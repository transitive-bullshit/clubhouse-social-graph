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

        console.log('AUTHED', newUser)
        req.session.set('user', newUser)
        await req.session.save()
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
