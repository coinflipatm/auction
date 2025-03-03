import React, { useState, useEffect } from 'react';
import { VerificationDocument, User } from '../../types';
import { Check, X, Eye, AlertCircle } from 'lucide-react';
import api from '../../services/api';

interface VerificationReviewPanelProps {
  onStatusChange?: () => void;
}

// Define a type that includes the user property
type VerificationDocumentWithUser = VerificationDocument & { user?: User };

const VerificationReviewPanel: React.FC<VerificationReviewPanelProps> = ({ onStatusChange }) => {
  const [pendingVerifications, setPendingVerifications] = useState<VerificationDocumentWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Update this type to include the user property
  const [selectedDocument, setSelectedDocument] = useState<VerificationDocumentWithUser | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  
  useEffect(() => {
    fetchPendingVerifications();
  }, []);
  
  const fetchPendingVerifications = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/admin/pending-verifications');
      setPendingVerifications(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load pending verifications');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApprove = async (documentId: string) => {
    try {
      await api.post(`/admin/verifications/${documentId}/approve`, { notes: reviewNote });
      setPendingVerifications(prev => prev.filter(doc => doc.id !== documentId));
      setSelectedDocument(null);
      setReviewNote('');
      if (onStatusChange) onStatusChange();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to approve verification');
    }
  };
  
  const handleReject = async (documentId: string) => {
    if (!reviewNote) {
      setError('Please provide a reason for rejection');
      return;
    }
    
    try {
      await api.post(`/admin/verifications/${documentId}/reject`, { notes: reviewNote });
      setPendingVerifications(prev => prev.filter(doc => doc.id !== documentId));
      setSelectedDocument(null);
      setReviewNote('');
      if (onStatusChange) onStatusChange();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to reject verification');
    }
  };
  
  const formatDocumentType = (type: string) => {
    switch (type) {
      case 'drivers_license': return "Driver's License";
      case 'passport': return "Passport";
      case 'id_card': return "ID Card";
      default: return type.replace('_', ' ');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Pending Identity Verifications</h2>
        <p className="text-gray-600 text-sm mt-1">Review and approve user identity documents</p>
      </div>
      
      {error && (
        <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start">
          <AlertCircle size={20} className="mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending verifications...</p>
        </div>
      ) : pendingVerifications.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-600">No pending verifications to review</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* List of pending verifications */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-4">Pending Documents ({pendingVerifications.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pendingVerifications.map((doc) => (
                <div 
                  key={doc.id} 
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedDocument?.id === doc.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedDocument(doc)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{doc.user?.username || 'Unknown User'}</p>
                      <p className="text-sm text-gray-600">{formatDocumentType(doc.type)}</p>
                      <p className="text-xs text-gray-500">Submitted: {new Date(doc.submittedAt).toLocaleString()}</p>
                    </div>
                    <button 
                      className="text-blue-600 hover:text-blue-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDocument(doc);
                      }}
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Document preview and review controls */}
          <div>
            {selectedDocument ? (
              <div className="space-y-4">
                <h3 className="font-medium">Document Review</h3>
                
                <div className="bg-gray-100 p-2 rounded-md">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">User:</span> {selectedDocument.user?.username || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Document Type:</span> {formatDocumentType(selectedDocument.type)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Submitted:</span> {new Date(selectedDocument.submittedAt).toLocaleString()}
                  </p>
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {selectedDocument.documentUrl.endsWith('.pdf') ? (
                    <div className="p-4 text-center">
                      <p className="mb-2">PDF Document</p>
                      <a 
                        href={selectedDocument.documentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md inline-block"
                      >
                        Open PDF
                      </a>
                    </div>
                  ) : (
                    <img 
                      src={selectedDocument.documentUrl} 
                      alt="Verification document" 
                      className="w-full h-auto max-h-80 object-contain"
                    />
                  )}
                </div>
                
                <div>
                  <label htmlFor="reviewNote" className="block text-sm font-medium text-gray-700 mb-1">
                    Review Notes
                  </label>
                  <textarea
                    id="reviewNote"
                    rows={3}
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Add notes about this verification (required for rejection)"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApprove(selectedDocument.id)}
                    className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
                  >
                    <Check size={18} className="mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(selectedDocument.id)}
                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center"
                  >
                    <X size={18} className="mr-2" />
                    Reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-6 text-center text-gray-500">
                <div>
                  <Eye size={48} className="mx-auto text-gray-300 mb-2" />
                  <p>Select a document to review</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationReviewPanel;