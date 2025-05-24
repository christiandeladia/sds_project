import React, { useMemo, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { buildDocumentData } from "./DocumentData";
import ForecastChart from '../chart/ForecastChart';
import EnergyMixChart from '../chart/EnergyMixChart';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { FaSun, FaBolt, FaBatteryFull, FaPlug  } from "react-icons/fa";
import BatteryChargeChart from '../chart/BatteryChargeChart';
import EnergyChargeChart from '../chart/EnergyChargeChart';
import SyncedScatterCharts from '../chart/ZoomCrosshairChart';


function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [maxHeight, setMaxHeight] = useState(0);
  const contentRef = useRef(null);
    // Whenever we open/close, recalc the scrollHeight
    useEffect(() => {
      if (contentRef.current) {
        const scrollH = contentRef.current.scrollHeight;
        setMaxHeight(isOpen ? scrollH : 0);
      }
    }, [isOpen, children]);

  return (
    <div className={`relative border-l-2 pl-4 mb-6 ${isOpen ? 'border-blue-500' : 'border-gray-300'}`}>
      {/* Top Dot */}
      {isOpen && (
        <span className="absolute -left-2 top-0 w-3.5 h-3.5 bg-blue-500 rounded-full transform -translate-y-1/2" />
      )}

      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        className="flex w-full justify-between items-center px-2 py-1 text-lg font-bold text-gray-500"
      >
        <span className={isOpen ? 'text-gray-800' : ''}>{title}</span>
        {isOpen
          ? <FaAngleUp className="w-6 h-6 text-gray-800" />
          : <FaAngleDown className="w-6 h-6 text-gray-500" />
        }
      </button>

      {/* Sliding Content */}
      <div
        className={`collapsible ${isOpen ? 'open' : ''}`}
        style={{ maxHeight: `${maxHeight}px` }}
      >
        <div ref={contentRef} className="pl-2 pt-2">
          {children}
        </div>
      </div>

      {/* Bottom Dot */}
      {isOpen && (
        <span className="absolute -left-2 bottom-0 w-3.5 h-3.5 bg-blue-500 rounded-full transform translate-y-1/2" />
      )}
    </div>
  );
}



