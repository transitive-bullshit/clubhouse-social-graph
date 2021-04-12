import * as db from 'clubhouse-crawler'
import * as neo4j from 'neo4j-driver'

import {
  withSession,
  NextApiRequestSession,
  NextApiResponse
} from 'lib/session'

import { getFullUserByUsername } from 'lib/get-full-user-by-username'

const usernameCache = {}

export default withSession(
  async (req: NextApiRequestSession, res: NextApiResponse) => {
    try {
      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not supported' })
        return
      }

      const username = req.query.username as string

      if (!username) {
        res.status(400).end()
        return
      }

      // const user = req.session.get('user')

      // if (!user) {
      //   res.status(401).json({ error: 'Authentication required' })
      //   return
      // }

      if (usernameCache[username]) {
        res.json(usernameCache[username])
        return
      }

      let driver: neo4j.Driver

      try {
        driver = db.driver()

        let session: neo4j.Session

        try {
          session = driver.session({ defaultAccessMode: 'READ' })

          const result = await getFullUserByUsername(session, username)

          if (!result) {
            res.status(404).json({ error: 'User not found' })
            return
          }

          res.setHeader(
            'Cache-Control',
            'public, s-maxage=600, max-age=600, stale-while-revalidate=60'
          )

          usernameCache[username] = result
          res.json(result)
        } finally {
          await session.close()
        }
      } finally {
        await driver.close()
      }
    } catch (err) {
      console.error('error', err)

      res
        .status(err.code || err.response?.statusCode || 500)
        .json({ error: err.message })
    }
  }
)
