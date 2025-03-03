import React, { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { submitIdentityVerification } from '../../services/authService';
import { FileText, Upload, AlertCircle, CheckCircle, Camera } from 'lucide-react';

interface IdentityVerificationFormProps {
  onSuccess?: () => void;
}

const IdentityVerificationForm: React.FC<IdentityVerificationFormProps> = ({ onSuccess }) => {
  const { user } = useAuthStore();
  const [documentType, setDocumentType] = useState<string>('drivers_license');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocumentFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setIsUsingCamera(true);
      
      if (webcamRef.current) {
        webcamRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions or use file upload instead.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsUsingCamera(false);
  };

  const capturePhoto = () => {
    if (webcamRef.current && canvasRef.current) {
      const video = webcamRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "document-capture.jpg", { type: "image/jpeg" });
            setDocumentFile(file);
            setPreviewUrl(canvas.toDataURL('image/jpeg'));
            stopCamera();
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !documentFile) {
      setError('Please select a document to upload');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await submitIdentityVerification(user.id, documentType, documentFile);
      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to upload verification document');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Identity Verification</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex items-start">
          <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {success ? (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700 flex items-start">
          <CheckCircle size={20} className="mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Verification Submitted</p>
            <p className="text-sm mt-1">Your identity verification has been submitted successfully. We'll review your documents and update your account status.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
              Document Type
            </label>
            <select
              id="documentType"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="drivers_license">Driver's License</option>
              <option value="passport">Passport</option>
              <option value="id_card">Government ID Card</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Document
            </label>
            
            <div className="flex space-x-2 mb-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-200 flex items-center justify-center"
              >
                <Upload size={18} className="mr-2" />
                Upload File
              </button>
              
              <button
                type="button"
                onClick={isUsingCamera ? stopCamera : startCamera}
                className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-200 flex items-center justify-center"
              >
                <Camera size={18} className="mr-2" />
                {isUsingCamera ? 'Stop Camera' : 'Use Camera'}
              </button>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,application/pdf"
              className="hidden"
            />
            
            {isUsingCamera ? (
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video 
                    ref={webcamRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-auto"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Take Photo
                </button>
              </div>
            ) : previewUrl ? (
              <div className="mt-2">
                <div className="relative">
                  <img 
                    src={previewUrl} 
                    alt="Document preview" 
                    className="max-h-64 rounded-md mx-auto border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setDocumentFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {documentFile?.name} ({Math.round((documentFile?.size || 0) / 1024)} KB)
                </p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileText size={36} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-4">
                  Drag and drop your document here, or click the upload button above
                </p>
                <p className="text-xs text-gray-500">
                  Accepted formats: JPEG, PNG, PDF (max 10MB)
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700">
            <p className="font-medium mb-1">Important:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Make sure your document is valid and not expired</li>
              <li>All information must be clearly visible</li>
              <li>Your document will be securely stored and handled according to our privacy policy</li>
            </ul>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading || !documentFile}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                (isLoading || !documentFile) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Uploading...' : 'Submit Verification'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default IdentityVerificationForm;