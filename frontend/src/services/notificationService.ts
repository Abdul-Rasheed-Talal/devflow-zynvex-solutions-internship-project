import apiClient from '../lib/apiClient';
import type { NotificationListResponse, SingleNotificationResponse } from '../types/notification';

export const notificationService = {
  /**
   * Fetch paginated notifications for the authenticated user
   */
  list: (page = 1, limit = 20) => {
    return apiClient<NotificationListResponse>(`/notifications?page=${page}&limit=${limit}`);
  },

  /**
   * Mark a single notification as read
   */
  markAsRead: (notificationId: string) => {
    return apiClient<SingleNotificationResponse>(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  },

  /**
   * Mark all unread notifications as read
   */
  markAllAsRead: () => {
    return apiClient<{ success: boolean; data: Record<string, never> }>(`/notifications/read-all`, {
      method: 'PATCH',
    });
  },
};
