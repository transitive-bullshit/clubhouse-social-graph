import React from 'react'
import cs from 'classnames'

import { Tooltip } from '@chakra-ui/react'
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai'
import { MdZoomOutMap } from 'react-icons/md'
import { FaQuestion } from 'react-icons/fa'

import { Viz } from 'state/viz'
import { Paper } from '../Paper/Paper'

import styles from './styles.module.css'

export const ZoomControls = () => {
  const { simulation, infoModal } = Viz.useContainer()

  const onClickZoomToFit = React.useCallback(() => {
    if (simulation.current) {
      simulation.current.zoomToFit(250)
    }
  }, [simulation])

  const onClickZoomIn = React.useCallback(() => {
    if (simulation.current) {
      simulation.current.zoom(simulation.current.zoom() * 1.5, 250)
    }
  }, [simulation])

  const onClickZoomOut = React.useCallback(() => {
    if (simulation.current) {
      simulation.current.zoom(simulation.current.zoom() * 0.75, 250)
    }
  }, [simulation])

  return (
    <div className={styles.container}>
      <Paper className={cs(styles.content, styles.info)}>
        <Tooltip label='Info' aria-label='Info' placement='left'>
          <button
            aria-label='Info'
            className={styles.control}
            onClick={infoModal.onOpen}
          >
            <FaQuestion />
          </button>
        </Tooltip>
      </Paper>

      <Paper className={cs(styles.content, styles.reset)}>
        <Tooltip label='Zoom to Fit' aria-label='Zoom to Fit' placement='left'>
          <button
            aria-label='Zoom to Fit'
            className={styles.control}
            onClick={onClickZoomToFit}
          >
            <MdZoomOutMap />
          </button>
        </Tooltip>
      </Paper>

      <Paper className={cs(styles.content, styles.zoom)}>
        <Tooltip label='Zoom In' aria-label='Zoom In' placement='left'>
          <button
            aria-label='Zoom In'
            className={styles.control}
            onClick={onClickZoomIn}
          >
            <AiOutlinePlus />
          </button>
        </Tooltip>

        <div className={styles.spacer} />

        <Tooltip label='Zoom Out' aria-label='Zoom Out' placement='left'>
          <button
            aria-label='Zoom Out'
            className={styles.control}
            onClick={onClickZoomOut}
          >
            <AiOutlineMinus />
          </button>
        </Tooltip>
      </Paper>
    </div>
  )
}
