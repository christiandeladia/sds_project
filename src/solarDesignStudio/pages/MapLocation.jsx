import React, { useEffect, useState, useRef } from 'react';
import GoogleMapReact from 'google-map-react';
import { collection, getDocs, onSnapshot  } from 'firebase/firestore';
import { db } from '../../Config';
import { RiMapPinFill } from "react-icons/ri";
import { FaArrowRight } from "react-icons/fa6";
import { AiOutlineClose } from "react-icons/ai";
import { Container, SectionHeader, SectionMedia, SectionContent } from "../shared/Layout";
import MapLocationModal from '../modals/MapLocationModal';

const Marker = ({ markerType }) => {
  const markerClass =
    markerType === 'battery'
      ? 'bg-green-600 text-green-600'
      : markerType === 'solar'
      ? 'bg-blue-600 text-blue-600'
      : 'bg-gray-500 text-gray-500';
  return (
    <div
      className={`w-4 h-4 rounded-full ${markerClass} shadow-[0_0_20px_5px_currentColor]`}
      style={{ border: '2px solid white' }}
    ></div>
  );
};

const MapLocation = ({ updateData, selectedAddress }) => {
  const inputRef = useRef(null);
  const [pins, setPins] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showDefaultMap, setShowDefaultMap] = useState(true);
  const [showMapModal, setShowMapModal] = useState(false);
  const debounceTimer = useRef(null);
  const wasFromInput = useRef(false);
  const [pinsLoading, setPinsLoading] = useState(true);
  // When an address is provided externally, update the input and map accordingly.
  useEffect(() => {
    if (selectedAddress && window.google?.maps?.Geocoder) {
      if (inputRef.current) {
        inputRef.current.value = selectedAddress;
      }
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: selectedAddress }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const loc = results[0].geometry.location;
          const lat = loc.lat();
          const lng = loc.lng();
          setSelectedLocation({ lat, lng });
          updateData("coordinates", { lat, lng });
          setShowDefaultMap(false);
        } else {
          console.warn("Geocode failed for saved address:", status);
        }
      });
    }
  }, [selectedAddress]);

  useEffect(() => {
    return () => clearTimeout(debounceTimer.current);
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'pin_location'), (querySnapshot) => {
      const locations = [];
      querySnapshot.forEach((doc) => {
        locations.push({ id: doc.id, ...doc.data() });
      });
      setPins(locations);
      setPinsLoading(false);
    }, (error) => {
      console.error("Error fetching locations: ", error);
    });
  
    // Clean up listener on unmount
    return () => unsubscribe();
  }, []);
  

  useEffect(() => {
    const initializeAutocomplete = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.warn('Google Maps JavaScript API or Places library is not available yet.');
        return;
      }
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode'],
        componentRestrictions: { country: 'ph' },
      });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place && place.formatted_address && place.geometry) {
          console.log("Selected Address:", place.formatted_address);
          wasFromInput.current = true;
          updateData("address", place.formatted_address);
          if (inputRef.current) {
            inputRef.current.value = place.formatted_address;
          }
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          setSelectedLocation({ lat, lng });
          updateData("coordinates", { lat, lng });
          setShowDefaultMap(false);

          clearTimeout(debounceTimer.current);
          // …then open modal after 500ms
          debounceTimer.current = setTimeout(() => {
            setShowMapModal(true);
          }, 500);
        }
      });
    };
    if (typeof window !== "undefined") {
      if (window.google?.maps?.places) {
        initializeAutocomplete();
      } else {
        const intervalId = setInterval(() => {
          if (window.google?.maps?.places) {
            initializeAutocomplete();
            clearInterval(intervalId);
          }
        }, 100);
      }
    }
  }, [updateData]);

  const defaultProps = {
    center: { lat: 14.6760, lng: 121.0437 },
    zoom: 10,
  };

  const reverseGeocodeLatLng = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };
    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const address = results[0].formatted_address;
        console.log("Reverse Geocoded Address:", address);
        // if (inputRef.current) {
        //   inputRef.current.value = address;
        // }
        // updateData("address", address);
      } else {
        console.warn("Geocoder failed: " + status);
      }
    });
  };

  const handleChange = (e) => {
    const value = e.target.value;
    // updateData("address", value);
    // console.log("Typed Address:", value);
    wasFromInput.current = true;
    if (value.trim() === '') {
      setSelectedLocation(null);
      setShowDefaultMap(true);
    }
  };

  return (
    <Container>
      <SectionHeader>
      <h2 className="text-[1.25rem] text-gray-400 tracking-tight font-medium mb-3 mt-15 md:mt-0 text-left">
        Solar Design Studio
      </h2>
      <h2 className="text-4xl font-medium mb-8 md:mt-0">Tell us more about your project.</h2>
      </SectionHeader>

<SectionMedia>
{/* Main Map Display – Fixed and Non-Draggable */}
<div
        className="relative rounded-2xl border border-gray-300 shadow-lg bg-white overflow-hidden h-70 lg:h-100 w-full"
      >
        {/* Inner wrapper with margin creates visible gap from the border */}
        <div
          style={{
            margin: '', // adjust as needed for desired spacing
            height: '100%', // subtract top+bottom margin
            width: '100%', // subtract left+right margin
            borderRadius: '11px',
            overflow: 'hidden'
          }}
        >
          {pinsLoading && (
          <GoogleMapReact
            bootstrapURLKeys={{
              key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
              libraries: ['places']
            }}
            center={selectedLocation || defaultProps.center}
            zoom={selectedLocation ? 19 : defaultProps.zoom}
            options={{
              draggable: false,
              disableDefaultUI: true,
              mapTypeId: 'roadmap',
              ...(showDefaultMap && {
                styles: [
                  {
                    stylers: [
                      { saturation: -100 },
                      { gamma: 0.4 }
                    ]
                  }
                ]
              })
            }}
            yesIWantToUseGoogleMapApiInternals
          >
            {showDefaultMap &&
              pins.map((pin) => (
                <Marker
                  key={pin.id}
                  lat={pin.latitude}
                  lng={pin.longitude}
                  markerType={pin.type}
                />
              ))
            }
          </GoogleMapReact>
          )}
        </div>

        {/* Fixed overlay marker when map is not in default mode */}
        {!showDefaultMap && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full z-10">
            <RiMapPinFill className="w-8 h-8 text-red-500" />
          </div>
        )}
      </div>

      {/* Additional Info for Default Map */}
      {/* {showDefaultMap && (
        <div className="pl-5">
          <p className="text-[0.85rem] text-blue-600 tracking-tight mt-2 relative pl-5">
            <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
            Neighbours On Solar
          </p>
          <p className="text-[0.85rem] text-green-600 tracking-tight mb-3 relative pl-5">
            <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2.5 h-2.5 bg-green-600 rounded-full"></span>
            Neighbours With Batteries
          </p>
        </div>
      )} */}

      {/* Button to Open Draggable Modal Map */}
      {!showDefaultMap && (
        <div className="w-full flex justify-end mt-2">
          <button
            onClick={() => setShowMapModal(true)}
            className="inline-flex items-center text-[0.85rem] text-blue-800 tracking-tight cursor-pointer"
          >
            Navigate the Map
            <FaArrowRight className="ml-1 inline-block" />
          </button>
        </div>

      )}
</SectionMedia>
      
<SectionContent>
<p className="mt-4 text-2xl font-medium mb-5 md:mt-0">Address of your project</p>
      <input
        ref={inputRef}
        type="text"
        placeholder="22 Ilagan St, Quezon City"
        className="p-2 border rounded w-full"
        onChange={handleChange}
      />
      <p className="text-[0.75rem] text-gray-400 tracking-tight mt-2">
        We only use your address so that we can check your roof layout &amp; panel placements.
      </p>
</SectionContent>
     

     <MapLocationModal
       isOpen={showMapModal}
       onClose={() => {
         if (selectedLocation) {
           reverseGeocodeLatLng(selectedLocation.lat, selectedLocation.lng);
         }
         setShowMapModal(false);
       }}
       center={selectedLocation}
       zoom={defaultProps.zoom}
       defaultProps={defaultProps}
       showDefaultMap={showDefaultMap}
       onCenterChange={(newCenter) => {
        setSelectedLocation(newCenter);
       updateData("coordinates", {
         lat: newCenter.lat,
         lng: newCenter.lng
       });
      }}
     />

    </Container>
  );
};

export default MapLocation;
