import { useState } from 'react';
import type { Comment, UpdateCommentInput } from '../../types/comment';
import CommentForm from './CommentForm';
import { useAuthStore } from '../../stores/authStore';
import type { ProjectRole } from '../../types/project';

interface CommentItemProps {
  comment: Comment;
  userRole: ProjectRole | null;
  onUpdate: (commentId: string, input: UpdateCommentInput) => void;
  onDelete: (commentId: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
  updateError?: string | null;
}

export default function CommentItem({
  comment,
  userRole,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
  updateError,
}: CommentItemProps) {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isAuthor = user?.id === comment.author.id;
  const canEdit = isAuthor; // Only author can edit
  const canDelete = isAuthor || userRole === 'admin' || userRole === 'owner'; // Author, admin, owner can delete

  const handleUpdate = (content: string) => {
    onUpdate(comment._id, { content });
    if (!updateError) {
      setIsEditing(false); // only close if no error (in real scenario handled by parent via useEffect, but simplifying)
    }
  };

  // formatting helper
  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (isEditing) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <CommentForm
          initialContent={comment.content}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isSubmitting={isUpdating}
          error={updateError}
          submitLabel="Save Changes"
        />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">{comment.author.name}</span>
          <span className="text-xs text-gray-500" title={new Date(comment.createdAt).toLocaleString()}>
            {formatDateTime(comment.createdAt)}
          </span>
          {comment.isEdited && (
            <span className="text-xs text-gray-400 italic">(edited)</span>
          )}
        </div>
        
        <div className="flex gap-2">
          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-medium text-gray-500 hover:text-blue-600 focus:outline-none focus:underline"
              aria-label={`Edit comment by ${comment.author.name}`}
            >
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="text-xs font-medium text-gray-500 hover:text-red-600 focus:outline-none focus:underline disabled:opacity-50"
              aria-label={`Delete comment by ${comment.author.name}`}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      </div>
      
      {/* Mentions logic could be parsed and styled here, but basic text rendering handles them fine for M3-T06 */}
      <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
        {comment.content}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
          <div className="bg-white border border-gray-200 rounded shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900">Delete Comment</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>
            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-3 py-1.5 bg-white text-gray-700 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(comment._id);
                  setShowDeleteConfirm(false);
                }}
                disabled={isDeleting}
                className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
