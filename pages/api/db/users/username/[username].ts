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

          // TODO: should we make these DB lookups in parallel?

          const results = await session.readTransaction((tx) =>
            Promise.all([
              db.getUserFollowersById(tx, userId),
              db.getFollowingUsersById(tx, userId),
              db.getUsersInvitedById(tx, userId),
              db.getUserInviteChainByUserId(tx, userId)
            ])
          )

          const followers = results[0].records.map((record) =>
            convertNeo4jUser(record.get(0))
          )

          const following = results[1].records.map((record) =>
            convertNeo4jUser(record.get(0))
          )

          const invitees = results[2].records.map((record) =>
            convertNeo4jUser(record.get(0))
          )

          const inviteChain = results[3].map((user) => convertNeo4jUser(user))

          res.setHeader(
            'Cache-Control',
            'public, s-maxage=600, max-age=600, stale-while-revalidate=60'
          )

          res.json({
            user,
            followers,
            following,
            invitees,
            inviteChain
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
