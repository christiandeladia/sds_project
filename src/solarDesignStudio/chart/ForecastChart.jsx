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

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * ForecastChart component renders a bar chart for ROI over 25 years.
 * @param {Object[]} forecast - Array of forecast items with year and returnOnInvestment.
 */
export default function ForecastChart({ forecast }) {
    const labels = forecast.map(item => item.year);
    const data = {
      labels,
      datasets: [
        {
          label: false,
          data: forecast.map(item => Number(item.returnOnInvestment)),
          backgroundColor: forecast.map(item =>
            Number(item.returnOnInvestment) >= 0
              ? 'rgb(61, 90, 215)'
              : 'rgb(182, 53, 46)'
          ),
          borderColor: forecast.map(item =>
            Number(item.returnOnInvestment) >= 0
              ? 'rgb(61, 90, 215)'
              : 'rgb(182, 53, 46)'
          ),
          borderWidth: 1
        }
      ]
    };
  

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: false,
              text: 'Year'
            },
            ticks: {
                autoSkip: true,    // ← don’t skip any labels
                maxRotation: 0,    // rotate a bit if needed
                minRotation: 0
              }
          },
          y: {
            title: {
              display: false,
              text: 'ROI (PHP)'
            },
          }
        },
        plugins: {
          legend: { display: false },
          title: { display: false, text: '25-Year ROI Forecast' }
        }
      };
    
        return (
          <div className="w-full h-50 flex justify-center items-center lg:h-70">
            <Bar data={data} options={options} />
          </div>
        );
      
    }
  