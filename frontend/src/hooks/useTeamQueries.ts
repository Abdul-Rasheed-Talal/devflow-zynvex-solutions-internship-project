import { useQuery } from '@tanstack/react-query';
import { teamService } from '../services/teamService';
import { TeamMember } from '../types/team';

export function useTeamMembers() {
  return useQuery<{ success: boolean; data: TeamMember[] }, Error, TeamMember[]>({
    queryKey: ['team'],
    queryFn: () => teamService.getTeamMembers(),
    select: (res) => res.data,
  });
}
