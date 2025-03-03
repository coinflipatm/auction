import React, { useEffect, useState } from 'react';
import { useAuctionStore } from '../store/auctionStore';
import Layout from '../components/layout/Layout';
import AuctionGrid from '../components/auctions/AuctionGrid';
import { Search, Filter, ChevronDown } from 'lucide-react';

const AuctionsPage: React.FC = () => {
  const { auctions, fetchAuctions, isLoading } = useAuctionStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  
  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);
  
  // Filter auctions based on search term and filters
  const filteredAuctions = auctions.filter(auction => {
    // Safe search matching with null checks
    const matchesSearch = searchTerm === '' || 
      auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (auction.vehicle?.make?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (auction.vehicle?.model?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    // Safe make matching
    const matchesMake = selectedMakes.length === 0 || 
      (auction.vehicle?.make && selectedMakes.includes(auction.vehicle.make));
    
    // Safe year matching
    const matchesYear = selectedYears.length === 0 || 
      (auction.vehicle?.year && selectedYears.includes(auction.vehicle.year));
    
    // Safe price matching
    const currentPrice = auction.currentPrice || auction.startingPrice || 0;
    const matchesPrice = currentPrice >= priceRange[0] && currentPrice <= priceRange[1];
    
    return matchesSearch && matchesMake && matchesYear && matchesPrice;
  });
  
  // Extract unique makes and years with proper type handling
  const makes = [...new Set(auctions.map(a => a.vehicle?.make).filter(Boolean) as string[])];
  const years = [...new Set(auctions.map(a => a.vehicle?.year).filter(Boolean) as number[])].sort((a, b) => b - a);
  
  const handleMakeToggle = (make: string) => {
    setSelectedMakes(prev => 
      prev.includes(make) 
        ? prev.filter(m => m !== make) 
        : [...prev, make]
    );
  };
  
  const handleYearToggle = (year: number) => {
    setSelectedYears(prev => 
      prev.includes(year) 
        ? prev.filter(y => y !== year) 
        : [...prev, year]
    );
  };
  
  const handlePriceChange = (index: number, value: number) => {
    setPriceRange(prev => {
      const newRange = [...prev] as [number, number];
      newRange[index] = value;
      return newRange;
    });
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedMakes([]);
    setSelectedYears([]);
    setPriceRange([0, 50000]);
  };

  // Rest of your component remains the same

  return (
    <Layout>
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Browse Auctions</h1>
            <p className="text-gray-600">
              Find and bid on quality tow vehicles from our curated selection.
            </p>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by make, model, or title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Filter size={18} className="mr-2" />
                Filters
                <ChevronDown size={18} className={`ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Make Filter */}
                  <div>
                    <h3 className="font-medium mb-2">Make</h3>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {makes.map(make => (
                        <label key={make} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedMakes.includes(make)}
                            onChange={() => handleMakeToggle(make)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{make}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Year Filter */}
                  <div>
                    <h3 className="font-medium mb-2">Year</h3>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {years.map(year => (
                        <label key={year} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedYears.includes(year)}
                            onChange={() => handleYearToggle(year)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{year}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Price Range Filter */}
                  <div>
                    <h3 className="font-medium mb-2">Price Range</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Min: ${priceRange[0].toLocaleString()}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="50000"
                          step="1000"
                          value={priceRange[0]}
                          onChange={(e) => handlePriceChange(0, parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Max: ${priceRange[1].toLocaleString()}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="50000"
                          step="1000"
                          value={priceRange[1]}
                          onChange={(e) => handlePriceChange(1, parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredAuctions.length} of {auctions.length} auctions
            </p>
          </div>
          
          {/* Auctions Grid */}
          <AuctionGrid auctions={filteredAuctions} isLoading={isLoading} />
        </div>
      </div>
    </Layout>
  );
};

export default AuctionsPage;