import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaAngleUp, FaAngleDown } from 'react-icons/fa';
import InverterImg from '../assets/img/solar/inverter.webp';
import PanelCard from '../shared/PanelCard';
import NetMeteringCard from '../shared/NetMeteringCard';
import NetMeteringAnimation from '../shared/NetMeteringAnimation';
import { panels, batteries } from '../shared/DocumentData';

// Reusable counter component
const Counter = ({ label, value, setValue }) => (
  <div className="flex items-center justify-between">
    <label className="font-extrabold text-xl text-gray-800">{label}</label>
    <div className="flex items-center space-x-2">
      <button
        type="button"
        onClick={() => setValue(v => Math.max(0, v - 1))}
        className="px-2 py-1 bg-gray-200 rounded cursor-pointer"
      >
        −
      </button>
      <input
        type="number"
        min="0"
        step="1"
        value={value}
        onChange={e => setValue(Math.max(0, parseInt(e.target.value, 10) || 0))}
        className="w-16 text-center border border-gray-300 rounded px-1 py-1 appearance-none"
      />
      <button
        type="button"
        onClick={() => setValue(v => v + 1)}
        className="px-2 py-1 bg-gray-200 rounded cursor-pointer"
      >
        +
      </button>
    </div>
  </div>
);

// Toggle button group for net metering
const ToggleGroup = ({ label, options, selected, onSelect }) => (
  <div className="flex items-center justify-between">
    <label className="font-medium text-gray-800">{label}</label>
    <div className="flex space-x-2">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onSelect(opt.value)}
          className={`px-3 py-1 rounded ${selected === opt.value ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

export default function SystemOverviewHeader({
  solarPanelskW,
  solarBatterykW,
  totalPricing,
  headerExpanded,
  setHeaderExpanded,
  parentPanels,
  parentInverters,
  parentBatteries,
  netMetering,
  panelDetails,
  batteryDetails,
  batteryReady: propBatteryReady,
  onUpdateData,
}) {
  // Defaults
  const recommendedBattery = batteries.find(b => b.recommended) || batteries[0];
  const recommendedBatteryBrand = recommendedBattery.brand;
  const initialNet = netMetering === 'yes' ? 'yes' : netMetering === 'no' ? 'no' : null;

  // State
  const [panelCount, setPanelCount] = useState(parentPanels);
  const [inverterCount, setInverterCount] = useState(parentInverters);
  const [isBatteryOn, setIsBatteryOn] = useState(
    propBatteryReady ?? Boolean(batteryDetails)
  );
  const [batteryCount, setBatteryCount] = useState(parentBatteries);
  const [currentPanel,   setCurrentPanel]   = useState(panelDetails.brand);
  const currentBatteryBrand = batteryDetails ? batteryDetails.brand : recommendedBatteryBrand;
  const [currentBattery, setCurrentBattery] = useState(currentBatteryBrand);
  const [applyNet, setApplyNet] = useState(initialNet);

  // Reset when header expands
  useEffect(() => {
    if (!headerExpanded) return;
    setPanelCount(parentPanels);
    setInverterCount(parentInverters);
    setIsBatteryOn(propBatteryReady);
    setBatteryCount(parentBatteries);
    setCurrentPanel(panelDetails.brand);
    setCurrentBattery(batteryDetails?.brand ?? recommendedBatteryBrand);
    setApplyNet(initialNet);
  },  [
    headerExpanded,
    parentPanels,
    parentInverters,
    propBatteryReady,
    parentBatteries,
    panelDetails.brand,
    batteryDetails,
    initialNet
  ]);

  // Sync battery on toggle (you don’t need a fallback default—Design.jsx guarantees `selectedBattery` is never undefined unless the user turned it off)
  useEffect(() => {
    setBatteryCount(parentBatteries);
    if (!propBatteryReady) {
      setCurrentBattery(null);
    }
  }, [propBatteryReady, parentBatteries]);

  // Format numbers
  const addCommas = useCallback(val => (
    val == null ? '' : val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  ), []);

  const panelIdx = useMemo(() => panels.findIndex(p => p.brand === currentPanel), [currentPanel]);
  const batteryIdx = useMemo(() => batteries.findIndex(b => b.brand === currentBattery), [currentBattery]);

  const handleApply = () => {
    onUpdateData('panelCount', panelCount);
    onUpdateData('inverterCount', inverterCount);
    onUpdateData('batteryCount', batteryCount);
    onUpdateData("panelDetails",   panels.find(p => p.brand === currentPanel));
    onUpdateData("batteryDetails", batteries.find(b => b.brand === currentBattery) || null);
    onUpdateData('netMetering', applyNet);
    onUpdateData('batteryReady', isBatteryOn);
    setHeaderExpanded(false);
  };

  return (
    <div className={`w-full mb-5 sticky top-0 z-50 ${headerExpanded ? 'bg-gray-100' : 'bg-gray-200'} shadow-md transition-all`}>      
      <div
        className="flex items-center justify-evenly p-4 max-w-7xl mx-auto cursor-pointer"
        onClick={() => setHeaderExpanded(e => !e)}
      >
        <div className="flex flex-col">
          <p className="font-semibold text-gray-800">Panels: <span className="font-normal">{solarPanelskW} kW</span></p>
          <p className="font-semibold text-gray-800">Battery: <span className="font-normal">{solarBatterykW} kWh</span></p>
        </div>
        <div className="border-l border-gray-400 h-10" />
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-gray-800">Total Cost:</p>
          <p className="text-lg font-bold text-gray-900">{addCommas(totalPricing)} PHP</p>
        </div>
        <div className="p-1 text-gray-600 hover:text-gray-800" aria-label={headerExpanded ? 'Collapse' : 'Expand'}>
          {headerExpanded ? <FaAngleUp size={30} /> : <FaAngleDown size={30} />}
        </div>
      </div>

      <div className={`border-t border-gray-400 bg-gray-100 p-6 absolute w-full max-h-[60vh] overflow-y-auto transform origin-top transition-all duration-200 ease-out ${headerExpanded ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
        <form className="max-w-md mx-auto space-y-6">
          <Counter label="Panels" value={panelCount} setValue={setPanelCount} />
          <PanelCard
            panels={panels}
            activeIndex={panelIdx}
            onSelect={i => {
              const picked = panels[i]
              setCurrentPanel(picked.brand)          // still update local UI state...
              onUpdateData("panelDetails", picked)   // …and immediately push to parent
            }}
          />
          <div className="flex items-center justify-between">
            <label className="font-extrabold text-xl text-gray-800">Inverter</label>
            <label className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isBatteryOn}
              onChange={e => {
                const newVal = e.target.checked;
                setIsBatteryOn(newVal);

                // 1) update your formData “batteryReady” flag
                onUpdateData('batteryReady', newVal);

                // 2) if they turned it off, clear out the batteryDetails
                if (newVal) {
 
                  // 3) if they turned it on, pick a default (e.g. the recommended one)
                  const defaultBat = batteries.find(b => b.recommended) || batteries[0];
                  onUpdateData('batteryDetails', defaultBat);
                }
              }}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded cursor-pointer"
            />

              <span className="font-medium text-gray-800 cursor-pointer">Battery ready</span>
            </label>
          </div>

          <div className="w-full p-3 flex flex-col rounded-lg bg-white border border-gray-400 mb-2">
            <div className="flex items-start space-x-4">
              <div className="basis-[35%] flex-shrink-0">
                <div className="inline-flex items-center px-3 py-1 mb-2 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">Recommended</div>
                <img src={InverterImg} alt="inverter" className="w-full h-auto object-contain" />
              </div>
              <div className="basis-[65%] flex flex-col justify-center">
                <Counter label="" value={inverterCount} setValue={setInverterCount} />
                <ul className="pt-5 list-disc list-inside text-sm text-gray-800 space-y-1">
                  <li>Max DC Input Voltage: 600 V</li>
                  <li>MPPT Voltage Range: 200 – 550 V</li>
                  <li>Rated AC Output Power: 5 kW</li>
                  <li>Peak Efficiency: 98.5%</li>
                  <li>Dimensions: 350×300×120 mm</li>
                  <li>Weight: 12 kg</li>
                </ul>
              </div>
            </div>
          </div>

          {isBatteryOn && (
            <>
              <Counter label="Battery" value={batteryCount} setValue={setBatteryCount} />
              <PanelCard
                panels={batteries}
                activeIndex={batteryIdx}
                onSelect={i => {
                  const pickedBat = batteries[i]
                  setCurrentBattery(pickedBat.brand)
                  onUpdateData("batteryDetails", pickedBat)
                }}
              />
            </>
          )}
          <div className="w-full">
                <p className='text-gray-400'>Want to add more panels in the future?</p>
          </div>

          {/* <ToggleGroup
            label="Apply Net Metering?"
            options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]}
            selected={applyNet}
            onSelect={setApplyNet}
          />
        {applyNet != null && (
          <NetMeteringCard
            key={applyNet}    
            lastLabel={applyNet === 'yes' ? 'Export Power' : 'Import Power'}
            reverseGrey={applyNet === 'no'}
          />
        )} */}



            {/* Net Metering Toggle */}
          
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-800">Apply Net Metering?</label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setApplyNet(true)}
                  className={`px-3 py-1 rounded cursor-pointer ${applyNet === true ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setApplyNet(false)}
                  className={`px-3 py-1 rounded cursor-pointer ${applyNet === false ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  No
                </button>
              </div>
            </div>
              {/* {applyNet != null && (
              <div className="w-full p-3 flex flex-col rounded-lg bg-white border border-gray-400 mb-2">

                  <div className="m-0">
                    <NetMeteringCard
                      lastLabel={applyNet ? 'Export Power' : 'Import Power'}
                      reverseGrey={!applyNet}
                    />
                  </div>
              </div>
              )} */}
              {applyNet && (
                <div className="w-full p-3 flex flex-col rounded-lg bg-white border border-gray-400 mb-2">

                    <div className="m-0">
                      <NetMeteringAnimation
                      />
                    </div>
                </div>
              )}


          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setHeaderExpanded(false)} className="px-6 py-2 bg-gray-600 text-white rounded cursor-pointer">Cancel</button>
            <button type="button" onClick={handleApply} className="px-6 py-2 bg-blue-600 text-white rounded cursor-pointer">Apply</button>
          </div>
        </form>
      </div>
    </div>
  );
}
