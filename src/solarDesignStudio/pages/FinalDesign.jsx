import React, { useState, useMemo  } from "react";
import { sendToTelegram } from "../shared/utils/sendToTelegram";
import {
  isValidBookDate,
  isValidName,
  isValidEmail,
  isValidPhoneNumber,
  getErrorText,
  getDateAndTime,
  setBorderStyle,
} from "../shared/utils/helper";
import { buildDocumentData } from '../shared/DocumentData';


const FinalDesign = ({ formData,  queryParams, calculateDesign, priceDesign, onBack }) => {
  const [date, setDate]       = useState("");
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [email, setEmail]     = useState("");
  const [errors, setErrors]   = useState({});
  const [status, setStatus]   = useState("idle");
  console.log(queryParams);
  console.log(calculateDesign);
  console.log(priceDesign);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status !== "idle") return;

    // --- VALIDATION USING HELPERS ---
    const errs = {};
    if (!isValidBookDate(date))             errs.date  = getErrorText("date");
    if (!isValidName(name))                 errs.name  = getErrorText("name");
    if (!isValidEmail(email))               errs.email = getErrorText("email");
    if (phone && !isValidPhoneNumber(phone)) errs.phone = getErrorText("phone");

    setErrors(errs);
    if (Object.keys(errs).length) {
      // clear back to an empty object after 3s
      setTimeout(() => setErrors({}), 3000);
      return;
    }
    

    setStatus("sending");

    // --- BUILD PAYLOAD ---
    const payload = {
      action:    "BOOK SITE VISIT",
      timestamp: getDateAndTime(),
      data: {
        queryParams,
        calculateDesign,
        priceDesign
      },
      contact: {
        SiteVisitDate: date,
        name:           name.trim(),
        phone:          phone.trim(),
        email:          email.trim(),
      },
    };
    console.log(payload);

    // --- SEND & UPDATE STATUS ---
    const success = await sendToTelegram(payload);
    setStatus(success ? "sent" : "idle");
  };

  // dynamic input classes
  const commonOpts = { disabled: status !== "idle" };
  const dateClass   = setBorderStyle({ hasError: !!errors.date,   isDisabled: commonOpts.disabled });
  const nameClass   = setBorderStyle({ hasError: !!errors.name,   isDisabled: commonOpts.disabled });
  const phoneClass  = setBorderStyle({ hasError: !!errors.phone,  isDisabled: commonOpts.disabled });
  const emailClass  = setBorderStyle({ hasError: !!errors.email,  isDisabled: commonOpts.disabled });


  const today = new Date().toISOString().slice(0, 10);  


  const params = {
    buildingType:            formData.buildingType,
    address:                 formData.address,
    coordinates:             `${formData.coordinates.lat},${formData.coordinates.lng}`,
    monthlyBill:             formData.monthlyBill,
    roofType:                formData.installationType,
    lineType:                formData.lineType    || "singlePhase",
    lineVoltage:             formData.lineVoltage || "220",
    timeOfUse:               formData.timeOfUse,
    netMetering:           formData.netMetering === "yes" ? "yes" : "no",
    panelCount:              formData.panelCount, 
    inverterCount:              formData.inverterCount, 
    batteryCount:            formData.batteryCount,
    panelDetails:    formData.panelDetails,
    batteryDetails:      formData.batteryDetails,
    newRequestedMonthlyBill: formData.newRequestedMonthlyBill || ""
  };

  function addCommas(value) {
      if (value == null) return '';
    
      const parts = value.toString().split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }

    function formatNumber(num, decimals) {
      const multiplier = Math.pow(10, decimals);
      return Math.round(num * multiplier) / multiplier;
    }
    
    // run the calc only when inputs change:
    const documentData = useMemo(
      () => buildDocumentData(params),
      [JSON.stringify(params)]
    );
  
    // pull out the panel count computed by the formula:
    const solarPanelskW = (documentData.solarPanels.count * documentData.solarPanels.watts)/1000;
    const totalPricing = documentData.pricing.total;
    const rawSavings = documentData.systemEstimates.monthlyIncome * 12 * 25;
    const finalTwentyYearSavings = Number(rawSavings.toFixed(2));
    const includeText = documentData.queryParams.netMetering;

    

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-7 md:mt-20 grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-10/12 lg:max-w-9/12 mx-auto"
    >
      {/* Left Column */}
      <div className="p-6 bg-white">
        <h4 className="text-center mb-6 text-xl font-semibold">Your Design</h4>
        <p className="text-center mb-0">{solarPanelskW} kW Solar Panels</p>
        <p className="text-center mb-0">Wall Inverter</p>
        {formData.battery && <p className="text-center mb-0">Battery</p>}
        <div className="h-px my-6 bg-gray-300" />
        <p className="text-center mb-0">Total Cost: P{addCommas(totalPricing)}</p>
        <p className="text-center font-bold mt-2">
          Est. 25 Year Savings: P{addCommas(finalTwentyYearSavings)}
        </p>
        <p className="text-center text-sm text-gray-600 my-6">
          Includes installation cost, government applications &nbsp;
          {includeText === 'no' ? (
            <u>does not include</u>
          ) : (
            <u>includes</u>
          )}{' '}
          net metering processing. Design &amp; price is not final and may be
          subject to change upon finalization.
        </p>

        {/* <DocumentDataDisplay documentData={documentData} /> */}
      </div>

      {/* Right Column: Form */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h4 className="text-center text-xl font-semibold mb-6">
          Ready to get started?
        </h4>

        {/* Date */}
        <div className="mb-5 relative">
          <label className="block text-sm">
            Preferred Site Visit Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={today}
            className={dateClass}
          />
          {errors.date && (
            <span
              className="absolute left-0 text-red-500 text-xs top-full"
            >
              {errors.date}
            </span>
          )}
        </div>


        {/* Name & Phone */}
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="flex-1 mb-5 relative">
            <label className="block text-sm">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Appleseed"
              className={nameClass}
            />
          {errors.name && (
            <span
              className="absolute left-0 text-red-500 text-xs top-full"
            >
              {errors.name}
            </span>
          )}
          </div>

          <div className="flex-1 mb-5 relative">
            <label className="block text-sm">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09xxxxxxxxx"
              className={phoneClass}
            />
          {errors.phone && (
            <span
              className="absolute left-0 text-red-500 text-xs top-full"
            >
              {errors.phone}
            </span>
          )}
          </div>
        </div>

        {/* Email */}
        <div className="mb-10 relative">
          <label className="block text-sm">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className={emailClass}
          />
          {errors.email && (
            <span
              className="absolute left-0 text-red-500 text-xs top-full"
            >
              {errors.email}
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-2 border border-gray-300 rounded bg-white"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={status !== "idle"}
            className={`flex-3 py-2 rounded text-white ${
              status !== "idle" ? "bg-gray-400" : "bg-blue-500"
            }`}
          >
            {status === "sending"
              ? "Sending..."
              : status === "sent"
              ? "Sent"
              : "Book"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default FinalDesign;
