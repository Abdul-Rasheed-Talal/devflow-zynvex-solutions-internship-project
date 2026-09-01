import apiClient from '../lib/apiClient';
import { TeamMember } from '../types/team';

export const teamService = {
  getTeamMembers: (): Promise<{ success: boolean; data: TeamMember[] }> => {
    return apiClient<{ success: boolean; data: TeamMember[] }>('/users/team');
  },
};
