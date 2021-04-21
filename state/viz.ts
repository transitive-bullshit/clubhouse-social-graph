import React from 'react'
import { useRouter } from 'next/router'
import { createContainer } from 'unstated-next'
import { useDisclosure } from '@chakra-ui/react'
import {
  useQueryParam,
  StringParam,
  ArrayParam,
  withDefault
} from 'use-query-params'
import omit from 'lodash.omit'

import { User, UserNode, UserNodeMap, Visualization } from 'lib/types'
import { fetchClubhouseAPI } from 'lib/fetch-clubhouse-api'

function useViz() {
  const router = useRouter()
  const [vizQuery, setVizQuery] = useQueryParam<string>(
    'viz',
    withDefault(StringParam, 'following')
  )
  const [connectQuery, setConnectQuery] = useQueryParam<string[]>(
    'u',
    withDefault(ArrayParam, undefined)
  )
  // TODO: add bootstrapping state to differentiate between longer first graph load
  // const [isBootstrapping, setIsBootstrapping] = React.useState<boolean>(true)
  const [loading, setLoading] = React.useState<number>(1)
  const [isCorgiMode, setIsCorgiMode] = React.useState<boolean>(false)
  const [visualization, setVisualization] = React.useState<Visualization>(
    vizQuery as Visualization
  )
  const [rootUsername, setRootUsername] = React.useState<string>(
    router.query.username as string
  )
  const [userNodeMap, setUserNodeMap] = React.useState<UserNodeMap>({})
  const [pendingUserNodes, setPendingUserNodes] = React.useState<{
    [username: string]: boolean
  }>(
    connectQuery?.reduce(
      (acc, username) => ({ ...acc, [username]: false }),
      {}
    ) ?? {}
  )
  const [focusedUser, setFocusedUser] = React.useState<User>(null)
  const simulation = React.useRef<any>()
  const infoModal = useDisclosure()

  const incLoading = React.useCallback(() => {
    setLoading((loading) => loading + 1)
  }, [setLoading])

  const decLoading = React.useCallback(() => {
    setLoading((loading) => Math.max(0, loading - 1))
  }, [setLoading])

  const addUserNode = React.useCallback(
    (userNode: UserNode) => {
      const userId = userNode.user.user_id
      console.log('addUserNode', userId, userNode)

      setUserNodeMap((userNodeMap) => ({
        ...userNodeMap,
        [userId]: userNode
      }))

      setPendingUserNodes((pendingUserNodes) =>
        omit(pendingUserNodes, userNode.user.username)
      )
    },
    [setUserNodeMap, setPendingUserNodes]
  )

  const removeUserNode = React.useCallback(
    (userId: string | number) => {
      setUserNodeMap((userNodeMap) => {
        return omit(userNodeMap, userId)
      })

      if (focusedUser?.user_id === userId) {
        setFocusedUser(null)
      }
    },
    [focusedUser, setUserNodeMap, setFocusedUser]
  )

  const fetchAndUpsertUserById = React.useCallback(
    (userId: string) => {
      return fetchClubhouseAPI({
        endpoint: `/db/users/${userId}`
      }).then((res) => {
        if (!res.error) {
          addUserNode(res)
        }
      })
    },
    [addUserNode]
  )

  const fetchAndUpsertUserByUsername = React.useCallback(
    (username: string) => {
      return fetchClubhouseAPI({
        endpoint: `/db/users/username/${username}`
      }).then((res) => {
        if (!res.error) {
          addUserNode(res)
        }
      })
    },
    [addUserNode]
  )

  const addUserById = React.useCallback(
    (userId: string | number) => {
      incLoading()
      return fetchAndUpsertUserById(`${userId}`).finally(() => {
        decLoading()
      })
    },
    [incLoading, decLoading, fetchAndUpsertUserById]
  )

  const resetUserNodeMap = React.useCallback(
    (userNode: UserNode) => {
      const userId = userNode.user.user_id
      incLoading()
      setFocusedUser(userNode.user)
      setPendingUserNodes({})
      setUserNodeMap({
        [userId]: userNode
      })
      setLoading(0)
    },
    [
      setUserNodeMap,
      setFocusedUser,
      setPendingUserNodes,
      incLoading,
      setLoading
    ]
  )

  const resetUserNodeMapById = React.useCallback(
    (userId: string | number) => {
      incLoading()
      setUserNodeMap({})
      addUserById(userId).finally(() => {
        decLoading()
      })
    },
    [addUserById, setUserNodeMap, incLoading, decLoading]
  )

  React.useEffect(() => {
    setVizQuery(visualization === 'following' ? undefined : visualization)
  }, [visualization, setVizQuery])

  React.useEffect(() => {
    setRootUsername(router.query.username as string)
  }, [router.query.username])

  // sync userNodeMap => connectQuery
  React.useEffect(() => {
    const usernames = Array.from(
      new Set(
        Object.values(userNodeMap)
          .map((userNode) => userNode.user.username)
          .concat(Object.keys(pendingUserNodes))
      )
    )
      .filter((username) => username !== rootUsername)
      .sort()

    setConnectQuery(usernames.length ? usernames : undefined)
  }, [rootUsername, userNodeMap, pendingUserNodes, setConnectQuery])

  // initialize any pending user nodes and start loading them
  React.useEffect(() => {
    for (const username of Object.keys(pendingUserNodes)) {
      if (!pendingUserNodes[username]) {
        setPendingUserNodes((pendingUserNodes) => {
          pendingUserNodes[username] = true
          return pendingUserNodes
        })
        fetchAndUpsertUserByUsername(username)
      }
    }
  }, [
    pendingUserNodes,
    setPendingUserNodes,
    addUserNode,
    fetchAndUpsertUserByUsername
  ])

  React.useEffect(() => {
    const numPending = Object.keys(pendingUserNodes).length
    const numUsers = Object.keys(userNodeMap).length

    if (!numPending && numUsers > 0) {
      incLoading()
      simulation.current?.zoomToFit(250)

      setTimeout(() => {
        simulation.current?.zoomToFit(100)
        decLoading()
      }, 250)
    } else {
      // console.log('zoomToFit', numPending, pendingUserNodes)
    }
  }, [userNodeMap, pendingUserNodes, incLoading, decLoading])

  // React.useEffect(() => {
  //   for (const username of connectQuery) {
  //     if (!pendingUserNodes[username]) {

  //     }
  //   }
  // }, [connectQuery])

  return {
    visualization,
    setVisualization,

    focusedUser,
    setFocusedUser,

    userNodeMap,
    addUserNode,
    removeUserNode,
    addUserById,
    resetUserNodeMap,
    resetUserNodeMapById,

    simulation,

    loading,
    incLoading,
    decLoading,

    pendingUserNodes,

    isCorgiMode,
    setIsCorgiMode,

    infoModal
  }
}

export const Viz = createContainer(useViz)
