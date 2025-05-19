// BatteryChargeChart.jsx
import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

// register Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// import your simulation helpers
import {
  generateTimeLabels,
  generateSolarPct,
  generateLoadPct,
  simulateBatteryAndGrid,
  PV_CAPACITY_KW,
  PERFORMANCE_RATIO,
  LOAD_CAPACITY_KW,
  DT_HOURS
} from './EnergyChargeChart';

export default function BatteryChargeChart() {
  // 1) build X-axis timestamps
  const labels = useMemo(generateTimeLabels, []);

  // 2) generate your % curves
  const solarPct = useMemo(() => generateSolarPct(5), []);
  const loadPct  = useMemo(generateLoadPct, []);

  // 3) turn %→kW
  const solarKW = useMemo(
    () => solarPct.map(p => p/100 * PV_CAPACITY_KW * PERFORMANCE_RATIO),
    [solarPct]
  );
  const loadKW = useMemo(
    () => loadPct.map(p => p/100 * LOAD_CAPACITY_KW),
    [loadPct]
  );

  // 4) run battery simulation to get SoC series
  const { socArr } = useMemo(
    () => simulateBatteryAndGrid(solarKW, loadKW),
    [solarKW, loadKW]
  );

  // 5) build chart data using socArr
  const data = {
    labels,
    datasets: [
      {
        label: 'Battery State of Charge (%)',
        data: socArr,
        fill: true,
        backgroundColor: 'rgba(34, 202, 236, 0.2)',
        borderColor: 'rgba(34, 202, 236, 1)',
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 6,
          callback: (_val, idx) => {
            // show every 2-hour label
            if (idx % 24 === 0) {
              const hour = (idx * 5) / 60;
              const label = hour === 0
                ? '12 AM'
                : hour < 12
                  ? `${hour} AM`
                  : hour === 12
                    ? '12 PM'
                    : `${hour - 12} PM`;
              return label;
            }
            return '';
          },
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        min: 0,
        max: 100,
        title: { display: false, text: 'SoC (%)' },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `SoC: ${ctx.parsed.y.toFixed(1)}%`,
        },
      },
    },
  };

  return (
    <div style={{ height: '200px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}
