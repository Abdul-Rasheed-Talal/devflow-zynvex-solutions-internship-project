import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementService } from '../services/announcementService';
import { Announcement, AnnouncementCreateRequest } from '../types/team';

export function useAnnouncements() {
  return useQuery<{ success: boolean; data: Announcement[] }, Error, Announcement[]>({
    queryKey: ['announcements'],
    queryFn: () => announcementService.getAnnouncements(),
    select: (res) => res.data,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AnnouncementCreateRequest) => announcementService.createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => announcementService.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}
