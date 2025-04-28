import { useState } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { Container, SectionHeader, SectionMedia, SectionContent } from "../shared/Layout";
import PanelsDiv from "../shared/PanelsDiv";
// import FinalContent from '../shared/FinalContent';
// import { requiredQueryParams } from '../shared/DocumentDataDisplay';
import DocumentDataDisplay from '../shared/DocumentDataDisplay';
// import { buildDocumentData } from '../shared/DocumentData';

const SystemOverview = ({ formData, goBack }) => {
  const [showPanels, setShowPanels] = useState(true);
  const [headerExpanded, setHeaderExpanded] = useState(false);
  // const [view, setView] = useState('finalContent');

    // NEW: form state
    const [panelCount,   setPanelCount]   = useState(12);
    const [batteryCount, setBatteryCount] = useState(2);
    const [applyNetMetering, setApplyNetMetering] = useState(null);
  
    const inc = setter => () => setter(c => c + 1);
    const dec = setter => () => setter(c => Math.max(0, c - 1));

   // Handlers for the various buttons/actions
   const handleAdjustSize = () => {
    console.log('Adjust System Size clicked');
    // e.g. open a slider panel, update state, etc.
  };

  const handleBackupPower = () => {
    console.log('Need Backup Power clicked');
    // e.g. show backup options dialog
  };

  const handleRecalculate = () => {
    console.log('Recalculate clicked');
    // e.g. re-run your sizing algorithm
  };

  return (
    <>
      {/* Sticky header with toggle */}
      <div
  className={`
    w-full mb-5 sticky top-0 z-50
    ${headerExpanded ? "bg-gray-100" : "bg-gray-200"}
    shadow-md transition-all
  `}
>
  <div className="flex items-center justify-evenly p-4 max-w-7xl mx-auto">
    {/* Panels & Battery */}
    <div className="flex flex-col">
      <p className="font-semibold text-gray-800">
        Panels: <span className="font-normal">32 kW</span>
      </p>
      <p className="font-semibold text-gray-800">
        Battery: <span className="font-normal">83 kWh</span>
      </p>
    </div>

    <div className="border-l border-gray-400 h-10" />

    {/* Total Cost */}
    <div className="flex flex-col">
      <p className="text-sm font-semibold text-gray-800">Total Cost:</p>
      <p className="text-lg font-bold text-gray-900">173,820 PHP</p>
    </div>

    {/* Toggle Button */}
    <button
      onClick={() => setHeaderExpanded((x) => !x)}
      className="p-1 text-gray-600 hover:text-gray-800"
      aria-label={
        headerExpanded ? "Collapse header" : "Expand header"
      }
    >
      {headerExpanded ? (
        <FaAngleUp size={30} />
      ) : (
        <FaAngleDown  size={30} />
      )}
    </button>
  </div>


  {headerExpanded && (
          <div className="border-t border-gray-400 bg-gray-100 p-6 absolute w-full">
            <form className="max-w-md mx-auto space-y-6">
              {/* Panels Counter */}
              <div className="flex items-center justify-between">
                <label className="font-medium text-gray-800">Number of Panels</label>
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
                    onChange={(e) =>
                      setPanelCount(Math.max(0, parseInt(e.target.value) || 0))
                    }
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

              {/* Batteries Counter */}
              <div className="flex items-center justify-between">
                <label className="font-medium text-gray-800">Number of Batteries</label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={dec(setBatteryCount)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    −
                  </button>

                  <input
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    value={batteryCount}
                    onChange={(e) =>
                      setBatteryCount(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-16 text-center border border-gray-300 rounded px-1 py-1"
                  />

                  <button
                    type="button"
                    onClick={inc(setBatteryCount)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    +
                  </button>
                </div>
              </div>


              {/* Net Metering Toggle */}
              <div className="flex items-center justify-between">
                <label className="font-medium text-gray-800">Apply Net Metering?</label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setApplyNetMetering(true)}
                    className={`px-3 py-1 rounded ${applyNetMetering === true ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setApplyNetMetering(false)}
                    className={`px-3 py-1 rounded ${applyNetMetering === true ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* (Optional) Submit or apply changes */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-600 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => console.log({ panelCount, batteryCount, applyNetMetering })}
                  className="px-6 py-2 bg-blue-600 text-white rounded"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        )}
      </div>


    <Container>
      <SectionHeader>
      <h2 className="text-[1.25rem] text-gray-400 tracking-tight font-medium mb-3 text-left w-full max-w-10/12">
          Solar Design Studio
        </h2>
        <div className="flex items-center mb-4">
        <h2 className="text-4xl font-medium">
          Your Personalized Solar Proposal
          <span className="pl-2 ">
            <button
              onClick={goBack}
              className="text-sm text-blue-600 relative bottom-[4px]"
            >
              [edit]
            </button>
          </span>
        </h2>
      </div>
      </SectionHeader>

<SectionMedia>
{/* <div className="w-full h-140 md:h-100 bg-gray-300 mb-8 rounded-lg border-2 flex justify-center items-center">

      </div> */}
      <PanelsDiv
        visible={showPanels}
        panelsCount={12}
        panelWattage={610}
        squareFoot={20.56}
        // optionally override logoSrc or panelSrc
      />

      

<DocumentDataDisplay formData={formData} />

</SectionMedia>

<SectionContent>

<div className="pb-25">
        {/* <p>
          <strong>Type:</strong> {formData.buildingType}
        </p>
        <p>
          <strong>Electricity Bill: <span className="font-normal">₱</span></strong> {formData.monthlyBill}
        </p>
        <p>
          <strong>Monthly Energy Data:</strong> {formData.monthlyEnergyData.join(', ')}
        </p>

        <p>
          <strong>Usage Time:</strong> {formData.timeOfUse}
        </p>
        <p>
          <strong>Daily Energy Data:</strong>{" "}
          {formData.dailyEnergyData
            .map(num =>
              num % 1 === 0 ? num : Number(num).toFixed(1)
            )
            .join(", ")}
        </p>


        <p>
          <strong>Installation Type:</strong> {formData.installationType}
        </p>
        <p>
          <strong>Address:</strong> {formData.address}
        </p>
        {formData.coordinates && (
          <p>
            <strong>Coordinates:</strong>{" "}
            {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
          </p>
        )} */}

      </div>

      {/* <FinalContent
        visible={view === 'finalContent'}
        systemKw="12 kW Solar Panels"
        includeBattery={true}
        showNip={true}
        onAdjustSize={handleAdjustSize}
        onBackupPower={handleBackupPower}
        oldBill="₱8,000"
        newBill="₱2,500"
        billWarning={false}
        onRecalculate={handleRecalculate}
        totalMonthlyBill="₱2,500"
        solarProgress={60}            
        savings="₱5,500"               
        generation="400 kWh"          
        totalCost="₱1,000,000"        
        solarRate="₱4.00/kWh"
        utilityRate="₱11.00/kWh"
        return25="₱2,000,000"
        yoyReturn="10%"
        tonnesCO2="2.5"
        maturedTrees="15"
        gasolineKM="5,000"
        futureEnergyMixCanvasId="futureMixChart"
      /> */}
</SectionContent>
      

    </Container>
    </>
  );
};

export default SystemOverview;
