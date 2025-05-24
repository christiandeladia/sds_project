// src/utils/buildDocumentData.js
// Calculates and returns the full documentData object for Firestore storage
import CanadianSolarPanel from '../assets/img/solar/solar-panel.webp';
import DL5 from '../assets/img/battery/DL5.webp';
import PowerBoxPro from '../assets/img/battery/PowerBoxPro.webp';
import PowerBrick from '../assets/img/battery/PowerBrick.webp';
import Solis1_3k from '../assets/img/battery/PowerBrick.webp';
import Solis3_6k from '../assets/img/battery/PowerBrick.webp';
import Solis5k   from '../assets/img/battery/PowerBrick.webp';
import Solis6k   from '../assets/img/battery/PowerBrick.webp';
const CO2ePerKWh = 0.0007603;

function formatNumber(num, decimals) {
  const multiplier = Math.pow(10, decimals);
  return Math.round(num * multiplier) / multiplier;
}

function getTwentyFiveYearsGeneration(
  annualSolarGeneration,
  electricityRate,
  exportEnergyPercentage,
  netMeteringRate,
  totalSystemCost
) {
  const years = 25;
  const degradationRate = 0.01;
  const rateIncrease = 0.02;
  let generation = annualSolarGeneration;
  let roi = -totalSystemCost;

  const dataset = { forecast: [], degradationRate, electricityRateIncrease: rateIncrease };

  for (let i = 0; i < years; i++) {
    const annualSavings =
      generation * netMeteringRate * exportEnergyPercentage +
      generation * electricityRate * (1 - exportEnergyPercentage);

    roi += annualSavings;

    dataset.forecast.push({
      year: i + 1,
      solarGeneration: generation.toFixed(2),
      electricityRate: electricityRate.toFixed(2),
      annualSavings: annualSavings.toFixed(2),
      netMeteringRate: netMeteringRate.toFixed(2),
      returnOnInvestment: roi.toFixed(0),
    });

    generation *= 1 - degradationRate;
    electricityRate *= 1 + rateIncrease;
    netMeteringRate *= 1 + rateIncrease;
  }

  return dataset;
}

  export const panels = [
    { brand: 'Hiku6',
      watts: 615,
      imageSrc: CanadianSolarPanel,
      performanceRatio: 0.82,
      recommended: true
    },
    { brand: 'All Black',
      watts: 450, 
      imageSrc: CanadianSolarPanel,
      performanceRatio: 0.82,
    },
  ];

  export const batteries = [
    { brand: 'PowerBrick',
      watts: 14336, 
      imageSrc: PowerBrick,
      batteryCapacity: 14.336, //kw
      maxCharge: 10, //kw
      maxDischarge: 10, //kw
      chargeEfficiency: 0.95, 
      dischargeEfficiency: 0.95,
      minCharging: 0.10, 
      maxCharging: 0.90, 
      initialCharging: 0.50, 
      recommended: true 
    },
    { brand: 'Powerbox Pro', 
      watts: 10240, 
      imageSrc: PowerBoxPro,
      batteryCapacity: 10.240, //kw
      maxCharge: 5.12, //kw
      maxDischarge: 5.12, //kw
      chargeEfficiency: 0.95, 
      dischargeEfficiency: 0.95,
      minCharging: 0.10, 
      maxCharging: 0.90, 
      initialCharging: 0.50,  
    },
    { brand: 'DL5.0C', 
      watts: 5120, 
      imageSrc: DL5, 
      batteryCapacity: 5.120, //kw
      maxCharge: 3.84, //kw
      maxDischarge: 3.84, //kw
      chargeEfficiency: 0.95, 
      dischargeEfficiency: 0.95,
      minCharging: 0.10, 
      maxCharging: 0.90, 
      initialCharging: 0.50, 
    },
  ];


  export const inverters = [
  {
    brand:         'Solis S6-EH1P3K-L-PRO',
    capacityKW:    1.3,
    efficiency:    0.96,
    imageSrc:      Solis1_3k,
    recommended:   false,
  },
  {
    brand:         'Solis S6-EH1P3.6K-L-PRO',
    capacityKW:    3.6,
    efficiency:    0.97,
    imageSrc:      Solis3_6k,
    recommended:   true,    // our go-to mid-range model
  },
  {
    brand:         'Solis S6-EH1P5K-L-PRO',
    capacityKW:    5.0,
    efficiency:    0.97,
    imageSrc:      Solis5k,
    recommended:   false,
  },
  {
    brand:         'Solis S6-EH1P6K-L-PRO',
    capacityKW:    6.0,
    efficiency:    0.97,
    imageSrc:      Solis6k,
    recommended:   false,
  },
];

