import React from "react";
import canadianSolar from "../assets/img/solar/Canadian-Solar-logo.webp";
import solarPanel from "../assets/img/solar/solar-panel.webp";

const PanelsDiv = ({
  panelsCount = "- x",
  panelWattage = "- W",
  squareFoot = "-",
  logoSrc = canadianSolar,
  panelSrc = solarPanel,
  visible = false,
}) => {
  return (
    <div
      id="panelsDiv"
      className={`${
        visible ? "block" : "hidden"
      } sticky top-[25px] z-10`} /* you can toggle visible via prop */
    >
      <div className="grid grid-cols-2 rounded-2xl shadow bg-white overflow-hidden mb-10 mt-5">
        {/* Left panel */}
        <div className="flex flex-col justify-center items-center p-4">
          <img
            src={logoSrc}
            alt="Manufacturer Logo"
            className="w-[85px] object-contain"
          />
          <h2
            id="panelsCountText"
            className="font-bold text-center mt-4 text-xl"
          >
            {panelsCount}x Panels
          </h2>
          <h4 id="panelWattageText" className="text-center mb-4 text-md">
            {panelWattage}W
          </h4>
          <div className="flex items-center justify-center mt-4 text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5M.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5"></path>
            </svg>
            <p id="squareFootText" className="ml-2 mb-0 text-sm">
              {squareFoot} m²
            </p>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex justify-center items-center bg-white">
          <img
            src={panelSrc}
            alt="Solar Panel"
            className="py-3 w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default PanelsDiv;