export default function DocumentDataDisplay({ formData, dailyEnergyData = [] }) {
  // 1) Map your formData → queryParams
  const queryParams = {
    buildingType:          formData.buildingType,
    address:               formData.address,
    coordinates:           `${formData.coordinates.lat},${formData.coordinates.lng}`,
    monthlyBill:           formData.monthlyBill,
    roofType:              formData.installationType,
    lineType:              formData.lineType  || "singlePhase", 
    lineVoltage:           formData.lineVoltage || "220",
    timeOfUse:             formData.timeOfUse,
    netMetering:           formData.netMetering === "yes" ? "yes" : "no",
    panelCount:            formData.panelCount, 
    inverterCount:         formData.inverterCount, 
    batteryCount:          formData.batteryCount,
    panelDetails:          formData.panelDetails,
    batteryDetails:        formData.batteryDetails,
    newRequestedMonthlyBill: formData.newRequestedMonthlyBill || ""
  };

  // 2) Build documentData
  const documentData = useMemo(
    () => buildDocumentData(queryParams),
    [
      formData.buildingType,
      formData.address,
      formData.coordinates.lat,
      formData.coordinates.lng,
      formData.monthlyBill,
      formData.installationType,
      formData.lineType,
      formData.lineVoltage,
      formData.timeOfUse,
      formData.netMetering,
      formData.panelCount,
      formData.inverterCount,
      formData.batteryCount,
      formData.panelDetails,
      formData.batteryDetails,
      formData.newRequestedMonthlyBill
    ]
  );

  const [showForecastModal, setShowForecastModal] = useState(false);
  const { forecast } = documentData.systemEstimates.twentyFiveYearForecast;
  const monthlyGeneration   = documentData.systemEstimates.monthlySolarGeneration;
  const utilityMonthlykWh   = documentData.calculateDesign.utilityMonthlykWh;

  return (
    <div className="pt-5">
      <CollapsibleSection title="Energy" defaultOpen>
          <div className="py-5 rounded-2xl bg-white overflow-hidden">
            <EnergyChargeChart className='mb-5' dailyEnergyData={formData.dailyEnergyData} sliderMax={formData.sliderMax} solarPanels={documentData.solarPanels}
              battery={documentData.battery} netMetering={formData.netMetering} batteryReady={formData.batteryReady}/>
          </div>

      {/* <div className="py-5">
        <p className="text-gray-500 font-extrabold">Charge Level</p>
        <BatteryChargeChart dailyEnergyData={formData.dailyEnergyData} sliderMax={formData.sliderMax} solarPanels={documentData.solarPanels}
          battery={documentData.battery} batteryReady={formData.batteryReady} />
      </div> */}

          {/* <SyncedScatterCharts/> */}

          {/* <div className="py-5">
            <p className="text-gray-500 font-extrabold">Charge Level</p>
            <BatteryChargeChart className='mb-5' />
          </div> */}
          
          {/* <div className="flex items-center justify-between w-full ">
            <div className="flex items-center space-x-1">
              <FaSun className="text-orange-400" />
              <p className="font-medium text-gray-600">
                Solar <span className="font-bold ps-2">30%</span>
              </p>
            </div>

            <p className="font-bold text-gray-600">12 kWh</p>
          </div>
          <div className="flex items-center justify-between w-full ">
            <div className="flex items-center space-x-1">
              <FaBatteryFull className="text-green-500" />
              <p className="font-medium text-gray-600">
                Battery <span className="font-bold ps-2">10%</span>
              </p>
            </div>

            <p className="font-bold text-gray-600">4 kWh</p>
          </div>
          <div className="flex items-center justify-between w-full ">
            <div className="flex items-center space-x-1">
              <FaBolt className="text-yellow-500" />
              <p className="font-medium text-gray-600">
                Grid <span className="font-bold ps-2">20%</span>
              </p>
            </div>

            <p className="font-bold text-gray-600">8 kWh</p>
          </div>

          <div className="flex items-center justify-between w-full ">
            <div className="flex items-center space-x-1">
              <FaPlug className="text-gray-500" />
              <p className="font-medium text-gray-600">
                Load <span className="font-bold ps-2">40%</span>
              </p>
            </div>

            <p className="font-bold text-gray-600">16 kWh</p>
          </div> */}

      </CollapsibleSection>

      <CollapsibleSection title="Inputs">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
          {Object.entries(queryParams).map(([key, val]) => (
            <React.Fragment key={key}>
              <dt className="font-medium text-gray-700">{key}</dt>
              <dd className="text-gray-900">{String(val)}</dd>
            </React.Fragment>
          ))}
        </dl>
      </CollapsibleSection>

      <CollapsibleSection title="Design Calculations">
        <dl className="space-y-2">
          {Object.entries(documentData.calculateDesign).map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <dt className="font-medium text-gray-700">{k}</dt>
              <dd className="text-gray-900">{String(v)}</dd>
            </div>
          ))}
        </dl>
      </CollapsibleSection>

      <CollapsibleSection title="Pricing Breakdown">
        <dl className="space-y-2">
          {Object.entries(documentData.priceDesign).map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <dt className="font-medium text-gray-700">{k}</dt>
              <dd className="text-gray-900">{String(v)}</dd>
            </div>
          ))}
        </dl>
      </CollapsibleSection>

      <CollapsibleSection title="System Estimates">
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="font-medium text-gray-700">monthlyIncome</dt>
            <dd className="text-gray-900">{documentData.systemEstimates.monthlyIncome}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-gray-700">monthlySolarGeneration</dt>
            <dd className="text-gray-900">{documentData.systemEstimates.monthlySolarGeneration}</dd>
          </div>
        </dl>
      </CollapsibleSection>

      <CollapsibleSection title="Final Prices">
        <dl className="space-y-2">
          {Object.entries(documentData.pricing).map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <dt className="font-medium text-gray-700">{k}</dt>
              <dd className="text-gray-900">{String(v)}</dd>
            </div>
          ))}
        </dl>
      </CollapsibleSection>

      <CollapsibleSection title="Environmental Impact">
        <dl className="space-y-2">
          {Object.entries(documentData.environment).map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <dt className="font-medium text-gray-700">{k}</dt>
              <dd className="text-gray-900">{String(v)}</dd>
            </div>
          ))}
        </dl>
      </CollapsibleSection>

      <CollapsibleSection title="Panel Details">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
          {Object.entries(documentData.solarPanels).map(([k, v]) => (
            <React.Fragment key={k}>
              <dt className="font-medium text-gray-700">{k}</dt>
              <dd className="text-gray-900">{String(v)}</dd>
            </React.Fragment>
          ))}
        </dl>
      </CollapsibleSection>

      <CollapsibleSection title="Battery Details">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
          {Object.entries(documentData.battery).map(([k, v]) => (
            <React.Fragment key={k}>
              <dt className="font-medium text-gray-700">{k}</dt>
              <dd className="text-gray-900">{String(v)}</dd>
            </React.Fragment>
          ))}
        </dl>
      </CollapsibleSection>

      <CollapsibleSection title="Future Energy Mix">
        <EnergyMixChart
          monthlyGeneration={monthlyGeneration}
          utilityMonthlykWh={utilityMonthlykWh}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Return On Investment">
        <ForecastChart forecast={forecast} />
      </CollapsibleSection>

      {/* View 25-Year Forecast Button */}
      <section>
        <button
          onClick={() => setShowForecastModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          View 25-Year Forecast
        </button>
      </section>

      {/* Forecast Modal */}
      {showForecastModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg overflow-auto max-h-[90vh] w-full mx-3 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">25-Year Forecast</h3>
              <button
                onClick={() => setShowForecastModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Year</th>
                  <th className="border px-2 py-1">Solar Generation</th>
                  <th className="border px-2 py-1">Electricity Rate</th>
                  <th className="border px-2 py-1">Annual Savings</th>
                  <th className="border px-2 py-1">Net Metering Rate</th>
                  <th className="border px-2 py-1">ROI</th>
                </tr>
              </thead>
              <tbody>
                {forecast.map(item => (
                  <tr key={item.year}>
                    <td className="border px-2 py-1">{item.year}</td>
                    <td className="border px-2 py-1">{item.solarGeneration}</td>
                    <td className="border px-2 py-1">{item.electricityRate}</td>
                    <td className="border px-2 py-1">{item.annualSavings}</td>
                    <td className="border px-2 py-1">{item.netMeteringRate}</td>
                    <td className="border px-2 py-1">{item.returnOnInvestment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

DocumentDataDisplay.propTypes = {
  formData: PropTypes.shape({
    buildingType:            PropTypes.string.isRequired,
    address:                 PropTypes.string.isRequired,
    coordinates: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number
    }).isRequired,
    monthlyBill:             PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    installationType:        PropTypes.string.isRequired,
    lineType:                PropTypes.string,
    lineVoltage:             PropTypes.string,
    timeOfUse:               PropTypes.string.isRequired,
    netMetering:             PropTypes.string,
    newRequestedMonthlyBill: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired
};
