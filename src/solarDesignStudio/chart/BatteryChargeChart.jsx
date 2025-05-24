import React, { useMemo, useRef, useState} from 'react';
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
import crosshairPlugin from 'chartjs-plugin-crosshair';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend, 
  crosshairPlugin
);

import {
  generateTimeLabels,
  generateSolarPct,
  generateLoadPct,
  simulateBatteryAndGrid,
  DT_HOURS,
} from './ChargeUtils';  // <-- import from your new util file

export default function BatteryChargeChart({ dailyEnergyData, sliderMax, solarPanels, battery, batteryReady }) {
  // Extract runtime values from props or provide defaults
  const MODULE_POWER_W = solarPanels.watts;
  const MODULE_COUNT = solarPanels.newCount;
  const PERFORMANCE_RATIO = solarPanels.performanceRatio;
  const PV_CAPACITY_KW = (MODULE_POWER_W * MODULE_COUNT) / 1000;

  const BATTERY_COUNT = battery.newCount;
  const BATTERY_CAPACITY_KWH = battery.batteryCapacity;
  const MAX_CHARGE_POWER_KW = battery.maxCharge;
  const MAX_DISCHARGE_POWER_KW = battery.maxDischarge;
  const CHARGE_EFFICIENCY = battery.chargeEfficiency;
  const DISCHARGE_EFFICIENCY = battery.dischargeEfficiency;
  const MIN_SOC = battery.minCharging;
  const MAX_SOC = battery.maxCharging;
  const INITIAL_SOC = battery.initialCharging;
  const BATTERY_READY = batteryReady;

  const labels = useMemo(generateTimeLabels, []);
  const solarPct = useMemo(() => generateSolarPct(5), []);
  const pctPerSlot = dailyEnergyData.length === 12
    ? dailyEnergyData
    : [4, 5, 4, 7, 12, 200, 12, 12, 5, 3, 5, 2];

  const solarKW = useMemo(
    () => solarPct.map(pct => pct / 100 * PV_CAPACITY_KW * PERFORMANCE_RATIO),
    [solarPct, PV_CAPACITY_KW, PERFORMANCE_RATIO]
  );
  const loadKW = useMemo(() => generateLoadPct(pctPerSlot, sliderMax), [pctPerSlot, sliderMax]);
console.log('batteryReady:', BATTERY_READY);
console.log('batteryCount:', BATTERY_COUNT);
console.log('batteryCapacityKWh:', BATTERY_CAPACITY_KWH);
console.log('Solar KW:', solarKW);
console.log('Load KW:', loadKW);
console.log(sliderMax); 
  const { socArr } = useMemo(
    () =>
      simulateBatteryAndGrid(solarKW, loadKW, {
        initialSOC: INITIAL_SOC,
        batteryCount: BATTERY_COUNT,
        batteryCapacityKWh: BATTERY_CAPACITY_KWH,
        maxChargePowerKW: MAX_CHARGE_POWER_KW,
        maxDischargePowerKW: MAX_DISCHARGE_POWER_KW,
        chargeEfficiency: CHARGE_EFFICIENCY,
        dischargeEfficiency: DISCHARGE_EFFICIENCY,
        minSOC: MIN_SOC,
        maxSOC: MAX_SOC,
        dtHours: DT_HOURS,
        batteryReady: BATTERY_READY,
      }),
    [
      solarKW,
      loadKW,
      INITIAL_SOC,
      BATTERY_COUNT,
      BATTERY_CAPACITY_KWH,
      MAX_CHARGE_POWER_KW,
      MAX_DISCHARGE_POWER_KW,
      CHARGE_EFFICIENCY,
      DISCHARGE_EFFICIENCY,
      MIN_SOC,
      MAX_SOC,
      DT_HOURS,
      BATTERY_READY
    ]
  );

  const [isZoomed, setIsZoomed] = useState(false);
   const chartRef = useRef(null);
  // build chart data using socArr
  const data = useMemo(() => ({
    labels: generateTimeLabels(),
    datasets: [{
      label: 'Battery SoC (%)',
      data: socArr,
      borderColor: 'rgba(34,202,236,1)',
      borderWidth: 1,
      backgroundColor: 'rgba(34,202,236,0.2)',
      fill: true,
      tension: 0.4,
      pointRadius: 0
    }]
  }), [socArr]);

const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    hover:       { mode: 'index', intersect: false },
    scales: {
      x: { grid: { display: false }, ticks: { autoSkip: true, maxTicksLimit: 6, callback: (_v, i) => i % 24 === 0 ? `${(i*5)/60 < 12 ? (i*5)/60||12 : (i*5)/60-12} ${((i*5)/60)<12?'AM':'PM'}` : '' } },
      y: { grid: { display: false }, title: { display: false } }
    },
    plugins: {
      dragData: { enabled: false },
      zoom: {
        pan: { enabled: false },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          drag: { enabled: true, threshold: 5, backgroundColor: 'rgba(0,0,0,0.1)' },
          mode: 'x',
          onZoomComplete: ({chart}) => setIsZoomed(true),
          onZoomRejected: () => {},
        }
      },
      crosshair: {
        drag: { enabled: false },
        line: { color: '#888', width: 1 },
        snap: { enabled: true },   
        sync: {
          enabled: true,
          group: 1,    // ← same string in both charts
          suppressTooltips: false,   // ← show tooltips on both
          axis: 'x', 
        },
        zoom: {
          enabled: true,                                      // enable zooming
          // zoomboxBackgroundColor: 'rgba(66,133,244,0.2)',     // background color of zoom box 
          // zoomboxBorderColor: '#48F',                         // border color of zoom box
          // zoomButtonText: 'Reset Zoom',                       // reset zoom button text
          // zoomButtonClass: 'reset-zoom',                      // reset zoom button class
        },
        callbacks: {
          beforeZoom: () => function(start, end) {                  // called before zoom, return false to prevent zoom
            return true;
          },
          afterZoom: () => function(start, end) {                   // called after zoom
          }
        }
      },
      legend: { position: 'top' },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: { label: ctx => `SoC: ${ctx.parsed.y.toFixed(1)}%` }
      },
    }
  }), []);

    const handleReset = () => {
    chartRef.current?.resetZoom();
    setIsZoomed(false);
  };
  return (
      <div style={{ width: '100%', height: '300px' }}>
        <Line ref={chartRef} data={data} options={options} />
        {isZoomed && (
          <button
            className="absolute top-2 right-2 z-10 px-2 py-1 bg-gray-50 border-2 border-gray-400 text-gray-600 font-semibold rounded-2xl text-xs cursor-pointer"
            onClick={handleReset}
          >
            Reset Zoom
          </button>
        )}
      </div>
  );
}
