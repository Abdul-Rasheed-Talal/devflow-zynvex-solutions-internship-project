import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/projectService';
import type { CreateProjectInput, UpdateProjectInput, AddMemberInput } from '../types/project';

// Query key factory
export const projectKeys = {
  all: ['projects'] as const,
  detail: (id: string) => ['projects', id] as const,
  members: (id: string) => ['projects', id, 'members'] as const,
};

/** Fetch all accessible projects */
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: () => projectService.list(),
    select: (data) => data.data,
  });
}

/** Fetch a single project by ID */
export function useProject(projectId: string) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => projectService.getById(projectId),
    select: (data) => data.data,
    enabled: !!projectId,
  });
}

/** Create a new project */
export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectInput) => projectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

/** Update an existing project */
export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProjectInput) => projectService.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

/** Delete a project */
export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => projectService.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

/** Fetch project members (owner only) */
export function useProjectMembers(projectId: string, enabled: boolean) {
  return useQuery({
    queryKey: projectKeys.members(projectId),
    queryFn: () => projectService.getMembers(projectId),
    select: (data) => data.data,
    enabled: !!projectId && enabled,
  });
}

/** Add a member to a project */
export function useAddMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddMemberInput) => projectService.addMember(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

/** Remove a member from a project */
export function useRemoveMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => projectService.removeMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}
