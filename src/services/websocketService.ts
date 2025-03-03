import { API_URL } from '../config';

// Define event types
export type EventType = 'bid_update' | 'auction_update' | 'notification' | 'system';

// Define event handler type
export type EventHandler = (data: any) => void;

// Define WebSocket service
class WebSocketService {
  private socket: WebSocket | null = null;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number = 2000; // Start with 2 seconds
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting: boolean = false;

  // Connect to WebSocket server
  connect(): void {
    if ((this.socket && this.socket.readyState === WebSocket.OPEN) || this.isConnecting) {
      return; // Already connected or connecting
    }

    this.isConnecting = true;
    
    // In a real implementation, this would use a WebSocket server URL
    const token = localStorage.getItem('token');
    const wsUrl = `${API_URL.replace('http', 'ws')}/ws?token=${token}`;
    
    try {
      // For mock purposes, we'll create a mock WebSocket
      this.createMockWebSocket();
      
      if (this.socket) {
        this.socket.onopen = this.handleOpen.bind(this);
        this.socket.onclose = this.handleClose.bind(this);
        this.socket.onerror = this.handleError.bind(this);
        this.socket.onmessage = this.handleMessage.bind(this);
      }
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.scheduleReconnect();
    }
  }

  // Create a mock WebSocket for development
  private createMockWebSocket(): void {
    // Create a custom object that mimics WebSocket behavior
    // Using a custom implementation to avoid readyState readonly issues
    const mockSocket = {
      _readyState: 0, // CONNECTING
      get readyState() { return this._readyState; },
      
      send: (data: string) => {
        console.log('Mock WebSocket send:', data);
        // Simulate successful send
        setTimeout(() => {
          if (mockSocket._readyState === 1) { // OPEN
            // Simulate response for certain actions
            try {
              const parsedData = JSON.parse(data);
              if (parsedData.type === 'place_bid') {
                this.simulateBidResponse(parsedData.data);
              }
            } catch (e) {
              console.error('Error parsing message data:', e);
            }
          }
        }, 500);
      },
      
      close: () => {
        console.log('Mock WebSocket closed');
        mockSocket._readyState = 3; // CLOSED
        if (mockSocket.onclose) {
          mockSocket.onclose({} as CloseEvent);
        }
      },
      
      onopen: null as ((event: Event) => void) | null,
      onclose: null as ((event: CloseEvent) => void) | null,
      onerror: null as ((event: Event) => void) | null,
      onmessage: null as ((event: MessageEvent) => void) | null,
    };

    // Simulate connection success
    setTimeout(() => {
      mockSocket._readyState = 1; // OPEN
      if (mockSocket.onopen) {
        mockSocket.onopen({} as Event);
      }
    }, 500);

    this.socket = mockSocket as unknown as WebSocket;
  }

  // Simulate bid response
  private simulateBidResponse(bidData: any): void {
    const response = {
      type: 'bid_update',
      data: {
        auctionId: bidData.auctionId,
        bid: {
          id: `mock-bid-${Date.now()}`,
          auctionId: bidData.auctionId,
          bidderId: bidData.bidderId,
          amount: bidData.amount,
          timestamp: new Date().toISOString(),
          status: 'placed'
        }
      }
    };

    if (this.socket && this.socket.onmessage) {
      this.socket.onmessage({ data: JSON.stringify(response) } as MessageEvent);
    }
  }

  // Handle WebSocket open event
  private handleOpen(event: Event): void {
    console.log('WebSocket connected');
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.reconnectTimeout = 2000; // Reset reconnect timeout
  }

  // Handle WebSocket close event
  private handleClose(event: CloseEvent): void {
    console.log('WebSocket disconnected');
    this.isConnecting = false;
    this.scheduleReconnect();
  }

  // Handle WebSocket error event
  private handleError(event: Event): void {
    console.error('WebSocket error:', event);
    this.isConnecting = false;
  }

  // Handle WebSocket message event
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      const eventType = data.type;
      const handlers = this.eventHandlers.get(eventType);
      
      if (handlers) {
        handlers.forEach(handler => handler(data.data));
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  // Schedule reconnect
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const timeout = this.reconnectTimeout * Math.pow(1.5, this.reconnectAttempts - 1);
      
      console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${timeout}ms`);
      
      this.reconnectTimer = setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, timeout);
    } else {
      console.error('Max reconnect attempts reached');
    }
  }

  // Subscribe to an event
  subscribe(eventType: EventType, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.add(handler);
    }
    
    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.eventHandlers.delete(eventType);
        }
      }
    };
  }

  // Send a message
  send(type: string, data: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, data }));
    } else {
      console.error('WebSocket not connected');
      // Auto-connect and queue message
      this.connect();
      setTimeout(() => this.send(type, data), 1000);
    }
  }

  // Disconnect
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;