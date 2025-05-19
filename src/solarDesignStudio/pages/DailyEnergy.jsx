import React, { useState, useEffect } from 'react';
import { FaArrowRight } from "react-icons/fa6";
import DailyEnergyChart from "../chart/DailyEnergyChart";
import { AiOutlineClose } from "react-icons/ai";
// Import the generator functions instead of the constant arrays.
import {
  generateNightTimeData,
  generateDayTimeData,
  generateTwentyFourSevenData,
} from "../chart/DailyEnergyChart";
import { Container, SectionHeader, SectionMedia, SectionContent } from "../shared/Layout";

//   const dayMap = [
//     { short: 'Mon', full: 'Monday' },
//     { short: 'Tue', full: 'Tuesday' },
//     { short: 'Wed', full: 'Wednesday' },
//     { short: 'Thurs', full: 'Thursday' },
//     { short: 'Fri', full: 'Friday' },
//     { short: 'Sat', full: 'Saturday' },
//     { short: 'Sun', full: 'Sunday' },
//   ];

// // Helper to format lists like "A and B" or "A, B, and C"
// const formatList = (days) => {
//   const names = days.map(short => dayMap.find(d => d.short === short).full);
//   if (names.length === 1) return names[0];
//   const last = names.pop();
//   return `${names.join(', ')} and ${last}`;
// };
// // Labels for the button
// const formatCustomizeLabel = (days) =>
//   days.length === 1
//     ? `Customize ${formatList(days)} only`
//     : `Customize ${formatList(days)}`;
// const formatMatchLabel = (days) => `Match ${formatList(days)} with`;


