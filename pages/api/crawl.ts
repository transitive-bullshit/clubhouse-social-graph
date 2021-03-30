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

      const seedUserId = req.body.seedUserId || user.userId
      const maxUsers = req.body.maxUsers || 20
      const throttle = {
        limit: 1,
        interval: 50,
        ...req.body.throttle
      }
      const crawlFollowers = req.body.crawlFollowers ?? true
      const crawlInvites = req.body.crawlInvites ?? true

      let driver

      try {
        driver = crawler.driver()

        // set up an authenticated API client with less aggressive throttling
        const client = new ClubhouseClient({
          userId: user.userId,
          deviceId: user.deviceId,
          authToken: user.authToken,
          throttle
        })

        // perform a limited crawl of the social graph, adding all users and
        // relationships to neo4j
        const socialGraph = await crawler.crawlSocialGraph(client, seedUserId, {
          maxUsers,
          crawlFollowers,
          crawlInvites,
          driver
        })

        res.json(socialGraph)
      } finally {
        await driver.close()
      }
    } catch (err) {
      console.error('crawl error', err)

      res
        .status(err.code || err.response?.statusCode || 500)
        .json({ error: err.message })
    }
  }
)
