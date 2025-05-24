import React, { useRef } from 'react'
import EnergyChargeChart from './EnergyChargeChart'
import BatteryChargeChart from './BatteryChargeChart'

export default function SyncedCharts(props) {
  const chartARef = useRef(null)
  const chartBRef = useRef(null)

  const handleHover = (event, activeElements) => {
    const chartA = chartARef.current?.chart; // react-chartjs-2 puts Chart.js instance on `.chart`
    const chartB = chartBRef.current?.chart;
    if (!chartA || !chartB) return

    // use chartA to get the elements under the pointer
    const points = chartA.getElementsAtEventForMode(
      event.native,      // react’s native event
      'index',
      { intersect: false },
      true
    )

    // mirror them on chartB
    chartB.tooltip.setActiveElements(
      points,
      { x: event.clientX, y: event.clientY }
    )
    chartB.update()
  }

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <div style={{ flex: 1 }}>
        <EnergyChargeChart
          ref={chartARef}
          {...props}
          onHover={handleHover}
        />
      </div>
      <div style={{ flex: 1 }}>
        <BatteryChargeChart
          ref={chartBRef}
          {...props}
        />
      </div>
    </div>
  )
}
