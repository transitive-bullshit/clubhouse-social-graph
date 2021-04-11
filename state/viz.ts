import React from 'react'
import { createContainer } from 'unstated-next'
import { useDisclosure } from '@chakra-ui/react'

import { useQueryParam, StringParam, withDefault } from 'use-query-params'

import { User, UserNode, UserNodeMap, Visualization } from 'lib/types'

function useViz() {
  const [viz, setViz] = useQueryParam<string>(
    'viz',
    withDefault(StringParam, 'following')
  )
  const [visualization, setVisualization] = React.useState<Visualization>(
    viz as Visualization
  )
  const [userNodeMap, setUserNodeMap] = React.useState<UserNodeMap>({})
  const [focusedUser, setFocusedUser] = React.useState<User>(null)
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

  React.useEffect(() => {
    setViz(visualization === 'following' ? undefined : visualization)
  }, [visualization, setViz])

  return {
    visualization,
    setVisualization,

    focusedUser,
    setFocusedUser,

    userNodeMap,
    addUserNode,
    setUserNodeMap,

    infoModal
  }
}

export const Viz = createContainer(useViz)
