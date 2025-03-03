import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuctionStore } from '../store/auctionStore';
import Layout from '../components/layout/Layout';
import AuctionGrid from '../components/auctions/AuctionGrid';
import { Truck, Clock, Shield, DollarSign, Search } from 'lucide-react';

const HomePage: React.FC = () => {
  const { featuredAuctions, fetchFeaturedAuctions, isLoading } = useAuctionStore();

  useEffect(() => {
    fetchFeaturedAuctions();
  }, [fetchFeaturedAuctions]);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Specialized Tow Vehicle Auctions
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Find quality tow vehicles at competitive prices through our secure auction platform.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/auctions"
                  className="px-6 py-3 bg-yellow-500 text-gray-900 rounded-md font-semibold hover:bg-yellow-400 transition-colors"
                >
                  Browse Auctions
                </Link>
                <Link
                  to="/how-it-works"
                  className="px-6 py-3 bg-transparent border border-white text-white rounded-md font-semibold hover:bg-white hover:text-blue-700 transition-colors"
                >
                  How It Works
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Tow truck"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by make, model, or year..."
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <button className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Featured Auctions</h2>
            <Link
              to="/auctions"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All
            </Link>
          </div>
          
          <AuctionGrid auctions={featuredAuctions} isLoading={isLoading} />
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our auction platform makes it easy to find and bid on quality tow vehicles.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={28} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Browse Inventory</h3>
              <p className="text-gray-600">
                Explore our extensive collection of tow vehicles with detailed information and high-quality images.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign size={28} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Place Your Bid</h3>
              <p className="text-gray-600">
                Register, set your budget, and place competitive bids on vehicles that meet your requirements.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck size={28} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Win & Collect</h3>
              <p className="text-gray-600">
                If you win, complete the payment securely and arrange for vehicle pickup or delivery.
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link
              to="/how-it-works"
              className="px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors inline-block"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform offers unique advantages for both buyers and sellers in the tow vehicle market.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <Clock size={24} className="text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Time Efficiency</h3>
              <p className="text-gray-600">
                Quick and streamlined process from browsing to winning an auction.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <Shield size={24} className="text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Secure Transactions</h3>
              <p className="text-gray-600">
                Advanced security measures to protect your data and transactions.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <Truck size={24} className="text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Quality Vehicles</h3>
              <p className="text-gray-600">
                Curated selection of tow vehicles with detailed history and condition reports.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <DollarSign size={24} className="text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Competitive Pricing</h3>
              <p className="text-gray-600">
                Transparent bidding process ensures fair market value for all vehicles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Next Vehicle?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our platform today and get access to exclusive tow vehicle auctions.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3 bg-yellow-500 text-gray-900 rounded-md font-semibold hover:bg-yellow-400 transition-colors"
            >
              Register Now
            </Link>
            <Link
              to="/auctions"
              className="px-8 py-3 bg-transparent border border-white text-white rounded-md font-semibold hover:bg-white hover:text-blue-700 transition-colors"
            >
              Browse Auctions
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;