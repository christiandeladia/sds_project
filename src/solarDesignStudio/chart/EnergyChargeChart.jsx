import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { FaSun, FaBolt, FaBatteryFull, FaBatteryQuarter, FaPlug  } from "react-icons/fa";
import BatteryChargeChart from './BatteryChargeChart';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

// ——————————————————————————————————————————
// Demo system & battery specs (feel free to tweak)
// ——————————————————————————————————————————
const MODULE_POWER_W    = 610;   // W per panel
const MODULE_COUNT      = 8;  
export const PERFORMANCE_RATIO = 0.82;
export const PV_CAPACITY_KW         = (MODULE_POWER_W * MODULE_COUNT) / 1000;    // total PV nameplate

export const LOAD_CAPACITY_KW       = 5;    // base “1.0 p.u.” load

const BATTERY_CAPACITY_KWH   = 10;   // usable energy
const MAX_CHARGE_POWER_KW    = 5;    // inverter charging limit
const MAX_DISCHARGE_POWER_KW = 5;    // inverter discharging limit
const CHARGE_EFFICIENCY      = 0.95; // round‐trip ≈ 0.95×0.95
const DISCHARGE_EFFICIENCY   = 0.95;

const MIN_SOC               = 0.10;  // 10 % of capacity
const MAX_SOC               = 0.90;  // 90 %
const INITIAL_SOC           = 0.50;  // 50 % start

export const DT_HOURS = 5 / 60;  // 5-minute timestep

// ——————————————————————————————————————————
// your existing generators (produce % values 0–100)
// ——————————————————————————————————————————
export const generateTimeLabels = () => {
  const L = [];
  for (let m = 0; m < 24*60; m += 5) {
    const h = Math.floor(m/60), mm = m%60;
    L.push(`${String(h).padStart(2,'0')}:${String(mm).padStart(2,'0')}`);
  }
  return L;
};

export const generateSolarPct = (jitterPct = 5) => {
  const D = [];
  for (let m = 0; m < 24*60; m += 5) {
    // base sine-bell (peaks at solar noon, zero at night)
    const angle = ((m - 360) / 1440) * 2 * Math.PI;
    const base  = Math.max(0, Math.sin(angle)) * 100;

    // ±jitterPct noise
    const noise = (Math.random() - 0.5) * 2 * jitterPct;

    // clamp 0–100 and round to 2 decimals
    const pct = Math.min(100, Math.max(0, base + noise));
    D.push(Number(pct.toFixed(2)));
  }
  return D;
};

export const generateLoadPct = () => {
  const D = [];
  for (let m = 0; m < 24*60; m += 5) {
    const h = m/60;
    let base = 20;
    if (h>=6 && h<9)   base = 60;
    else if (h>=12 && h<14) base = 40;
    else if (h>=17 && h<21) base = 80;
    D.push(Number((base + Math.random()*5).toFixed(2)));
  }
  return D;
};

// export const generateLoadPct = () => {
//   const D = [];
//   // same slot definitions as above:
//   const pctPerSlot = [4, 5, 4, 7, 12, 11, 12, 12, 5, 3, 5, 2];

//   pctPerSlot.forEach(pct => {
//     // each slot is 2 hours = 120 minutes ⇒ 120/5 = 24 points
//     for (let i = 0; i < 24; i++) {
//       D.push(pct);
//     }
//   });

//   return D;  // → length 12×24 = 288, constant slices every 24 entries
// };



// const TOTAL_DAILY_LOAD_KWH = 600;    // fixed daily energy
// // your 2 h buckets (must sum to 100%)
// const pctPerSlot = [4, 5, 4, 7, 12, 11, 12, 12, 5, 3, 5, 2];

// export function generateLoadPct() {
//   // 1) build raw energy-per-slice array with jitter
//   const rawEnergies = [];
//   pctPerSlot.forEach(slotPct => {
//     // total kWh in this 2 h block
//     const blockEnergy = (slotPct/100) * TOTAL_DAILY_LOAD_KWH;
//     // base energy per 5 min slice
//     const baseSliceEnergy = blockEnergy / 24;
//     for (let i = 0; i < 24; i++) {
//       // ±5% jitter:
//       const jitter = (Math.random() - 0.5) * 0.10;    
//       rawEnergies.push(baseSliceEnergy * (1 + jitter));
//     }
//   });

