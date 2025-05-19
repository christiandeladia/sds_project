import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * EnergyMixChart renders a horizontal bar chart showing the mix of energy sources.
 * @param {number} monthlyGeneration - Monthly solar generation (kWh).
 * @param {number} utilityMonthlykWh - Monthly utility consumption (kWh).
 */
export default function EnergyMixChart({ monthlyGeneration, utilityMonthlykWh }) {
  const buildingPct = 100;
  const utilityPct = Math.round(
    Math.max(0, (1 - monthlyGeneration / utilityMonthlykWh) * 100)
  );
  const solarPct = Math.round((monthlyGeneration / utilityMonthlykWh) * 100);

  const datasets = [
    {
      label: 'Building Usage %',
      data: [buildingPct],
      backgroundColor: 'rgba(0,0,0,1)',
      borderWidth: 1
    },
    {
      label: 'Utility %',
      data: [utilityPct],
      backgroundColor: 'rgba(149,154,159,1)',
      borderWidth: 1
    },
    {
      label: 'Solar %',
      data: [solarPct],
      backgroundColor: 'rgba(252,158,9,1)',
      borderWidth: 1
    }
  ].sort((a, b) => b.data[0] - a.data[0]);

  const data = {
    labels: ['Energy Mix'],
    datasets
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    },
    scales: {
      y: { display: false, title: { display: false } },
      x: { title: { display: false, text: '%' } }
    }
  };

  return (
    <div className="w-full h-50 flex justify-center items-center lg:h-70">
      <Bar data={data} options={options} />
    </div>
  );
}