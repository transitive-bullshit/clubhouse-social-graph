import React from 'react'
import dynamic from 'next/dynamic'

const ForceGraphDynamic = dynamic(() => import('./force-graph'), {
  ssr: false
})

export default React.forwardRef((props: any, ref) => (
  <ForceGraphDynamic {...props} fgRef={ref} />
))
