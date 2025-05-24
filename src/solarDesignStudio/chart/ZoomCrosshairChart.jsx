import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import crosshairPlugin from 'chartjs-plugin-crosshair';
import { Chart } from 'react-chartjs-2';

// Register Chart.js components and plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  crosshairPlugin
);

export default function SyncedScatterCharts() {
  // Shared labels and data
  const labels = useMemo(() => Array.from({ length: 11 }, (_, i) => i), []);
  const dataA = useMemo(() => ({
    labels,
    datasets: [{
      label: 'Sine Wave',
      data: labels.map(x => Math.sin(x / 2)),
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      fill: false,
      tension: 0.3
    }]
  }), [labels]);

  const dataB = useMemo(() => ({
    labels,
    datasets: [{
      label: 'Cosine Wave',
      data: labels.map(x => Math.cos(x / 2)),
      borderColor: 'rgba(153, 102, 255, 1)',
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      fill: false,
      tension: 0.3
    }]
  }), [labels]);

  // Common options with crosshair sync
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    hover:       { mode: 'index', intersect: false },
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: false
      },
      crosshair: {
        line: { color: '#888', width: 1 },
        sync: { enabled: true, group: 1, suppressTooltips: false },
        snap: { enabled: true }
      },
      legend: { position: 'top' }
    },
    scales: {
      x: { title: { display: true, text: 'X Value' } },
      y: { title: { display: true, text: 'Y Value' } }
    }
  }), []);

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <div style={{ flex: 1, height: '300px' }}>
        <Chart type="line" data={dataA} options={options} />
      </div>
      <div style={{ flex: 1, height: '300px' }}>
        <Chart type="line" data={dataB} options={options} />
      </div>
    </div>
  );
}
