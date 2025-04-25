import React, { useState, useEffect } from 'react';
import { AiOutlineClose } from "react-icons/ai";
import groundRoof from "../assets/img/stock/ground-roof.jpeg";
import canopyRoof from "../assets/img/stock/canopy-roof.png";
import metalRoof from "../assets/img/stock/metal-roof.webp";
import shinglesRoof from "../assets/img/stock/shingles-roof.webp";
import tilesRoof from "../assets/img/stock/tiles-roof.webp";
import flatRoof from "../assets/img/stock/flat-roof.webp";
import roofTypes from "../assets/img/stock/roof-types.webp";
import { Container, SectionHeader, SectionMedia, SectionContent } from "../shared/Layout";
import RoofTypeModal from '../modals/RoofTypeModal';



const RoofType = ({ updateData, selectedInstallationType }) => {
  // Local state for modal visibility and selected roof type
  const [isRoofModalOpen, setRoofModalOpen] = useState(false);
  const [selectedRoofType, setSelectedRoofType] = useState("Roof");

  // When component mounts, set selectedRoofType from formData
  useEffect(() => {
    if (
      selectedInstallationType &&
      !["Ground", "Canopy"].includes(selectedInstallationType)
    ) {
      setSelectedRoofType(selectedInstallationType); // set to "Metal", "Tiles", etc.
    }
  }, [selectedInstallationType]);

  const handleInstallationClick = (option) => {
    if (option === "Roof") {
      // Open modal for roof type selection
      setRoofModalOpen(true);
    } else {
      updateData("installationType", option);
    }
  };

  const handleSelectRoofType = (roofType) => {
    setSelectedRoofType(roofType);
    updateData("installationType", roofType);
  };

    // Determine image URL based on the selected installation.
  // For Roof, we display the roof type in the placeholder image text.
  let imageUrl = '';
  if (selectedInstallationType === "Ground") {
    imageUrl = groundRoof;
  } else if (selectedInstallationType === "Canopy") {
    imageUrl = canopyRoof;
  } else {
    // For roof types: "Metal", "Shingles", "Tiles", or "Flatroof"
    switch (selectedInstallationType) {
    case "Metal":
        imageUrl = metalRoof;
        break;
    case "Shingles":
        imageUrl = shinglesRoof;
        break;
    case "Tiles":
        imageUrl = tilesRoof;
        break;
    case "Flatroof":
        imageUrl = flatRoof;
        break;
    default:
        imageUrl = roofTypes;
    }
}

  return (
    <Container>
      <SectionHeader>
      <h2 className="text-[1.25rem] text-gray-400 tracking-tight font-medium mb-3 mt-15 md:mt-0 text-left">
                Solar Design Studio
            </h2>
      <h2 className="text-4xl font-medium mb-8 md:mb-0">Tell us about your project.</h2>
      </SectionHeader>

      <SectionMedia>
            {/* Image container with a changeable image */}
            <div className="w-full h-70 bg-gray-300 rounded-lg flex justify-center items-center">
              <img 
                src={imageUrl} 
                alt="Solar Project" 
                className="w-full h-full object-cover rounded-lg" 
              />
            </div>
      </SectionMedia>

<SectionContent>

<p className="mt-4 text-2xl font-medium mb-4 md:mt-0">What type of solar project is this?</p>

<div className="mt-2 flex space-x-2 justify-center">
  {["Roof", "Ground", "Canopy"].map((option) => (
    <button
      key={option}
      className={`border border-gray-500 px-1 py-2 rounded-md flex-1 cursor-pointer transition-all
        ${selectedInstallationType === option ||
          (option === "Roof" &&
            selectedInstallationType &&
            selectedInstallationType !== "Ground" &&
            selectedInstallationType !== "Canopy")
          ? "bg-blue-500 text-white"
          : "bg-gray-100"}`}
      onClick={() => handleInstallationClick(option)}
    >
      {option === "Roof" ? selectedRoofType : option}
    </button>
  ))}
</div>

<p className="text-[0.75rem] text-gray-400 tracking-tight leading-tight mb-8 mt-4 text-left w-full max-w-10/12">
  This info gives us an understanding of how much you can save with the different types of systems available.
</p>
</SectionContent>


      <RoofTypeModal
        isOpen={isRoofModalOpen}
        onClose={() => setRoofModalOpen(false)}
        onSelectRoofType={handleSelectRoofType}
        selectedRoofType={selectedRoofType}
      />
    </Container>
  );
};

export default RoofType;
