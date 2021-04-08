import * as db from 'clubhouse-crawler'
import * as neo4j from 'neo4j-driver'

import {
  withSession,
  NextApiRequestSession,
  NextApiResponse
} from 'lib/session'

import { convertNeo4jUser } from 'lib/convert-neo4j-user'

export default withSession(
  async (req: NextApiRequestSession, res: NextApiResponse) => {
    try {
      const user = req.session.get('user')

      if (!user) {
        res.status(401).json({ error: 'Authentication required' })
        return
      }

      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not supported' })
        return
      }

      const username = req.query.username as string

      if (!username) {
        res.status(400).end()
        return
      }

      let driver: neo4j.Driver

      try {
        driver = db.driver()

        let session: neo4j.Session

        try {
          session = driver.session({ defaultAccessMode: 'READ' })

          const user = convertNeo4jUser(
            (await db.getUserByUsername(session, username)).records[0]?.get(0)
          )

          if (!user) {
            res.status(404).json({ error: 'User not found' })
            return
          }

          const userId: number = user.user_id

          const followers = (
            await db.getUserFollowersById(session, userId)
          ).records.map((record) => convertNeo4jUser(record.get(0)))

          const following = (
            await db.getFollowingUsersById(session, userId)
          ).records.map((record) => convertNeo4jUser(record.get(0)))

          res.json({
            user,
            followers,
            following
          })
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
