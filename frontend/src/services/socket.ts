import { io, Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
// Extract the base URL (e.g. http://localhost:5000) from the API URL (e.g. http://localhost:5000/api)
const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');

let socket: Socket | null = null;

/**
 * Get or create the shared Socket.IO connection.
 * We use a single shared connection per browser tab.
 */
export const getSocket = (): Socket => {
  if (!socket) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('devflow_token') : null;

    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      auth: token ? { token } : undefined,
    });
  }
  return socket;
};

/**
 * Connect the socket if it isn't already connected.
 */
export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

/**
 * Disconnect the socket.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null; // Clean up the instance
  }
};
