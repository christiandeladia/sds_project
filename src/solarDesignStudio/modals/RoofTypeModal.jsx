import React from 'react';
import { AiOutlineClose } from 'react-icons/ai';

const RoofTypeModal = ({ isOpen, onClose, onSelectRoofType, selectedRoofType }) => {
  if (!isOpen) return null;

  const roofTypes = ['Metal', 'Shingles', 'Tiles', 'Flatroof'];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50 md:items-center md:justify-center">
      <div className="bg-white w-full rounded-t-2xl p-6 h-50 max-h-[80vh] overflow-y-auto shadow-lg transition-transform transform translate-y-0 md:rounded-2xl md:max-w-lg animate-slide-up">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-bold">Select Roof Type</h3>
          <button onClick={onClose}>
            <AiOutlineClose className="text-black text-2xl cursor-pointer" />
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mt-4 justify-center w-full">
          {roofTypes.map((type) => (
            <button
              key={type}
              className={`border flex-1 border-gray-400 px-4 py-2 rounded-md transition-all text-sm font-medium cursor-pointer
                  ${selectedRoofType === type ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-blue-100'}`}
              onClick={() => {
                onSelectRoofType(type);
                onClose();
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoofTypeModal;
