import React from 'react';
import Layout from '../components/layout/Layout';
import { Search, DollarSign, Truck, Shield, Clock, FileText, CreditCard, HelpCircle } from 'lucide-react';

const HowItWorksPage: React.FC = () => {
  return (
    <Layout>
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">How It Works</h1>
              <p className="text-xl text-gray-600">
                Our auction platform makes it easy to find and bid on quality tow vehicles.
              </p>
            </div>
            
            {/* Process Steps */}
            <div className="space-y-16">
              {/* Step 1 */}
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <h2 className="text-2xl font-bold">Create an Account</h2>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Sign up for a free account to access our auction platform. Registration is quick and easy, requiring only basic information to get started.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Shield size={18} className="text-green-500 mr-2 mt-1" />
                      <span>Secure authentication system</span>
                    </li>
                    <li className="flex items-start">
                      <Clock size={18} className="text-green-500 mr-2 mt-1" />
                      <span>Takes less than 2 minutes</span>
                    </li>
                    <li className="flex items-start">
                      <FileText size={18} className="text-green-500 mr-2 mt-1" />
                      <span>No paperwork required</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <img 
                    src="https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                    alt="Create an account" 
                    className="rounded-lg"
                  />
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="grid md:grid-cols-2 gap-8 items-center md:flex-row-reverse">
                <div className="md:order-2">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                    <h2 className="text-2xl font-bold">Browse Inventory</h2>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Explore our extensive collection of tow vehicles with detailed information, specifications, and high-quality images.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Search size={18} className="text-green-500 mr-2 mt-1" />
                      <span>Advanced search and filtering options</span>
                    </li>
                    <li className="flex items-start">
                      <Truck size={18} className="text-green-500 mr-2 mt-1" />
                      <span>Comprehensive vehicle details</span>
                    </li>
                    <li className="flex items-start">
                      <FileText size={18} className="text-green-500 mr-2 mt-1" />
                      <span>Vehicle history and condition reports</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md md:order-1">
                  <img 
                    src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                    alt="Browse inventory" 
                    className="rounded-lg"
                  />
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-bold">3</span>
                    </div>
                    <h2 className="text-2xl font-bold">Place Your Bid</h2>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Once you find a vehicle you're interested in, you can place a bid directly through our platform. Set your maximum bid and let our system automatically bid for you up to your limit.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <DollarSign size={18} className="text-green-500 mr-2 mt-1" />
                      <span>Transparent bidding process</span>
                    </li>
                    <li className="flex items-start">
                      <Clock size={18} className="text-green-500 mr-2 mt-1" />
                      <span>Real-time bid updates</span>
                    </li>
                    <li className="flex items-start">
                      <Shield size={18} className="text-green-500 mr-2 mt-1" />
                      <span>Secure transaction system</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <img 
                    src="https://images.unsplash.com/photo-1607863680198-23d4b2565df0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                    alt="Place your bid" 
                    className="rounded-lg"
                  />
                </div>
              </div>
              
              {/* Step 4 */}
              <div className="grid md:grid-cols-2 gap-8 items-center md:flex-row-reverse">
                <div className="md:order-2">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-bold">4</span>
                    </div>
                    <h2 className="text-2xl font-bold">Win & Complete Purchase</h2>
                  </div>
                  <p className="text-gray-600 mb-4">
                    If you're the highest bidder when the auction ends, you'll be notified immediately. Complete your purchase securely through our platform and arrange for vehicle pickup or delivery.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CreditCard size={18} className="text-green-500 mr-2 mt-1" />
                      <span>Multiple payment options</span>
                    </li>
                    <li className="flex items-start">
                      <FileText size={18} className="text-green-500 mr-2 mt-1" />
                      <span>Digital documentation</span>
                    </li>
                    <li className="flex items-start">
                      <Truck size={18} className="text-green-500 mr-2 mt-1" />
                      <span>Pickup and delivery options</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md md:order-1">
                  <img 
                    src="https://images.unsplash.com/photo-1551522435-a13afa10f103?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                    alt="Complete purchase" 
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>
            
            {/* FAQ Section */}
            <div className="mt-20">
              <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-3 flex items-center">
                    <HelpCircle size={20} className="text-blue-600 mr-2" />
                    How do I know the vehicle's condition?
                  </h3>
                  <p className="text-gray-600">
                    Each vehicle listing includes detailed information about its condition, including known damages, mechanical issues, and cosmetic imperfections. We also provide multiple high-quality images of each vehicle to give you a comprehensive view of its current state.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-3 flex items-center">
                    <HelpCircle size={20} className="text-blue-600 mr-2" />
                    What happens if I win an auction?
                  </h3>
                  <p className="text-gray-600">
                    If you're the highest bidder when an auction ends, you'll receive an email notification confirming your win. You'll then have a specified period (typically 3 business days) to complete the payment. Once payment is confirmed, you can arrange for vehicle pickup or delivery.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-3 flex items-center">
                    <HelpCircle size={20} className="text-blue-600 mr-2" />
                    Are there any buyer's fees?
                  </h3>
                  <p className="text-gray-600">
                    Yes, there is a buyer's premium of 5% added to the final bid amount. This fee covers the cost of processing the transaction and maintaining our platform. All applicable fees are clearly displayed before you place a bid.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-3 flex items-center">
                    <HelpCircle size={20} className="text-blue-600 mr-2" />
                    Can I inspect the vehicle before bidding?
                  </h3>
                  <p className="text-gray-600">
                    Yes, we offer scheduled inspection appointments for serious bidders. Contact our customer service team to arrange a viewing at the vehicle's current location. We recommend inspecting vehicles in person whenever possible.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-3 flex items-center">
                    <HelpCircle size={20} className="text-blue-600 mr-2" />
                    What if the vehicle doesn't match the description?
                  </h3>
                  <p className="text-gray-600">
                    We strive for accuracy in all our listings. If you believe there's a significant discrepancy between the vehicle's description and its actual condition, contact our customer service team within 24 hours of pickup or delivery. We'll work with you to resolve the issue fairly.
                  </p>
                </div>
              </div>
            </div>
            
            {/* CTA */}
            <div className="mt-16 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-gray-600 mb-6">
                Join our platform today and find your next tow vehicle at a competitive price.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a 
                  href="/register" 
                  className="px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors"
                >
                  Create an Account
                </a>
                <a 
                  href="/auctions" 
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300 transition-colors"
                >
                  Browse Auctions
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HowItWorksPage;