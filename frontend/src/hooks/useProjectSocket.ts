import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { connectSocket } from '../services/socket';
import { projectKeys } from './useProjectQueries';
import { taskKeys } from './useTaskQueries';
import { commentKeys } from './useCommentQueries';
import { activityKeys } from './useActivityQueries';
import { auditKeys } from './useAuditQueries';

/**
 * Hook to manage the real-time Socket.IO connection for a specific project.
 * Automatically connects, joins the project room, listens for events, and invalidates queries.
 * @param projectId The ID of the project to join. If undefined, no connection is made.
 */
export function useProjectSocket(projectId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) return;

    // Connect and join room
    const socket = connectSocket();
    socket.emit('join_project', projectId);

    // Set up event listeners
    const onProjectUpdated = () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    };

    const onProjectDeleted = () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    };

    const onMembershipUpdated = () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: auditKeys.project(projectId) });
    };

    const onTaskEvent = () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.project(projectId) });
    };

    const onTaskDeleted = (payload: { taskId: string }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.project(projectId) });
      if (payload.taskId) {
        queryClient.invalidateQueries({ queryKey: taskKeys.detail(payload.taskId) });
      }
    };

    const onCommentEvent = (payload: { taskId: string }) => {
      if (payload.taskId) {
        queryClient.invalidateQueries({ queryKey: commentKeys.task(payload.taskId) });
      }
    };

    const onActivityEvent = () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.project(projectId) });
    };

    // Listeners for Project
    socket.on('project.updated', onProjectUpdated);
    socket.on('project.deleted', onProjectDeleted);
    socket.on('membership.updated', onMembershipUpdated);

    // Listeners for Tasks
    socket.on('task.created', onTaskEvent);
    socket.on('task.updated', onTaskEvent);
    socket.on('task.status_changed', onTaskEvent);
    socket.on('task.deleted', onTaskDeleted);

    // Listeners for Comments
    socket.on('comment.created', onCommentEvent);
    socket.on('comment.updated', onCommentEvent);
    socket.on('comment.deleted', onCommentEvent);
    
    // Generic listener for activity feed updates (future proofing)
    socket.on('activity.created', onActivityEvent);

    return () => {
      // Clean up listeners
      socket.off('project.updated', onProjectUpdated);
      socket.off('project.deleted', onProjectDeleted);
      socket.off('membership.updated', onMembershipUpdated);
      socket.off('task.created', onTaskEvent);
      socket.off('task.updated', onTaskEvent);
      socket.off('task.status_changed', onTaskEvent);
      socket.off('task.deleted', onTaskDeleted);
      socket.off('comment.created', onCommentEvent);
      socket.off('comment.updated', onCommentEvent);
      socket.off('comment.deleted', onCommentEvent);
      socket.off('activity.created', onActivityEvent);

      // Leave project room
      socket.emit('leave_project', projectId);
    };
  }, [projectId, queryClient]);
}
