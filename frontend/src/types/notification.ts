import { User } from './auth';
import { Project } from './project';
import { Task } from './task';
import { Comment } from './comment';

export type NotificationType = 'mention' | 'task_assigned' | 'task_updated';

export interface Notification {
  _id: string;
  user: string;
  actor: User;
  project: Pick<Project, '_id' | 'name'>;
  type: NotificationType;
  referenceId: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Contextual data populated manually by the backend
  task?: Pick<Task, '_id' | 'title'>;
  comment?: Pick<Comment, '_id' | 'content'> & { task: string };
}

export interface NotificationPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface NotificationListResponse {
  success: boolean;
  data: Notification[];
  pagination: NotificationPagination;
  meta: {
    unreadCount: number;
  };
}

export interface SingleNotificationResponse {
  success: boolean;
  data: Notification;
}
