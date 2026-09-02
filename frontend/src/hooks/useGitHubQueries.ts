import { useQuery } from '@tanstack/react-query';
import { githubService, GitHubData, GitHubRepo } from '../services/githubService';
import type { ApiError } from '../types/auth';

export function useProjectGitHubData(projectId: string, hasGithubRepo: boolean) {
  return useQuery<{ success: boolean; data: GitHubData }, Error, GitHubData>({
    queryKey: ['github', projectId],
    queryFn: () => githubService.getProjectGitHubData(projectId),
    select: (res) => res.data,
    enabled: !!projectId && !!hasGithubRepo,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
}

export const useGitHubRepos = () => {
  return useQuery<{ success: boolean; data: GitHubRepo[] }, ApiError>({
    queryKey: ['github', 'repos'],
    queryFn: () => githubService.getUserRepositories(),
    staleTime: 5 * 60 * 1000,
    retry: false // Fail fast if unauthorized or no premium
  });
};
