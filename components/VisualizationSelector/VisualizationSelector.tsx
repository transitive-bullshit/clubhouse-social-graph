import React from 'react'
import cs from 'classnames'
import { Tooltip } from '@chakra-ui/react'

import { Viz } from 'state/viz'
import { Paper } from '../Paper/Paper'

import styles from './styles.module.css'

export const VisualizationSelector = () => {
  const { visualization, setVisualization } = Viz.useContainer()
  const [hasMounted, setHasMounted] = React.useState(false)
  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  const onSelectFollowers = React.useCallback(() => {
    setVisualization('followers')
  }, [setVisualization])

  const onSelectFollowing = React.useCallback(() => {
    setVisualization('following')
  }, [setVisualization])

  const onSelectInvites = React.useCallback(() => {
    setVisualization('invites')
  }, [setVisualization])

  if (!hasMounted) {
    return null
  }

  return (
    <div className={styles.container}>
      <Paper className={styles.content}>
        <Tooltip
          label='View a sample of your followers'
          aria-label='View followers'
          placement='bottom'
        >
          <div
            className={cs(
              styles.option,
              visualization === 'followers' && styles.selected
            )}
            onClick={onSelectFollowers}
          >
            Followers
          </div>
        </Tooltip>

        <Tooltip
          label="View a sample of the users that you're following"
          aria-label='View following'
          placement='bottom'
        >
          <div
            className={cs(
              styles.option,
              visualization === 'following' && styles.selected
            )}
            onClick={onSelectFollowing}
          >
            Following
          </div>
        </Tooltip>

        <Tooltip
          label='View your invite chain'
          aria-label='View your invite chain'
          placement='bottom'
        >
          <div
            className={cs(
              styles.option,
              visualization === 'invites' && styles.selected
            )}
            onClick={onSelectInvites}
          >
            Invites
          </div>
        </Tooltip>
      </Paper>
    </div>
  )
}
