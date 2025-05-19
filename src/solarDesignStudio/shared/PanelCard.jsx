import React, { useState } from 'react';

function formatWatts(watts) {
  // ensure we’re working with a number
  const w = typeof watts === 'string'
    ? parseFloat(watts.replace(/[^\d.]/g, ''))
    : watts;

  if (w >= 1000) {
    // convert to kW, drop any trailing .0
    const kW = (w / 1000).toFixed(2).replace(/\.00$/, '');
    return `${kW} kW`;
  }
  return `${w} W`;
}

export default function PanelCard({
  panels,              // [{ imageSrc, brand, watts }, …]
  activeIndex: propActive = null,
  onSelect,            // (idx) => void
  className = '',      // extra wrapper classes if you need them
}) {
  // if parent doesn't control selection, use internal state
  const [internalActive, setInternalActive] = useState(null);
  const activeIndex = propActive !== null ? propActive : internalActive;
  const handleClick = idx => {
    if (onSelect) onSelect(idx);
    else setInternalActive(idx);
  };

  return (
    <div className={`overflow-x-auto px-2 ${className}`}>
      <div className="flex justify-center space-x-6 w-full min-w-max px-2">
        {panels.map((panel, idx) => {
          const isActive = idx === activeIndex;
          return (
            <div
              key={idx}
              onClick={() => handleClick(idx)}
              className={`
                flex-shrink-0 h-min-40 w-45 p-3 flex flex-col cursor-pointer rounded-lg bg-white
                ${isActive 
                  ? 'border-4 border-blue-500' 
                  : 'border border-gray-400'}
              `}
            >
                              {panel.recommended && (
                <div className="w-fit flex  px-3 py-1 mb-1 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">
                Recommended
                </div>
                  
                )}
              <div className="flex-1 flex items-center justify-center">
                <img
                  src={panel.imageSrc}
                  alt={panel.brand}
                  className="max-h-full h-30 object-contain"
                />
              </div>
              <div className="w-full flex justify-between pt-2">
                <p className='font-bold'>{panel.brand}</p>
                <p>{formatWatts(panel.watts)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
