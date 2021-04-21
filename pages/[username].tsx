import React from 'react'
import { useRouter } from 'next/router'

import * as db from 'clubhouse-crawler'
import * as neo4j from 'neo4j-driver'

import {
  Layout,
  SocialGraphVisualization,
  VisualizationSelector,
  QueryParamProvider,
  FocusedUserPane,
  ZoomControls,
  LoadingIndicator,
  InfoModal,
  CorgiModeControls
} from 'components'

import { getFullUserByUsername } from 'lib/get-full-user-by-username'
import { UserNode } from 'lib/types'
import exampleUsers from 'lib/example-users'
import { Viz } from 'state/viz'

import styles from 'styles/user.module.css'

export async function getStaticProps(context) {
  const username = context.params.username as string

  try {
    const props: any = {
      username
    }

    let driver: neo4j.Driver

    try {
      driver = db.driver()

      let session: neo4j.Session

      try {
        session = driver.session({ defaultAccessMode: 'READ' })
        const userNode = await getFullUserByUsername(session, username)
        if (!userNode) {
          return {
            notFound: true
          }
        }
        props.userNode = userNode
        console.log(props.userNode.user)
      } finally {
        await session.close()
      }
    } finally {
      await driver.close()
    }

    // revalidate once every hour
    return { props, revalidate: 3600 }
  } catch (err) {
    console.error('page error', username, err)

    throw err
  }
}

export async function getStaticPaths() {
  const isCI = process.env.GITHUB_ACTIONS || process.env.CI || true
  const paths = isCI ? [] : exampleUsers.map((u) => u.href)

  return {
    paths,
    fallback: true
  }
}

export default function UserDetailPage({
  userNode,
  username
}: {
  userNode: UserNode
  username: string
}) {
  const router = useRouter()
  const name = userNode?.user?.name
  const bio = userNode?.user?.bio
  const title = name ? `${name} - Social Graph` : undefined
  const description = name
    ? `Visualize the Clubhouse social graph of ${name}.${bio ? ' ' + bio : ''}`
    : undefined
  const twitter = userNode?.user?.twitter ?? 'transitive_bs'

  return (
    <Layout title={title} description={description} twitter={twitter}>
      {router.isFallback ? (
        <LoadingIndicator isLoading={true} initial={{ opacity: 1 }} />
      ) : (
        <QueryParamProvider>
          <Viz.Provider>
            <SocialGraph userNode={userNode} username={username} />
          </Viz.Provider>
        </QueryParamProvider>
      )}
    </Layout>
  )
}

const SocialGraph = ({
  userNode,
  username
}: {
  userNode: UserNode
  username: string
}) => {
  const { resetUserNodeMap, setIsCorgiMode } = Viz.useContainer()

  React.useEffect(() => {
    if (!userNode) return

    if (username === 'li') {
      setIsCorgiMode(true)
    }

    resetUserNodeMap(userNode)
  }, [username, userNode, resetUserNodeMap, setIsCorgiMode])

  return (
    <section className={styles.fullPage}>
      <SocialGraphVisualization />

      <VisualizationSelector />

      <FocusedUserPane />

      <ZoomControls />

      <InfoModal />

      {username === 'li' && <CorgiModeControls />}
    </section>
  )
}
