import apiClient from '../lib/apiClient';
import { Announcement, AnnouncementCreateRequest } from '../types/team';

export const announcementService = {
  getAnnouncements: (): Promise<{ success: boolean; data: Announcement[] }> => {
    return apiClient<{ success: boolean; data: Announcement[] }>('/announcements');
  },
  
  createAnnouncement: (data: AnnouncementCreateRequest): Promise<{ success: boolean; data: Announcement }> => {
    return apiClient<{ success: boolean; data: Announcement }>('/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  deleteAnnouncement: (id: string): Promise<{ success: boolean }> => {
    return apiClient<{ success: boolean }>(`/announcements/${id}`, {
      method: 'DELETE',
    });
  },
};
