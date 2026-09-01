import apiClient from '../lib/apiClient';

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: string;
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
}

export interface GitHubData {
  repo: string;
  issues: GitHubIssue[];
  pullRequests: GitHubIssue[];
}

export const githubService = {
  getProjectGitHubData: (projectId: string): Promise<{ success: boolean; data: GitHubData }> => {
    return apiClient<{ success: boolean; data: GitHubData }>(`/projects/${projectId}/github`);
  }
};
