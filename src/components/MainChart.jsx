import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../Config";
// Import the new DateDropdown component which includes the chart toggle button.
import DateDropdown from "../components/DateRangePicker";
import PowerDropdown from "../components/PowerDropdown";
import { groupedPhaseOptions } from "../components/PowerDropdown";
import CustomTooltip from "../components/CustomTooltip";
import CustomDateTooltip from "../components/CustomDateTooltip";
import { groupAndAverage, formatXAxisLabel } from "../utils/dataUtils";
import {LoadingSkeleton} from "../components/LoadingSkeleton";

const colorArray = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00c49f", "#0088FE", "#FFBB28"];

const MainChart = ({ selectedPlant }) => {
  const [selectedDates, setSelectedDates] = useState(null);
  // Add chartType state; default is "area"
  const [chartType, setChartType] = useState("area");

  // Set default phase to "Total Power"
  const totalPowerOption = groupedPhaseOptions
    .flatMap((group) => group.options)
    .flatMap((subGroup) => subGroup.options)
    .find((option) => option.value === "total_power");
  const [selectedPhases, setSelectedPhases] = useState(
    totalPowerOption ? [totalPowerOption] : []
  );
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredPhase, setHoveredPhase] = useState(null);
  const [hoveredPhaseValue, setHoveredPhaseValue] = useState(null);
  const [hoveredPill, setHoveredPill] = useState(null);

  // Fetch data from Firestore
  useEffect(() => {
    if (!selectedPlant) return;
    const q = query(
      collection(db, "meter_monitor_day"),
      where("plant_id", "==", selectedPlant)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedData = querySnapshot.docs.map((doc) => doc.data());
      setData(fetchedData);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [selectedPlant]);

  // Compute day difference using selectedDates.
  const diffInDays = useMemo(() => {
    if (selectedDates && selectedDates.length === 2) {
      const start = new Date(selectedDates[0] * 1000);
      const end = new Date(selectedDates[1] * 1000);
      return (end - start) / (1000 * 60 * 60 * 24);
    }
    return 0;
  }, [selectedDates]);

  // rawFilteredData: ungrouped data for custom date ranges (2-7 days) in area mode.
  const rawFilteredData = useMemo(() => {
    let startTimestamp, endTimestamp, startDate, endDate;
    if (selectedDates && selectedDates.length === 2) {
      startDate = new Date(selectedDates[0] * 1000);
      endDate = new Date(selectedDates[1] * 1000);
      startTimestamp = Math.floor(startDate.setHours(0, 0, 0, 0) / 1000);
      endTimestamp = Math.floor(endDate.setHours(23, 59, 59, 999) / 1000);
    } else {
      const today = new Date();
      startDate = new Date(today);
      endDate = new Date(today);
      startTimestamp = Math.floor(today.setHours(0, 0, 0, 0) / 1000);
      endTimestamp = Math.floor(today.setHours(23, 59, 59, 999) / 1000);
    }
    return data
      .filter(
        (entry) =>
          entry.timestamp >= startTimestamp && entry.timestamp <= endTimestamp
      )
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((entry) => ({
        // Use full locale string for other chart modes
        timestamp: new Date(entry.timestamp * 1000).toLocaleString("en-PH", {
          timeZone: "Asia/Manila",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        timestamp_unix: entry.timestamp,
        // Voltage measurements
        L1_voltage: entry.voltages_avg?.L1 || null,
        L2_voltage: entry.voltages_avg?.L2 || null,
        L3_voltage: entry.voltages_avg?.L3 || null,
        total_voltage:
          (entry.voltages_avg?.L1 ?? 0) +
          (entry.voltages_avg?.L2 ?? 0) +
          (entry.voltages_avg?.L3 ?? 0),

        // Current measurements
        L1_current: entry.currents_avg?.L1 || null,
        L2_current: entry.currents_avg?.L2 || null,
        L3_current: entry.currents_avg?.L3 || null,
        total_current:
          (entry.currents_avg?.L1 ?? 0) +
          (entry.currents_avg?.L2 ?? 0) +
          (entry.currents_avg?.L3 ?? 0),

        // Frequency measurements
        L1_frequency: entry.frequencies_avg?.L1 || null,
        L2_frequency: entry.frequencies_avg?.L2 || null,
        L3_frequency: entry.frequencies_avg?.L3 || null,
        total_frequency:
          (entry.frequencies_avg?.L1 ?? 0) +
          (entry.frequencies_avg?.L2 ?? 0) +
          (entry.frequencies_avg?.L3 ?? 0),

        // Voltage Harmonics measurements
        L1_volt_harmonic: entry.voltage_harmonics_avg?.L1 || null,
        L2_volt_harmonic: entry.voltage_harmonics_avg?.L2 || null,
        L3_volt_harmonic: entry.voltage_harmonics_avg?.L3 || null,
        total_volt_harmonic:
          (entry.voltage_harmonics_avg?.L1 ?? 0) +
          (entry.voltage_harmonics_avg?.L2 ?? 0) +
          (entry.voltage_harmonics_avg?.L3 ?? 0),

        // Current Harmonics measurements
        L1_curr_harmonic: entry.current_harmonics_avg?.L1 || null,
        L2_curr_harmonic: entry.current_harmonics_avg?.L2 || null,
        L3_curr_harmonic: entry.current_harmonics_avg?.L3 || null,
        total_curr_harmonic:
          (entry.current_harmonics_avg?.L1 ?? 0) +
          (entry.current_harmonics_avg?.L2 ?? 0) +
          (entry.current_harmonics_avg?.L3 ?? 0),

        // Power Factor measurements
        L1_power_factor: entry.power_factors_avg?.L1 || null,
        L2_power_factor: entry.power_factors_avg?.L2 || null,
        L3_power_factor: entry.power_factors_avg?.L3 || null,
        total_power_factor:
          (entry.power_factors_avg?.L1 ?? 0) +
          (entry.power_factors_avg?.L2 ?? 0) +
          (entry.power_factors_avg?.L3 ?? 0),

        // Power measurements
        L1_power: entry.power?.L1 || null,
        L2_power: entry.power?.L2 || null,
        L3_power: entry.power?.L3 || null,
        total_power:
          (entry.power?.L1 ?? 0) +
          (entry.power?.L2 ?? 0) +
          (entry.power?.L3 ?? 0),
      }));
  }, [data, selectedDates]);

  const filteredChartData = useMemo(() => {
    if (!data.length) return [];

    let startTimestamp, endTimestamp, startDate, endDate;
    if (selectedDates && selectedDates.length === 2) {
      startDate = new Date(selectedDates[0] * 1000);
      endDate = new Date(selectedDates[1] * 1000);
      startTimestamp = Math.floor(startDate.setHours(0, 0, 0, 0) / 1000);
      endTimestamp = Math.floor(endDate.setHours(23, 59, 59, 999) / 1000);
    } else {
      const today = new Date();
      startDate = new Date(today);
      endDate = new Date(today);
      startTimestamp = Math.floor(today.setHours(0, 0, 0, 0) / 1000);
      endTimestamp = Math.floor(today.setHours(23, 59, 59, 999) / 1000);
    }

    const filteredData = data.filter(
      (entry) => entry.timestamp >= startTimestamp && entry.timestamp <= endTimestamp
    );

    let groupedData = [];
    const diffInMs = endDate - startDate;
    const diffInDaysCalc = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInDaysCalc < 2) {
      // For ranges less than 2 days: do not group data.
      groupedData = filteredData
        .sort((a, b) => a.timestamp - b.timestamp)
        .map((entry) => ({
          timestamp: new Date(entry.timestamp * 1000).toLocaleTimeString("en-PH", {
            timeZone: "Asia/Manila",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          timestamp_unix: entry.timestamp,
          // Voltage measurements
          L1_voltage: entry.voltages_avg?.L1 || null,
          L2_voltage: entry.voltages_avg?.L2 || null,
          L3_voltage: entry.voltages_avg?.L3 || null,
          total_voltage:
            (entry.voltages_avg?.L1 ?? 0) +
            (entry.voltages_avg?.L2 ?? 0) +
            (entry.voltages_avg?.L3 ?? 0),

          // Current measurements
          L1_current: entry.currents_avg?.L1 || null,
          L2_current: entry.currents_avg?.L2 || null,
          L3_current: entry.currents_avg?.L3 || null,
          total_current:
            (entry.currents_avg?.L1 ?? 0) +
            (entry.currents_avg?.L2 ?? 0) +
            (entry.currents_avg?.L3 ?? 0),

          // Frequency measurements
          L1_frequency: entry.frequencies_avg?.L1 || null,
          L2_frequency: entry.frequencies_avg?.L2 || null,
          L3_frequency: entry.frequencies_avg?.L3 || null,
          total_frequency:
            (entry.frequencies_avg?.L1 ?? 0) +
            (entry.frequencies_avg?.L2 ?? 0) +
            (entry.frequencies_avg?.L3 ?? 0),

          // Voltage Harmonics measurements
          L1_volt_harmonic: entry.voltage_harmonics_avg?.L1 || null,
          L2_volt_harmonic: entry.voltage_harmonics_avg?.L2 || null,
          L3_volt_harmonic: entry.voltage_harmonics_avg?.L3 || null,
          total_volt_harmonic:
            (entry.voltage_harmonics_avg?.L1 ?? 0) +
            (entry.voltage_harmonics_avg?.L2 ?? 0) +
            (entry.voltage_harmonics_avg?.L3 ?? 0),

          // Current Harmonics measurements
          L1_curr_harmonic: entry.current_harmonics_avg?.L1 || null,
          L2_curr_harmonic: entry.current_harmonics_avg?.L2 || null,
          L3_curr_harmonic: entry.current_harmonics_avg?.L3 || null,
          total_curr_harmonic:
            (entry.current_harmonics_avg?.L1 ?? 0) +
            (entry.current_harmonics_avg?.L2 ?? 0) +
            (entry.current_harmonics_avg?.L3 ?? 0),

          // Power Factor measurements
          L1_power_factor: entry.power_factors_avg?.L1 || null,
          L2_power_factor: entry.power_factors_avg?.L2 || null,
          L3_power_factor: entry.power_factors_avg?.L3 || null,
          total_power_factor:
            (entry.power_factors_avg?.L1 ?? 0) +
            (entry.power_factors_avg?.L2 ?? 0) +
            (entry.power_factors_avg?.L3 ?? 0),

          // Power measurements
          L1_power: entry.power?.L1 || null,
          L2_power: entry.power?.L2 || null,
          L3_power: entry.power?.L3 || null,
          total_power:
            (entry.power?.L1 ?? 0) +
            (entry.power?.L2 ?? 0) +
            (entry.power?.L3 ?? 0),
        }));
    } else {
      // For ranges of 2 days or more, group data by day (or month if spanning multiple months)
      if (
        startDate.getMonth() === endDate.getMonth() &&
        startDate.getFullYear() === endDate.getFullYear()
      ) {
        groupedData = groupAndAverage(filteredData, (item) => {
          const d = new Date(item.timestamp * 1000);
          return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${("0" + d.getDate()).slice(-2)}`;
        });
      } else {
        groupedData = groupAndAverage(filteredData, (item) => {
          const d = new Date(item.timestamp * 1000);
          return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}`;
        });
      }
      groupedData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    // Remove grouped entries where all selected phase values are null.
    groupedData = groupedData.filter((entry) =>
      selectedPhases.some((phase) => entry[phase.value] !== null)
    );

    return groupedData;
  }, [data, selectedDates, selectedPhases]);

  const overlayData = useMemo(() => {
    if (selectedDates && diffInDays >= 2 && diffInDays <= 7 && chartType === "area") {
      const groups = {};
      rawFilteredData.forEach((entry) => {
        // Use the same short format as in the pills.
        const dayKey = new Date(entry.timestamp_unix * 1000)
          .toLocaleDateString(undefined, { month: "short", day: "numeric" });
        if (!groups[dayKey]) groups[dayKey] = [];
        const originalDate = new Date(entry.timestamp_unix * 1000);
        const fixedTime = new Date(
          1970,
          0,
          1,
          originalDate.getHours(),
          originalDate.getMinutes(),
          originalDate.getSeconds()
        );
        groups[dayKey].push({ ...entry, fixedTime });
      });
      const sortedDays = Object.keys(groups).sort(
        (a, b) => new Date(a) - new Date(b)
      );
      return sortedDays.map((dayKey) => ({
        day: dayKey,
        data: groups[dayKey].sort((a, b) => a.fixedTime - b.fixedTime),
      }));
    }
    return null;
  }, [rawFilteredData, selectedDates, diffInDays, chartType]);

  // Build combined overlay data: keyed by fixedTime with composite keys "day||phase"
// Build combined overlay data: keyed by fixedTime with composite keys "day||phase"
const combinedData = useMemo(() => {
  if (overlayData) {
    const temp = {};
    overlayData.forEach((dayGroup) => {
      dayGroup.data.forEach((d) => {
        // Get the 24-hour value
        const hour24 = d.fixedTime.getHours();
        // Convert to 12-hour (if hour24 % 12 is 0, use 12)
        const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
        const ampm = hour24 >= 12 ? "PM" : "AM";
        // Build a label like "01:00 AM"
        const fixedLabel = `${hour12.toString().padStart(2, "0")}:00 ${ampm}`;
        // Store both label and sort key
        if (!temp[fixedLabel]) {
          temp[fixedLabel] = { fixedTime: fixedLabel, sortHour: hour24 };
        }
        selectedPhases.forEach((phase) => {
          const key = `${dayGroup.day}||${phase.value}`;
          temp[fixedLabel][key] = d[phase.value];
        });
      });
    });
    const arr = Object.values(temp);
    // Sort by the underlying 24-hour value
    arr.sort((a, b) => a.sortHour - b.sortHour);
    return arr;
  }
  return null;
}, [overlayData, selectedPhases]);



  // We'll use mergedData that includes both daily series and average fields.
  const mergedData = useMemo(() => {
    if (!combinedData) return null;
    return combinedData.map((item) => {
      const newItem = { ...item };
      selectedPhases.forEach((phase) => {
        const keys = Object.keys(item).filter(
          (key) => key !== "fixedTime" && key.endsWith(`||${phase.value}`)
        );
        const values = keys
          .map((key) => Number(item[key]))
          .filter((v) => !isNaN(v));
        const avg =
          values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
        newItem[`avg_${phase.value}`] =
          avg !== null ? parseFloat(avg.toFixed(2)) : null;
      });
      return newItem;
    });
  }, [combinedData, selectedPhases]);
  
  const overallAverages = useMemo(() => {
    if (!filteredChartData || filteredChartData.length === 0) return {};
    // List all fields you want to compute an average for.
    const fields = [
      "L1_voltage", "L2_voltage", "L3_voltage", "total_voltage",
      "L1_current", "L2_current", "L3_current", "total_current",
      "L1_frequency", "L2_frequency", "L3_frequency", "total_frequency",
      "L1_volt_harmonic", "L2_volt_harmonic", "L3_volt_harmonic", "total_volt_harmonic",
      "L1_curr_harmonic", "L2_curr_harmonic", "L3_curr_harmonic", "total_curr_harmonic",
      "L1_power_factor", "L2_power_factor", "L3_power_factor", "total_power_factor",
      "L1_power", "L2_power", "L3_power", "total_power"
    ];
    
  
    const averages = {};
    fields.forEach((field) => {
      let sum = 0;
      let count = 0;
      filteredChartData.forEach((item) => {
        const value = Number(item[field]);
        if (!isNaN(value) && value !== null) {
          sum += value;
          count++;
        }
      });
      averages[field] = count ? parseFloat((sum / count).toFixed(2)) : null;
    });
    return averages;
  }, [filteredChartData]);
  

  // --- In the overlay chart rendering ---
  // We assume overlayData is an array of groups (one per day).
  // Compute the number of days:
  const numDays = overlayData ? overlayData.length : 1;
  
  // Determine minY and maxY for the y-axis.
  const { minY, maxY } = useMemo(() => {
    const getPhaseValues = (phaseKey) => {
      if (
        chartType === "area" &&
        selectedDates &&
        diffInDays >= 2 &&
        diffInDays <= 7 &&
        mergedData
      ) {
        return mergedData
          .flatMap((d) =>
            Object.keys(d)
              .filter((key) => key !== "fixedTime" && key.endsWith(phaseKey))
              .map((k) => Number(d[k]))
          )
          .filter((v) => v != null && !isNaN(v));
      } else {
        // Fallback for single-chart mode.
        return rawFilteredData
          .map((entry) => Number(entry[phaseKey]))
          .filter((v) => v != null && !isNaN(v));
      }
    };
    const allValues = selectedPhases.flatMap((phase) => getPhaseValues(phase.value));
    if (allValues.length === 0) return { minY: 0, maxY: 0 };
    const min = Math.min(...allValues) - 1;
    const max = Math.max(...allValues) + 1;
    return { minY: parseFloat(min.toFixed(1)), maxY: parseFloat(max.toFixed(1)) };
  }, [rawFilteredData, selectedPhases, chartType, diffInDays, mergedData]);

  // Close dropdown when clicking outside.
  const dropdownRef = useRef();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-11/12 bg-white p-6 rounded-lg shadow-lg h-[80vh] flex flex-col">
      <div className="flex justify-between items-center mb-4">
      <PowerDropdown
        onPhaseChange={setSelectedPhases}
        onPhaseHover={setHoveredPhase}  // <-- new prop for hover events
        limitToOne={selectedDates && diffInDays >= 2 && diffInDays <= 7}
      />


        <div className="flex items-center space-x-4">
          {/* Use the updated DateDropdown that now includes the chart toggle button */}
          <DateDropdown
            onDateSelect={(dates) => setSelectedDates(dates)}
            onChartTypeChange={(newType) => setChartType(newType)}
            overallAverages={overallAverages}
            onDatePillHover={setHoveredPill} // Pass the callback here.
            rawData={rawFilteredData} 
          />
        </div>
      </div>

      <div className="flex-1">
        {isLoading ? (
          <LoadingSkeleton />
        ) : filteredChartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600 text-lg font-semibold">No Data Found</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {diffInDays < 2 ? (
              // Always use AreaChart for ranges less than 2 days.
              <AreaChart data={filteredChartData}>
                <defs>
                  {selectedPhases.map((phase) => (
                    <linearGradient
                      key={`areaGradient_${phase.value}`}
                      id={`areaGradient_${phase.value}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="10%" stopColor={phase.color} stopOpacity={1} />
                      <stop offset="90%" stopColor={phase.color} stopOpacity={0.3} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="black" strokeOpacity={0.2} />
                <XAxis
                  dataKey="timestamp"
                  minTickGap={40}
                  stroke="gray"
                  tick={{ style: { pointerEvents: "none", userSelect: "none" } }}
                  tickFormatter={formatXAxisLabel}
                />
                <YAxis
                  stroke="gray"
                  domain={[minY, maxY]}
                  tickLine={true}
                  axisLine={true}
                  tick={{ style: { pointerEvents: "none", userSelect: "none" } }}
                />
                <Tooltip content={<CustomTooltip />} />
                {selectedPhases.map((phase) => (
                  <Area
                  key={`area_${phase.value}`}
                  type="monotone"
                  dataKey={phase.value}
                  stroke={phase.color}
                  fill={`url(#areaGradient_${phase.value})`}
                  strokeWidth={hoveredPhase === phase.value ? 4 : 2}
                  dot={{ r: 2 }}
                  style={{
                    filter: hoveredPhase && hoveredPhase !== phase.value ? "grayscale(100%)" : "none",
                    opacity: hoveredPhase && hoveredPhase !== phase.value ? 0.3 : 1,
                  }}
                >
                  {hoveredPhase === phase.value && (
                    <LabelList
                      dataKey={phase.value}
                      position="top"
                      fill="black"
                      fontSize={12}
                      textAnchor="middle"
                      formatter={(value) => Number(value).toFixed(2)}
                    />
                  )}
                </Area>
                ))}
              </AreaChart>
            ) : diffInDays > 7 ? (
              // Always use BarChart for ranges greater than 7 days.
              <BarChart data={filteredChartData}>
              <defs>
                {selectedPhases.map((phase) => (
                  <linearGradient
                    key={`barGradient_${phase.value}`}
                    id={`barGradient_${phase.value}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="10%" stopColor={phase.color} stopOpacity={1} />
                    <stop offset="90%" stopColor={phase.color} stopOpacity={0.5} />
                  </linearGradient>
                ))}
              </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="black" strokeOpacity={0.2} />
                <XAxis
                  dataKey="timestamp"
                  minTickGap={40}
                  stroke="gray"
                  tick={{ style: { pointerEvents: "none", userSelect: "none" } }}
                  tickFormatter={formatXAxisLabel}
                />
                <YAxis
                  stroke="gray"
                  domain={[minY, maxY]}
                  tickLine={true}
                  axisLine={true}
                  tick={{ style: { pointerEvents: "none", userSelect: "none" } }}
                />
                <Tooltip content={<CustomTooltip />} />
                {selectedPhases.map((phase) => (
                  <Bar
                    key={`bar_${phase.value}`}
                    dataKey={phase.value}
                    fill={`url(#barGradient_${phase.value})`}
                    radius={[15, 15, 0, 0]}
                    style={{
                      filter: hoveredPhase && hoveredPhase !== phase.value ? "grayscale(100%)" : "none",
                      opacity: hoveredPhase && hoveredPhase !== phase.value ? 0.3 : 1,
                    }}
                  >
                    {hoveredPhase === phase.value && (
                      <LabelList
                        dataKey={phase.value}
                        position="top"
                        fill="black"
                        fontSize="12"
                        textAnchor="middle"
                        formatter={(value) => Number(value).toFixed(2)}
                      />
                    )}
                  </Bar>
                ))}
              </BarChart>
            ) : (
              // For custom date ranges between 2 and 7 days, render chart based on chartType state.
              chartType === "bar" ? (
                <BarChart data={filteredChartData}>
                    <defs>
                      {selectedPhases.map((phase) => (
                        <linearGradient
                          key={`barGradient_${phase.value}`}
                          id={`barGradient_${phase.value}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="10%" stopColor={phase.color} stopOpacity={1} />
                          <stop offset="90%" stopColor={phase.color} stopOpacity={0.5} />
                        </linearGradient>
                      ))}
                    </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="black" strokeOpacity={0.2} />
                  <XAxis
                    dataKey="timestamp"
                    minTickGap={40}
                    stroke="gray"
                    tick={{ style: { pointerEvents: "none", userSelect: "none" } }}
                    tickFormatter={formatXAxisLabel}
                  />
                  <YAxis
                    stroke="gray"
                    domain={[minY, maxY]}
                    tickLine={true}
                    axisLine={true}
                    tick={{ style: { pointerEvents: "none", userSelect: "none" } }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {selectedPhases.map((phase) => (
                    <Bar
                      key={`bar_${phase.value}`}
                      dataKey={phase.value}
                      fill={`url(#barGradient_${phase.value})`}
                      radius={[15, 15, 0, 0]}
                    />
                  ))}
                </BarChart>
              ) : mergedData && (
              <AreaChart data={mergedData}>
                {/* Define gradients for the average series */}
                <defs>
                  {selectedPhases.map((phase) => (
                    <linearGradient
                      key={`avgGradient_${phase.value}`}
                      id={`avgGradient_${phase.value}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="10%" stopColor={phase.color} stopOpacity={1} />
                      <stop offset="90%" stopColor={phase.color} stopOpacity={0.3} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis dataKey="fixedTime" />
                <YAxis domain={[minY, maxY]} />
                <Tooltip content={<CustomDateTooltip />} />
                {/* Render daily series */}
                {selectedPhases.map((phase) =>
                  overlayData.map((group) => {
                    const dataKey = `${group.day}||${phase.value}`;
                    // Compare the hovered pill value with the group's day (both should be formatted similarly, e.g. "Mar 1")
                    const isHovered = hoveredPill === group.day;
                    return (
                      <Area
                        key={`${group.day}||${phase.value}`}
                        type="monotone"
                        dataKey={dataKey}
                        stroke={phase.color}
                        fillOpacity={0}
                        // Highlight with thicker stroke if hovered; otherwise, use normal thickness.
                        strokeWidth={isHovered ? 4 : 2}
                        // Adjust opacity: fully opaque for the hovered series and slightly faded for non-hovered.
                        style={{
                          filter: hoveredPill && !isHovered ? "grayscale(100%)" : "none",
                          opacity: hoveredPill && !isHovered ? 0.3 : 1,
                        }}                        
                        dot={{ r: 2 }}
                      >
                        {isHovered && (
                          <LabelList
                            dataKey={dataKey}
                            position="top"
                            fill="black"
                            fontSize={12}
                            textAnchor="middle"
                            formatter={(value) => Number(value).toFixed(2)}
                          />
                        )}
                      </Area>
                    );
                  })
                )}

                {/* Render average series for each selected phase with gradient fill */}
                {selectedPhases.map((phase) => (
                  <Area
                    key={`avg_${phase.value}`}
                    type="monotone"
                    dataKey={`avg_${phase.value}`}
                    stroke={phase.color}
                    fill={`url(#avgGradient_${phase.value})`}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                ))}
              </AreaChart>


              )
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default MainChart;
