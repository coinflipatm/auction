import React, { useState, useEffect } from 'react';
import { Auction, Payment } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { CreditCard, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import api from '../../services/api';

interface CheckoutFormProps {
  auction: Auction;
  onSuccess?: (payment: Payment) => void;
  onCancel?: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ auction, onSuccess, onCancel }) => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'bank_transfer'>('credit_card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
    expiryDate: '',
    cvv: '',
  });
  const [isVerified, setIsVerified] = useState(false);
  
  // Check if user is verified
  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!user) return;
      
      try {
        const response = await api.get(`/users/${user.id}/verification-status`);
        setIsVerified(response.data.status === 'approved');
      } catch (error) {
        console.error('Failed to check verification status:', error);
      }
    };
    
    checkVerificationStatus();
  }, [user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      // Format card number with spaces every 4 digits
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setCardDetails({ ...cardDetails, [name]: formatted });
    } else if (name === 'expiryDate') {
      // Format expiry date as MM/YY
      const formatted = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/, '$1/$2')
        .substring(0, 5);
      setCardDetails({ ...cardDetails, [name]: formatted });
    } else if (name === 'cvv') {
      // Only allow 3-4 digits for CVV
      const formatted = value.replace(/\D/g, '').substring(0, 4);
      setCardDetails({ ...cardDetails, [name]: formatted });
    } else {
      setCardDetails({ ...cardDetails, [name]: value });
    }
  };
  
  const validateForm = () => {
    if (paymentMethod === 'credit_card') {
      if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, '').length < 16) {
        setError('Please enter a valid card number');
        return false;
      }
      
      if (!cardDetails.cardHolder) {
        setError('Please enter the cardholder name');
        return false;
      }
      
      if (!cardDetails.expiryDate || !cardDetails.expiryDate.includes('/')) {
        setError('Please enter a valid expiry date (MM/YY)');
        return false;
      }
      
      if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
        setError('Please enter a valid CVV code');
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to complete this purchase');
      return;
    }
    
    if (!isVerified) {
      setError('You must verify your identity before making a purchase');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would integrate with Stripe or another payment processor
      // For now, we'll simulate a successful payment
      const response = await api.post('/payments', {
        auctionId: auction.id,
        amount: auction.currentPrice,
        paymentMethod,
        // In a real implementation, we would not send card details directly to our API
        // Instead, we would use Stripe Elements or a similar secure method
      });
      
      const payment = response.data.data;
      setSuccess(true);
      
      if (onSuccess) {
        onSuccess(payment);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Payment processing failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your payment of ${auction.currentPrice.toLocaleString()} has been processed successfully.
          </p>
          <div className="bg-gray-50 p-4 rounded-md text-left mb-6">
            <h3 className="font-medium mb-2">Transaction Details</h3>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Auction:</span> {auction.title}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Amount:</span> ${auction.currentPrice.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Date:</span> {new Date().toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Payment Method:</span> {paymentMethod === 'credit_card' ? 'Credit Card' : 'Bank Transfer'}
            </p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            A receipt has been sent to your email address. You can also view this transaction in your account dashboard.
          </p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center">
            <a 
              href="/dashboard" 
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </a>
            <a 
              href={`/auctions/${auction.id}`}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              View Auction
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Complete Your Purchase</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex items-start">
          <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {!isVerified && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm flex items-start">
          <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Identity Verification Required</p>
            <p className="mt-1">You need to verify your identity before making a purchase. Please go to your profile settings to complete verification.</p>
            <a 
              href="/profile" 
              className="mt-2 inline-block text-yellow-800 underline"
            >
              Complete Verification
            </a>
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Order Summary</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Auction:</span>
            <span className="font-medium">{auction.title}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Vehicle:</span>
            <span>{auction.vehicle ? `${auction.vehicle.year} ${auction.vehicle.make} ${auction.vehicle.model}` : 'Unknown'}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Winning Bid:</span>
            <span className="font-medium">${auction.currentPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Buyer's Premium (5%):</span>
            <span>${Math.round(auction.currentPrice * 0.05).toLocaleString()}</span>
          </div>
          <div className="border-t border-gray-200 my-2 pt-2 flex justify-between">
            <span className="font-medium">Total:</span>
            <span className="font-bold">${Math.round(auction.currentPrice * 1.05).toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Payment Method</h3>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                value="credit_card"
                checked={paymentMethod === 'credit_card'}
                onChange={() => setPaymentMethod('credit_card')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-gray-700">Credit Card</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                value="bank_transfer"
                checked={paymentMethod === 'bank_transfer'}
                onChange={() => setPaymentMethod('bank_transfer')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-gray-700">Bank Transfer</span>
            </label>
          </div>
        </div>
        
        {paymentMethod === 'credit_card' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <div className="relative">
                <input
                  id="cardNumber"
                  name="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  maxLength={19}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard size={16} className="text-gray-400" />
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name
              </label>
              <input
                id="cardHolder"
                name="cardHolder"
                type="text"
                placeholder="John Doe"
                value={cardDetails.cardHolder}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  id="expiryDate"
                  name="expiryDate"
                  type="text"
                  placeholder="MM/YY"
                  value={cardDetails.expiryDate}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  maxLength={5}
                />
              </div>
              
              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  id="cvv"
                  name="cvv"
                  type="text"
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        )}
        
        {paymentMethod === 'bank_transfer' && (
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Bank Transfer Instructions</h4>
            <p className="text-sm text-gray-700 mb-2">
              Please transfer the total amount to the following bank account:
            </p>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Bank Name:</span> TowBid Financial</p>
              <p><span className="font-medium">Account Name:</span> TowBid Escrow Services</p>
              <p><span className="font-medium">Account Number:</span> 1234567890</p>
              <p><span className="font-medium">Routing Number:</span> 987654321</p>
              <p><span className="font-medium">Reference:</span> AUC-{auction.id.substring(0, 8)}</p>
            </div>
            <p className="text-sm text-gray-700 mt-2">
              After making the transfer, please click "Complete Purchase" below. We'll verify your payment and update your order status.
            </p>
          </div>
        )}
        
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <Lock size={14} className="mr-2 text-gray-500" />
          <span>Your payment information is encrypted and secure</span>
        </div>
        
        <div className="flex space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !isVerified}
            className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              (isLoading || !isVerified) ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Processing...' : 'Complete Purchase'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;