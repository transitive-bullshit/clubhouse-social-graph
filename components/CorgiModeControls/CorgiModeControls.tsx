import React from 'react'
import cs from 'classnames'

import { Tooltip } from '@chakra-ui/react'
import { FaDog } from 'react-icons/fa'

import { Viz } from 'state/viz'
import { Paper } from '../Paper/Paper'

import styles from './styles.module.css'

export const CorgiModeControls = () => {
  const { isCorgiMode, setIsCorgiMode } = Viz.useContainer()

  const onClickToggleCorgiMode = React.useCallback(() => {
    setIsCorgiMode((isCorgiMode) => !isCorgiMode)
  }, [setIsCorgiMode])

  return (
    <div className={styles.container}>
      <Paper className={cs(styles.content, isCorgiMode && styles.enabled)}>
        <Tooltip
          label='Toggle Corgi Mode'
          aria-label='Toggle Corgi Mode'
          placement='right'
        >
          <button
            aria-label='Toggle Corgi Mode'
            className={styles.control}
            onClick={onClickToggleCorgiMode}
          >
            <FaDog />
          </button>
        </Tooltip>
      </Paper>
    </div>
  )
}
