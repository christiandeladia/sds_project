// SyncedEnergyCharts.jsx
import React, { useMemo, useRef } from 'react';
import crosshairPlugin from 'chartjs-plugin-crosshair';
import zoomPlugin       from 'chartjs-plugin-zoom';
import dragDataPlugin   from 'chartjs-plugin-dragdata';

ChartJS.register(
  crosshairPlugin,
  zoomPlugin,
  dragDataPlugin,
  // …plus any controllers & scales you use…
);

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// register core components once
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function SyncedEnergyCharts() {
  // Generate some dummy data (replace with your real solar/battery arrays + labels)
  const labels = useMemo(
    () => Array.from({ length: 24 }, (_, i) => `${i}:00`),
    []
  );
  const solarData = useMemo(
    () => labels.map((_, i) => Math.sin(i / 3) * 5 + 10),
    [labels]
  );
  const batteryData = useMemo(
    () => labels.map((_, i) => Math.cos(i / 4) * 3 + 5),
    [labels]
  );

  const dataSolar = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: 'Solar (kW)',
          data: solarData,
          borderColor: 'orange',
          backgroundColor: 'rgba(255,165,0,0.2)',
          tension: 0.3,
          pointRadius: 2
        }
      ]
    }),
    [labels, solarData]
  );
  const dataBattery = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: 'Battery Flow (kW)',
          data: batteryData,
          borderColor: 'green',
          backgroundColor: 'rgba(0,128,0,0.2)',
          tension: 0.3,
          pointRadius: 2
        }
      ]
    }),
    [labels, batteryData]
  );

const options = {
  interaction: { mode: 'index', intersect: false },
  hover:       { mode: 'index', intersect: false },
  plugins: {
    tooltip: { 
      mode: 'index', 
      intersect: false 
    },
    crosshair: {
      line: { color: '#888', width: 1 },
      snap: { enabled: true },            // lock to data points
      sync: {
        enabled: true,
        group: 'energy-sync-group',       // ← same string in both
        suppressTooltips: false           // show tooltips on all charts
      },
      zoom: { enabled: false },
      drag: { enabled: false }
    },
    zoom: {
      pan:  { enabled: false },
      zoom: { wheel: true, pinch: true, mode: 'x' }
    },
    legend: { position: 'top' }
  },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { display: false } }
  }
};


  // Refs to both charts
  const solarRef   = useRef(null);
  const batteryRef = useRef(null);

  // onHover handler that mirrors tooltips to both charts
  const onHoverSync = (refList) => (event) => {
    refList.forEach((chartRef) => {
      const chart = chartRef.current;
      if (!chart) return;

      // get active elements at this mouse position
      const elems = chart.getElementsAtEventForMode(
        event.native,
        'index',
        { intersect: false },
        true
      );

      // apply to each chart
      refList.forEach((r) => {
        const c = r.current;
        if (!c) return;
        c.tooltip.setActiveElements(elems, {
          x: event.native.x,
          y: event.native.y
        });
        // only update without animation
        c.update('none');
      });
    });
  };

  // wrap handler once with both refs
  const handleHover = onHoverSync([solarRef, batteryRef]);

  // merge into options
  const optionsSolar   = { ...options, onHover: handleHover };
  const optionsBattery = { ...options, onHover: handleHover };

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <div style={{ flex: 1, height: 300 }}>
        <Line
          ref={solarRef}
          data={dataSolar}
          options={optionsSolar}
        />
      </div>
      <div style={{ flex: 1, height: 300 }}>
        <Line
          ref={batteryRef}
          data={dataBattery}
          options={optionsBattery}
        />
      </div>
    </div>
  );
}
