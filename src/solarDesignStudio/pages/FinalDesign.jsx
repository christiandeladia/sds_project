import React, { useState } from "react";
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

const FinalDesign = ({ formData, onBack }) => {
  const [date, setDate]       = useState("");
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [email, setEmail]     = useState("");
  const [errors, setErrors]   = useState({});
  const [status, setStatus]   = useState("idle");

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
      data:      { ...formData },
      contact: {
        SiteVisitDate: date,
        name:           name.trim(),
        phone:          phone.trim(),
        email:          email.trim(),
      },
    };

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

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-7 md:mt-20 grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-10/12 lg:max-w-9/12 mx-auto"
    >
      {/* Left Column */}
      <div className="p-6 bg-white">
        <h4 className="text-center mb-6 text-xl font-semibold">Your Design</h4>
        <p className="text-center mb-0">{formData.kW} kW Solar Panels</p>
        <p className="text-center mb-0">{formData.inverter} Inverter</p>
        {formData.battery && <p className="text-center mb-0">Battery</p>}
        <div className="h-px my-6 bg-gray-300" />
        <p className="text-center mb-0">Total Cost: P{formData.totalCost}</p>
        <p className="text-center font-bold mt-2">
          Est. 25 Year Savings: P{formData.savings}
        </p>
        <p className="text-center text-sm text-gray-600 my-6">
          {formData.costIncludes}
        </p>
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