/**
 * Builds the documentData object from provided parameters
 * @param {object} params
 * @returns {object} documentData
 */
export function buildDocumentData(params) {
  const {
    buildingType,
    address,
    coordinates,
    monthlyBill,
    roofType,
    lineType,
    lineVoltage,
    timeOfUse,
    netMetering,
    sliderMax,
    panelCount,
    batteryCount,
    inverterCount,
    panelDetails,
    batteryDetails,
    batteryReady,
    newRequestedMonthlyBill,
  } = params;


  // lookup (or default)
  const panelKey   = panelDetails?.brand   ?? panelDetails;
  const batteryKey = batteryDetails?.brand ?? batteryDetails;

  const lookupPanel = panels.find(p => p.brand === panelKey)
                   || panels.find(p => p.recommended);
  const lookupBattery = batteries.find(b => b.brand === batteryKey)
                     || batteries.find(b => b.recommended);

  const { brand: panelBrand, watts: panelWatts, performanceRatio: performanceRatio } = lookupPanel
  const panelKW = panelWatts / 1000; 
  const { brand: batteryBrand,
     watts: batteryWatts,
      batteryCapacity: batteryCapacity,
      maxCharge: maxCharge,
      maxDischarge: maxDischarge,
      chargeEfficiency: chargeEfficiency, 
      dischargeEfficiency: dischargeEfficiency,
      minCharging: minCharging, 
      maxCharging: maxCharging, 
      initialCharging: initialCharging, 
   } = lookupBattery


  // Parse inputs

  const [latStr, longStr] = coordinates.split(",");
  const latitude = parseFloat(latStr);
  const longitude = parseFloat(longStr);
  const validNewRequestedMonthlyBill = newRequestedMonthlyBill
    ? parseFloat(newRequestedMonthlyBill)
    : null;

  // Calculate design
  const utilityPricePerkWh =
    buildingType === "residential"
      ? 12.5
      : buildingType === "commercial"
      ? 10
      : 10;
  const utilityMonthlykWh = monthlyBill / utilityPricePerkWh;
  const utilityDailyUsage = utilityMonthlykWh / 30;
  const utilityNetMeteringRate = 7.6;
  const optimalROISizeFactor =
    timeOfUse === "Night time"
      ? 0.05
      : timeOfUse === "Day time"
      ? 0.16
      : timeOfUse === "24 Hours"
      ? 0.1
      : 0.05;
  const fastestROISolarSize = (utilityDailyUsage * optimalROISizeFactor) / 0.8;
  let suggestedSize =
    netMetering === "yes"
      ? Math.ceil((monthlyBill / 30 / utilityNetMeteringRate / 5) / panelKW) * panelKW
      : fastestROISolarSize;

  if (validNewRequestedMonthlyBill !== null) {
    suggestedSize =
      (monthlyBill - validNewRequestedMonthlyBill) /
      30 /
      utilityNetMeteringRate /
      4;
  }
  const minimumUtilityBill =
    netMetering === "yes"
      ? 0
      : monthlyBill - suggestedSize * 4 * 30 * utilityNetMeteringRate;

  // Price design
  let totalNetMeteringPrice = 40000;
  if (suggestedSize > totalNetMeteringPrice / 1000) {
    totalNetMeteringPrice = Math.ceil(suggestedSize) * 1000;
  }
  if (netMetering === "no") totalNetMeteringPrice = 0;

  const basePricingPerKwh = 8750 + 10980;
  let totalSolarPricing = basePricingPerKwh * suggestedSize;
  const scaledPricingPerKwh = (399 / (suggestedSize + 70)) * 1000;
  totalSolarPricing += suggestedSize * scaledPricingPerKwh;

  let baseLabourPricePerKwh = 2720;
  if (roofType === "Shingles" || roofType === "Tiles") baseLabourPricePerKwh += 1203;
  if (roofType === "Concrete") baseLabourPricePerKwh += 2448;
  const totalLabourPricing = baseLabourPricePerKwh * suggestedSize;

  const scaledInverterPricing = lineType === "threePhase"
    ? Math.max(4, 95.25 / (suggestedSize + 5)) * 1000
    : Math.max(5, 61 / (suggestedSize + 5)) * 1000;
  const inverterPricingAdj = lineVoltage === "220" ? 2 : 0;
  const totalInverterPricing = (scaledInverterPricing + inverterPricingAdj) * suggestedSize;

  // System estimates
  const monthlySolarGeneration = suggestedSize * 4 * 30;
  const exportPct =
    timeOfUse === "Night time"
      ? 0.95
      : timeOfUse === "Day time"
      ? 0.84
      : timeOfUse === "24 Hours"
      ? 0.9
      : 1;
  const selfConsumptionRate =
    buildingType === "residential" ? 12.5 : 8.2;
  const monthlyIncome =
    monthlySolarGeneration * utilityNetMeteringRate * exportPct +
    monthlySolarGeneration * selfConsumptionRate * (1 - exportPct);

  const forecastData = getTwentyFiveYearsGeneration(
    monthlySolarGeneration * 12,
    selfConsumptionRate,
    exportPct,
    utilityNetMeteringRate,
    totalSolarPricing + totalLabourPricing + totalNetMeteringPrice + totalInverterPricing
  );
  const lastYearROI =
    forecastData.forecast[forecastData.forecast.length - 1].returnOnInvestment;

  // Assemble documentData
  return {
    date: new Date(),
    queryParams: {
      buildingType,
      address,
      coordinates: { lat: latitude, long: longitude },
      monthlyBill,
      roofType,
      lineType,
      lineVoltage,
      timeOfUse,
      netMetering,
      sliderMax,
      panelCount,
      batteryCount,
      inverterCount,
      panelDetails,
      batteryDetails,
      batteryReady,
      validNewRequestedMonthlyBill,
    },
    calculateDesign: {
      utilityPricePerkWh,
      utilityMonthlykWh,
      utilityDailyUsage,
      utilityNetMeteringRate,
      optimalROISizeFactor,
      fastestROISolarSize,
      minimumUtilityBill,
      suggestedSize,
    },
    priceDesign: {
      totalNetMeteringPrice,
      basePricingPerKwh,
      totalSolarPricing,
      scaledPricingPerKwh,
      baseLabourPricePerKwh,
      totalLabourPricing,
      scaledInverterPricing,
      totalInverterPricing,
    },
    systemEstimates: {
      monthlyIncome,
      monthlySolarGeneration,
      twentyFiveYearForecast: forecastData,
      lastYearReturnOnInvestment: parseFloat(lastYearROI),
    },
    pricing: {
      solar: formatNumber(totalSolarPricing, 2),
      labour: formatNumber(totalLabourPricing, 2),
      netMetering: formatNumber(totalNetMeteringPrice, 2),
      inverter: formatNumber(totalInverterPricing, 2),
      total: formatNumber(
        totalSolarPricing +
          totalLabourPricing +
          totalNetMeteringPrice +
          totalInverterPricing,
        2
      ),
    },
    environment: {
      savingsCO2ePerMonth: formatNumber(
        CO2ePerKWh * suggestedSize * 4 * 30,
        2
      ),
      matureTrees: formatNumber(
        (CO2ePerKWh * suggestedSize * 4 * 30) / 0.0218,
        2
      ),
      gasolineCarKM: formatNumber(
        (CO2ePerKWh * suggestedSize * 4 * 30) / 0.0002,
        2
      ),
    },
    solarPanels: {
      brand: panelBrand,
      watts: panelWatts,
      count: Math.ceil(suggestedSize / (panelWatts/1000)),  // if your size is in kW
      sqm: formatNumber(Math.ceil(suggestedSize / (panelWatts/1000)) * 2.57, 2),
      performanceRatio: performanceRatio,
      newCount: panelCount,
      solarCapacity: (panelWatts * panelCount) / 1000,
      inverterCount: inverterCount,
    },
    battery: {
      brand: batteryBrand,
      watts: batteryWatts,
      count: Math.ceil(suggestedSize / (batteryWatts/1000)),  // if your size is in kW
      sqm: formatNumber(Math.ceil(suggestedSize / (batteryWatts/1000)) * 2.57, 2),
      newCount: batteryCount,
      batteryCapacity: batteryCapacity,
      batteryReady: batteryReady,
      maxCharge: maxCharge,
      maxDischarge: maxDischarge,
      chargeEfficiency: chargeEfficiency, 
      dischargeEfficiency: dischargeEfficiency,
      minCharging: minCharging, 
      maxCharging: maxCharging, 
      initialCharging: initialCharging, 
    },
  };
}

// module.exports = { buildDocumentData };
