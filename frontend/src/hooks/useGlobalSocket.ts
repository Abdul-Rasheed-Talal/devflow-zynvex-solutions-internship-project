import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { connectSocket } from '../services/socket';
import { notificationKeys } from './useNotificationQueries';
import { useAuthStore } from '../stores/authStore';

/**
 * Hook to manage global real-time events (like notifications) for the authenticated user.
 */
export function useGlobalSocket() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = connectSocket();

    // The backend automatically joins `user_<userId>` upon connection and authentication.
    const onNotificationCreated = (data: any) => {
      console.log('Socket: Received notification.created', data);
      // Invalidate notifications cache to fetch the latest
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    };

    socket.on('connect', () => console.log('Socket: Connected!'));
    socket.on('connect_error', (err) => console.error('Socket: Connection error:', err.message));
    socket.on('disconnect', () => console.log('Socket: Disconnected.'));
    socket.on('error', (err) => console.error('Socket: Error event:', err));

    socket.on('notification.created', onNotificationCreated);

    return () => {
      socket.off('notification.created', onNotificationCreated);
    };
  }, [isAuthenticated, queryClient]);
}
