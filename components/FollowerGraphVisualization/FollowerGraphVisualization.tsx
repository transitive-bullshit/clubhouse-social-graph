import React from 'react'
import * as d3 from 'd3'
import { useMeasure } from 'react-use'

import { fetchClubhouseAPI } from 'lib/fetch-clubhouse-api'

import styles from './styles.module.css'
import data from './miserables.json'

export const FollowerGraphVisualization: React.FC<{
  username: string
}> = ({ username }) => {
  const [measureRef, { width, height }] = useMeasure()
  const d3Ref = React.useRef(null)

  React.useEffect(() => {
    if (!d3Ref.current) {
      return
    }

    const links = data.links.map((d) => Object.create(d))
    const nodes = data.nodes.map((d) => Object.create(d))

    const id = (d: any) => d.id

    const simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(id))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2))

    const svg = d3
      .select(d3Ref.current)
      .attr('viewBox', [0, 0, width, height] as any)

    const link = svg
      .select('g.lines')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', (d) => Math.sqrt(d.value))

    const node = svg
      .select('g.nodes')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes, id)
      .join('circle')
      .attr('r', 5)
      .attr('fill', color())
      .call(drag(simulation))

    node.append('title').text((d) => d.id)

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y)
    })

    function color() {
      const scale = d3.scaleOrdinal(d3.schemeCategory10)
      return (d) => scale(d.group)
    }

    function drag(simulation) {
      function onDragStart(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        event.subject.fx = event.subject.x
        event.subject.fy = event.subject.y
      }

      function onDrag(event) {
        event.subject.fx = event.x
        event.subject.fy = event.y
      }

      function onDragEnd(event) {
        if (!event.active) simulation.alphaTarget(0)
        event.subject.fx = null
        event.subject.fy = null
      }

      return d3
        .drag()
        .on('start', onDragStart)
        .on('drag', onDrag)
        .on('end', onDragEnd)
    }

    return () => {
      simulation.stop()
    }
  }, [d3Ref.current, width, height])

  React.useEffect(() => {
    fetchClubhouseAPI({
      endpoint: `/db/users/13870`
    }).then((res) => {
      console.log(res)
    })
  }, [])

  // React.useEffect(() => {
  //   fetchClubhouseAPI({
  //     endpoint: `/db/users/username/${username}`
  //   }).then((res) => {
  //     console.log(res)
  //   })
  // }, [])

  return (
    <div className={styles.wrapper} ref={measureRef}>
      <svg width={width} height={height} ref={d3Ref}>
        <g className='lines' />
        <g className='nodes' />
      </svg>
    </div>
  )
}