//   // 2) compute sum of raw energies
//   const sumRaw = rawEnergies.reduce((s,e) => s + e, 0);

//   // 3) normalize so they sum exactly to TOTAL_DAILY_LOAD_KWH
//   const normFactor = TOTAL_DAILY_LOAD_KWH / sumRaw;

//   // 4) convert to kW by dividing by DT_HOURS
//   return rawEnergies.map(e => (e * normFactor) / DT_HOURS);
// }




// ——————————————————————————————————————————
// timestep simulation of battery + grid
// ——————————————————————————————————————————
export function simulateBatteryAndGrid(solarKW, loadKW) {
  let soc_kWh = INITIAL_SOC * BATTERY_CAPACITY_KWH;
  const socArr      = [];
  const battFlowKW  = [];
  const gridFlowKW  = [];

  solarKW.forEach((pvKW, i) => {
    const load_ = loadKW[i];
    const netKW = pvKW - load_;

    let chargeKW = 0,
        dischargeKW = 0,
        exportKW = 0,
        importKW = 0;

    if (netKW > 0) {
      // charge
      chargeKW = Math.min(netKW, MAX_CHARGE_POWER_KW);
      const chargedKWh = chargeKW * DT_HOURS * CHARGE_EFFICIENCY;
      soc_kWh = Math.min(soc_kWh + chargedKWh, MAX_SOC * BATTERY_CAPACITY_KWH);
      exportKW = netKW - chargeKW;
    } else {
      // discharge
      const deficitKW = -netKW;
      dischargeKW = Math.min(
        deficitKW,
        MAX_DISCHARGE_POWER_KW,
        (soc_kWh - MIN_SOC * BATTERY_CAPACITY_KWH) / DT_HOURS * DISCHARGE_EFFICIENCY
      );
      const dischargedKWh = dischargeKW * DT_HOURS / DISCHARGE_EFFICIENCY;
      soc_kWh = Math.max(soc_kWh - dischargedKWh, MIN_SOC * BATTERY_CAPACITY_KWH);
      importKW = deficitKW - dischargeKW;
    }

    // record
    socArr.push(Number((soc_kWh / BATTERY_CAPACITY_KWH * 100).toFixed(2)));
    battFlowKW.push(Number((chargeKW - dischargeKW).toFixed(2))); // +charge / -discharge
    gridFlowKW.push(Number((exportKW - importKW).toFixed(2)));    // +export / -import
  });

  return { socArr, battFlowKW, gridFlowKW };
}

