import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Layout from '../components/layout/Layout';
import ProfileForm from '../components/auth/ProfileForm';
import PasswordChangeForm from '../components/auth/PasswordChangeForm';
import IdentityVerificationForm from '../components/auth/IdentityVerificationForm';
import { User, Settings, Key, Shield, FileText } from 'lucide-react';
import { getVerificationStatus } from '../services/authService';

const ProfilePage: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'verification' | 'preferences'>('profile');
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'approved' | 'rejected' | 'none'>('none');
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  
  // Fetch verification status
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      if (!user) return;
      
      setIsLoadingStatus(true);
      try {
        const response = await getVerificationStatus(user.id);
        setVerificationStatus(response.status || 'none');
      } catch (error) {
        console.error('Failed to fetch verification status:', error);
      } finally {
        setIsLoadingStatus(false);
      }
    };
    
    if (isAuthenticated && user) {
      fetchVerificationStatus();
    }
  }, [isAuthenticated, user]);
  
  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Sidebar */}
              <div className="bg-white rounded-lg shadow-md p-4 h-fit">
                <nav>
                  <ul className="space-y-1">
                    <li>
                      <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center px-4 py-2 text-sm rounded-md ${
                          activeTab === 'profile' 
                            ? 'bg-blue-50 text-blue-700 font-medium' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <User size={18} className="mr-3" />
                        Profile Information
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center px-4 py-2 text-sm rounded-md ${
                          activeTab === 'security' 
                            ? 'bg-blue-50 text-blue-700 font-medium' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Key size={18} className="mr-3" />
                        Security
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab('verification')}
                        className={`w-full flex items-center px-4 py-2 text-sm rounded-md ${
                          activeTab === 'verification' 
                            ? 'bg-blue-50 text-blue-700 font-medium' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Shield size={18} className="mr-3" />
                        Identity Verification
                        {verificationStatus === 'pending' && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                        {verificationStatus === 'approved' && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Verified
                          </span>
                        )}
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab('preferences')}
                        className={`w-full flex items-center px-4 py-2 text-sm rounded-md ${
                          activeTab === 'preferences' 
                            ? 'bg-blue-50 text-blue-700 font-medium' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Settings size={18} className="mr-3" />
                        Preferences
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
              
              {/* Main Content */}
              <div className="md:col-span-3">
                {activeTab === 'profile' && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                    <ProfileForm />
                  </div>
                )}
                
                {activeTab === 'security' && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
                    <PasswordChangeForm />
                  </div>
                )}
                
                {activeTab === 'verification' && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Identity Verification</h2>
                    
                    {isLoadingStatus ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading verification status...</p>
                      </div>
                    ) : verificationStatus === 'approved' ? (
                      <div className="p-4 border border-green-200 bg-green-50 rounded-md">
                        <div className="flex items-start">
                          <Shield size={20} className="text-green-600 mr-3 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-green-800">Verification Approved</h3>
                            <p className="text-sm text-green-700 mt-1">
                              Your identity has been verified. You can now participate in auctions and make purchases.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : verificationStatus === 'pending' ? (
                      <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-md">
                        <div className="flex items-start">
                          <Shield size={20} className="text-yellow-600 mr-3 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-yellow-800">Verification Pending</h3>
                            <p className="text-sm text-yellow-700 mt-1">
                              Your verification is currently being reviewed. This process typically takes 1-2 business days.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : verificationStatus === 'rejected' ? (
                      <div className="p-4 border border-red-200 bg-red-50 rounded-md mb-6">
                        <div className="flex items-start">
                          <Shield size={20} className="text-red-600 mr-3 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-red-800">Verification Rejected</h3>
                            <p className="text-sm text-red-700 mt-1">
                              Your verification was rejected. Please submit a new document that meets our requirements.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-md mb-6">
                        <div className="flex items-start">
                          <Shield size={20} className="text-yellow-600 mr-3 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-yellow-800">Verification Required</h3>
                            <p className="text-sm text-yellow-700 mt-1">
                              To place bids on auctions, you need to verify your identity. Please upload a valid government-issued ID.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {(verificationStatus === 'none' || verificationStatus === 'rejected') && (
                      <div className="mt-6">
                        <IdentityVerificationForm />
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'preferences' && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div>
                          <h3 className="font-medium">Email Notifications</h3>
                          <p className="text-sm text-gray-600">Receive updates about your auctions and bids</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div>
                          <h3 className="font-medium">Bid Outbid Alerts</h3>
                          <p className="text-sm text-gray-600">Get notified when someone outbids you</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div>
                          <h3 className="font-medium">Auction Ending Reminders</h3>
                          <p className="text-sm text-gray-600">Receive reminders when watched auctions are ending soon</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div>
                          <h3 className="font-medium">Marketing Communications</h3>
                          <p className="text-sm text-gray-600">Receive updates about new features and promotions</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Save Preferences
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;