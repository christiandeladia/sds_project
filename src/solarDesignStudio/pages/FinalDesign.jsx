import React, { useState } from "react";
import { sendToTelegram } from '../shared/utils/sendToTelegram';

const FinalDesign = ({ formData, onBack }) => {
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle");

  const validate = () => {
    const errs = {};
    if (!date) errs.date = "Date is required";
    if (!name.trim()) errs.name = "Name is required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Valid email is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status !== "idle") return;
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("sending");

    // Build the payload
    const now = new Date();
    const timestamp = now.toLocaleString("en-PH", {
        year:   "numeric",
        month:  "long",
        day:    "numeric",
        hour:   "2-digit",
        minute: "2-digit",
    });

    const payload = {
      action: "BOOK SITE VISIT",
      timestamp,
      data: {
        ...formData,
      },
      contact: {
        SiteVisitDate: date,
        name,
        phone,
        email,
      },
    };

    const success = await sendToTelegram(payload);
    setStatus(success ? "sent" : "idle");
  };

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
        <p className="text-center font-bold mt-2">Est. 25 Year Savings: P{formData.savings}</p>
        <p className="text-center text-sm text-gray-600 my-6">{formData.costIncludes}</p>
      </div>

      {/* Right Column: Form only */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h4 className="text-center text-xl font-semibold mb-6">Ready to get started?</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm">
              Preferred Site Visit Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>

          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="flex-1">
              <label className="block text-sm">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Appleseed"
                className="w-full p-2 border rounded"
                required
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="flex-1 mt-4 md:mt-0">
              <label className="block text-sm">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0000-000-0000"
                className="w-full p-2 border rounded"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="johnappleseed@mail.com"
              className="w-full p-2 border rounded"
              required
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
        </div>

        <div className="flex space-x-4 mt-10">
          <button
            type="button"
            onClick={onBack}
            className="flex-[1] py-2 border border-gray-300 rounded bg-white"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={status !== 'idle'}
            className={`flex-[3] py-2 rounded text-white ${
                status !== 'idle' ? 'bg-gray-400' : 'bg-blue-500'
            }`}
            >
            {status === 'sending'
                ? 'Sending...'
                : status === 'sent'
                ? 'Sent'
                : 'Book'}
            </button>

        </div>
      </div>
    </form>
  );
};

export default FinalDesign;
