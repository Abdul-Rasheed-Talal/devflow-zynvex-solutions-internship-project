import { useState } from 'react';
import { useProjectMembers, useAddMember, useRemoveMember, useUpdateMemberRole, useAssignTeam } from '../../hooks/useProjectQueries';
import { useTeamWorkspaces } from '../../hooks/useTeamWorkspaceQueries';
import { canManageMembers, canManageTargetRole } from '../../lib/permissions';
import type { ProjectMember, ProjectRole } from '../../types/project';
import type { ApiError } from '../../types/auth';
import UserProfileModal from '../team/UserProfileModal';

interface ProjectMembersProps {
  projectId: string;
  currentUserRole: ProjectRole | null;
  ownerId: string;
}

/**
 * Maps known API error statuses to user-friendly messages.
 */
function getAddMemberErrorMessage(err: ApiError): string {
  const status = err.status;
  if (status === 400) return err.message || 'Invalid input. Please check the user ID.';
  if (status === 404) return 'User not found. Ensure the user is registered in DevFlow.';
  if (status === 409) return 'This user is already a member of the project.';
  if (status === 403) return 'You do not have permission to manage membership.';
  if (status === 401) return 'Your session has expired. Please log in again.';
  return err.message || 'Failed to add member. Please try again.';
}

function getRemoveMemberErrorMessage(err: ApiError): string {
  const status = err.status;
  if (status === 404) return 'User is not a member of this project.';
  if (status === 400) return err.message || 'Cannot perform this operation.';
  if (status === 403) return 'You do not have permission to manage membership.';
  if (status === 401) return 'Your session has expired. Please log in again.';
  return err.message || 'Failed to remove member. Please try again.';
}

