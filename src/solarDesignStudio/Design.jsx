import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./shared/Navbar";
import MapLocation from "./pages/MapLocation";
import BuildingType from "./pages/BuildingType";
import MonthlyEnergy from "./pages/MonthlyEnergy";
import DailyEnergy from "./pages/DailyEnergy";
import RoofType from "./pages/RoofType";
import SystemOverview from "./pages/SystemOverview";
import { sendToTelegram } from "./shared/utils/sendToTelegram";

const Design = () => {
  const [bookingStatus, setBookingStatus] = useState("idle");
  const navigate = useNavigate();
  // Default center can be Quezon City or any default location
  const [mapCenter, setMapCenter] = useState({
    lat: 14.6760,
    lng: 121.0437
  });

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: "",
    bill: "",
    monthly: [],
    usage: "",
    electricityData: [],
    installation: "",
    address: "",
    hasUserAdjusted: false,
    sliderMax: 0 
  });
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);
  const updateData = (key, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [key]: value };
      console.log("Updated formData:", newData);
      return newData;
    });
  
    if (step === 1) {
      nextStep();
    }
  };
  
  const handleGetContacted = () => {
    console.log("User chose to get contacted:", formData);
    alert("Our team will contact you soon!");
  };

  const handleBookSiteVisit = async () => {
    if (bookingStatus === "sending") return;
    setBookingStatus("sending");

    // build a payload that includes your formData
    const payload = {
      action: "BOOK_SITE_VISIT",
      timestamp: new Date().toISOString(),
      systemOverview: "NOTE: TEST FOR NEW SDS",
      data: formData
    };

    const success = await sendToTelegram(payload);
    setBookingStatus(success ? "sent" : "idle");

    if (success) {
      alert("Your site visit has been booked!");
    } else {
      alert("Failed to send—please try again.");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <BuildingType updateData={updateData} selectedType={formData.type}  />;
      case 2:
        return <MonthlyEnergy updateData={updateData} selectedBill={formData.bill} customerType={formData.type} initialConsumption={formData.monthly}    hasUserAdjusted={formData.hasUserAdjusted}/>
      case 3:
        return <DailyEnergy updateData={updateData} selectedUsage={formData.usage} computedSliderMax={formData.sliderMax} />;
      case 4:
        return <RoofType updateData={updateData} selectedInstallation={formData.installation} />;
      case 5:
        return <MapLocation center={mapCenter} updateData={updateData} selectedAddress={formData.address} />;
      case 6:
        return <SystemOverview formData={formData} goBack={prevStep} />;
      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.type !== "";
      case 2:
        return formData.bill !== "";
      case 3:
        return formData.usage !== "";
      case 4:
        return formData.installation !== "";
      case 5:
        return formData.address !== "";
      default:
        return true;
    }
  };
  



  return (
    <div
      className="min-h-screen text-black"
      style={{ fontFamily: "DM Sans, sans-serif" }}
    >
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex flex-col">
        {/* <h2 className="text-[1.25rem] text-gray-400 tracking-tight font-medium mb-3 mt-15 text-left w-full max-w-10/12">
          Solar Design Studio
        </h2> */}

        {renderStep()}

        {/* Navigation Buttons */}
        <div className="mt-2 mx-auto w-full max-w-10/12 lg:max-w-9/12 flex justify-center md:justify-end">
          {step > 1 && step < 6 && (
            <div className="flex space-x-4 min-w-12/12 md:min-w-6/12">
              <button onClick={prevStep} className='border border-gray-500 bg-gray-100 font-medium px-4 py-3 rounded-md flex-1 cursor-pointer'>Back</button>
              <button
                onClick={nextStep}
                disabled={!isStepValid()}
                className={`border px-4 py-3 rounded-md flex-1 font-medium ${
                  isStepValid()
                    ? 'bg-black text-white cursor-pointer'
                    : 'bg-black text-gray-200 opacity-45 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          )}
          
          {/* Step 6: Get Contacted & Book Site Visit */}
          {step === 6 && (
          <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 p-4 z-40">
            <div className="flex space-x-4 justify-center max-w-4xl mx-auto">
              <button
                onClick={handleGetContacted}
                className="border border-gray-500 bg-gray-100 font-medium px-4 py-3 rounded-md flex-1"
              >
                Contact Me
              </button>
              <button
            onClick={handleBookSiteVisit}
            disabled={bookingStatus === "sending"}
            className={`border font-medium px-4 py-3 rounded-md flex-1 ${
              bookingStatus === "sending"
                ? "bg-gray-200 text-gray-500 cursor-wait"
                : "bg-black text-white cursor-pointer"
            }`}
          >
            {bookingStatus === "sending" ? "Booking..." : "Book Site Visit"}
          </button>
            </div>
          </div>
        )}

        </div>

      </main>
    </div>
  );
};

export default Design;
