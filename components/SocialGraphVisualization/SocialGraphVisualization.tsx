import React from 'react'
import { useMeasure } from 'react-use'
import { useRouter } from 'next/router'

import { User, UserNode, UserNodeMap } from 'lib/types'
import { fetchClubhouseAPI } from 'lib/fetch-clubhouse-api'
import { getApproxNumRepresentation } from 'lib/get-approx-num-representation'

import { LoadingIndicator } from '../LoadingIndicator/LoadingIndicator'
import { fillRoundedRect } from './fill-rounded-rect'
import ForceGraph2D from './force-graph-no-ssr'
import styles from './styles.module.css'

interface Link {
  source: number
  target: number
}

interface GraphData {
  nodes: User[]
  links: Link[]
}

export const SocialGraphVisualization: React.FC<{
  userNodeMap: UserNodeMap
  addUserNode: (userNode: UserNode) => any
  visualization: 'followers' | 'following' | 'invites'
}> = ({ userNodeMap, addUserNode, visualization }) => {
  const router = useRouter()
  const simulation = React.useRef<any>()
  const imageRefs = React.useRef<any>({})
  const [hoverNode, setHoverNode] = React.useState<number>(null)
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [measureRef, { width, height }] = useMeasure()
  const [graphData, setGraphData] = React.useState<GraphData>({
    nodes: [],
    links: []
  })

  for (const node of graphData.nodes) {
    imageRefs.current[node.user_id] =
      imageRefs.current[node.user_id] || React.createRef()
  }

  // update the d3 graph data (nodes + links)
  React.useEffect(() => {
    const relationships = {}
    const users = {}

    function addRelationship(source: number, target: number) {
      if (!relationships[source]) {
        relationships[source] = new Set<number>()
      }

      relationships[source].add(target)
    }

    for (const userNode of Object.values(userNodeMap)) {
      const userId = userNode.user.user_id
      users[userId] = userNode.user

      if (visualization === 'followers') {
        for (const u of userNode.followers) {
          users[u.user_id] = u
          addRelationship(u.user_id, userId)
        }
      } else if (visualization === 'following') {
        for (const u of userNode.following) {
          users[u.user_id] = u
          addRelationship(userId, u.user_id)
        }
      } else if (visualization === 'invites') {
        console.log(userNode)

        let prevUserId = userId
        for (const u of userNode.inviteChain) {
          users[u.user_id] = u
          addRelationship(prevUserId, u.user_id)
          prevUserId = u.user_id
        }

        for (const u of userNode.invitees) {
          users[u.user_id] = u
          addRelationship(u.user_id, userId)
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
  }, [visualization, userNodeMap, setGraphData])

  function fetchAndUpsertUserById(userId: string) {
    return fetchClubhouseAPI({
      endpoint: `/db/users/${userId}`
    }).then((res) => {
      if (!res.error) {
        addUserNode(res)
      }
    })
  }

  // initial graph layout
  React.useEffect(() => {
    if (numUsers !== 1) {
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      simulation.current?.zoomToFit(250)

      setTimeout(() => {
        simulation.current?.zoomToFit(100)
        setIsLoading(false)
      }, 250)
    }, 1000)
  }, [userNodeMap, setIsLoading])

  const onNodeClick = React.useCallback(
    (node, event) => {
      // TODO: figure out how to navigate to another user's profile
      if (event.detail === 2) {
        event.preventDefault()
        console.log('double click', node)
        router.push(`/${node.username}`)
        return false
      }

      if (userNodeMap[node.user_id]) {
        return
      }
      console.log('click', node, userNodeMap)

      setIsLoading(true)
      fetchAndUpsertUserById(node.user_id).then(() => {
        setTimeout(() => {
          simulation.current?.zoomToFit(250)
          setIsLoading(false)
        }, 700)
      })
    },
    [userNodeMap, addUserNode, setIsLoading]
  )

  const onNodeRightClick = React.useCallback(() => {
    // View @node.username
    // View relationship between @username and @node.username
    // Crawl @node.username?
  }, [])

  const onNodeHover = React.useCallback(
    (node) => {
      setHoverNode(node?.user_id)
    },
    [setHoverNode]
  )

  const nodeLabel = React.useCallback((node) => {
    const numFollowers = getApproxNumRepresentation(node.num_followers)
    const numFollowing = getApproxNumRepresentation(node.num_following)

    return `
    <div class="${styles.userNodeTooltip}">
      <span class="${styles.name}">
        ${node.name}
      </span>

      <span class="${styles.numFollowers}">
        ${numFollowers}
      </span>

      <span class="${styles.numFollowing}">
        ${numFollowing}
      </span>
    </div>
    `
  }, [])

  function isHeroNode(node) {
    return !!userNodeMap[node.user_id]
  }

  const drawNode = React.useCallback(
    (node, ctx: CanvasRenderingContext2D) => {
      const image: HTMLImageElement = imageRefs.current[node.user_id]?.current
      if (!image || !image.complete) return

      const s = 16
      const h = (s / 2) | 0
      try {
        const isHovered = hoverNode === node.user_id
        if (isHovered || isHeroNode(node)) {
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
    [hoverNode, userNodeMap]
  )

  const wrapperStyle = React.useMemo(
    () => ({
      cursor: hoverNode ? 'pointer' : undefined
    }),
    [hoverNode]
  )

  // http://localhost:3000/_next/image?url=https%3A%2F%2Fclubhouseprod.s3.amazonaws.com%3A443%2F103_00fd39e3-f27f-4eb1-ab26-6e4b875a6dfa&w=64&q=100
  // http://localhost:3000/_next/image?url=https%3A%2F%2Fclubhouseprod.s3.amazonaws.com%3A443%2F2015_97c3b287-b71d-4c12-b5c9-37766c509c0d&w=64&q=75
  // https://chsg.imgix.net/4175_4462da0b-3b07-4ac1-898d-3e96da3bb54a?w=64&auto=format&mask=corners&corner-radius=10,10,10,10
  const imageProxyUrl = 'https://chsg.imgix.net'
  const defaultProfileImageUrl = '/profile.png'
  const numUsers = Object.keys(userNodeMap).length
  const numNodes = graphData.nodes.length
  const shouldDislayLargeUsers = numUsers <= 2 || numNodes <= 128
  const imageSize = shouldDislayLargeUsers ? 512 : 64
  const imageSizeHero = shouldDislayLargeUsers ? 512 : 128

  const params = React.useMemo(() => {
    return {
      nodeRelSize: 1,
      nodeVal: 100,
      cooldownTicks: 300,
      dagMode: visualization === 'invites' ? 'bu' : undefined,
      linkDirectionalParticles: 5,
      linkDirectionalParticleSpeed: 0.005
    }
  }, [visualization])

  return (
    <>
      <div className={styles.wrapper} ref={measureRef} style={wrapperStyle}>
        <ForceGraph2D
          ref={simulation}
          graphData={graphData}
          width={width}
          height={height}
          nodeId='user_id'
          onNodeClick={onNodeClick}
          onNodeHover={onNodeHover}
          onNodeRightClick={onNodeRightClick}
          nodeCanvasObject={drawNode}
          nodeLabel={nodeLabel}
          {...params}
        />

        <LoadingIndicator
          isLoading={isLoading}
          initial={{ opacity: numUsers ? 0 : 1 }}
        />
      </div>

      <div className={styles.images}>
        {graphData.nodes.map((node) => {
          let url = defaultProfileImageUrl
          let suffix = node.photo_url?.split(':443/')?.[1]

          if (suffix) {
            const thumbnail = '_thumbnail_250x250'
            if (suffix.endsWith(thumbnail)) {
              suffix = suffix.substring(0, suffix.length - thumbnail.length)
            }

            // TODO: LOD?
            const size = isHeroNode(node) ? imageSizeHero : imageSize
            url = `${imageProxyUrl}/${suffix}?w=${size}&auto=format&mask=corners`
            // url = `/_next/image?url=${encodeURIComponent(
            //   node.photo_url
            // )}&w=32&q=75`
          }

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
