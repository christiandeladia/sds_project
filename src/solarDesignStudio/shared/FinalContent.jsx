import React, { useState } from 'react';

/**
 * FinalContent component displays summary of the solar system proposal.
 * Props:
 * - visible: boolean to show/hide this section
 * - systemKw: string (e.g. "- kWh Solar Panels")
 * - includeBattery: boolean
 * - showNip: boolean
 * - onAdjustSize: function
 * - onBackupPower: function
 * - oldBill: string
 * - newBill: string
 * - billWarning: boolean
 * - onRecalculate: function
 * - totalMonthlyBill: string
 * - solarProgress: number (0-100)
 * - savings: string
 * - generation: string
 * - totalCost: string
 * - solarRate: string
 * - utilityRate: string
 * - return25: string
 * - yoyReturn: string
 * - tonnesCO2: string
 * - maturedTrees: string
 * - gasolineKM: string
 * - futureEnergyMixCanvasId: string
 */
const FinalContent = ({
  visible = true,
  systemKw = '- kWh Solar Panels',
  includeBattery = false,
  showNip = false,
  onAdjustSize = () => {},
  onBackupPower = () => {},
  oldBill = '-',
  newBill = '-',
  billWarning = false,
  onRecalculate = () => {},
  totalMonthlyBill = '-',
  solarProgress = 0,
  savings = 'P-',
  generation = '- kWh',
  totalCost = '-',
  solarRate = 'P-/kWh',
  utilityRate = 'P-/kWh',
  return25 = '-',
  yoyReturn = '-',
  tonnesCO2 = '-',
  maturedTrees = '-',
  gasolineKM = '-',
  futureEnergyMixCanvasId = 'energyMixChart',
}) => {
  const [showAdjust, setShowAdjust] = useState(false);

  if (!visible) return null;

  return (
    <div className="mt-9">
      {/* Your System */}
      <h5 className="mt-9 text-lg font-semibold">Your System</h5>
      <p className="text-xs text-gray-600 mt-2">
        Installation comes with a <strong>5 year workmanship warranty.</strong> Solar panels: <strong>30 years performance warranty, 12 years product warranty.</strong> Inverter: <strong>5 year warranty.</strong>
      </p>
      <ul className="list-disc pl-5 mt-2">
        <li>{systemKw}</li>
        <li>Wall Inverter (TBD)</li>
        {includeBattery && <li>Battery (TBD & NIP)</li>}
      </ul>
      {!includeBattery && showNip && (
        <p className="text-xs text-gray-600 mt-1">*NIP - Not included in price</p>
      )}

      <div className="flex space-x-4 mt-4">
        <button
          onClick={() => { setShowAdjust(!showAdjust); onAdjustSize(); }}
          className="border border-blue-600 text-blue-600 px-4 py-2 rounded"
        >
          Adjust System Size
        </button>
        <button
          onClick={onBackupPower}
          className="border border-gray-700 text-gray-700 px-4 py-2 rounded"
        >
          Need Backup Power?
        </button>
      </div>

      {/* Adjust System Size Panel */}
      {showAdjust && (
        <div className="shadow p-4 rounded mt-12">
          <p className="text-center mb-6">How much would you like to pay your utility?</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h5 className="text-center text-gray-500">{oldBill}</h5>
              <p className="text-xs text-gray-600 text-center">Your old monthly bill</p>
            </div>
            <div>
              <h5 className="text-center">{newBill}</h5>
              <p className="text-xs text-gray-600 text-center">Average new monthly bill</p>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            className="w-full"
          />
          {billWarning && (
            <p className="text-center text-red-500 text-xs mt-2">
              Without net metering or a battery your bill will not be able to reach these levels.
            </p>
          )}
          <div className="flex justify-center mt-4">
            <button
              onClick={onRecalculate}
              className="border border-blue-600 text-blue-600 px-4 py-2 rounded"
            >
              Recalculate
            </button>
          </div>
        </div>
      )}

      {/* Your New Utility Bill */}
      <h5 className="mt-12 text-lg font-semibold">Your New Utility Bill</h5>
      <p className="text-center mt-3 mb-1 font-light">{totalMonthlyBill}</p>
      <div className="h-2 bg-gray-200 rounded-t-full rounded-b-full mb-4"></div>
      <div className="relative bg-green-200 rounded-full h-9 mb-4">
        <div
          className="h-full bg-gray-800 rounded-full"
          style={{ width: `${solarProgress}%` }}
        />
      </div>

      {/* Savings & Generation */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="text-center">
          <p className="font-bold">{savings}</p>
          <p className="text-sm text-gray-500">Monthly Savings</p>
        </div>
        <div className="text-center">
          <p className="font-bold">{generation}</p>
          <p className="text-sm text-gray-500">Monthly Generation</p>
        </div>
      </div>

      {/* Pricing */}
      <div className="mt-12">
        <h5>Total System Cost</h5>
        <p className="font-bold">{totalCost}</p>

        {/* Estimated kWh Rate */}
        <div className="mt-6">
          <p className="text-sm text-gray-500 mb-2">Estimated kWh Rate</p>
          <div className="flex items-end justify-center space-x-4">
            <div className="bg-gray-800 text-white py-4 rounded w-2/5 text-center">
              <p>{solarRate}</p>
              <p className="mt-1 text-sm">Solar Rate</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"
              className="transform rotate-90" fill="currentColor">
              <path d="M23.0677 11.9929L18.818 7.75739L17.4061 9.17398L19.2415 11.0032L0.932469 11.0012L0.932251 13.0012L19.2369 13.0032L17.4155 14.8308L18.8321 16.2426L23.0677 11.9929Z" />
            </svg>
            <div className="bg-red-600 text-white py-16 rounded w-3/5 text-center">
              <p>{utilityRate}</p>
              <p className="mt-1 text-sm">Utility Rate</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            <strong>Calculation:</strong> Total System Price / Estimated 20-Year Generation.
            Keep in mind as electricity price rises your rate stays the same.
          </p>
        </div>

        {/* ROI Section */}
        <div className="mt-12">
          <p className="text-sm text-gray-500 mb-2">Return On Investment</p>
          <canvas id="ROIChart" width="100%" height="250"></canvas>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center">
              <p className="font-bold">{return25}</p>
              <p className="text-sm text-gray-500">Return in 25 Years</p>
            </div>
            <div className="text-center">
              <p className="font-bold">{yoyReturn}</p>
              <p className="text-sm text-gray-500">Year over year return on initial investment</p>
            </div>
          </div>
          <button className="mt-6 border border-blue-600 text-blue-600 px-4 py-2 rounded">
            View Calculations
          </button>
        </div>

        {/* Environment Section */}
        <div className="mt-12">
          <h5>Environment</h5>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold mb-1">{tonnesCO2}</p>
              <p className="text-sm text-gray-500">tonnes of CO2e / Month</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold mb-1">{maturedTrees}</p>
              <p className="text-sm text-gray-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 text-green-500 mr-1">
                  <path d="M12.7401 16.3185..." />
                </svg>
                Matured Trees / Month
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold mb-1">{gasolineKM}</p>
              <p className="text-sm text-gray-500">Gasoline Car KM / Month</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Data displays equivalent amount of greenhouse gases per category that may be avoided through solar.
          </p>
          <h6 className="mt-9 font-semibold">Did you know?</h6>
          <p>Rising sea levels due to climate change could displace up to 200 million people by the end of this century.</p>
          <p className="text-sm text-gray-500 mt-9">Future Energy Mix</p>
          <canvas id={futureEnergyMixCanvasId} className="mt-2 w-full h-64"></canvas>
        </div>
      </div>
    </div>
  );
};

export default FinalContent;
