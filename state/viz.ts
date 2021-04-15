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
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
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
    },
    [setUserNodeMap]
  )

  const addUserById = React.useCallback(
    (userId: string | number) => {
      setIsLoading(true)
      fetchAndUpsertUserById(`${userId}`).then(() => {
        setTimeout(() => {
          simulation.current?.zoomToFit(250)
          setIsLoading(false)
        }, 1000)
      })
    },
    [addUserNode, setIsLoading, simulation]
  )

  const resetUserNodeMap = React.useCallback(
    (userNode: UserNode) => {
      const userId = userNode.user.user_id
      setIsLoading(true)
      setFocusedUser(userNode.user)
      setUserNodeMap({
        [userId]: userNode
      })
      setIsLoading(false)
    },
    [setUserNodeMap, setFocusedUser, setIsLoading]
  )

  const resetUserNodeMapById = React.useCallback(
    (userId: string | number) => {
      setIsLoading(true)
      setUserNodeMap({})
      addUserById(userId)
    },
    [addUserById, setUserNodeMap, setIsLoading]
  )

  function fetchAndUpsertUserById(userId: string) {
    return fetchClubhouseAPI({
      endpoint: `/db/users/${userId}`
    }).then((res) => {
      if (!res.error) {
        addUserNode(res)
      }
    })
  }

  function fetchAndUpsertUserByUsername(username: string) {
    return fetchClubhouseAPI({
      endpoint: `/db/users/username/${username}`
    }).then((res) => {
      if (!res.error) {
        addUserNode(res)
      }
    })
  }

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
  }, [pendingUserNodes, addUserNode, setPendingUserNodes])

  React.useEffect(() => {
    const numKeys = Object.keys(pendingUserNodes).length
    const numUsers = Object.keys(userNodeMap).length

    if (!numKeys && numUsers > 0) {
      simulation.current?.zoomToFit(500)
      setIsLoading(true)
      setTimeout(() => {
        simulation.current?.zoomToFit(250)

        setTimeout(() => {
          simulation.current?.zoomToFit(100)
          setIsLoading(false)
        }, 250)
      }, 1000)
    } else {
      console.log('keys', numKeys, pendingUserNodes)
    }
  }, [userNodeMap, pendingUserNodes, setIsLoading])

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

    isLoading,
    setIsLoading,
    pendingUserNodes,

    isCorgiMode,
    setIsCorgiMode,

    infoModal
  }
}

export const Viz = createContainer(useViz)
