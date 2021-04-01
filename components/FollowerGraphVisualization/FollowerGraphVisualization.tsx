import React from 'react'
import * as d3 from 'd3'
import data from './miserables.json'

export const FollowerGraphVisualization: React.FC = () => {
  const d3Ref = React.useRef(null)

  React.useEffect(() => {
    if (!d3Ref.current) {
      return
    }

    const width = 640
    const height = 480

    const links = data.links.map((d) => Object.create(d))
    const nodes = data.nodes.map((d) => Object.create(d))

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink(links).id((d) => d.id)
      )
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2))

    const svg = d3.select(d3Ref.current).attr('viewBox', [0, 0, width, height])

    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links, (d, i) => i)
      .join('line')
      .attr('stroke-width', (d) => Math.sqrt(d.value))

    const node = svg
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes, (d) => d.id)
      .join('circle')
      .attr('r', 5)
      .attr('fill', color())
    // .call(drag(simulation))

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

    // function drag(simulation) {
    //   function dragstarted(event) {
    //     if (!event.active) simulation.alphaTarget(0.3).restart()
    //     event.subject.fx = event.subject.x
    //     event.subject.fy = event.subject.y
    //   }

    //   function dragged(event) {
    //     event.subject.fx = event.x
    //     event.subject.fy = event.y
    //   }

    //   function dragended(event) {
    //     if (!event.active) simulation.alphaTarget(0)
    //     event.subject.fx = null
    //     event.subject.fy = null
    //   }

    //   return d3
    //     .drag()
    //     .on('start', dragstarted)
    //     .on('drag', dragged)
    //     .on('end', dragended)
    // }

    // Bind D3 data
    // const update = svg.append('g').selectAll('text').data(data)

    // // Enter new D3 elements
    // update
    //   .enter()
    //   .append('text')
    //   .attr('x', (d, i) => i * 25)
    //   .attr('y', 40)
    //   .style('font-size', 24)
    //   .text((d: number) => d)

    // // Update existing D3 elements
    // update.attr('x', (d, i) => i * 40).text((d: number) => d)

    // // Remove old D3 elements
    // update.exit().remove()
  }, [data, d3Ref.current])

  return <svg width={640} height={480} ref={d3Ref} />
}
