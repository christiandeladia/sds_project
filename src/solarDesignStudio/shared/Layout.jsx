// components/Layout.jsx
import React from "react";


// full‐width centered grid container
export function Container({ children, className = "", noTopMargin = false, }) {
  return (
    <div
      className={`
        ${noTopMargin ? "" : "md:mt-30"}
        w-full max-w-10/12 lg:w-9/12 mx-auto
        grid grid-cols-1 md:gap-8
        md:grid-cols-[2fr_1fr] md:grid-rows-min
        lg:grid-cols-[2fr_1fr] lg:grid-rows-min
        ${className}
      `}
    >
      {children}
    </div>
  );
}


// places its children in the “SectionHeader ” cell
export function SectionHeader ({ children, className = "" }) {
  return (
    <div className={`md:col-start-2 md:row-start-1 ${className}`}>
      {children}
    </div>
  );
}

// places its children in the big image cell
export function SectionMedia ({ children, className = "" }) {
  return (
    <div
      className={`
        md:col-start-1 md:row-start-1 md:row-span-2
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// places its children in the “question+buttons” cell
export function SectionContent ({ children, className = "" }) {
  return (
    <div className={`md:col-start-2 md:row-start-2 md:self-end ${className}`}>
      {children}
    </div>
  );
}
