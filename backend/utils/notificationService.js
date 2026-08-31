import Notification from '../models/Notification.js';
import { emitUserEvent } from '../socket/events.js';

/**
 * Helper to check if a user is part of the project (owner or member)
 */
function isProjectParticipant(project, userIdStr) {
  if (project.owner.toString() === userIdStr) return true;
  return project.members.some((m) => {
    const memberId = m.user ? m.user.toString() : m.toString();
    return memberId === userIdStr;
  });
}

/**
 * Creates mention notifications for users tagged in a comment.
 * Ensures the user belongs to the project and is not the actor.
 */
export const createMentionNotifications = async (project, task, actorId, commentId, mentionedUserIds) => {
  if (!mentionedUserIds || mentionedUserIds.length === 0) return;

  const actorIdStr = actorId.toString();

  // Deduplicate and filter valid users
  const uniqueMentionedIds = [...new Set(mentionedUserIds.map((id) => id.toString()))];

  const notificationsToCreate = [];

  for (const userIdStr of uniqueMentionedIds) {
    if (userIdStr === actorIdStr) continue; // Don't notify self
    if (!isProjectParticipant(project, userIdStr)) continue; // Must be in project

    notificationsToCreate.push({
      user: userIdStr,
      actor: actorId,
      project: project._id,
      type: 'mention',
      referenceId: commentId,
    });
  }

  if (notificationsToCreate.length === 0) return;

  const inserted = await Notification.insertMany(notificationsToCreate);

  // Emit socket events
  for (const notif of inserted) {
    emitUserEvent(notif.user, 'notification.created', { notificationId: notif._id });
  }
};

/**
 * Creates a notification for task assignment.
 * Does not notify if the assigner is assigning themselves.
 */
export const createTaskAssignmentNotification = async (project, task, actorId) => {
  if (!task.assignee) return;

  const assigneeIdStr = task.assignee.toString();
  const actorIdStr = actorId.toString();

  if (assigneeIdStr === actorIdStr) return; // Don't notify self

  const notif = await Notification.create({
    user: task.assignee,
    actor: actorId,
    project: project._id,
    type: 'task_assigned',
    referenceId: task._id,
  });

  emitUserEvent(task.assignee, 'notification.created', { notificationId: notif._id });
};

/**
 * Creates a notification for a task update (like status changes).
 * Only notifies the assignee, and only if the actor is not the assignee.
 */
export const createTaskUpdateNotification = async (project, task, actorId) => {
  if (!task.assignee) return;

  const assigneeIdStr = task.assignee.toString();
  const actorIdStr = actorId.toString();

  if (assigneeIdStr === actorIdStr) return; // Don't notify self

  const notif = await Notification.create({
    user: task.assignee,
    actor: actorId,
    project: project._id,
    type: 'task_updated',
    referenceId: task._id,
  });

  emitUserEvent(task.assignee, 'notification.created', { notificationId: notif._id });
};
