import type { UserBasic } from './project';

export interface Comment {
  _id: string;
  project: string;
  task: string;
  author: UserBasic;
  content: string;
  mentionedUsers: UserBasic[];
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentInput {
  content: string;
  mentionedUsers?: string[];
}

export interface UpdateCommentInput {
  content?: string;
  mentionedUsers?: string[];
}

export interface CommentListResponse {
  success: boolean;
  data: Comment[];
}

export interface CommentResponse {
  success: boolean;
  data: Comment;
}

export interface DeleteCommentResponse {
  success: boolean;
  data: Record<string, never>;
}
