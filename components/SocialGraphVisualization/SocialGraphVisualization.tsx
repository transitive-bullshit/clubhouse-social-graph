import React from 'react'
import { useMeasure } from 'react-use'

import { User } from 'lib/types'
import { getApproxNumRepresentation } from 'lib/get-approx-num-representation'
import { getProfilePhotoUrl } from 'lib/get-profile-photo-url'
import { Viz } from 'state/viz'
import { getRandomCorgi } from 'lib/get-random-corgi'

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

export const SocialGraphVisualization: React.FC = () => {
  const {
    visualization,
    userNodeMap,
    addUserById,
    setFocusedUser,
    focusedUser,
    simulation,
    isLoading,
    setIsLoading,
    isCorgiMode
  } = Viz.useContainer()
  const corgiMap = React.useRef<{ [userId: string]: string }>({})
  const imageRefs = React.useRef<any>({})
  const [hoverNode, setHoverNode] = React.useState<number>(null)
  const [measureRef, { width, height }] = useMeasure()
  const [graphData, setGraphData] = React.useState<GraphData>({
    nodes: [],
    links: []
  })

  const numUsers = React.useMemo(() => Object.keys(userNodeMap).length, [
    userNodeMap
  ])
  const numNodes = React.useMemo(() => graphData.nodes.length, [graphData])
  const shouldDislayLargeUsers =
    (numUsers <= 2 || numNodes <= 128) && numNodes <= 500
  const imageSize = shouldDislayLargeUsers ? 512 : 64
  const imageSizeHero = shouldDislayLargeUsers ? 512 : 128

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

  React.useEffect(() => {
    if (numUsers < 1) {
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      simulation.current?.zoomToFit(250)
      setIsLoading(false)
    }, 250)
  }, [visualization])

  const onNodeClick = React.useCallback(
    (node, event) => {
      event.preventDefault()
      setFocusedUser(node)

      if (userNodeMap[node.user_id]) {
        // already expanded
        return
      }

      if (focusedUser && focusedUser.user_id === node.user_id) {
        // clicking on the focused users a second time will expand their graph
        addUserById(node.user_id)
      }
    },
    [userNodeMap, focusedUser, addUserById]
  )

  const onBackgroundClick = React.useCallback(() => {
    setFocusedUser(null)
  }, [setFocusedUser])

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

  const params = React.useMemo(() => {
    const isLarge = numNodes >= 1000

    return {
      nodeRelSize: 1,
      nodeVal: 100,
      cooldownTicks: 300,
      dagMode: visualization === 'invites' ? 'bu' : undefined,
      linkDirectionalParticles: isLarge ? 1 : 5,
      linkDirectionalParticleSpeed: 0.005
    }
  }, [visualization, numNodes])

  return (
    <>
      <div className={styles.wrapper} ref={measureRef} style={wrapperStyle}>
        <ForceGraph2D
          ref={simulation}
          graphData={graphData}
          width={width}
          height={height}
          nodeId='user_id'
          onBackgroundClick={onBackgroundClick}
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
          const width = isHeroNode(node) ? imageSizeHero : imageSize
          let url: string

          if (isCorgiMode) {
            url = corgiMap.current[node.user_id]
            if (!url) {
              url = corgiMap.current[node.user_id] = getRandomCorgi()
            }
          } else {
            url = getProfilePhotoUrl(node, { width })
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
