import React from 'react'
import { useMeasure } from 'react-use'
import ForceGraph2D from './force-graph-no-ssr'

import { fetchClubhouseAPI } from 'lib/fetch-clubhouse-api'

import styles from './styles.module.css'
// import initialData from './test-user.json'

import type { User } from 'clubhouse-client'

interface Link {
  source: number
  target: number
}

interface CustomUser extends User {
  hero?: boolean
}

interface Data {
  nodes: CustomUser[]
  links: Link[]
}

interface UserData {
  [userId: string]: {
    user: User
    followers: User[]
    following: User[]
  }
}

export const FollowerGraphVisualization: React.FC<{
  username: string
  visualization: 'followers' | 'following'
}> = ({ username, visualization }) => {
  const simulation = React.useRef<any>()
  const [measureRef, { width, height }] = useMeasure()

  const [userData, setUserData] = React.useState<UserData>({})

  const [data, setData] = React.useState<Data>({
    nodes: [],
    links: []
  })

  const imageRefs = React.useRef({})

  for (const node of data.nodes) {
    imageRefs.current[node.user_id] =
      imageRefs.current[node.user_id] || React.createRef()
  }

  function upsertUsers(update: any) {
    const userId = update.user.user_id
    update.user.hero = true

    setUserData((userData) => ({
      ...userData,
      [userId]: update
    }))
  }

  React.useEffect(() => {
    const users = {}
    const relationships = {}

    function addFollower(source: number, target: number) {
      if (!relationships[source]) {
        relationships[source] = new Set<number>()
      }

      relationships[source].add(target)
    }

    for (const user of Object.values(userData)) {
      const userId = user.user.user_id
      const followers = user.followers
      const following = user.following

      users[userId] = user.user

      if (visualization === 'followers') {
        for (const user of followers) {
          users[user.user_id] = user
          addFollower(user.user_id, userId)
        }
      } else if (visualization === 'following') {
        for (const user of following) {
          users[user.user_id] = user
          addFollower(userId, user.user_id)
        }
      }
    }

    const nodes: User[] = Object.values(users)
    const links: Link[] = Object.keys(relationships).flatMap((key) => {
      const source = +key
      if (isNaN(source)) {
        return []
      }

      return Array.from(relationships[key] || []).map((target: number) => ({
        source,
        target
      }))
    })

    setData({
      nodes,
      links
    })
  }, [visualization, userData])

  React.useEffect(() => {
    if (!username) {
      return
    }

    fetchClubhouseAPI({
      endpoint: `/db/users/username/${username}`
    }).then((res) => {
      if (!res.error) {
        upsertUsers(res)
      }
    })
  }, [username])

  const onNodeClick = React.useCallback((node) => {
    console.log('click', node)
  }, [])

  const onNodeHover = React.useCallback((node) => {
    // console.log('hover', node)
  }, [])

  const drawNode = React.useCallback(
    (node, ctx: CanvasRenderingContext2D, scale) => {
      // if (node.user_id === 2015)
      const image = imageRefs.current[node.user_id]?.current
      if (!image) return

      const s = node.hero ? 20 : 16
      ctx.drawImage(image, node.x - s / 2, node.y - s / 2, s, s)

      // ctx.fillStyle = 'red'
      // ctx.beginPath()
      // ctx.ellipse(node.x, node.y, 4, 4, 0, 0, 2 * Math.PI)
      // ctx.fill()
    },
    []
  )

  // http://localhost:3000/_next/image?url=https%3A%2F%2Fclubhouseprod.s3.amazonaws.com%3A443%2F103_00fd39e3-f27f-4eb1-ab26-6e4b875a6dfa&w=64&q=100
  // http://localhost:3000/_next/image?url=https%3A%2F%2Fclubhouseprod.s3.amazonaws.com%3A443%2F2015_97c3b287-b71d-4c12-b5c9-37766c509c0d&w=64&q=75
  // https://chsg.imgix.net/4175_4462da0b-3b07-4ac1-898d-3e96da3bb54a?w=64&auto=format&mask=corners&corner-radius=10,10,10,10
  const imageProxyUrl = 'https://chsg.imgix.net'
  const imageSize = 64
  const imageSizeHero = 128

  // onEngineStop

  return (
    <>
      <div className={styles.wrapper} ref={measureRef}>
        <ForceGraph2D
          ref={simulation}
          graphData={data}
          nodeId='user_id'
          width={width}
          height={height}
          onNodeClick={onNodeClick}
          onNodeHover={onNodeHover}
          nodeCanvasObject={drawNode}
          nodeRelSize={4}
          // linkDirectionalParticles={5}
          // linkDirectionalArrowLength={5}
        />
      </div>

      <div className={styles.images}>
        {data.nodes.map((node) => {
          const suffix = node.photo_url?.split(':443/')?.[1]
          if (!suffix) return null

          const size = node.hero ? imageSizeHero : imageSize
          const url = `${imageProxyUrl}/${suffix}?w=${size}&auto=format&mask=corners`
          // const url = `/_next/image?url=${encodeURIComponent(
          //   node.photo_url
          // )}&w=32&q=75`

          return (
            <img
              key={node.user_id}
              ref={imageRefs.current[node.user_id]}
              src={url}
            />
          )
        })}
      </div>

      {/* <div className={styles.images}>
        {data.nodes.map((node) => (
          <Image
            key={node.user_id}
            className={styles.profileImage}
            id={'' + node.user_id}
            src={node.photo_url}
            layout='responsive'
            sizes='32px'
            width={480}
            height={480}
          />
        ))}
      </div> */}
    </>
  )
}
