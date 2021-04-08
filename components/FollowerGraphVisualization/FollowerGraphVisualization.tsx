import React from 'react'
import { useMeasure } from 'react-use'
import { useRouter } from 'next/router'

import type { User } from 'clubhouse-client'

import { fetchClubhouseAPI } from 'lib/fetch-clubhouse-api'

import ForceGraph2D from './force-graph-no-ssr'
import styles from './styles.module.css'

interface Link {
  source: number
  target: number
}

interface CustomUser extends User {
  hero?: boolean
}

interface GraphData {
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
  const router = useRouter()
  const simulation = React.useRef<any>()
  const [measureRef, { width, height }] = useMeasure()

  const [userData, setUserData] = React.useState<UserData>({})

  const [graphData, setGraphData] = React.useState<GraphData>({
    nodes: [],
    links: []
  })

  const imageRefs = React.useRef({})

  for (const node of graphData.nodes) {
    imageRefs.current[node.user_id] =
      imageRefs.current[node.user_id] || React.createRef()
  }

  // TODO: denormalize users here
  // 1. reduce memory
  // 2. retain hero attribute
  function upsertUsers(update: any) {
    const userId = update.user.user_id
    update.user.hero = true

    setUserData((userData) => ({
      ...userData,
      [userId]: update
    }))
  }

  // update the graph
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

    setGraphData({
      nodes,
      links
    })
  }, [visualization, userData])

  function fetchAndUpsertUserById(userId: string) {
    return fetchClubhouseAPI({
      endpoint: `/db/users/${userId}`
    }).then((res) => {
      if (!res.error) {
        upsertUsers(res)
      }
    })
  }

  function fetchAndUpsertUserByUsername(username: string) {
    return fetchClubhouseAPI({
      endpoint: `/db/users/username/${username}`
    }).then((res) => {
      if (!res.error) {
        upsertUsers(res)
      }
    })
  }

  // load the initial user and their immediate followers / following
  React.useEffect(() => {
    if (!username) {
      return
    }

    fetchAndUpsertUserByUsername(username).then(() => {
      setTimeout(() => {
        simulation.current?.zoomToFit(400)
      }, 250)
    })
  }, [username])

  const onNodeClick = React.useCallback((node, event) => {
    // TODO: figure out how to navigate to another user's profile
    if (event.detail === 2) {
      event.preventDefault()
      console.log('double click', node)
      router.push(`/${node.username}`)
      return false
    }

    if (userData[node.user_id]) {
      return
    }

    fetchAndUpsertUserById(node.user_id).then(() => {
      setTimeout(() => {
        simulation.current?.zoomToFit(250)
      }, 700)
    })
  }, [])

  const onNodeRightClick = React.useCallback((node) => {
    // TODO
  }, [])

  // TODO: useRef or useState
  let hoverNode: number = null

  const onNodeHover = React.useCallback((node) => {
    // console.log('hover', node)
    hoverNode = node?.user_id
  }, [])

  const drawNode = React.useCallback(
    (node, ctx: CanvasRenderingContext2D, scale) => {
      // if (node.user_id === 2015)
      const image: HTMLImageElement = imageRefs.current[node.user_id]?.current
      if (!image || !image.complete) return

      const s = 16
      const h = (s / 2) | 0
      try {
        const isHovered = hoverNode === node.user_id
        if (userData[node.user_id] || isHovered) {
          const o = 1.5
          ctx.fillStyle = isHovered ? '#D88E73' : '#7194FA'
          fillRoundedRect(
            ctx,
            node.x - h - o,
            node.y - h - o,
            s + 2 * o,
            s + 2 * o,
            s / 4
          )
          // ctx.beginPath()
          // // ctx.ellipse(node.x, node.y, 4, 4, 0, 0, 2 * Math.PI)
          // ctx.rect(node.x - h - 2, node.y - h - 2, s + 4, s + 4)
          // ctx.fill()
        }
        ctx.drawImage(image, node.x - h, node.y - h, s, s)
      } catch (err) {
        // error with image
      }
    },
    []
  )

  // http://localhost:3000/_next/image?url=https%3A%2F%2Fclubhouseprod.s3.amazonaws.com%3A443%2F103_00fd39e3-f27f-4eb1-ab26-6e4b875a6dfa&w=64&q=100
  // http://localhost:3000/_next/image?url=https%3A%2F%2Fclubhouseprod.s3.amazonaws.com%3A443%2F2015_97c3b287-b71d-4c12-b5c9-37766c509c0d&w=64&q=75
  // https://chsg.imgix.net/4175_4462da0b-3b07-4ac1-898d-3e96da3bb54a?w=64&auto=format&mask=corners&corner-radius=10,10,10,10
  const imageProxyUrl = 'https://chsg.imgix.net'
  const imageSize = 64
  const imageSizeHero = 128

  console.log('simulation', simulation.current)

  return (
    <>
      <div className={styles.wrapper} ref={measureRef}>
        <ForceGraph2D
          ref={simulation}
          graphData={graphData}
          nodeId='user_id'
          width={width}
          height={height}
          onNodeClick={onNodeClick}
          onNodeHover={onNodeHover}
          onNodeRightClick={onNodeRightClick}
          nodeCanvasObject={drawNode}
          nodeRelSize={1}
          nodeVal={100}
          cooldownTicks={300}
          d3Force='center'
          linkDirectionalParticles={5}
          linkDirectionalParticleSpeed={0.005}
          // linkDirectionalArrowLength={5}
        />
      </div>

      <div className={styles.images}>
        {graphData.nodes.map((node) => {
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
    </>
  )
}

function fillRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  const r = x + w
  const b = y + h
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(r - radius, y)
  ctx.quadraticCurveTo(r, y, r, y + radius)
  ctx.lineTo(r, y + h - radius)
  ctx.quadraticCurveTo(r, b, r - radius, b)
  ctx.lineTo(x + radius, b)
  ctx.quadraticCurveTo(x, b, x, b - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.fill()
}
