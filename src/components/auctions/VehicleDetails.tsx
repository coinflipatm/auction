import React, { useState } from 'react';
import { Vehicle } from '../../types';
import { Calendar, Truck, Info, AlertTriangle, Check, X } from 'lucide-react';
import { DEFAULT_VEHICLE_IMAGE } from '../../config';
import { toJSDate } from '../../utils/dateUtils';

interface VehicleDetailsProps {
  vehicle: Vehicle;
}

const VehicleDetails: React.FC<VehicleDetailsProps> = ({ vehicle }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'features' | 'damages'>('details');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const images = vehicle.images.length > 0 ? vehicle.images : [DEFAULT_VEHICLE_IMAGE];
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Image Gallery */}
      <div className="relative">
        <div className="aspect-w-16 aspect-h-9 bg-gray-100">
          <img 
            src={images[activeImageIndex]} 
            alt={`${vehicle.make} ${vehicle.model}`} 
            className="w-full h-64 object-cover"
          />
        </div>
        
        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="flex overflow-x-auto p-2 bg-gray-100 space-x-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 ${
                  activeImageIndex === index ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                <img 
                  src={image} 
                  alt={`Thumbnail ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Vehicle Info */}
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-2">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h2>
        
        <div className="flex flex-wrap gap-3 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Truck size={14} className="mr-1" />
            {vehicle.condition}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Info size={14} className="mr-1" />
            VIN: {vehicle.vin.slice(-6)}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Calendar size={14} className="mr-1" />
            Towed: {toJSDate(vehicle.towDate)?.toLocaleDateString()|| 'N/A'}
          </span>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-4 text-sm font-medium ${
                activeTab === 'details'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`py-2 px-4 text-sm font-medium ${
                activeTab === 'features'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Features
            </button>
            <button
              onClick={() => setActiveTab('damages')}
              className={`py-2 px-4 text-sm font-medium ${
                activeTab === 'damages'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Damages
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="text-sm">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <p className="text-gray-700">{vehicle.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-700">Specifications</h4>
                  <ul className="mt-2 space-y-1">
                    <li className="flex justify-between">
                      <span className="text-gray-600">Year:</span>
                      <span>{vehicle.year}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Make:</span>
                      <span>{vehicle.make}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span>{vehicle.model}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Color:</span>
                      <span>{vehicle.color}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Mileage:</span>
                      <span>{vehicle.mileage.toLocaleString()} mi</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">VIN:</span>
                      <span>{vehicle.vin}</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700">Location</h4>
                  <ul className="mt-2 space-y-1">
                    <li className="flex justify-between">
                      <span className="text-gray-600">City:</span>
                      <span>{vehicle.location.city}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">State:</span>
                      <span>{vehicle.location.state}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Zip:</span>
                      <span>{vehicle.location.zip}</span>
                    </li>
                    {vehicle.lotNumber && (
                      <li className="flex justify-between">
                        <span className="text-gray-600">Lot Number:</span>
                        <span>{vehicle.lotNumber}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'features' && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Vehicle Features</h4>
              {vehicle.features.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {vehicle.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check size={16} className="mr-2 text-green-500 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No features listed for this vehicle</p>
              )}
            </div>
          )}
          
          {activeTab === 'damages' && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Known Damages</h4>
              {vehicle.damages.length > 0 ? (
                <ul className="space-y-2">
                  {vehicle.damages.map((damage, index) => (
                    <li key={index} className="flex items-start">
                      <AlertTriangle size={16} className="mr-2 text-amber-500 mt-0.5" />
                      <span>{damage}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center text-green-600">
                  <Check size={18} className="mr-2" />
                  <span>No known damages reported</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;