import { useMemo, useState, useEffect } from "react";
import { Container, SectionHeader, SectionMedia, SectionContent } from "../shared/Layout";
import PanelsDiv from "../shared/PanelsDiv";
// import FinalContent from '../shared/FinalContent';
// import { requiredQueryParams } from '../shared/DocumentDataDisplay';
import DocumentDataDisplay from '../shared/DocumentDataDisplay';
import SystemOverviewHeader from '../modals/SystemOverviewHeader';

const SystemOverview = ({ formData, updateData, goBack, queryParams, documentData, dailyEnergyData }) => {
  const [headerExpanded, setHeaderExpanded] = useState(false);
  const {
    panelCount: parentPanels,
    inverterCount: parentInverters,
    batteryCount: parentBatteries,
    netMetering,
    panelDetails,
    batteryDetails,
    batteryReady
  } = formData;

  // pull out the panel count computed by the formula:
  const computedPanelCount = documentData.solarPanels.count;
  const computedBatteryCount = documentData.battery.count;
  const solarPanelskW = (formData.panelCount * documentData.solarPanels.watts)/1000;
  const solarBatterykW = (formData.batteryCount * documentData.battery.watts)/1000;
  const totalPricing = documentData.pricing.total;

  // Step 2: sync it into your parent formData
  useEffect(() => {
    // only update if it’s different to avoid an infinite loop
    if (formData.panelCount !== computedPanelCount) {
      updateData("panelCount", computedPanelCount);
    }
  }, [computedPanelCount]);

  useEffect(() => {
    // only update if it’s different to avoid an infinite loop
    if (formData.batteryCount !== computedBatteryCount) {
      updateData("batteryCount", computedBatteryCount);
    }
  }, [computedBatteryCount]);

  // lock/unlock background scroll
  useEffect(() => {
    document.body.style.overflow = headerExpanded ? 'hidden' : 'auto';
    return () => {
      // cleanup if component unmounts
      document.body.style.overflow = 'auto';
    };
  }, [headerExpanded]);

  return (
    <>
    <SystemOverviewHeader
      solarPanelskW={solarPanelskW}
      solarBatterykW={solarBatterykW}
      totalPricing={totalPricing}
      headerExpanded={headerExpanded}
      setHeaderExpanded={setHeaderExpanded}
      parentPanels={parentPanels}
      parentInverters={parentInverters}
      parentBatteries={parentBatteries}
      netMetering={netMetering}
      panelDetails={panelDetails}
      batteryDetails={batteryDetails}
      batteryReady={batteryReady}
      onUpdateData={updateData}
    />

    <Container>
    {headerExpanded && (
      <div
        className="fixed inset-0 bg-black/40 z-10"
        onClick={() => setHeaderExpanded(false)}
      />
    )}


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
{/* <PanelsDiv
            visible={true}
            panelsCount={formData.panelCount}
            panelWattage={documentData.solarPanels.watts}
            squareFoot={documentData.solarPanels.sqm}
          /> */}



</SectionMedia>

<SectionContent>
<DocumentDataDisplay formData={formData} dailyEnergyData={dailyEnergyData} />
<div className="pb-60">
      </div>


</SectionContent>
      

    </Container>
    </>
  );
};

export default SystemOverview;
