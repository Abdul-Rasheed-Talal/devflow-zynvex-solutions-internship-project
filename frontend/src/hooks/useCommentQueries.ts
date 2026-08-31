import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTaskComments,
  createComment,
  updateComment,
  deleteComment,
} from '../services/commentService';
import type { CreateCommentInput, UpdateCommentInput } from '../types/comment';
import type { ApiError } from '../types/auth';

export const commentKeys = {
  all: ['comments'] as const,
  task: (taskId: string) => [...commentKeys.all, 'task', taskId] as const,
};

export function useTaskComments(taskId: string, enabled = true) {
  return useQuery({
    queryKey: commentKeys.task(taskId),
    queryFn: () => getTaskComments(taskId),
    select: (response) => response.data,
    enabled: !!taskId && enabled,
  });
}

export function useCreateComment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCommentInput) => createComment(taskId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.task(taskId) });
    },
    onError: (error: ApiError) => {
      console.error('Failed to create comment:', error);
    },
  });
}

export function useUpdateComment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, input }: { commentId: string; input: UpdateCommentInput }) =>
      updateComment(commentId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.task(taskId) });
    },
    onError: (error: ApiError) => {
      console.error('Failed to update comment:', error);
    },
  });
}

export function useDeleteComment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.task(taskId) });
    },
    onError: (error: ApiError) => {
      console.error('Failed to delete comment:', error);
    },
  });
}