export default function ProjectMembers({ projectId, currentUserRole, ownerId }: ProjectMembersProps) {
  const hasManagePermission = canManageMembers(currentUserRole);

  const { data: members, isLoading, error: fetchError } = useProjectMembers(projectId, true);
  const addMutation = useAddMember(projectId);
  const removeMutation = useRemoveMember(projectId);
  const updateRoleMutation = useUpdateMemberRole(projectId);
  const assignTeamMutation = useAssignTeam(projectId);
  const { data: globalTeams } = useTeamWorkspaces();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showAssignTeamModal, setShowAssignTeamModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [teamAssignSuccess, setTeamAssignSuccess] = useState<string | null>(null);
  const [teamAssignError, setTeamAssignError] = useState<string | null>(null);

  const [emailInput, setEmailInput] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<ProjectMember | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-900">Team members</h2>
        </div>
        <div className="p-6 space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-8 w-8 rounded-full bg-gray-200" />
              <div className="space-y-1">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-48 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fetch error state
  if (fetchError) {
    const apiErr = fetchError as ApiError;
    return (
      <div className="bg-white border border-gray-200 rounded">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-900">Team members</h2>
        </div>
        <div className="p-6 text-sm text-red-600">
          {apiErr.status === 401
            ? 'Your session has expired. Please log in again.'
            : 'Failed to load team members.'}
        </div>
      </div>
    );
  }

  function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);

    const trimmed = emailInput.trim();
    if (!trimmed) {
      setAddError('Please enter an email address.');
      return;
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setAddError('Invalid email format.');
      return;
    }

    addMutation.mutate({ email: trimmed }, {
      onSuccess: () => {
        setEmailInput('');
        setShowAddForm(false);
        setAddError(null);
      },
      onError: (err) => {
        setAddError(getAddMemberErrorMessage(err as ApiError));
      },
    });
  }

  function handleRemoveMember() {
    if (!confirmRemove) return;
    setRemoveError(null);

    removeMutation.mutate(confirmRemove.user.id, {
      onSuccess: () => {
        setConfirmRemove(null);
        setRemoveError(null);
      },
      onError: (err) => {
        setRemoveError(getRemoveMemberErrorMessage(err as ApiError));
        setConfirmRemove(null);
      },
    });
  }

  function handleRoleChange(member: ProjectMember, newRole: string) {
    setRoleError(null);
    updateRoleMutation.mutate({ userId: member.user.id, data: { role: newRole as ProjectRole } }, {
      onError: (err) => {
        const apiErr = err as ApiError;
        setRoleError(apiErr.message || 'Failed to update member role.');
      }
    });
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900">Team members</h2>
          {hasManagePermission && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setShowAssignTeamModal(true); setTeamAssignError(null); setTeamAssignSuccess(null); }}
                className="px-3 py-1.5 bg-white text-gray-700 border border-gray-300 text-xs font-medium rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Assign Team
              </button>
              {!showAddForm && (
                <button
                  type="button"
                  onClick={() => { setShowAddForm(true); setAddError(null); }}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Add member
                </button>
              )}
            </div>
          )}
        </div>

        {/* Team assign banners */}
        {teamAssignSuccess && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded" role="alert">
            {teamAssignSuccess}
          </div>
        )}
        {teamAssignError && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded" role="alert">
            {teamAssignError}
          </div>
        )}

        {/* Global role error banner */}
        {roleError && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded" role="alert">
            {roleError}
          </div>
        )}

        {/* Remove error banner */}
        {removeError && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded" role="alert">
            {removeError}
          </div>
        )}

        {/* Add member form */}
        {showAddForm && (
          <div className="px-6 pt-4">
            <form onSubmit={handleAddMember} className="space-y-3">
              {addError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded" role="alert">
                  {addError}
                </div>
              )}
              <div>
                <label htmlFor="add-member-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="add-member-email"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. user@example.com"
                  autoFocus
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-400">
                  New members are added as <strong>members</strong> by default.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addMutation.isPending ? 'Adding...' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setAddError(null); setEmailInput(''); }}
                  disabled={addMutation.isPending}
                  className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Member list */}
        <div className="p-6">
          {(!members || members.length === 0) ? (
            <p className="text-sm text-gray-500">No members added yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100" role="list">
              {members.map((member) => {
                const canManageThisRole = canManageTargetRole(currentUserRole, member.role);
                const isPendingUpdate = updateRoleMutation.isPending && updateRoleMutation.variables?.userId === member.user.id;

                return (
                  <li key={member.user.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => setSelectedUser(member.user)}
                        className="flex items-center gap-3 text-left hover:bg-gray-50 rounded-md p-1 transition-colors"
                      >
                        {member.user.avatarUrl ? (
                          <img src={member.user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                            {member.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate hover:text-blue-600 transition-colors flex items-center gap-1">
                            {member.user.name}
                            {member.user.accountType === 'company' && (
                              <span className="text-blue-500" title="Verified Company Account">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                            {member.role === 'owner' && (
                              <span className="text-yellow-500" title="Project Owner / Creator">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{member.user.email}</p>
                        </div>
                      </button>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* Role selection/display */}
                      {canManageThisRole ? (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member, e.target.value)}
                          disabled={isPendingUpdate}
                          className="block w-28 text-xs border-gray-300 py-1.5 pl-3 pr-8 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Change role for ${member.user.name}`}
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-800">
                          {member.role}
                        </span>
                      )}

                      {/* Remove button */}
                      {canManageThisRole && member.user.id !== ownerId && (
                        <button
                          onClick={() => setConfirmRemove(member)}
                          disabled={removeMutation.isPending || isPendingUpdate}
                          className="text-xs text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600 shrink-0"
                          aria-label={`Remove ${member.user.name} from project`}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Remove confirmation dialog */}
      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true" aria-labelledby="remove-member-dialog-title">
          <div className="bg-white border border-gray-200 rounded shadow-lg p-6 max-w-sm w-full mx-4">
            <h2 id="remove-member-dialog-title" className="text-lg font-medium text-gray-900">Remove member</h2>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to remove <strong>{confirmRemove.user.name}</strong> from this project?
            </p>
            <div className="mt-4 flex items-center gap-3 justify-end">
              <button
                onClick={() => setConfirmRemove(null)}
                disabled={removeMutation.isPending}
                className="px-3 py-1.5 bg-white text-gray-700 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveMember}
                disabled={removeMutation.isPending}
                className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {removeMutation.isPending ? 'Removing...' : 'Remove member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Team Modal */}
      {showAssignTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
          <div className="bg-white border border-gray-200 rounded shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-medium text-gray-900">Assign Global Team</h2>
            <p className="mt-1 text-sm text-gray-500">
              Bulk-assign all members of a global team or workspace to this project.
            </p>

            {(!globalTeams || globalTeams.length === 0) ? (
              <div className="mt-4 p-4 bg-gray-50 rounded border text-center text-sm text-gray-500">
                You do not have any global teams created yet. You can create one in the <strong className="text-gray-900">Team</strong> section.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="select-team-assign" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Team
                  </label>
                  <select
                    id="select-team-assign"
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Choose a team --</option>
                    {globalTeams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name} ({team.members.length + 1} members)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setShowAssignTeamModal(false); setSelectedTeamId(''); }}
                disabled={assignTeamMutation.isPending}
                className="px-3 py-1.5 bg-white text-gray-700 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!selectedTeamId) return;
                  setTeamAssignError(null);
                  setTeamAssignSuccess(null);
                  try {
                    await assignTeamMutation.mutateAsync(selectedTeamId);
                    setTeamAssignSuccess('Team members successfully assigned to the project.');
                    setShowAssignTeamModal(false);
                    setSelectedTeamId('');
                  } catch (err: any) {
                    setTeamAssignError(err.message || 'Failed to assign team.');
                  }
                }}
                disabled={!selectedTeamId || assignTeamMutation.isPending}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {assignTeamMutation.isPending ? 'Assigning...' : 'Assign Team'}
              </button>
            </div>
          </div>
        </div>
      )}

      <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
    </>
  );
}
