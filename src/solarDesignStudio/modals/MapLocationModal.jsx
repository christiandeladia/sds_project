// MapModal.jsx
import React from 'react';
import GoogleMapReact from 'google-map-react';
import { RiMapPinFill } from 'react-icons/ri';
import { AiOutlineClose } from 'react-icons/ai';

const MapLocationModal = ({
  isOpen,
  onClose,
  center,
  zoom,
  defaultProps,
  showDefaultMap,
  onCenterChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center lg:justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* panel */}
      <div className="relative bg-white w-full rounded-t-2xl max-h-[80vh] overflow-y-auto shadow-lg lg:rounded-2xl lg:max-w-[800px] animate-slide-up">
        <div className="flex justify-between items-center p-4">
          <div>
            <h3 className="text-xl font-bold">Move the pin to your roof</h3>
            <h3 className="text-md text-gray-500 font-medium">So our team can design for the right roof</h3>
          </div>
          <button onClick={onClose}>
            <AiOutlineClose className="text-black text-2xl cursor-pointer" />
          </button>
        </div>
        <div className="w-full h-[300px] lg:h-[500px] p-1">
          <GoogleMapReact
            bootstrapURLKeys={{
              key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
              libraries: ['places']
            }}
            center={center || defaultProps.center}
            zoom={center ? 19 : defaultProps.zoom}
            options={{
              draggable: true,
              mapTypeId: 'satellite'
            }}
            yesIWantToUseGoogleMapApiInternals
            onChange={({ center }) => onCenterChange(center)}
          >

          </GoogleMapReact>
          {!showDefaultMap && (
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <RiMapPinFill className="w-8 h-8 text-red-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapLocationModal;
