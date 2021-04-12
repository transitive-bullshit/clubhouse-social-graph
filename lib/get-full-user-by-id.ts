import * as db from 'clubhouse-crawler'
import * as neo4j from 'neo4j-driver'

import { convertNeo4jUser } from 'lib/convert-neo4j-user'
import { getRandomCorgi } from 'lib/get-random-corgi'

export const getFullUserById = async (
  session: neo4j.Session,
  userId: number | string
) => {
  const results = await session.readTransaction((tx) =>
    Promise.all([
      db.getUserById(tx, userId),
      db.getUserFollowersById(tx, userId, { limit: 600 }),
      db.getFollowingUsersById(tx, userId, { limit: 600 }),
      db.getUsersInvitedById(tx, userId, { limit: 400 }),
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

  if (userId === 76 || userId === '76') {
    // special surprise for li jin...
    for (const u of followers) {
      u.photo_url = getRandomCorgi()
    }

    for (const u of following) {
      u.photo_url = getRandomCorgi()
    }

    for (const u of invitees) {
      u.photo_url = getRandomCorgi()
    }

    for (const u of inviteChain) {
      u.photo_url = getRandomCorgi()
    }
  }

  return {
    user,
    followers,
    following,
    invitees,
    inviteChain
  }
}
