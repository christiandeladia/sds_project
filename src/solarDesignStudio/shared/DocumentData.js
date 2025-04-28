// src/utils/buildDocumentData.js
// Calculates and returns the full documentData object for Firestore storage

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
    monthlyBill: rawBill,
    roofType,
    lineType,
    lineVoltage,
    timeOfUse,
    netMetering,
    newRequestedMonthlyBill,
  } = params;

  // Parse inputs
  const monthlyBill = parseFloat(rawBill);
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
    timeOfUse === "nightTime"
      ? 0.05
      : timeOfUse === "dayTime"
      ? 0.16
      : timeOfUse === "twentyFourSeven"
      ? 0.1
      : 0.05;
  const fastestROISolarSize = (utilityDailyUsage * optimalROISizeFactor) / 0.8;
  let suggestedSize =
    netMetering === "yes"
      ? Math.ceil((monthlyBill / 30 / utilityNetMeteringRate / 5) / 0.610) * 0.610
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
  if (roofType === "shingles" || roofType === "tiles") baseLabourPricePerKwh += 1203;
  if (roofType === "concrete") baseLabourPricePerKwh += 2448;
  const totalLabourPricing = baseLabourPricePerKwh * suggestedSize;

  const scaledInverterPricing = lineType === "threePhase"
    ? Math.max(4, 95.25 / (suggestedSize + 5)) * 1000
    : Math.max(5, 61 / (suggestedSize + 5)) * 1000;
  const inverterPricingAdj = lineVoltage === "220" ? 2 : 0;
  const totalInverterPricing = (scaledInverterPricing + inverterPricingAdj) * suggestedSize;

  // System estimates
  const monthlySolarGeneration = suggestedSize * 4 * 30;
  const exportPct =
    timeOfUse === "nightTime"
      ? 0.95
      : timeOfUse === "dayTime"
      ? 0.84
      : timeOfUse === "twentyFourSeven"
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
      watts: 610,
      brand: "Canadian Solar",
      count: Math.ceil(suggestedSize / 0.610),
      sqm: formatNumber(Math.ceil(suggestedSize / 0.610) * 2.57, 2),
    },
  };
}

// module.exports = { buildDocumentData };
