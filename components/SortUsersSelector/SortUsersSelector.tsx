import React from 'react'
import cs from 'classnames'
import { Tooltip } from '@chakra-ui/react'

import { Paper } from '../Paper/Paper'

import styles from './styles.module.css'

export const SortUsersSelector = ({ selection, onChangeSelection }) => {
  return (
    <div className={styles.container}>
      <Paper className={styles.content}>
        <Tooltip
          label='Display the top Clubhouse users sorted by the highest transitive importance (using a PageRank algorithm).'
          aria-label='Sort by PageRank'
          placement='bottom'
        >
          <div
            className={cs(
              styles.option,
              selection === 'pagerank' && styles.selected
            )}
            onClick={() => onChangeSelection('pagerank')}
          >
            PageRank
          </div>
        </Tooltip>

        <Tooltip
          label='Display the top Clubhouse users sorted by the most number of followers.'
          aria-label='Sort by number of followers'
          placement='bottom'
        >
          <div
            className={cs(
              styles.option,
              selection === 'num_followers' && styles.selected
            )}
            onClick={() => onChangeSelection('num_followers')}
          >
            Number of Followers
          </div>
        </Tooltip>
      </Paper>
    </div>
  )
}