const DailyEnergy = ({ updateData, selectedTimeOfUse: propUsage, computedSliderMax, selectedDays = [] }) => {
  const [selectedTimeOfUse, setSelectedTimeOfUse] = useState(propUsage || "Day time");
  const [showChartModal, setShowChartModal] = useState(false);
  const [shake, setShake] = useState(false);
  const [isMatchedView, setIsMatchedView] = useState(false);
  
  // Compute dailySliderMax from the monthly value (make it a whole number)
  // const dailySliderMax = Math.round(computedSliderMax / 30);
  const dailySliderMax = 100;

  // Create a function that returns dynamic default patterns.
  const getDefaultPattern = (timeOfUse) => {
    if (timeOfUse === "Night time") return generateNightTimeData(dailySliderMax);
    if (timeOfUse === "24 Hours") return generateTwentyFourSevenData(dailySliderMax);
    if (timeOfUse === "Custom") return generateDayTimeData(dailySliderMax); // fallback
    return generateDayTimeData(dailySliderMax);
  };

  // Use dynamic default data if no manual pattern is provided.
  const [dailyPattern, setDailyPattern] = useState(getDefaultPattern(propUsage || "Day time"));

  // On mount, update parent's state with the usage selection.
  useEffect(() => {
    updateData("timeOfUse", selectedTimeOfUse);
    updateData("dailyEnergyData", dailyPattern);
  }, []);

  const handleUsageChange = (option) => {
    setSelectedTimeOfUse(option);
    updateData("timeOfUse", option);
    // Update dailyPattern dynamically based on the new selection.
    const newPattern = getDefaultPattern(option);
    // Update local state.
    setDailyPattern(newPattern);
    // Also update parent's state for dailyEnergyData.
    updateData("dailyEnergyData", newPattern);
  };

  // When the modal chart is changed, update the state.
  const handleChartUpdate = (newData) => {
    setDailyPattern(newData);
    updateData("dailyEnergyData", newData);
  
    setSelectedTimeOfUse("Custom");
    updateData("timeOfUse", "Custom");
 
  };
  

  const analyzePattern = (data) => {
    const dayIndices = [3, 4, 5, 6, 7, 8];       // 6 AM to 6 PM
    const nightIndices = [9, 10, 11, 0, 1, 2];     // 6 PM to 6 AM
  
    const daySum = dayIndices.reduce((sum, i) => sum + (data[i] || 0), 0);
    const nightSum = nightIndices.reduce((sum, i) => sum + (data[i] || 0), 0);
  
    const total = daySum + nightSum;
  
    if (total === 0) return "Day time"; // Default fallback
  
    const dayRatio = daySum / total;
    const nightRatio = nightSum / total;
  
    if (dayRatio >= 0.6) return "Day time";
    if (nightRatio >= 0.6) return "Night time";
    return "24 Hours";
  };

  // Compute the total daily consumption using the current dailyPattern.
  const totalConsumptionRaw = dailyPattern.reduce((acc, val) => acc + val, 0);
  const totalConsumption = totalConsumptionRaw.toFixed(1);

    // Function to trigger shake animation.
    const triggerShake = () => {
      console.log("onMaxDrag triggered: Maximum value reached");
      setShake(true);
      setTimeout(() => {
        setShake(false);
      }, 300); // Duration should match the CSS animation duration (0.3s here)
    };

  return (
    <div>

      <div className='border-1 p-5 rounded-lg'>
      {/* <p className="text-lg mb-2">
            {(!isMatchedView ? dayMap : dayMap.filter(d => selectedDays.includes(d.short)))
              .map(({ short, full }, i, arr) => (
                <span
                  key={short}
                  className={`inline-block ${selectedDays.includes(short) ? 'font-bold' : 'font-normal'}`}>
                  {full}{i < arr.length - 1 ? ', ' : ''}
                </span>
              ))
            }
          </p> */}

        {/* below the full-day list */}
        {/* <button
            onClick={() => setIsMatchedView(v => !v)}
            className="text-blue-500 cursor-pointer"
          >
            {isMatchedView
              ? formatMatchLabel(selectedDays)
              : formatCustomizeLabel(selectedDays)
            } <span className="ml-1">→</span>
          </button> */}

        <DailyEnergyChart 
          data={dailyPattern} 
          draggable={false} 
          sliderMax={computedSliderMax} 
          timeOfUse={selectedTimeOfUse}  // Pass current usage so the chart can adjust if needed.
        />

        <div className="mt-2 flex space-x-2 justify-center">
          {["Day time", "Night time", "24 Hours", "Custom"].map((option) => (
            <button
              key={option}
              className={`border border-gray-500 px-1 py-2 rounded-md flex-1 cursor-pointer transition-all
                ${selectedTimeOfUse === option ? "bg-blue-500 text-white" : "bg-gray-100"}`}
              onClick={() => {
                if (option === "Custom") {
                  setShowChartModal(true);
                } else {
                  handleUsageChange(option);
                }
              }}
            >
              {option}
            </button>
          ))}
        </div>

      </div>


{showChartModal && (
  <div
    className="
      fixed inset-0 z-50
      flex justify-center items-end
      lg:items-center
    "
  >
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/40"
      onClick={() => setShowChartModal(false)}
    />

    {/* Modal panel */}
    <div
      className="
        relative
        bg-white
        w-full
        rounded-t-2xl
        lg:rounded-2xl lg:max-w-lg
        max-h-[80vh] overflow-y-auto
        pb-6 p-6 shadow-lg
        animate-slide-up
      "
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Adjust Daily Energy Pattern</h3>
        <button onClick={() => setShowChartModal(false)}>
          <AiOutlineClose className="text-black text-2xl cursor-pointer" />
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-1 ps-6">
              Daily consumption:{" "}
              {totalConsumptionRaw === dailySliderMax ? (
                <span className={`text-green-600 font-semibold inline-block ${shake ? 'shake' : ''}`}>
                  {totalConsumption} % (Max)
                </span>
              ) : (
                <span className="text-red-500 font-bold">{totalConsumption}</span>
              )}
              {totalConsumptionRaw === dailySliderMax ? "" : `/${dailySliderMax} %`}
            </p>



            <DailyEnergyChart
              data={dailyPattern}
              draggable={true}
              onDataChange={handleChartUpdate} // updates local state and eventually parent's state
              sliderMax={computedSliderMax}
              timeOfUse={selectedTimeOfUse}
              onMaxDrag={triggerShake}
            />
    </div>
  </div>
)}

    </div>
  );
};

export default DailyEnergy;
