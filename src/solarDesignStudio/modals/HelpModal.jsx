import React, { useState, useEffect } from "react";
import { AiOutlineClose, AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdEmail } from "react-icons/md";
import { BiSupport } from "react-icons/bi";
import { FaCheck } from "react-icons/fa";
import { sendToTelegram } from "../shared/utils/sendToTelegram";
import { getDateAndTime, isValidEmail, isValidPhoneNumber, getErrorText, setBorderStyle } from "../shared/utils/helper";

const HelpModal = ({ onClose, dataToSend }) => {
  const [activeMethod, setActiveMethod] = useState(null);
  const [sendStatus, setSendStatus] = useState("idle");
  const [contactValue, setContactValue] = useState("");
  const [showError, setShowError]         = useState(false);

  useEffect(() => {
    setSendStatus("idle");
    setContactValue("");
    setShowError(false);
  }, [activeMethod]);

  const toggleMethod = (method) =>
    setActiveMethod(prev => (prev === method ? null : method));

  const isValidInput = () => {
    if (activeMethod === "email")   return isValidEmail(contactValue);
    if (activeMethod === "text")    return isValidPhoneNumber(contactValue);
    return false;
  };

  const handleSend = async () => {
       if (!isValidInput()) {
            setShowError(true);
            // clear the error after 2 seconds
            setTimeout(() => setShowError(false), 3000);
            return;
          }
    setSendStatus("sending");

    const payload = {
      action:    "HELP REQUEST",
      method:    activeMethod === "email" ? "EMAIL" : "TEXT&CALL",
      timestamp: getDateAndTime(),
      contact:   contactValue.trim(),
      ...(dataToSend && { data: dataToSend }),
    };

    const success = await sendToTelegram(payload);
    if (success) setSendStatus("sent");
    else {
      setSendStatus("idle");
      alert("Failed to send—please try again.");
    }
  };

  const renderSendButton = () => {
    const bgClass = !contactValue.trim()
      ? "bg-blue-300"
      : sendStatus === "idle"
      ? "bg-blue-500 cursor-pointer"
      : "bg-blue-200";

    return (
      <button
        onClick={handleSend}
        disabled={sendStatus !== "idle" || !contactValue.trim()}
        className={`mt-3 ${bgClass} text-white py-2 px-8 rounded flex items-center justify-center`}
      >
        {sendStatus === "idle" && "Send"}
        {sendStatus === "sending" && "Sending"}
        {sendStatus === "sent" && "Sent"}
        {sendStatus === "sending" && (
          <AiOutlineLoading3Quarters className="animate-spin ml-2 inline-block" />
        )}
        {sendStatus === "sent" && <FaCheck className="ml-2 inline-block" />}
      </button>
    );
  };

  // Show error only when there's some input and it's invalid
  const errorText = getErrorText(activeMethod);

  const inputClassName = setBorderStyle({
    hasError:   showError,
    isDisabled: sendStatus !== "idle"
  });

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white w-11/12 max-w-md rounded-2xl p-6 max-h-[80vh] overflow-y-auto shadow-lg animate-slide-up">
        <div className="mb-6 flex justify-between">
          <h3 className="text-lg font-bold">Need Help Estimating?</h3>
          <button onClick={onClose}>
            <AiOutlineClose className="text-black text-2xl cursor-pointer" />
          </button>
        </div>

        <p className="text-gray-700 mb-6">
          Not sure how much your electricity bill is? Would you like us to assist you via:
        </p>

        <div className="flex space-x-2 justify-center w-full">
          <button
            onClick={() => toggleMethod("email")}
            className={`flex-1 px-4 py-2 rounded font-medium flex items-center justify-center space-x-2 ${
              activeMethod === "email" ? "bg-blue-100" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <MdEmail />
            <span>Email</span>
          </button>

          <button
            onClick={() => toggleMethod("text")}
            className={`flex-1 px-4 py-2 rounded font-medium flex items-center justify-center space-x-2 ${
              activeMethod === "text" ? "bg-blue-100" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <BiSupport />
            <span>Text and Call</span>
          </button>
        </div>

        {activeMethod && (
          <div className="mt-6">
            <input
              type={activeMethod === "email" ? "email" : "tel"}
              placeholder={
                activeMethod === "email"
                  ? "Enter your email address"
                  : "Enter your phone number"
              }
              disabled={sendStatus !== "idle"}
              className={inputClassName}
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
            />

            {showError ? (
              <p className="text-red-500 text-sm mb-3">
                {errorText}
              </p>
            ) : (
              <p className="text-gray-500 text-sm mb-3 mt-2 truncate">
                {activeMethod === "email"
                  ? "Get contacted in less than 1 business day."
                  : "Get contacted in less than 60 seconds."}
              </p>
            )}


            <div className="flex justify-end">{renderSendButton()}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpModal;
