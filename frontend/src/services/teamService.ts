import apiClient from '../lib/apiClient';
import { ProjectTeamDirectory } from '../types/team';
import { TeamWorkspace } from '../types/teamWorkspace';

export const teamService = {
  getTeamMembers: (): Promise<{ success: boolean; data: ProjectTeamDirectory[] }> => {
    return apiClient<{ success: boolean; data: ProjectTeamDirectory[] }>('/users/team');
  },
  
  getTeams: (): Promise<{ success: boolean; data: TeamWorkspace[] }> => {
    return apiClient<{ success: boolean; data: TeamWorkspace[] }>('/teams');
  },
  
  createTeam: (data: { name: string }): Promise<{ success: boolean; data: TeamWorkspace }> => {
    return apiClient<{ success: boolean; data: TeamWorkspace }>('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  addTeamMember: (teamId: string, email: string): Promise<{ success: boolean; data: TeamWorkspace }> => {
    return apiClient<{ success: boolean; data: TeamWorkspace }>(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  deleteTeam: (teamId: string): Promise<{ success: boolean; message: string }> => {
    return apiClient<{ success: boolean; message: string }>(`/teams/${teamId}`, {
      method: 'DELETE',
    });
  }
};
