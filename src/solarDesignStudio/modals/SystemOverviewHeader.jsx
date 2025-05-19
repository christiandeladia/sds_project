import React, { useState, useEffect } from 'react';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import InverterImg from '../assets/img/solar/inverter.webp';
import PanelCard from '../shared/PanelCard';
import NetMeteringCard from '../shared/NetMeteringCard';
import { panels, batteries } from '../shared/DocumentData';

const SystemOverviewHeader = ({
  solarPanelskW,
  solarBatterykW,
  totalPricing,
  headerExpanded,
  setHeaderExpanded,
  parentPanels,
  parentInverters,
  parentBatteries,
selectedPanelTitle: initialPanelTitle,
selectedBatteryTitle: initialBatteryTitle,
  netMetering,
  onUpdateData,
}) => {
  const [panelCount, setPanelCount] = useState(parentPanels);
  const [inverterCount, setInverterCount] = useState(parentInverters);
  const initialReady = Boolean(initialBatteryTitle);
  const [batteryReady, setBatteryReady] = useState(initialReady);
  const [batteryCount, setBatteryCount] = useState(parentBatteries);
  // find the recommended-panel brand
  const defaultPanel = panels.find(p => p.recommended)?.brand || panels[0].brand;
  const defaultBattery = batteries.find(b => b.recommended)?.brand || batteries[0].brand;

    
  useEffect(() => {
    if (batteryReady) {
      // if user already had one from props, keep it; otherwise default
      setBatteryCount(parentBatteries);
      setSelectedBatteryTitle(initialBatteryTitle || defaultBattery);
    } else {
      // clear out
      setBatteryCount(parentBatteries);
      setSelectedBatteryTitle(null);
    }
  }, [batteryReady, parentBatteries, initialBatteryTitle, defaultBattery]);

  // init state → if the parent gave you one, use it, otherwise use the default
  const [selectedPanelTitle, setSelectedPanelTitle] =
    useState(initialPanelTitle || defaultPanel);
  const [selectedBatteryTitle, setSelectedBatteryTitle] = useState(
    batteryReady
      ? (initialBatteryTitle || defaultBattery)
      : null
  );

const [applyNetMetering, setApplyNetMetering] = useState(null)

  const inc = setter => () => setter(c => c + 1);
  const dec = setter => () => setter(c => Math.max(0, c - 1));

  useEffect(() => {
    if (headerExpanded) {
      setPanelCount(parentPanels);
      setInverterCount(parentInverters);
      if (batteryReady) setBatteryCount(parentBatteries);
      setSelectedPanelTitle(initialPanelTitle || defaultPanel);
      if (batteryReady) setSelectedBatteryTitle(initialBatteryTitle || defaultBattery);
      setBatteryReady(initialReady);
      setApplyNetMetering(
        netMetering === 'yes' ? true : netMetering === 'no' ? false : null
      );
    }
  }, [headerExpanded, parentPanels, parentInverters, parentBatteries, initialPanelTitle, defaultPanel, initialBatteryTitle, defaultBattery, netMetering]);

  const addCommas = value => {
    if (value == null) return '';
    const parts = value.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };



  const panelIdx   = panels.findIndex(p => p.brand === selectedPanelTitle);
  const batteryIdx = batteries.findIndex(b => b.brand === selectedBatteryTitle);
  return (
    <div className={`
      w-full mb-5 sticky top-0 z-50
      ${headerExpanded ? 'bg-gray-100' : 'bg-gray-200'}
      shadow-md transition-all cursor-pointer
    `}
    >
      <div className="flex items-center justify-evenly p-4 max-w-7xl mx-auto" onClick={() => setHeaderExpanded(x => !x)}>
        <div className="flex flex-col">
          <p className="font-semibold text-gray-800">
            Panels: <span className="font-normal">{solarPanelskW} kW</span>
          </p>
          <p className="font-semibold text-gray-800">
            Battery: <span className="font-normal">{solarBatterykW} kWh</span>
          </p>
        </div>
        <div className="border-l border-gray-400 h-10" />
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-gray-800">Total Cost:</p>
          <p className="text-lg font-bold text-gray-900">
            {addCommas(totalPricing)} PHP
          </p>
        </div>
        <div
          className="p-1 text-gray-600 hover:text-gray-800"
          aria-label={headerExpanded ? 'Collapse header' : 'Expand header'}
        >
          {headerExpanded ? <FaAngleUp size={30} /> : <FaAngleDown size={30} />}
        </div>
      </div>

      {/* {headerExpanded && ( */}
      <div
      
  className={`
    border-t border-gray-400 bg-gray-100 p-6 absolute w-full
    max-h-[60vh] overflow-y-auto transform origin-top
    transition-all duration-400  ease-out forwards
    ${headerExpanded
      ? 'opacity-100 scale-y-100'
      : 'opacity-100 scale-y-0 pointer-events-none'
    }
  `}
>

          <form className="max-w-md mx-auto space-y-6">
            {/* Panels Counter */}
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-xl text-gray-800">Panels</label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={dec(setPanelCount)}
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  −
                </button>
                <input
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={panelCount}
                  onChange={e => setPanelCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-16 text-center border border-gray-300 rounded px-1 py-1"
                />
                <button
                  type="button"
                  onClick={inc(setPanelCount)}
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  +
                </button>
              </div>
            </div>

            <PanelCard
                panels={panels}
                activeIndex={panelIdx}
                onSelect={idx => setSelectedPanelTitle(panels[idx].brand)}
            />


            {/* Inverter Counter */}
            <div className="flex items-center justify-between">
                <label className="font-extrabold text-xl text-gray-800">Inverter</label>
                <label className="inline-flex items-center space-x-2">
                    <input
                    type="checkbox"
                    checked={batteryReady}
                    onChange={e => setBatteryReady(e.target.checked)}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="font-medium text-gray-800">Battery ready</span>
                </label>
            </div>




            <div
            className="
                w-full
                p-3
                flex flex-col
                rounded-lg bg-white
                border border-gray-400 mb-2
            "
            >
            <div className="flex items-start space-x-4">
                {/* Left: 40% width for image, height auto */}
                <div className="basis-[35%] flex-shrink-0">
                <div className="inline-flex items-center px-3 py-1 mb-2 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">
            Recommended
            </div>
                <img
                    src={InverterImg}
                    alt="inverter image"
                    className="w-full h-auto object-contain"
                />
                </div>

                {/* Right: 60% width for text */}
                <div className="basis-[65%] flex flex-col justify-center items-start">
                    <div className="flex items-center justify-end w-full space-x-2">
                        <button
                        type="button"
                        onClick={dec(setInverterCount)}
                        className="px-2 py-1 bg-gray-200 rounded"
                        >
                        −
                        </button>
                        <input
                        type="number"
                        min={0}
                        step={1}
                        inputMode="numeric"
                        value={inverterCount}
                        onChange={e => setInverterCount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-16 text-center border border-gray-300 rounded px-1 py-1"
                        />
                        <button
                        type="button"
                        onClick={inc(setInverterCount)}
                        className="px-2 py-1 bg-gray-200 rounded"
                        >
                        +
                        </button>
                    </div>
                    <ul className="pt-5 list-disc list-inside text-sm tracking-tight space-y-1 text-gray-800">
                    <li>Max DC Input Voltage: 600 V</li>
                    <li>MPPT Voltage Range: 200 – 550 V</li>
                    <li>Rated AC Output Power: 5 kW</li>
                    <li>Peak Efficiency: 98.5 %</li>
                    <li>Dimensions: 350 × 300 × 120 mm</li>
                    <li>Weight: 12 kg</li>
                    </ul>

                </div>
            </div>
            </div>

            <div className="w-full">
                <p className='text-gray-400'>Want to add more panels in the future?</p>
            </div>



            {/* Batteries Counter */}
            {batteryReady && (
                <div className='fade-step'>
                    {/* Batteries Counter */}
                    <div className="flex items-center justify-between mb-5">
                    <label className="font-extrabold text-xl text-gray-800">Battery</label>
                    <div className="flex items-center space-x-2">
                        <button type="button" onClick={dec(setBatteryCount)} className="px-2 py-1 bg-gray-200 rounded">−</button>
                        <input
                        type="number"
                        min={0}
                        step={1}
                        inputMode="numeric"
                        value={batteryCount}
                        onChange={e => setBatteryCount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-16 text-center border border-gray-300 rounded px-1 py-1"
                        />
                        <button type="button" onClick={inc(setBatteryCount)} className="px-2 py-1 bg-gray-200 rounded">+</button>
                    </div>
                    </div>

                    {/* Battery selection cards */}
                    <PanelCard
                        panels={batteries}
                        activeIndex={batteryIdx}
                        onSelect={idx => setSelectedBatteryTitle(batteries[idx].brand)}
                    />
                </div>
            )}

            {/* Net Metering Toggle */}
            <div className="flex items-center justify-between">
              <label className="font-medium text-gray-800">Apply Net Metering?</label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setApplyNetMetering(true)}
                  className={`px-3 py-1 rounded ${applyNetMetering === true ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setApplyNetMetering(false)}
                  className={`px-3 py-1 rounded ${applyNetMetering === false ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  No
                </button>
              </div>
            </div>

            {applyNetMetering != null && (
                    <div className="m-0">
                      <NetMeteringCard
                        lastLabel={applyNetMetering ? 'Export Power' : 'Import Power'}
                        reverseGrey={!applyNetMetering}
                      />
                    </div>
                  )}


            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setHeaderExpanded(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateData('panelCount', panelCount);
                  onUpdateData('inverterCount', inverterCount);
                  onUpdateData('batteryCount', batteryCount);
                  onUpdateData('selectedPanelTitle',   selectedPanelTitle);
                  onUpdateData('selectedBatteryTitle', selectedBatteryTitle);
                  onUpdateData('netMetering', applyNetMetering ? 'yes' : 'no');
                  onUpdateData('batteryReady', batteryReady);
                  setHeaderExpanded(false);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded"
              >
                Apply
              </button>
            </div>
          </form>
        </div>
      {/* )} */}
    </div>
  );
};

export default SystemOverviewHeader;