export default function EnergyFlowChart() {
  // raw % curves
  const labels   = useMemo(generateTimeLabels, []);
  const solarPct = useMemo(generateSolarPct, []);
  const loadPct  = useMemo(generateLoadPct, []);

// convert % → kW
  const solarKW = useMemo(
    () => solarPct.map(pct =>
      pct/100 * PV_CAPACITY_KW * PERFORMANCE_RATIO
    ),
    [solarPct]
  );
  const loadKW = useMemo(
    () => loadPct.map(pct =>
      pct/100 * LOAD_CAPACITY_KW
    ),
    [loadPct]
  );

  // run the sim
  const { socArr, battFlowKW, gridFlowKW } = useMemo(
    () => simulateBatteryAndGrid(solarKW, loadKW),
    [solarKW, loadKW]
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

  // grid flow: positive = export, negative = import
  const totalGridExportKWh = useMemo(
    () =>
      gridFlowKW
        .filter(flow => flow > 0)
        .reduce((sum, kW) => sum + kW, 0)
      * DT_HOURS,
    [gridFlowKW]
  );
  const totalGridImportKWh = useMemo(
    () =>
      gridFlowKW
        .filter(flow => flow < 0)
        .reduce((sum, kW) => sum + Math.abs(kW), 0)
      * DT_HOURS,
    [gridFlowKW]
  );

  // ——————————————————————————————————————————
  // 2) compute percentage shares relative to total load
  // ——————————————————————————————————————————
  const pctSolar  = (totalSolarKWh  / totalLoadKWh * 100).toFixed(1);
  const pctBattery = (totalBatteryDischargeKWh / totalLoadKWh * 100).toFixed(1);
  const pctGrid   = (totalGridImportKWh   / totalLoadKWh * 100).toFixed(1);

  // chart in kW
  const data = {
    labels,
    datasets: [
      {
        label: 'Solar',
        data: solarKW,
        borderColor: 'rgba(251, 146, 60, 1)',
        backgroundColor: 'rgba(251, 146, 60, 0.2)',
        fill: true, tension: 0.4, pointRadius: 0,
      },
      {
        label: 'Battery',
        data: battFlowKW,
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        fill: true, tension: 0.4, pointRadius: 0,
      },
      {
        label: 'Grid',
        data: gridFlowKW,
        borderColor: 'rgba(234, 179, 8, 1)',
        backgroundColor: 'rgba(234, 179, 8, 0.2)',
        fill: true, tension: 0.4, pointRadius: 0,
      },
      {
        label: 'Load',
        data: loadKW,
        borderColor: 'rgba(201,203,207, 1)',
         backgroundColor: 'rgba(201,203,207,0.2)',
        fill: true, tension: 0.4, pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, ticks: { maxTicksLimit: 6 } },
      y: { title: { display: false, text: 'kW' } },
    },
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} kW`
        },
      },
    },
  };

  return (
    <div>
      {/* Chart */}
      <div style={{ width: '100%', height: '300px' }}>
        <Line data={data} options={options} />
      </div>

      {/* Totals Display */}
      {/* <div className="mt-4 space-y-2 text-sm">
        <p>Total Solar Generation: <strong>{totalSolarKWh.toFixed(2)} kWh</strong> ({pctSolar} % of load)</p>
        <p>Total Load Consumption: <strong>{totalLoadKWh.toFixed(2)} kWh</strong></p>
        <p>Battery Discharged: <strong>{totalBatteryDischargeKWh.toFixed(2)} kWh</strong> ({pctBattery} % of load)</p>
        <p>Grid Imported: <strong>{totalGridImportKWh.toFixed(2)} kWh</strong> ({pctGrid} % of load)</p>
        <p>Battery Charged: <strong>{totalBatteryChargeKWh.toFixed(2)} kWh</strong></p>
        <p>Grid Exported: <strong>{totalGridExportKWh.toFixed(2)} kWh</strong></p>
      </div> */}

      <div className="py-5">
        <p className="text-gray-500 font-extrabold">Charge Level</p>
        <BatteryChargeChart className='mb-5' />
      </div>

      <div className="flex items-center justify-between w-full mt-2">
        <div className="flex items-center space-x-1">
          <FaSun className="text-orange-400" />
          <p className="font-medium text-gray-600">
            Solar <span className="font-bold ps-2">({pctSolar} % of load)</span>
          </p>
        </div>

        <p className="font-bold text-gray-600"><strong>{totalSolarKWh.toFixed(2)} kWh</strong></p>
      </div>
      <div className="flex items-center justify-between w-full ">
        <div className="flex items-center space-x-1">
          <FaBatteryQuarter  className="text-green-500" />
          <p className="font-medium text-gray-600">
            Battery discharged <span className="font-bold ps-2">({pctBattery} % of load)</span>
          </p>
        </div>

        <p className="font-bold text-gray-600"><strong>{totalBatteryDischargeKWh.toFixed(2)} kWh</strong></p>
      </div>
      <div className="flex items-center justify-between w-full ">
        <div className="flex items-center space-x-1">
          <FaBatteryFull className="text-green-500" />
          <p className="font-medium text-gray-600">
            Battery charged <span className="font-bold ps-2"></span>
          </p>
        </div>

        <p className="font-bold text-gray-600"><strong>{totalBatteryChargeKWh.toFixed(2)} kWh</strong></p>
      </div>
      <div className="flex items-center justify-between w-full ">
        <div className="flex items-center space-x-1">
          <FaBolt className="text-yellow-500" />
          <p className="font-medium text-gray-600">
            Grid Imported <span className="font-bold ps-2">({pctGrid} % of load)</span>
          </p>
        </div>

        <p className="font-bold text-gray-600"><strong>{totalGridImportKWh.toFixed(2)} kWh</strong></p>
      </div>
      <div className="flex items-center justify-between w-full ">
        <div className="flex items-center space-x-1">
          <FaBolt className="text-yellow-600" />
          <p className="font-medium text-gray-600">
            Grid Exported <span className="font-bold ps-2"></span>
          </p>
        </div>

        <p className="font-bold text-gray-600"><strong>{totalGridExportKWh.toFixed(2)} kWh</strong></p>
      </div>

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
