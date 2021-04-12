import React from 'react'
import ForceGraph2D from 'react-force-graph-2d'

export default function ForceGraph({ fgRef, ...props }) {
  return <ForceGraph2D {...props} ref={fgRef} />
}
