import dynamic from 'next/dynamic'
export default dynamic(() => import('./force-graph'), {
  ssr: false
})
