// src/components/DocumentDataDisplay.jsx
import React from "react";
import PropTypes from "prop-types";
import { buildDocumentData } from "./DocumentData";

export default function DocumentDataDisplay({ formData }) {
  // 1) Map your existing formData → the flat queryParams shape
  const queryParams = {
    buildingType:          formData.buildingType,
    address:               formData.address,
    coordinates:           `${formData.coordinates.lat},${formData.coordinates.lng}`,
    monthlyBill:           formData.monthlyBill,
    roofType:              formData.installationType,        // your “RoofType” step
    lineType:              formData.lineType  || "singlePhase", 
    lineVoltage:           formData.lineVoltage || "220",
    timeOfUse:             formData.timeOfUse,
    netMetering:           formData.applyNetMetering ? "yes" : "no",
    newRequestedMonthlyBill: formData.newRequestedMonthlyBill || ""
  };

  // 2) Build the full documentData object
  const documentData = buildDocumentData(queryParams);

  // 3) Render each section
  return (
    <div className="space-y-8">
      {/* Query Params */}
      <section>
        <h3 className="text-xl font-semibold mb-2">Inputs</h3>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
          {Object.entries(queryParams).map(([key, val]) => (
            <React.Fragment key={key}>
              <dt className="font-medium text-gray-700">{key}</dt>
              <dd className="text-gray-900">{String(val)}</dd>
            </React.Fragment>
          ))}
        </dl>
      </section>

      {/* Calculations */}
      <section>
        <h3 className="text-xl font-semibold mb-2">Design Calculations</h3>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
          {Object.entries(documentData.calculateDesign).map(([k, v]) => (
            <React.Fragment key={k}>
              <dt className="font-medium text-gray-700">{k}</dt>
              <dd className="text-gray-900">{String(v)}</dd>
            </React.Fragment>
          ))}
        </dl>
      </section>

      {/* Pricing */}
      <section>
        <h3 className="text-xl font-semibold mb-2">Pricing Breakdown</h3>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
          {Object.entries(documentData.priceDesign).map(([k, v]) => (
            <React.Fragment key={k}>
              <dt className="font-medium text-gray-700">{k}</dt>
              <dd className="text-gray-900">{String(v)}</dd>
            </React.Fragment>
          ))}
        </dl>
      </section>

      {/* Estimates */}
      <section>
        <h3 className="text-xl font-semibold mb-2">System Estimates</h3>
          <div>
            <dt className="font-medium text-gray-700">monthlyIncome</dt>
            <dd className="text-gray-900">{documentData.systemEstimates.monthlyIncome}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">monthlySolarGeneration</dt>
            <dd className="text-gray-900">{documentData.systemEstimates.monthlySolarGeneration}</dd>
          </div>
          {/* if you want to dive into the 25-year array, you could map it here */}
      </section>

      {/* Final Pricing */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Final Prices</h3>
          <dl className="space-y-2">
            {Object.entries(documentData.pricing).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="font-medium text-gray-700">{k}</span>
                <span className="text-gray-900">{v}</span>
              </div>
            ))}
          </dl>
        </div>

      {/* Environment */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Environmental Impact</h3>
          <dl className="space-y-2">
            {Object.entries(documentData.environment).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="font-medium text-gray-700">{k}</span>
                <span className="text-gray-900">{v}</span>
              </div>
            ))}
          </dl>
        </div>


      {/* Panel Specs */}
      <section>
        <h3 className="text-xl font-semibold mb-2">Panel Details</h3>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
          {Object.entries(documentData.solarPanels).map(([k, v]) => (
            <React.Fragment key={k}>
              <dt className="font-medium text-gray-700">{k}</dt>
              <dd className="text-gray-900">{String(v)}</dd>
            </React.Fragment>
          ))}
        </dl>
      </section>
    </div>
  );
}

DocumentDataDisplay.propTypes = {
  formData: PropTypes.shape({
    buildingType:              PropTypes.string.isRequired,
    address:                   PropTypes.string.isRequired,
    coordinates: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number
    }).isRequired,
    monthlyBill:               PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    installationType:          PropTypes.string.isRequired,
    lineType:                  PropTypes.string,
    lineVoltage:               PropTypes.string,
    timeOfUse:                 PropTypes.string.isRequired,
    applyNetMetering:          PropTypes.bool,
    newRequestedMonthlyBill:   PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired
};
