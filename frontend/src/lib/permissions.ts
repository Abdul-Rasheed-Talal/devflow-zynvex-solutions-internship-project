import type { Project, ProjectRole } from '../types/project';

/**
 * Determines a user's role in a project.
 * Uses the hierarchy: owner > member role.
 */
export function getProjectRole(project: Project | undefined | null, userId: string | undefined): ProjectRole | null {
  if (!project || !userId) return null;
  
  if (project.owner === userId) {
    return 'owner';
  }
  
  const memberRecord = project.members.find(m => m.user === userId);
  if (memberRecord) {
    return memberRecord.role;
  }
  
  return null;
}

/**
 * Checks if a user has permission to manage (add/remove) members.
 * Only Owners and Admins can manage members.
 */
export function canManageMembers(role: ProjectRole | null): boolean {
  return role === 'owner' || role === 'admin';
}

/**
 * Checks if a user has permission to manage roles of other members.
 * Only Owners and Admins can manage roles.
 */
export function canManageRoles(role: ProjectRole | null): boolean {
  return role === 'owner' || role === 'admin';
}

/**
 * Checks if a user has permission to edit project details (settings, name, description).
 * Owners and Admins can edit projects.
 */
export function canEditProject(role: ProjectRole | null): boolean {
  return role === 'owner' || role === 'admin';
}

/**
 * Checks if a user has permission to delete the project.
 * Only Owners can delete projects.
 */
export function canDeleteProject(role: ProjectRole | null): boolean {
  return role === 'owner';
}

/**
 * Checks if a user has permission to edit or create tasks.
 * Owners, Admins, and Members can edit tasks.
 * Viewers cannot.
 */
export function canEditTasks(role: ProjectRole | null): boolean {
  return role === 'owner' || role === 'admin' || role === 'member';
}

/**
 * Determines if a user's role allows managing a target role.
 * Owners can manage everyone (except owner).
 * Admins can manage members and viewers.
 */
export function canManageTargetRole(currentUserRole: ProjectRole | null, targetUserRole: ProjectRole): boolean {
  if (!currentUserRole) return false;
  if (targetUserRole === 'owner') return false; // Nobody can modify the owner
  
  if (currentUserRole === 'owner') return true;
  if (currentUserRole === 'admin') {
    return targetUserRole === 'member' || targetUserRole === 'viewer';
  }
  
  return false;
}
