import AuditLog from '../models/AuditLog.js';

/**
 * Creates an immutable audit log entry for security-relevant operations.
 * 
 * @param {Object} params
 * @param {Object} params.req - The Express request object (must have req.user and req.ip)
 * @param {string|mongoose.Types.ObjectId} params.projectId - The ID of the affected project
 * @param {string} params.action - The specific action that occurred (e.g., 'member_added')
 * @param {string|mongoose.Types.ObjectId} [params.targetUser] - The target user of the action, if applicable
 */
export const logAuditEvent = async ({ req, projectId, action, targetUser }) => {
  try {
    const actorId = req.user?.id;
    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';

    if (!actorId || !projectId || !action) {
      console.error('AuditLogger error: Missing required fields', { actorId, projectId, action });
      return;
    }

    const auditEntry = new AuditLog({
      project: projectId,
      actor: actorId,
      action,
      targetUser: targetUser || undefined,
      ipAddress,
    });

    await auditEntry.save();
  } catch (error) {
    // Log the error but do not throw it, so we don't crash the main operation
    console.error('AuditLogger failed to save audit entry:', error);
  }
};
