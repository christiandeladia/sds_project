import { formatNumber } from './global';

/**
 * Calculates solar design, pricing, and environmental estimates.
 * @param {Object} params - Input parameters
 * @param {number} params.monthlyBill - User's monthly electricity bill in PHP
 * @param {string} params.buildingType - 'residential' or 'commercial'
 * @param {string} params.timeOfUse - 'nightTime', 'dayTime', or 'twentyFourSeven'
 * @param {string} params.netMetering - 'yes' or 'no'
 * @param {string} params.roofType - 'metal', 'shingles', 'tiles', or 'concrete'
 * @param {string} params.lineType - 'singlePhase' or 'threePhase'
 * @param {string} params.lineVoltage - '220' or '400'
 * @param {string} params.coordinates - 'lat,lng' string
 * @param {number|null} params.newRequestedMonthlyBill
 * @returns {Object} documentData and responseData
 */
export async function calculateDesign(params) {
  const {
    monthlyBill,
    buildingType,
    timeOfUse,
    netMetering,
    roofType,
    lineType,
    lineVoltage,
    coordinates,
    newRequestedMonthlyBill,
  } = params;

  // parse coordinates
  const [latitudeStr, longitudeStr] = coordinates.split(',');
  const latitude = parseFloat(latitudeStr);
  const longitude = parseFloat(longitudeStr);

  // constants
  const CO2ePerKWh = 0.0007603;

  // utility calculations
  const utilityPricePerkWh = buildingType === 'residential' ? 12.5 : 10;
  const utilityMonthlykWh = monthlyBill / utilityPricePerkWh;
  const utilityDailyUsage = utilityMonthlykWh / 30;
  const utilityNetMeteringRate = 7.6;
  const optimalROISizeFactor = timeOfUse === 'nightTime'
    ? 0.05
    : timeOfUse === 'dayTime'
    ? 0.16
    : 0.1;
  const fastestROISolarSize = (utilityDailyUsage * optimalROISizeFactor) / 0.8;

  // suggested size
  let suggestedSize = netMetering === 'yes'
    ? Math.ceil((monthlyBill / 30 / utilityNetMeteringRate / 5) / 0.610) * 0.610
    : fastestROISolarSize;

  if (newRequestedMonthlyBill) {
    const validNew = newRequestedMonthlyBill;
    suggestedSize = (monthlyBill - validNew) / 30 / utilityNetMeteringRate / 4;
  }

  // pricing calculations
  let totalNetMeteringPrice = netMetering === 'yes' ? 40000 : 0;
  if (suggestedSize > totalNetMeteringPrice / 1000) {
    totalNetMeteringPrice = Math.ceil(suggestedSize) * 1000;
  }

  const basePricingPerKwh = 8750 + 10980;
  let totalSolarPricing = basePricingPerKwh * suggestedSize;
  const scaledPricingPerKwh = (399 / (suggestedSize + 70)) * 1000;
  totalSolarPricing += suggestedSize * scaledPricingPerKwh;

  let baseLabourPricePerKwh = 2720;
  if (roofType === 'shingles' || roofType === 'tiles') baseLabourPricePerKwh += 1203;
  if (roofType === 'concrete') baseLabourPricePerKwh += 2448;
  const totalLabourPricing = baseLabourPricePerKwh * suggestedSize;

  const scaledInverterPricing = (lineType === 'threePhase'
    ? Math.max(4, 95.25 / (suggestedSize + 5))
    : Math.max(5, 61 / (suggestedSize + 5))) * 1000 + (lineVoltage === '220' ? 2 : 0);
  const totalInverterPricing = scaledInverterPricing * suggestedSize;

  // forecasts
  const exportEnergyPercentage =
    timeOfUse === 'nightTime' ? 0.95 :
    timeOfUse === 'dayTime' ? 0.84 : 0.9;
  const selfConsumptionSavingsPerKwh = buildingType === 'residential' ? 12.5 : 8.2;
  const monthlySolarGeneration = suggestedSize * 4 * 30;
  const monthlyIncome =
    monthlySolarGeneration * utilityNetMeteringRate * exportEnergyPercentage +
    monthlySolarGeneration * selfConsumptionSavingsPerKwh * (1 - exportEnergyPercentage);

  // 25-year forecast using external helper
  const twentyFiveYearForecast =
    getTwentyFiveYearsGeneration(
      monthlySolarGeneration * 12,
      selfConsumptionSavingsPerKwh,
      exportEnergyPercentage,
      utilityNetMeteringRate,
      totalSolarPricing + totalLabourPricing + totalNetMeteringPrice + totalInverterPricing
    );
  twentyFiveYearForecast.sunlightHours = 3.2;
  twentyFiveYearForecast.exportEnergyPercentage = exportEnergyPercentage;

  // last year ROI
  const lastYearForecast =
    twentyFiveYearForecast.forecast[twentyFiveYearForecast.forecast.length - 1];
  const lastYearROI = lastYearForecast.returnOnInvestment;

  // solar panels spec
  const panelWp = 610;
  const panelCount = Math.ceil(suggestedSize / 0.610);
  const panelArea = panelCount * 2.57;

  // build data
  const documentData = {
    queryParams: { buildingType, latitude, longitude, monthlyBill, roofType, lineType, lineVoltage, timeOfUse, netMetering, newRequestedMonthlyBill },
    calculateDesign: { utilityPricePerkWh, utilityMonthlykWh, utilityDailyUsage, utilityNetMeteringRate, optimalROISizeFactor, fastestROISolarSize, suggestedSize },
    priceDesign: { totalNetMeteringPrice, basePricingPerKwh, totalSolarPricing, scaledPricingPerKwh, baseLabourPricePerKwh, totalLabourPricing, scaledInverterPricing, totalInverterPricing },
    systemEstimates: { monthlyIncome, monthlySolarGeneration, twentyFiveYearForecast, lastYearReturnOnInvestment: lastYearROI },
    pricing: { solar: formatNumber(totalSolarPricing,2), labour: formatNumber(totalLabourPricing,2), netMetering: formatNumber(totalNetMeteringPrice,2), inverter: formatNumber(totalInverterPricing,2), total: formatNumber(totalSolarPricing+totalLabourPricing+totalNetMeteringPrice+totalInverterPricing,2) },
    environment: { savingsCO2ePerMonth: formatNumber(CO2ePerKWh * suggestedSize * 4 * 30,2), matureTrees: formatNumber((CO2ePerKWh * suggestedSize * 4 * 30)/0.0218,2), gasolineCarKM: formatNumber((CO2ePerKWh * suggestedSize * 4 * 30)/0.0002,2) },
    solarPanels: { watts: panelWp, brand: 'Canadian Solar', count: panelCount, sqm: formatNumber(panelArea,2) }
  };

  // Your code to save 'documentData' to Firestore or other DB can be called here

  return documentData;
}

/** Helper: 25-year forecast function placeholder */
function getTwentyFiveYearsGeneration(annualKwh, rate, exportPct, netMeterRate, totalCost) {
  // implement or import your existing logic for forecasting
  return { forecast: [] };
}
