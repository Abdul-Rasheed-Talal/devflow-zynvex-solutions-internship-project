import { getIo } from './index.js';

/**
 * Emit an event to a specific project room.
 * This should ONLY be called after successful database operations.
 *
 * @param {string} projectId - The ID of the project
 * @param {string} eventName - The name of the event (e.g., 'project.updated')
 * @param {Object} payload - The minimal payload required by the frontend
 */
export const emitProjectEvent = (projectId, eventName, payload) => {
  try {
    const io = getIo();
    io.to(`project_${projectId.toString()}`).emit(eventName, payload);
  } catch (error) {
    console.error(`Failed to emit project event ${eventName}:`, error.message);
  }
};

/**
 * Emit an event to a specific user room.
 * This should ONLY be called after successful database operations.
 *
 * @param {string} userId - The ID of the user
 * @param {string} eventName - The name of the event (e.g., 'notification.created')
 * @param {Object} payload - The minimal payload required by the frontend
 */
export const emitUserEvent = (userId, eventName, payload) => {
  try {
    const io = getIo();
    io.to(`user_${userId.toString()}`).emit(eventName, payload);
  } catch (error) {
    console.error(`Failed to emit user event ${eventName}:`, error.message);
  }
};
