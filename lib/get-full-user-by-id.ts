import * as db from 'clubhouse-crawler'
import * as neo4j from 'neo4j-driver'

import { convertNeo4jUser } from 'lib/convert-neo4j-user'

export const getFullUserById = async (
  session: neo4j.Session,
  userId: number | string
) => {
  const results = await session.readTransaction((tx) =>
    Promise.all([
      db.getUserById(tx, userId),
      db.getUserFollowersById(tx, userId),
      db.getFollowingUsersById(tx, userId),
      db.getUsersInvitedById(tx, userId),
      db.getUserInviteChainByUserId(tx, userId)
    ])
  )

  const user = convertNeo4jUser(results[0].records[0]?.get(0))

  if (!user) {
    return null
  }

  const followers = results[1].records.map((record) =>
    convertNeo4jUser(record.get(0))
  )

  const following = results[2].records.map((record) =>
    convertNeo4jUser(record.get(0))
  )

  const invitees = results[3].records.map((record) =>
    convertNeo4jUser(record.get(0))
  )

  const inviteChain = results[4].map((user) => convertNeo4jUser(user))

  return {
    user,
    followers,
    following,
    invitees,
    inviteChain
  }
}
