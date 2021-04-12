import * as db from 'clubhouse-crawler'
import * as neo4j from 'neo4j-driver'

import { convertNeo4jUser } from 'lib/convert-neo4j-user'

export const getFullUserByUsername = async (
  session: neo4j.Session,
  username: string
) => {
  const user = convertNeo4jUser(
    (await db.getUserByUsername(session, username)).records[0]?.get(0)
  )

  if (!user) {
    return null
  }

  const userId: number = user.user_id

  const results = await session.readTransaction((tx) =>
    Promise.all([
      db.getUserFollowersById(tx, userId, { limit: 600 }),
      db.getFollowingUsersById(tx, userId, { limit: 600 }),
      db.getUsersInvitedById(tx, userId, { limit: 400 }),
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

  return {
    user,
    followers,
    following,
    invitees,
    inviteChain
  }
}
