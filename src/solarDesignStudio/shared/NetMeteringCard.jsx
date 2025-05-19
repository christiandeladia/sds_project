import React from 'react';
import residentialImg from '../assets/img/solar/residential.png';

const NetMeteringCard = ({ lastLabel, reverseGrey = false }) => {
  // CSS class toggles only the animation-direction
  const containerClasses = `relative text-center ${reverseGrey ? 'reverse-grey' : ''}`
  const tipColor = reverseGrey ? '#FB923C' : '#0B5ED7'

  return (
    <div className={containerClasses}>
      {/* Base image (mirrored as in your original) */}
      <img
        src={residentialImg}
        alt="Solar"
        className="rounded block w-full h-auto"
        fetchPriority="high"
        style={{ transform: 'scaleX(-1)' }}
      />

    {/* “Generate Power” */}
    {!reverseGrey && (
      <div
        className="absolute text-white text-center"
        style={{
          top: '50%',
          left: '23%',
          transform: 'translate(-50%,-50%) skewY(14deg) rotateX(20deg)',
          zIndex: 20,
        }}
      >
        <p className="mb-0" style={{ fontSize: '.6rem' }}>
          Generate Power
        </p>
      </div>
    )}
      {/* Arrow 1 */}
    {!reverseGrey && (
    <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
    >
        {/* solid blue tip */}
        <path
        d="M35 50 L31 53 L31 63"
        stroke={tipColor}
        strokeWidth="0.5"
        fill="none"
        strokeLinecap="round"
        />
        {/* grey animated tail */}
        <path
        d="M35 50 L31 53 L31 63"
        className="dashed"
        stroke="lightgrey"
        strokeWidth="0.5"
        fill="none"
        strokeLinecap="round"
        />
    </svg>
    )}


      {/* “Store Power” */}
      <div
        className="absolute text-white text-center"
        style={{
          top: '65%',
          left: '22.5%',
          transform: 'translate(-50%,-50%) skewY(15deg)',
          zIndex: 20,
        }}
      >
        <p className="mb-0" style={{ fontSize: '.6rem' }}>
          Store Power
        </p>
      </div>

      {/* Arrow 2 */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      >
        <path
          d="M33.5 71 L35 70 L40.5 71.5 L40.5 73 L58 78 L76 70 L76 58"
          stroke={tipColor}
          strokeWidth="0.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M33.5 71 L35 70 L40.5 71.5 L40.5 73 L58 78 L76 70 L76 58"
          className="dashed"
          stroke="lightgrey"
          strokeWidth="0.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Arrow 3 */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      >
        <path
          d="M76 70 L90 64"
          stroke={tipColor}
          strokeWidth="0.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M76 70 L90 64"
          className="dashed"
          stroke="lightgrey"
          strokeWidth="0.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Arrow 4 */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      >
        <path
          d="M75.2 34.5 L77.5 18 L74.5 18 Q74 20, 30 21"
          stroke={tipColor}
          strokeWidth="0.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M75.2 34.5 L77.5 18 L74.5 18 Q74 20, 30 21"
          className="dashed"
          stroke="lightgrey"
          strokeWidth="0.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Final label (“Import Power” or “Export Power”) */}
      <div
        className="absolute text-black text-center"
        style={{ top: '18%', left: '30%', zIndex: 20 }}
      >
        <p className="mb-0" style={{ fontSize: '.6rem' }}>
          {lastLabel}
        </p>
      </div>
    </div>
  )
}

export default NetMeteringCard
