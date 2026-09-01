import { useQuery } from '@tanstack/react-query';
import { githubService, GitHubData } from '../services/githubService';

export function useProjectGitHubData(projectId: string) {
  return useQuery<{ success: boolean; data: GitHubData }, Error, GitHubData>({
    queryKey: ['github', projectId],
    queryFn: () => githubService.getProjectGitHubData(projectId),
    select: (res) => res.data,
    enabled: !!projectId,
    retry: false, // Don't retry if the repo is invalid or unauthorized
  });
}
