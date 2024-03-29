import React from 'react'
import Link from 'next/link'

import * as db from 'clubhouse-crawler'
import * as neo4j from 'neo4j-driver'

import { Button } from '@chakra-ui/react'
import { FaTwitter, FaInstagram } from 'react-icons/fa'
import { HiOutlineExternalLink } from 'react-icons/hi'

import { useQueryParam, StringParam, withDefault } from 'use-query-params'

import { Layout, UserBio, QueryParamProvider } from 'components'
import { SortUsersSelector } from 'components/SortUsersSelector/SortUsersSelector'

import { User } from 'lib/types'
import { convertNeo4jUser } from 'lib/convert-neo4j-user'
import { getApproxNumRepresentation } from 'lib/get-approx-num-representation'

import { Avatar } from 'components/Avatar/Avatar'
import { Paper } from 'components/Paper/Paper'

import styles from 'styles/top-users.module.css'

interface UsersMap {
  [key: string]: User[]
}

export const getStaticProps = async () => {
  try {
    const props: any = {}

    let driver: neo4j.Driver

    try {
      driver = db.driver()

      let session: neo4j.Session

      try {
        session = driver.session({ defaultAccessMode: 'READ' })
        const usersMap: UsersMap = {}

        usersMap.pagerank = (
          await db.getUsers(session, { orderBy: 'pagerank', limit: 100 })
        ).records.map((record) => convertNeo4jUser(record.get(0)))

        usersMap.num_followers = (
          await db.getUsers(session, { orderBy: 'num_followers', limit: 100 })
        ).records.map((record) => convertNeo4jUser(record.get(0)))

        const fakeUsers = [
          // add one fake user at the end...
          {
            name: 'Travis Fischer',
            user_id: 2481724,
            username: 'transitive_bs',
            twitter: 'transitive_bs',
            instagram: 'transitive_bullshit',
            time_scraped: '2021-03-29T23:30:12.852000000Z',
            time_created: '2021-01-17T04:12:49.056276000Z',
            num_followers: 'null',
            is_blocked_by_network: 'FALSE',
            photo_url:
              'https://clubhouseprod.s3.amazonaws.com:443/2481724_7d2d0da1-cd66-4dd6-bc39-d86082f6d0d4',
            num_following: 'null',
            bio: `Okay okay, so this last one's fake.. I'm not actually one of the top users on Clubhouse.. but I do control the algorithm behind this chart.. 😂\ntransitivebullsh.it 💪`
          } as any
        ]

        usersMap.pagerank = usersMap.pagerank.concat(fakeUsers)
        usersMap.num_followers = usersMap.num_followers.concat(fakeUsers)
        props.usersMap = usersMap
      } finally {
        if (session) {
          await session.close()
        }
      }
    } finally {
      if (driver) {
        await driver.close()
      }
    }

    // revalidate once every hour
    return { props, revalidate: 3600 }
  } catch (err) {
    console.error('page error', err)

    throw err
  }
}

export default function TopUsersPage({ usersMap }: { usersMap: UsersMap }) {
  return (
    <Layout full>
      <QueryParamProvider>
        <section className={styles.topUsersSection}>
          <h1>Top 100 Clubhouse Users</h1>

          <UsersGallery usersMap={usersMap} />
        </section>
      </QueryParamProvider>
    </Layout>
  )
}

function UsersGallery({ usersMap }: { usersMap: UsersMap }) {
  const [selectionQuery, setSelectionQuery] = useQueryParam<string>(
    'sort',
    withDefault(StringParam, undefined)
  )

  const [selection, setSelection] = React.useState<string>(
    selectionQuery || 'pagerank'
  )

  const onChangeSelection = React.useCallback(
    (selection) => {
      setSelection(selection)
    },
    [setSelection]
  )

  const users = React.useMemo(() => {
    return usersMap[selection]
  }, [usersMap, selection])

  React.useEffect(() => {
    setSelectionQuery(selection === 'pagerank' ? undefined : selection)
  }, [selection, setSelectionQuery])

  return (
    <div className={styles.usersGalleryContainer}>
      <SortUsersSelector
        selection={selection}
        onChangeSelection={onChangeSelection}
      />

      <div className={styles.usersGallery}>
        {users?.map((user, index) => (
          <UserCard key={user.user_id} user={user} index={index} />
        ))}
      </div>
    </div>
  )
}

function UserCard({ user, index }: { user: User; index: number }) {
  const numFollowers = getApproxNumRepresentation((user as any)?.num_followers)
  const numFollowing = getApproxNumRepresentation((user as any)?.num_following)

  const profileUrl = `/${user.username}`

  return (
    <Paper key={user.user_id} id={user.username} className={styles.user}>
      <div className={styles.header}>
        <div className={styles.index}>#{index + 1}</div>

        <Link href={profileUrl}>
          <a className={styles.avatar}>
            <Avatar user={user} size='xl' />
          </a>
        </Link>

        <Link href={profileUrl}>
          <a className={styles.name}>{user.name}</a>
        </Link>

        <Link href={`${profileUrl}?viz=followers`}>
          <a className={styles.stat}>
            <span className={styles.bold}>{numFollowers}</span> Followers
          </a>
        </Link>

        <Link href={`${profileUrl}?viz=following`}>
          <a className={styles.stat}>
            <span className={styles.bold}>{numFollowing}</span> Following
          </a>
        </Link>
      </div>

      <UserBio user={user} className={styles.bio} />

      <div className={styles.actions}>
        <Link href={profileUrl}>
          <a>
            <Button colorScheme='blue'>View Graph</Button>
          </a>
        </Link>

        <a
          href={`https://joinclubhouse.com/@${user.username}`}
          target='_blank'
          rel='noopener noreferrer'
        >
          <Button colorScheme='blue'>
            View Bio
            <HiOutlineExternalLink className={styles.external} size={12} />
          </Button>
        </a>
      </div>

      {(user.twitter || (user as any).instagram) && (
        <div className={styles.social}>
          {user.twitter && (
            <a
              className={styles.twitter}
              href={`https://twitter.com/${user.twitter}`}
              title={`Twitter @${user.twitter}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              <FaTwitter size={24} />
            </a>
          )}

          {(user as any).instagram && (
            <a
              className={styles.instagram}
              href={`https://instagram.com/${(user as any).instagram}`}
              title={`Instagram @${(user as any).instagram}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              <FaInstagram size={24} />
            </a>
          )}
        </div>
      )}
    </Paper>
  )
}
