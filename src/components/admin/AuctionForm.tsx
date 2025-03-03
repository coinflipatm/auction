import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Auction, Vehicle } from '../../types';
import { AlertCircle, X, Upload } from 'lucide-react';
import { createAuction, updateAuction, uploadVehicleImages } from '../../services/auctionService';
import { Timestamp } from 'firebase/firestore';

// Type for form data
type AuctionFormData = {
  title: string;
  description: string;
  vehicleId: string;
  startingPrice: number;
  reservePrice?: number;
  incrementAmount: number;
  startTime: string;
  endTime: string;
  status: 'draft' | 'scheduled' | 'active';
};

// Date formatting helper
const formatDateForInput = (date: string | Timestamp | undefined): string => {
  if (!date) return '';
  
  try {
    if (typeof date === 'string') {
      return new Date(date).toISOString().slice(0, 16);
    } else if (date instanceof Timestamp) {
      return date.toDate().toISOString().slice(0, 16);
    } 
  } catch (e) {
    console.error("Date formatting error:", e);
  }
  return '';
};

// Props interface
interface AuctionFormProps {
  auction?: Auction;
  vehicles?: Vehicle[];
  onSuccess?: (auction: Auction) => void;
  onCancel?: () => void;
}

// Component implementation
  const AuctionForm: React.FC<AuctionFormProps> = ({ 
    auction, 
    vehicles = [], 
    onSuccess, 
    onCancel 
  }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<AuctionFormData>({
    defaultValues: auction ? {
      title: auction.title,
      description: auction.description,
      vehicleId: auction.vehicleId,
      startingPrice: auction.startingPrice,
      reservePrice: auction.reservePrice,
      incrementAmount: auction.incrementAmount,
      startTime: formatDateForInput(auction.startTime),
      endTime: formatDateForInput(auction.endTime),
      status: auction.status as 'draft' | 'scheduled' | 'active',
    } : {
      title: '',
      description: '',
      vehicleId: '',
      startingPrice: 0,
      incrementAmount: 100,
      startTime: new Date().toISOString().slice(0, 16),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      status: 'draft',
    }
  });
  
  const watchVehicleId = watch('vehicleId');
  
  // Update selected vehicle when vehicleId changes
  useEffect(() => {
    if (watchVehicleId) {
      const vehicle = vehicles.find(v => v.id === watchVehicleId);
      setSelectedVehicle(vehicle || null);
      
      // Auto-populate title if it's empty
      if (vehicle && !watch('title')) {
        setValue('title', `${vehicle.year} ${vehicle.make} ${vehicle.model}`);
      }
    } else {
      setSelectedVehicle(null);
    }
  }, [watchVehicleId, vehicles, setValue, watch]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setImages(prev => [...prev, ...fileArray]);
      
      // Create preview URLs
      const newPreviewUrls = fileArray.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };
  
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };
 
  const onSubmit = async (data: AuctionFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let savedAuction: Auction;
      
      if (auction) {
        // Update existing auction
        savedAuction = await updateAuction(auction.id, {
          ...data,
          viewCount: auction.viewCount || 0,
          bids: auction.bids || [],
          createdBy: auction.createdBy,
          currentPrice: auction.currentPrice || data.startingPrice
        });
      } else {
        // Create new auction with required fields
        savedAuction = await createAuction({
          ...data,
          viewCount: 0,
          bids: [],
          createdBy: '', // This will be set by the backend
          currentPrice: data.startingPrice
        }, images);
      }
      
      // Upload images if any and we didn't pass them to createAuction
      if (images.length > 0 && selectedVehicle && auction) {
        await uploadVehicleImages(selectedVehicle.id, images);
      }
      
      if (onSuccess) {
        onSuccess(savedAuction);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save auction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">
        {auction ? 'Edit Auction' : 'Create New Auction'}
      </h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start">
          <AlertCircle size={20} className="mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Vehicle Selection */}
        <div>
          <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700 mb-1">
            Select Vehicle *
          </label>
          <select
            id="vehicleId"
            {...register('vehicleId', { required: 'Vehicle is required' })}
            className={`block w-full px-3 py-2 border ${
              errors.vehicleId ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
          >
            <option value="">-- Select a vehicle --</option>
            {vehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.vin}
              </option>
            ))}
          </select>
          {errors.vehicleId && (
            <p className="mt-1 text-sm text-red-600">{errors.vehicleId.message}</p>
          )}
        </div>
        
        {/* Vehicle Preview */}
        {selectedVehicle && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium mb-2">Selected Vehicle:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Make/Model:</span> {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">VIN:</span> {selectedVehicle.vin}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Color:</span> {selectedVehicle.color}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Mileage:</span> {selectedVehicle.mileage.toLocaleString()} miles
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Condition:</span> {selectedVehicle.condition}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Location:</span> {selectedVehicle.location.city}, {selectedVehicle.location.state}
                </p>
                <p className="text-sm text-gray-600">
                <span className="font-medium">Tow Date:</span> {
                  selectedVehicle.towDate instanceof Timestamp 
                    ? selectedVehicle.towDate.toDate().toLocaleDateString()
                    : new Date(selectedVehicle.towDate).toLocaleDateString()
                }                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Basic Auction Details */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Auction Title *
          </label>
          <input
            id="title"
            type="text"
            {...register('title', { required: 'Title is required' })}
            className={`block w-full px-3 py-2 border ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            rows={4}
            {...register('description', { required: 'Description is required' })}
            className={`block w-full px-3 py-2 border ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
        
        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="startingPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Starting Price ($) *
            </label>
            <input
              id="startingPrice"
              type="number"
              min="0"
              step="1"
              {...register('startingPrice', { 
                required: 'Starting price is required',
                min: { value: 0, message: 'Price must be positive' }
              })}
              className={`block w-full px-3 py-2 border ${
                errors.startingPrice ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.startingPrice && (
              <p className="mt-1 text-sm text-red-600">{errors.startingPrice.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="reservePrice" className="block text-sm font-medium text-gray-700 mb-1">
              Reserve Price ($) <span className="text-gray-500">(Optional)</span>
            </label>
            <input
              id="reservePrice"
              type="number"
              min="0"
              step="1"
              {...register('reservePrice', { 
                min: { value: 0, message: 'Price must be positive' }
              })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.reservePrice && (
              <p className="mt-1 text-sm text-red-600">{errors.reservePrice.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="incrementAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Bid Increment ($) *
            </label>
            <input
              id="incrementAmount"
              type="number"
              min="1"
              step="1"
              {...register('incrementAmount', { 
                required: 'Bid increment is required',
                min: { value: 1, message: 'Increment must be at least $1' }
              })}
              className={`block w-full px-3 py-2 border ${
                errors.incrementAmount ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.incrementAmount && (
              <p className="mt-1 text-sm text-red-600">{errors.incrementAmount.message}</p>
            )}
          </div>
        </div>
        
        {/* Timing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
              Start Time *
            </label>
            <input
              id="startTime"
              type="datetime-local"
              {...register('startTime', { required: 'Start time is required' })}
              className={`block w-full px-3 py-2 border ${
                errors.startTime ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
              End Time *
            </label>
            <input
              id="endTime"
              type="datetime-local"
              {...register('endTime', { 
                required: 'End time is required',
                validate: value => {
                  const startTime = new Date(watch('startTime'));
                  const endTime = new Date(value);
                  return endTime > startTime || 'End time must be after start time';
                }
              })}
              className={`block w-full px-3 py-2 border ${
                errors.endTime ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
            )}
          </div>
        </div>
        
        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Auction Status *
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="draft"
                {...register('status', { required: 'Status is required' })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Draft</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="scheduled"
                {...register('status', { required: 'Status is required' })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Scheduled</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="active"
                {...register('status', { required: 'Status is required' })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>
        
        {/* Image Upload */}
        {selectedVehicle && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Images
            </label>
            
            {/* Existing Images */}
            {selectedVehicle.images.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Images:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {selectedVehicle.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={image} 
                        alt={`Vehicle ${index + 1}`} 
                        className="h-24 w-full object-cover rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* New Images */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Add New Images:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={url} 
                      alt={`Upload preview ${index + 1}`} 
                      className="h-24 w-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                <label className="h-24 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                  <Upload size={24} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Add Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Saving...' : auction ? 'Update Auction' : 'Create Auction'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default AuctionForm;