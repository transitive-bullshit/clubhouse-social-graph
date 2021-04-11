import React from 'react'
import { ForceGraph2D } from 'react-force-graph'

export default function ForceGraph({ fgRef, ...props }) {
  return <ForceGraph2D {...props} ref={fgRef} />
}
