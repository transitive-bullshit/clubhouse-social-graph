import { ClubhouseClient } from 'clubhouse-client'

import {
  withSession,
  NextApiRequestSession,
  NextApiResponse
} from 'lib/session'

// API proxy to clubhouse
export default withSession(
  async (req: NextApiRequestSession, res: NextApiResponse) => {
    try {
      const user = req.session.get('user')
      const client = new ClubhouseClient({
        userId: user?.userId,
        deviceId: user?.deviceId,
        authToken: user?.authToken
      })

      const { proxy } = req.query
      const endpoint = `/${(proxy as string[]).join('/')}`

      const result = await client._fetch({
        endpoint,
        method: req.method,
        auth: !!user,
        body: req.body
      })

      if (endpoint === '/complete_phone_number_auth') {
        const newUser = {
          userId: client._userId,
          deviceId: client._deviceId,
          authToken: client._authToken
        }

        req.session.set('user', newUser)
        await req.session.save()
      }

      res.json(result)
    } catch (err) {
      res.status(err.code || 500).json({ error: err.message })
    }
  }
)
