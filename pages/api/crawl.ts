import { ClubhouseClient } from 'clubhouse-client'
import * as crawler from 'clubhouse-crawler'

import {
  withSession,
  NextApiRequestSession,
  NextApiResponse
} from 'lib/session'

export default withSession(
  async (req: NextApiRequestSession, res: NextApiResponse) => {
    try {
      const user = req.session.get('user')

      if (!user) {
        res.status(401).json({ error: 'Authentication required' })
        return
      }

      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not supported' })
        return
      }

      let driver

      try {
        driver = crawler.driver()

        // set up an authenticated API client with less aggressive throttling
        const client = new ClubhouseClient({
          userId: user.userId,
          deviceId: user.deviceId,
          authToken: user.authToken,
          throttle: {
            limit: 1,
            interval: 50
          }
        })

        // perform a limited crawl of the social graph
        const socialGraph = await crawler.crawlSocialGraph(
          client,
          user.userId,
          {
            maxUsers: 10,
            crawlFollowers: true,
            crawlInvites: true
          }
        )

        res.json(socialGraph)

        // add all of the users and relationships to neo4j
        const session = driver.session()
        try {
          const users = Object.values(socialGraph)
          for (let i = 0; i < users.length; ++i) {
            const user = users[i]
            console.log(`${i + 1} / ${users.length}) upserting user`, user)

            await session.writeTransaction(async (tx) => {
              const res = await crawler.upsertSocialGraphUser(tx, user)
              console.log('user', res.records[0]?.get(0))
            })
          }
        } catch (err) {
          console.error('unable to execute query', err)
          throw err
        } finally {
          await session.close()
        }
      } finally {
        if (driver) {
          await driver.close()
        }
      }
    } catch (err) {
      res
        .status(err.code || err.response?.statusCode || 500)
        .json({ error: err.message })
    }
  }
)
