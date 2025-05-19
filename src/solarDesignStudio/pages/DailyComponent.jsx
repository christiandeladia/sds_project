import React, { useState, useEffect } from 'react';
import DailyEnergyChart from '../chart/DailyEnergyChart';
import { FaArrowRight } from 'react-icons/fa6';
import { AiOutlineClose } from 'react-icons/ai';
import {
  generateNightTimeData,
  generateDayTimeData,
  generateTwentyFourSevenData,
} from '../chart/DailyEnergyChart';

const DailyComponent = ({ updateData, selectedTimeOfUse: propUsage, computedSliderMax }) => {
  const [selectedTimeOfUse, setSelectedTimeOfUse] = useState(propUsage || 'Day time');
  const [dailyPattern, setDailyPattern] = useState(
    getDefaultPattern(propUsage || 'Day time')
  );
  const [showChartModal, setShowChartModal] = useState(false);

  const dailySliderMax = Math.round(computedSliderMax / 30);

  function getDefaultPattern(option) {
    if (option === 'Night time') return generateNightTimeData(dailySliderMax);
    if (option === '24 Hours') return generateTwentyFourSevenData(dailySliderMax);
    return generateDayTimeData(dailySliderMax);
  }

  useEffect(() => {
    updateData('timeOfUse', selectedTimeOfUse);
    updateData('dailyEnergyData', dailyPattern);
  }, []);

  const handleUsageChange = (option) => {
    const pattern = getDefaultPattern(option);
    setSelectedTimeOfUse(option);
    setDailyPattern(pattern);
    updateData('timeOfUse', option);
    updateData('dailyEnergyData', pattern);
  };

  const handleChartUpdate = (newData) => {
    setDailyPattern(newData);
    setSelectedTimeOfUse('Custom');
    updateData('dailyEnergyData', newData);
    updateData('timeOfUse', 'Custom');
  };

  return (
    <div style={{ padding: 0 }}>
      <DailyEnergyChart
        data={dailyPattern}
        draggable={false}
        sliderMax={computedSliderMax}
        timeOfUse={selectedTimeOfUse}
      />
      <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
        {['Day time', 'Night time', '24 Hours', 'Custom'].map((opt) => (
          <button
            key={opt}
            onClick={() => {
              if (opt === 'Custom') setShowChartModal(true);
              else handleUsageChange(opt);
            }}
            style={{
              flex: 1,
              padding: '0.5rem',
              background: selectedTimeOfUse === opt ? '#2563EB' : '#E5E7EB',
              color: selectedTimeOfUse === opt ? '#FFF' : '#000',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      {showChartModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div style={{ background: '#FFF', padding: '1rem', maxWidth: 600 }}>
            <button
              onClick={() => setShowChartModal(false)}
              style={{ float: 'right', background: 'none', border: 'none', fontSize: '1.5rem' }}
            >
              <AiOutlineClose />
            </button>
            <DailyEnergyChart
              data={dailyPattern}
              draggable={true}
              onDataChange={handleChartUpdate}
              sliderMax={computedSliderMax}
              timeOfUse={selectedTimeOfUse}
              onMaxDrag={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyComponent;
