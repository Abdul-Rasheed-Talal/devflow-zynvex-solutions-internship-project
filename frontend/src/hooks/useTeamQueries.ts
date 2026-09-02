import { useQuery } from '@tanstack/react-query';
import { teamService } from '../services/teamService';
import { ProjectTeamDirectory } from '../types/team';

export function useTeamMembers() {
  return useQuery<{ success: boolean; data: ProjectTeamDirectory[] }, Error, ProjectTeamDirectory[]>({
    queryKey: ['team'],
    queryFn: () => teamService.getTeamMembers(),
    select: (res) => res.data,
  });
}
