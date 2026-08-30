import { useState } from 'react';
import { useProjectMembers, useAddMember, useRemoveMember } from '../../hooks/useProjectQueries';
import type { ProjectMember } from '../../types/project';
import type { ApiError } from '../../types/auth';

interface ProjectMembersProps {
  projectId: string;
  isOwner: boolean;
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
  if (status === 403) return 'Only the project owner can manage membership.';
  if (status === 401) return 'Your session has expired. Please log in again.';
  return err.message || 'Failed to add member. Please try again.';
}

function getRemoveMemberErrorMessage(err: ApiError): string {
  const status = err.status;
  if (status === 404) return 'User is not a member of this project.';
  if (status === 400) return err.message || 'Cannot perform this operation.';
  if (status === 403) return 'Only the project owner can manage membership.';
  if (status === 401) return 'Your session has expired. Please log in again.';
  return err.message || 'Failed to remove member. Please try again.';
}

export default function ProjectMembers({ projectId, isOwner, ownerId }: ProjectMembersProps) {
  const { data: members, isLoading, error: fetchError } = useProjectMembers(projectId, isOwner);
  const addMutation = useAddMember(projectId);
  const removeMutation = useRemoveMember(projectId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [userIdInput, setUserIdInput] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<ProjectMember | null>(null);

  // Non-owner: just show a brief note that membership is managed by the owner
  if (!isOwner) {
    return (
      <div className="bg-white border border-gray-200 rounded">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-900">Team members</h2>
        </div>
        <div className="p-6 text-sm text-gray-500">
          Team membership is managed by the project owner.
        </div>
      </div>
    );
  }

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

    const trimmed = userIdInput.trim();
    if (!trimmed) {
      setAddError('Please enter a user ID.');
      return;
    }

    // Basic ObjectId format check (24 hex characters)
    if (!/^[a-f0-9]{24}$/i.test(trimmed)) {
      setAddError('Invalid user ID format. A user ID is a 24-character hexadecimal string.');
      return;
    }

    addMutation.mutate({ userId: trimmed }, {
      onSuccess: () => {
        setUserIdInput('');
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

    removeMutation.mutate(confirmRemove.id, {
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

  return (
    <>
      <div className="bg-white border border-gray-200 rounded">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900">Team members</h2>
          {!showAddForm && (
            <button
              onClick={() => { setShowAddForm(true); setAddError(null); }}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add member
            </button>
          )}
        </div>

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
                <label htmlFor="add-member-user-id" className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <input
                  id="add-member-user-id"
                  type="text"
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                  placeholder="e.g. 507f1f77bcf86cd799439011"
                  autoFocus
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Enter the user's ID to add them to this project. User IDs can be found in the DevFlow admin or shared by team members.
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
                  onClick={() => { setShowAddForm(false); setAddError(null); setUserIdInput(''); }}
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
              {members.map((member) => (
                <li key={member.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                      <p className="text-xs text-gray-500 truncate">{member.email}</p>
                    </div>
                  </div>
                  {/* Remove button: never shown for the owner */}
                  {member.id !== ownerId && (
                    <button
                      onClick={() => setConfirmRemove(member)}
                      disabled={removeMutation.isPending}
                      className="text-xs text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600 shrink-0"
                      aria-label={`Remove ${member.name} from project`}
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
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
              Are you sure you want to remove <strong>{confirmRemove.name}</strong> from this project?
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
    </>
  );
}
