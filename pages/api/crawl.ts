import { ClubhouseClient } from 'clubhouse-client'

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
        userId: user?.userId,
        deviceId: user?.deviceId,
        authToken: user?.authToken
      })

      res.json(result)
    } catch (err) {
      res.status(err.code || 500).json({ error: err.message })
    }
  }
)
