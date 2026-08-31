import apiClient from '../lib/apiClient';
import type { 
  CommentListResponse, 
  CommentResponse, 
  CreateCommentInput, 
  UpdateCommentInput,
  DeleteCommentResponse
} from '../types/comment';

export const getTaskComments = async (taskId: string): Promise<CommentListResponse> => {
  const response = await apiClient<CommentListResponse>(`/tasks/${taskId}/comments`, { method: 'GET' });
  return response;
};

export const createComment = async (taskId: string, input: CreateCommentInput): Promise<CommentResponse> => {
  const response = await apiClient<CommentResponse>(`/tasks/${taskId}/comments`, { 
    method: 'POST',
    body: JSON.stringify(input)
  });
  return response;
};

export const updateComment = async (commentId: string, input: UpdateCommentInput): Promise<CommentResponse> => {
  const response = await apiClient<CommentResponse>(`/comments/${commentId}`, { 
    method: 'PATCH',
    body: JSON.stringify(input)
  });
  return response;
};

export const deleteComment = async (commentId: string): Promise<DeleteCommentResponse> => {
  const response = await apiClient<DeleteCommentResponse>(`/comments/${commentId}`, { method: 'DELETE' });
  return response;
};
