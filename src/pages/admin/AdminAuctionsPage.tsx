import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Auction } from '../../types';
import { getAuctions, updateAuction } from '../../services/auctionService';
import Layout from '../../components/layout/Layout';
import { Timestamp } from 'firebase/firestore';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Clock,
  Calendar
} from 'lucide-react';

const AdminAuctionsPage: React.FC = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Auction>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const navigate = useNavigate();
  
  useEffect(() => {
    loadAuctions();
  }, []);
  
  const loadAuctions = async () => {
    setIsLoading(true);
    try {
      const data = await getAuctions();
      setAuctions(data);
    } catch (error) {
      console.error('Error loading auctions:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStatusUpdate = async (auctionId: string, newStatus: Auction['status']) => {
    try {
      await updateAuction(auctionId, { status: newStatus });
      // Update local state
      setAuctions(auctions.map(auction => 
        auction.id === auctionId ? { ...auction, status: newStatus } : auction
      ));
    } catch (error) {
      console.error('Error updating auction status:', error);
    }
  };
  
  const toggleSort = (field: keyof Auction) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const getSortIcon = (field: keyof Auction) => {
    if (field !== sortField) return <ArrowUpDown size={16} className="ml-1 text-gray-400" />;
    return sortDirection === 'asc' 
      ? <ChevronUp size={16} className="ml-1 text-blue-500" />
      : <ChevronDown size={16} className="ml-1 text-blue-500" />;
  };
  
  // Format date from Timestamp or string
  const formatDate = (date: string | Timestamp | undefined): string => {
    if (!date) return 'N/A';
    
    if (date instanceof Timestamp) {
      return date.toDate().toLocaleString();
    }
    
    return new Date(date).toLocaleString();
  };
  
  // Status badge component
  const StatusBadge: React.FC<{ status: Auction['status'] }> = ({ status }) => {
    const getStatusColor = () => {
      switch (status) {
        case 'active': return 'bg-green-100 text-green-800';
        case 'ended': return 'bg-gray-100 text-gray-800';
        case 'scheduled': return 'bg-blue-100 text-blue-800';
        case 'draft': return 'bg-yellow-100 text-yellow-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };
    
    const getStatusIcon = () => {
      switch (status) {
        case 'active': return <CheckCircle size={14} className="mr-1" />;
        case 'ended': return <XCircle size={14} className="mr-1" />;
        case 'scheduled': return <Calendar size={14} className="mr-1" />;
        case 'draft': return <Clock size={14} className="mr-1" />;
        case 'cancelled': return <XCircle size={14} className="mr-1" />;
        default: return null;
      }
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
        {getStatusIcon()}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  // Filter and sort auctions
  const filteredAndSortedAuctions = auctions
    .filter(auction => 
      auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auction.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auction.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      // Handle dates
      if (sortField === 'startTime' || sortField === 'endTime' || sortField === 'createdAt' || sortField === 'updatedAt') {
        aValue = aValue instanceof Timestamp ? aValue.toMillis() : new Date(aValue || 0).getTime();
        bValue = bValue instanceof Timestamp ? bValue.toMillis() : new Date(bValue || 0).getTime();
      }
      
      // Handle numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Manage Auctions</h1>
            <Link
              to="/admin/auctions/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus size={16} className="mr-2" />
              Create Auction
            </Link>
          </div>
          
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search auctions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={loadAuctions}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Refresh
              </button>
            </div>
          </div>
          
          {/* Auctions Table */}
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  {isLoading ? (
                    <div className="text-center py-12">
                      <div className="spinner-border inline-block w-8 h-8 border-4 rounded-full" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Loading auctions...</p>
                    </div>
                  ) : filteredAndSortedAuctions.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-sm text-gray-500">No auctions found</p>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => toggleSort('title')}
                          >
                            <div className="flex items-center">
                              Title
                              {getSortIcon('title')}
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => toggleSort('currentPrice')}
                          >
                            <div className="flex items-center">
                              Current Price
                              {getSortIcon('currentPrice')}
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => toggleSort('startTime')}
                          >
                            <div className="flex items-center">
                              Start Time
                              {getSortIcon('startTime')}
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => toggleSort('endTime')}
                          >
                            <div className="flex items-center">
                              End Time
                              {getSortIcon('endTime')}
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => toggleSort('status')}
                          >
                            <div className="flex items-center">
                              Status
                              {getSortIcon('status')}
                            </div>
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAndSortedAuctions.map((auction) => (
                          <tr key={auction.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{auction.title}</div>
                              <div className="text-sm text-gray-500">ID: {auction.id.slice(0, 8)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                ${(auction.currentPrice || 0).toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                Starting: ${auction.startingPrice.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(auction.startTime)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(auction.endTime)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={auction.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <Link
                                  to={`/auctions/${auction.id}`}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  View
                                </Link>
                                <Link
                                  to={`/admin/auctions/edit/${auction.id}`}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  <Edit size={16} />
                                </Link>
                                <button
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to cancel this auction?')) {
                                      handleStatusUpdate(auction.id, 'cancelled');
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminAuctionsPage;