import { ClubhouseClient, crawlSocialGraph } from 'clubhouse-client'

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

      const client = new ClubhouseClient({
        userId: user.userId,
        deviceId: user.deviceId,
        authToken: user.authToken
      })

      const socialGraph = await crawlSocialGraph(client, user.userId, {
        maxUsers: 1
      })

      res.json(socialGraph)
    } catch (err) {
      res.status(err.code || 500).json({ error: err.message })
    }
  }
)
