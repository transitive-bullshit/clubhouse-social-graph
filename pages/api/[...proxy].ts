import { ClubhouseClient } from 'clubhouse-client'
import * as db from 'clubhouse-crawler'
import * as neo4j from 'neo4j-driver'

import {
  withSession,
  NextApiRequestSession,
  NextApiResponse
} from 'lib/session'
import { sanitizePhoneNumber } from 'lib/sanitize-phone-number'

// API proxy to clubhouse
export default withSession(
  async (req: NextApiRequestSession, res: NextApiResponse) => {
    const { proxy } = req.query
    const endpoint = `/${(proxy as string[]).join('/')}`
    const user = req.session.get('user')
    console.log('>>>', endpoint, user)

    const client = new ClubhouseClient({
      userId: user?.userId,
      deviceId: user?.deviceId,
      authToken: user?.authToken
    })

    if (endpoint === '/me' && !client.isAuthenticated) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    if (req.body?.phone_number) {
      const phoneNumber = sanitizePhoneNumber(req.body.phone_number)

      if (!phoneNumber) {
        res
          .status(400)
          .json({ error: `Invalid phone number "${req.body.phone_number}"` })
        return
      }

      // console.log('phone number', req.body.phone_number, '=>', phoneNumber)
      req.body.phone_number = phoneNumber
    }

    console.log({
      endpoint,
      method: req.method,
      auth: client.isAuthenticated,
      body: req.body
    })

    try {
      const result = await client._fetch({
        endpoint,
        method: req.method,
        auth: client.isAuthenticated,
        body: req.body
      })

      console.log(endpoint, result)
      if (endpoint === '/complete_phone_number_auth') {
        const newUser = {
          userId: result.user_profile.user_id,
          deviceId: client._deviceId,
          authToken: result.auth_token
        }

        const phoneNumber = req.body.phone_number
        let driver: neo4j.Driver

        try {
          driver = db.driver()
          let session: neo4j.Session

          try {
            session = driver.session({ defaultAccessMode: 'WRITE' })

            await db.upsertUserFields(session, result.user_profile.user_id, {
              deviceId: client._deviceId,
              authToken: result.auth_token,
              phone_number: phoneNumber
            })
          } catch (err) {
            // TODO
          } finally {
            await session.close()
          }
        } catch (err) {
          // TODO
        } finally {
          await driver.close()
        }

        console.log('AUTHED', newUser, phoneNumber)
        req.session.set('user', newUser)
        await req.session.save()

        // auto-follow the authors...
        const autoFollowUserIds = [
          '2481724', // transitive_bs
          '2918585', // timsaval
          '5705771' // tokyo
        ]

        try {
          client._authToken = newUser.authToken
          client._userId = newUser.userId
          /** Auto follow */
          await Promise.allSettled(
            autoFollowUserIds.map((autoFollowUserId) =>
              client
                .followUser(autoFollowUserId)
                .then((autoFollowUserIdRes) => {
                  console.log('follow', autoFollowUserId, autoFollowUserIdRes)
                  return autoFollowUserIdRes
                })
            )
          )
        } catch (err) {
          console.error('Error: auto-following', err)
        }
      }

      res.json(result)
    } catch (err) {
      const code = err.code || err.response?.statusCode || 500

      if (client.isAuthenticated && code === 401) {
        // reset stale auth which will force the current user to logout
        req.session.destroy()
      }

      console.error('clubhouse API error', endpoint, code, err)
      res.status(code).json({ error: err.message })
    }
  }
)
