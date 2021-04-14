import React from 'react'
import { createContainer } from 'unstated-next'
import { useDisclosure } from '@chakra-ui/react'
import { useQueryParam, StringParam, withDefault } from 'use-query-params'
import omit from 'lodash.omit'

import { User, UserNode, UserNodeMap, Visualization } from 'lib/types'
import { fetchClubhouseAPI } from 'lib/fetch-clubhouse-api'

function useViz() {
  const [vizQuery, setVizQuery] = useQueryParam<string>(
    'viz',
    withDefault(StringParam, 'following')
  )
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [isCorgiMode, setIsCorgiMode] = React.useState<boolean>(false)
  const [visualization, setVisualization] = React.useState<Visualization>(
    vizQuery as Visualization
  )
  const [userNodeMap, setUserNodeMap] = React.useState<UserNodeMap>({})
  const [focusedUser, setFocusedUser] = React.useState<User>(null)
  const simulation = React.useRef<any>()

  // TODO
  const infoModal = useDisclosure()

  const addUserNode = React.useCallback(
    (userNode: UserNode) => {
      const userId = userNode.user.user_id
      console.log('addUserNode', userId, userNode)

      setUserNodeMap((userNodeMap) => ({
        ...userNodeMap,
        [userId]: userNode
      }))
    },
    [setUserNodeMap]
  )

  const removeUserNode = React.useCallback(
    (userId: string | number) => {
      setUserNodeMap((userNodeMap) => omit(userNodeMap, userId))
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

  React.useEffect(() => {
    setVizQuery(visualization === 'following' ? undefined : visualization)
  }, [visualization, setVizQuery])

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

    isCorgiMode,
    setIsCorgiMode,

    infoModal
  }
}

export const Viz = createContainer(useViz)
