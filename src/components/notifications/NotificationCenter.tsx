import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Notification } from '../../types';
import { useAuthStore } from '../../store/authStore';
import websocketService from '../../services/websocketService';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Fetch notifications on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      // Mock data for now - in a real app, fetch from API
      const mockNotifications: Notification[] = [
        {
          id: '1',
          userId: user.id,
          type: 'bid_placed',
          title: 'Bid Placed',
          message: 'Your bid of $5,200 was placed successfully.',
          isRead: false,
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          userId: user.id,
          type: 'outbid',
          title: 'You\'ve Been Outbid',
          message: 'Someone placed a higher bid on 2018 Toyota Camry.',
          isRead: false,
          relatedId: 'auction-123',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          userId: user.id,
          type: 'auction_ending',
          title: 'Auction Ending Soon',
          message: 'An auction you\'re watching ends in 15 minutes.',
          isRead: true,
          relatedId: 'auction-456',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
    }
  }, [isAuthenticated, user]);
  
  // Subscribe to notification updates
  useEffect(() => {
    if (isAuthenticated) {
      websocketService.connect();
      
      const unsubscribe = websocketService.subscribe('notification', (data) => {
        if (data.notification) {
          setNotifications(prev => [data.notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      });
      
      return () => {
        unsubscribe();
      };
    }
  }, [isAuthenticated]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // In a real app, call API to mark as read
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    
    setUnreadCount(0);
    
    // In a real app, call API to mark all as read
  };
  
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="relative p-1 rounded-full hover:bg-gray-700 focus:outline-none"
        onClick={toggleDropdown}
      >
        <Bell size={20} className="text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10">
          <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-500">
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-gray-800">{notification.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="px-4 py-2 border-t border-gray-200 text-center">
            <a href="/notifications" className="text-xs text-blue-600 hover:text-blue-800">
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;