import { useState } from "react";
import { Container, SectionHeader, SectionMedia, SectionContent } from "../shared/Layout";
import PanelsDiv from "../shared/PanelsDiv";
import FinalContent from '../shared/FinalContent';

const SystemOverview = ({ formData, goBack }) => {
  const [showPanels, setShowPanels] = useState(true);
  const [view, setView] = useState('finalContent');

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
    <div className="w-full mb-5 sticky top-0 z-50 bg-gray-200 shadow-md">
        <div className="flex items-center justify-evenly bg-gray-200 p-4 shadow-md max-w-7xl mx-auto">
        <div>
            <p className=" font-semibold text-gray-800">
            Panels: <span className="font-normal">32kW</span>
            </p>
            <p className="font-semibold text-gray-800">
            Battery: <span className="font-normal">83 kWh</span>
            </p>
        </div>
        <div className="border-l border-gray-400 h-10 mx-4"></div>
        <div>
            <p className="text-sm font-semibold text-gray-800">Total Cost:</p>
            <p className="text-lg font-bold text-gray-900">173,820 PHP</p>
        </div>
        </div>
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
</SectionMedia>

<SectionContent>

<div className="pb-25">
        <p>
          <strong>Type:</strong> {formData.type}
        </p>
        <p>
          <strong>Electricity Bill: <span className="font-normal">₱</span></strong> {formData.bill}
        </p>
        <p>
          <strong>Monthly Data:</strong> {formData.monthly.join(', ')}
        </p>

        <p>
          <strong>Usage Time:</strong> {formData.usage}
        </p>
        <p>
          <strong>Daily Data:</strong>{" "}
          {formData.electricityData
            .map(num =>
              num % 1 === 0 ? num : Number(num).toFixed(1)
            )
            .join(", ")}
        </p>


        <p>
          <strong>Installation Type:</strong> {formData.installation}
        </p>
        <p>
          <strong>Address:</strong> {formData.address}
        </p>
      </div>

      <FinalContent
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
        solarProgress={60}            // 60% of bill covered by solar
        savings="₱5,500"               // monthly savings
        generation="400 kWh"           // monthly generation
        totalCost="₱1,000,000"         // system cost
        solarRate="₱4.00/kWh"
        utilityRate="₱11.00/kWh"
        return25="₱2,000,000"
        yoyReturn="10%"
        tonnesCO2="2.5"
        maturedTrees="15"
        gasolineKM="5,000"
        futureEnergyMixCanvasId="futureMixChart"
      />
</SectionContent>
      

    </Container>
    </>
  );
};

export default SystemOverview;
