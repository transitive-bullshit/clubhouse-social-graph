import { ClubhouseClient } from 'clubhouse-client'

import {
  withSession,
  NextApiRequestSession,
  NextApiResponse
} from 'lib/session'

// API proxy to clubhouse
export default withSession(
  async (req: NextApiRequestSession, res: NextApiResponse) => {
    const { proxy } = req.query
    const endpoint = `/${(proxy as string[]).join('/')}`

    try {
      const user = req.session.get('user')
      console.log('>>>', endpoint, user)

      const client = new ClubhouseClient({
        userId: user?.userId,
        deviceId: user?.deviceId,
        authToken: user?.authToken
      })

      console.log({
        endpoint,
        method: req.method,
        auth: client.isAuthenticated,
        body: req.body
      })

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

        console.log('AUTHED', newUser)
        req.session.set('user', newUser)
        await req.session.save()
      }

      res.json(result)
    } catch (err) {
      console.error('clubhouse API error', endpoint, err)
      res.status(err.code || 500).json({ error: err.message })
    }
  }
)
