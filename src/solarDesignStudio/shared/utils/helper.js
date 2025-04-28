// Format a JS Date into a Philippine‐style timestamp
export function getDateAndTime(date = new Date()) {
    return date.toLocaleString("en-PH", {
      year:   "numeric",
      month:  "long",
      day:    "numeric",
      hour:   "2-digit",
      minute: "2-digit",
    });
  }
  
export function getErrorText(key) {
    switch (key) {
    case "email":
        return "Please enter a valid email address.";
    case "text":
    case "phone":
        return "Please enter a valid phone number.";
    case "date":
        return "Date is required.";
    case "name":
        return "Name is required.";
    default:
        return "";
    }
}

export function isValidEmail(email = "") {
    const trimmed = email.trim();
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    return emailRegex.test(trimmed);
}
  
export function isValidPhoneNumber(phone = "") {
    const trimmed = phone.trim();
    const phoneRegex = /^(?:0|(?:\+63))9\d{9}$/;
    return phoneRegex.test(trimmed);
}

export function isValidBookDate(dateStr = "") {
    const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoRegex.test(dateStr.trim())) return false;
  
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return false;
  
    const [year, month, day] = dateStr.split("-");
    return (
      date.getUTCFullYear() === Number(year) &&
      date.getUTCMonth() + 1 === Number(month) &&
      date.getUTCDate() === Number(day)
    );
}
  
export function isValidName(name = "") {
    const trimmed = name.trim();
    if (trimmed.length < 2) return false;
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
    return nameRegex.test(trimmed);
}


export function setBorderStyle({ hasError = false, isDisabled = false, extra = "" }) {
    const base   = "w-full rounded p-2 border";
    let stateCls = "border-gray-300";

    if (hasError) {
        stateCls = "border-red-500 border-1";
    } else if (isDisabled) {
        stateCls = "border-gray-200 bg-gray-100";
    }

    return [base, stateCls, extra].filter(Boolean).join(" ");
}