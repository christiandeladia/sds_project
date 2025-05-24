export const LOAD_CAPACITY_KW       = 5; 
export const DT_HOURS = 5 / 60;  // 5-minute timestep

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


export function generateLoadPct(pctArray, totalDailyLoadKwh) {
  const TOTAL_DAILY_LOAD_KWH = totalDailyLoadKwh;

  // each slot is 2h → 24 slices of 5min each
  const raw = [];
  pctArray.forEach(slotPct => {
    const blockEnergy = (slotPct/100) * TOTAL_DAILY_LOAD_KWH;  // kWh for that 2-hour block
    const baseSlice   = blockEnergy / 24;                     // kWh per 5-min slice
    for (let i = 0; i < 24; i++) {
      const jitter = (Math.random() - 0.5) * 0.10;
      raw.push(baseSlice * (1 + jitter));
    }
  });
  const sumRaw = raw.reduce((a,b) => a + b, 0);
  const norm   = TOTAL_DAILY_LOAD_KWH / sumRaw;

  // now return an array of **kW** (slice-energy ÷ 5 min)
  return raw.map(e => (e * norm) / DT_HOURS);
}


export function simulateBatteryAndGrid(
  solarKW,
  loadKW,
  {
    initialSOC,
    batteryCount,
    batteryCapacityKWh,
    maxChargePowerKW,
    maxDischargePowerKW,
    chargeEfficiency,
    dischargeEfficiency,
    minSOC,
    maxSOC,
    dtHours,
    batteryReady,
  }
) {
  const totalBatteryCapacity = batteryCapacityKWh * batteryCount;
  const totalMaxChargePower = maxChargePowerKW * batteryCount;
  const totalMaxDischargePower = maxDischargePowerKW * batteryCount;
  let soc_kWh = initialSOC * totalBatteryCapacity;
  const socArr = [];
  const battFlowKW = [];
  const gridFlowKW = [];

  solarKW.forEach((pvKW, i) => {
    const load_ = loadKW[i];
    const netKW = pvKW - load_;

    let chargeKW = 0,
      dischargeKW = 0,
      exportKW = 0,
      importKW = 0;

    if (batteryReady) {
      if (netKW > 0) {
        chargeKW = Math.min(netKW, totalMaxChargePower);
        const chargedKWh = chargeKW * dtHours * chargeEfficiency;
        soc_kWh = Math.min(soc_kWh + chargedKWh, maxSOC * totalBatteryCapacity);
        exportKW = netKW - chargeKW;
      } else {
        const deficitKW = -netKW;
        dischargeKW = Math.min(
          deficitKW,
          totalMaxDischargePower,
          (soc_kWh - minSOC * totalBatteryCapacity) / dtHours * dischargeEfficiency
        );
        const dischargedKWh = dischargeKW * dtHours / dischargeEfficiency;
        soc_kWh = Math.max(soc_kWh - dischargedKWh, minSOC * totalBatteryCapacity);
        importKW = deficitKW - dischargeKW;
      }
    } else {
      // Battery disabled: no charge/discharge, all netKW exported or imported
      exportKW = netKW > 0 ? netKW : 0;
      importKW = netKW < 0 ? -netKW : 0;
      // soc_kWh remains unchanged
    }

    socArr.push(batteryReady ? Number((soc_kWh / totalBatteryCapacity * 100).toFixed(2)) : 0);
    battFlowKW.push(batteryReady ? Number((dischargeKW - chargeKW).toFixed(2)) : 0);
    gridFlowKW.push(Number((exportKW - importKW).toFixed(2)));
  });

  return { socArr, battFlowKW, gridFlowKW };
}