import React, { useMemo, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { FaSun, FaBolt, FaBatteryFull, FaBatteryQuarter, FaPlug  } from "react-icons/fa";
import BatteryChargeChart from './BatteryChargeChart';
import {
  DT_HOURS,
  generateTimeLabels,
  generateSolarPct,
  generateLoadPct,
  simulateBatteryAndGrid
} from './ChargeUtils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import crosshairPlugin from 'chartjs-plugin-crosshair';
import dragDataPlugin from 'chartjs-plugin-dragdata';
ChartJS.unregister(dragDataPlugin);
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  crosshairPlugin,
  zoomPlugin
);



export default function EnergyFlowChart({ dailyEnergyData = [], sliderMax, solarPanels, battery, netMetering = 'no', batteryReady }) {

  const MODULE_POWER_W = solarPanels.watts;
  const MODULE_COUNT = solarPanels.newCount;
  const PERFORMANCE_RATIO = solarPanels.performanceRatio;
  const PV_CAPACITY_KW = (MODULE_POWER_W * MODULE_COUNT) / 1000;
  const INVERTER_COUNT = solarPanels.inverterCount;

  // Extract battery specs (with defaults)
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

  const allowGridExport = netMetering === 'yes';

  // raw % curves
  const labels   = useMemo(generateTimeLabels, []);
  const solarPct = useMemo(generateSolarPct, []);
   const pctPerSlot = dailyEnergyData.length === 12
    ? dailyEnergyData
    : [4, 5, 4, 7, 12, 200, 12, 12, 5, 3, 5, 2];

  // const solarKW = useMemo(
  //   () => solarPct.map(pct => pct / 100 * PV_CAPACITY_KW * PERFORMANCE_RATIO),
  //   [solarPct, PV_CAPACITY_KW, PERFORMANCE_RATIO]
  // );

  const inverterMaxKW = INVERTER_COUNT * 5;
  const solarKW = useMemo(
  () => solarPct.map(pct => {
    // 1) DC kW from panels
    const dcKW = (pct/100) * PV_CAPACITY_KW;
    // 2) AC kW after performance ratio
    const acKW = dcKW * PERFORMANCE_RATIO;
    // 3) clamp to inverter limit
    return Math.min(acKW, inverterMaxKW);
  }),
  [solarPct, PV_CAPACITY_KW, PERFORMANCE_RATIO, inverterMaxKW]
);

  const loadKW = useMemo(() => generateLoadPct(pctPerSlot, sliderMax), [pctPerSlot, sliderMax]);


 const { socArr, battFlowKW, gridFlowKW } = useMemo(
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

  // ——————————————————————————————————————————
  // 1) compute total kWh for each curve
  // ——————————————————————————————————————————
  const totalSolarKWh = useMemo(
    () => solarKW.reduce((sum, kW) => sum + kW, 0) * DT_HOURS,
    [solarKW]
  );
  const totalLoadKWh = useMemo(
    () => loadKW.reduce((sum, kW) => sum + kW, 0) * DT_HOURS,
    [loadKW]
  );

  // battery flow: we care about charge vs discharge separately
  const totalBatteryChargeKWh = useMemo(
    () =>
      battFlowKW
        .filter(flow => flow > 0)
        .reduce((sum, kW) => sum + kW, 0)
      * DT_HOURS,
    [battFlowKW]
  );
  const totalBatteryDischargeKWh = useMemo(
    () =>
      battFlowKW
        .filter(flow => flow < 0)
        .reduce((sum, kW) => sum + Math.abs(kW), 0)
      * DT_HOURS,
    [battFlowKW]
  );

  // adjust grid flow based on allowGridExport
  const adjustedGridFlowKW = useMemo(() => {
    if (allowGridExport) {
      return gridFlowKW;
    } else {
      // Block export by zeroing out positive grid flows
      return gridFlowKW.map(kW => (kW > 0 ? 0 : kW));
    }
  }, [gridFlowKW, allowGridExport]);

 // Use adjustedGridFlowKW instead of gridFlowKW below
  const totalGridExportKWh = useMemo(
    () =>
      adjustedGridFlowKW
        .filter(flow => flow > 0)
        .reduce((sum, kW) => sum + kW, 0)
      * DT_HOURS,
    [adjustedGridFlowKW]
  );

  const totalGridImportKWh = useMemo(
    () =>
      adjustedGridFlowKW
        .filter(flow => flow < 0)
        .reduce((sum, kW) => sum + Math.abs(kW), 0)
      * DT_HOURS,
    [adjustedGridFlowKW]
  );

  // ——————————————————————————————————————————
  // 2) compute percentage shares relative to total load
  // ——————————————————————————————————————————
  const pctSolar  = (totalSolarKWh  / totalLoadKWh * 100).toFixed(1);
  const pctBattery = (totalBatteryDischargeKWh / totalLoadKWh * 100).toFixed(1);
  const pctGrid   = (totalGridImportKWh   / totalLoadKWh * 100).toFixed(1);
  const chartRef = useRef(null);
  const [isZoomed, setIsZoomed] = useState(false);
  // chart in kW
  const datasets = useMemo(() => {
    const base = [
      {
        label: 'Solar',
        data: solarKW,
        borderColor: 'rgba(251,146,60,1)',
        borderWidth: 1,
        backgroundColor: 'rgba(251,146,60,0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 0
      }
    ];

    if (batteryReady) {
      base.push({
        label: 'Battery',
        data: battFlowKW,
        borderColor: 'rgba(34,197,94,1)',
        borderWidth: 1,
        backgroundColor: 'rgba(34,197,94,0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 0
      });
    }

    base.push(
      {
        label: 'Grid',
        data: adjustedGridFlowKW,
        borderColor: 'rgba(234,179,8,1)',
        borderWidth: 1,
        backgroundColor: 'rgba(234,179,8,0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 0
      },
      {
        label: 'Load',
        data: loadKW,
        borderColor: 'rgba(201,203,207,1)',
        borderWidth: 1,
        backgroundColor: 'rgba(201,203,207,0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 0
      }
    );
      base.push({
    label: 'Inverter Capacity',
    data: labels.map(() => inverterMaxKW),
    borderColor: 'rgba(220,38,38,0.8)',
    borderWidth: 1,
    borderDash: [6, 4],
    pointRadius: 0,
    fill: false,
    tension: 0,
  });

    return base;
  }, [solarKW, battFlowKW, adjustedGridFlowKW, loadKW, batteryReady, labels]);

  const data = useMemo(() => ({ labels, datasets }), [labels, datasets]);

  const allValues = [
    ...solarKW,
    ...battFlowKW,
    ...adjustedGridFlowKW,
    ...loadKW,
   inverterMaxKW, 
  ];
  const dataMin = Math.min(...allValues);
  const dataMax = Math.max(...allValues);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    hover:       { mode: 'index', intersect: false },
    scales: {
      x: { grid: { display: false }, ticks: { autoSkip: true, maxTicksLimit: 6, callback: (_v, i) => i % 24 === 0 ? `${(i*5)/60 < 12 ? (i*5)/60||12 : (i*5)/60-12} ${((i*5)/60)<12?'AM':'PM'}` : '' } },
      y: { grid: { display: false }, title: { display: false }, min: dataMin - 1, max: dataMax + 2 }
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
        callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} kW` }
      }
    }
  }), [dataMin, dataMax]);

  const handleReset = () => {
    chartRef.current?.resetZoom();
    setIsZoomed(false);
  };

  return (
    <div>
      {/* Chart */}
      <div className="relative" style={{ width: '100%', height: '300px' }}>
        <Line ref={chartRef} data={data} options={options} />
        {isZoomed && (
          <button
            className="absolute top-8 right-2 z-10 px-2 py-1 bg-gray-50 border-1 border-gray-400 text-gray-600 font-semibold rounded-md text-xs cursor-pointer"
            onClick={handleReset}
          >
            Reset Zoom
          </button>
        )}
      </div>
      
      {batteryReady && (
        <div className="py-5">
          <p className="text-gray-500 font-extrabold">Charge Level</p>
          <BatteryChargeChart dailyEnergyData = {dailyEnergyData} sliderMax={sliderMax} solarPanels={solarPanels} battery={battery} batteryReady={batteryReady} />
        </div>
       )}

      <div className="flex items-center justify-between w-full mt-2">
        <div className="flex items-center space-x-1">
          <FaSun className="text-orange-400" />
          <p className="font-medium text-gray-600">
            Solar <span className="font-bold ps-2">({pctSolar} % of load)</span>
          </p>
        </div>

        <p className="font-bold text-gray-600"><strong>{totalSolarKWh.toFixed(2)} kWh</strong></p>
      </div>
      {batteryReady && (
        <div className="flex items-center justify-between w-full ">
          <div className="flex items-center space-x-1">
            <FaBatteryQuarter  className="text-green-500" />
            <p className="font-medium text-gray-600">
              Battery discharged <span className="font-bold ps-2">({pctBattery} % of load)</span>
            </p>
          </div>
          <p className="font-bold text-gray-600"><strong>{totalBatteryDischargeKWh.toFixed(2)} kWh</strong></p>
        </div>
      )}
      {batteryReady && (
        <div className="flex items-center justify-between w-full ">
          <div className="flex items-center space-x-1">
            <FaBatteryFull className="text-green-500" />
            <p className="font-medium text-gray-600">
              Battery charged <span className="font-bold ps-2"></span>
            </p>
          </div>
          <p className="font-bold text-gray-600"><strong>{totalBatteryChargeKWh.toFixed(2)} kWh</strong></p>
        </div>
      )}

      <div className="flex items-center justify-between w-full ">
        <div className="flex items-center space-x-1">
          <FaBolt className="text-yellow-500" />
          <p className="font-medium text-gray-600">
            Grid Imported <span className="font-bold ps-2">({pctGrid} % of load)</span>
          </p>
        </div>
        <p className="font-bold text-gray-600"><strong>{totalGridImportKWh.toFixed(2)} kWh</strong></p>
      </div>

      {netMetering && (
        <div className="flex items-center justify-between w-full ">
          <div className="flex items-center space-x-1">
            <FaBolt className="text-yellow-600" />
            <p className="font-medium text-gray-600">
              Grid Exported <span className="font-bold ps-2"></span>
            </p>
          </div>
          <p className="font-bold text-gray-600"><strong>{totalGridExportKWh.toFixed(2)} kWh</strong></p>
        </div>
      )}

      <div className="flex items-center justify-between w-full ">
        <div className="flex items-center space-x-1">
          <FaPlug className="text-gray-500" />
          <p className="font-medium text-gray-600">
            Load <span className="font-bold ps-2"></span>
          </p>
        </div>

        <p className="font-bold text-gray-600"><strong>{totalLoadKWh.toFixed(2)} kWh</strong></p>
      </div>
    </div>
  );
}
