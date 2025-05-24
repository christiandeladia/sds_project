import React, { useRef, useEffect, useState } from "react";
import netMeteringImg from "../assets/img/solar/netMeteringImg.webp";

export default function NetMeteringAnimation() {
  const pathRef = useRef(null);
  const [pathLength, setPathLength] = useState(0);
  const tipLength = 20; // length of the moving tip segment
  const dashPattern = "6 6"; // dash length and gap for the tail
  const duration = 5; // seconds for a full loop

  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
    }
  }, []);

  return (
    <div className="relative">
      {/* Background image */}
      <div className="relative text-center">
        <img
          src={netMeteringImg}
          alt="Net Metering Diagram"
          className="w-full block"
        />
      </div>


      {/* SVG overlay */}
<svg
  viewBox="0 0 100 100"
  className="absolute inset-0 w-full h-full pointer-events-none z-10"
>
  {/* orange tip */}
  <path
    d="M25 70 Q60 50, 80 55"
    stroke="#FB923C"
    strokeWidth="0.7"
    fill="none"
    strokeLinecap="round"
  />

  {/* grey tail */}
  <path
    d="M25 70 Q60 50, 80 55"
    className="dashed"
    stroke="lightgrey"
    strokeWidth="0.7"
    fill="none"
    strokeLinecap="round"
  />
</svg>









    </div>
  );
}
