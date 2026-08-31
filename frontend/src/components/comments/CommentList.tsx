import { useState, useEffect } from 'react';
import { useTaskComments, useCreateComment, useUpdateComment, useDeleteComment } from '../../hooks/useCommentQueries';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import type { ProjectRole } from '../../types/project';
import type { ApiError } from '../../types/auth';

interface CommentListProps {
  taskId: string;
  userRole: ProjectRole | null;
}

export default function CommentList({ taskId, userRole }: CommentListProps) {
  const { data: comments, isLoading, error } = useTaskComments(taskId);
  const createMutation = useCreateComment(taskId);
  const updateMutation = useUpdateComment(taskId);
  const deleteMutation = useDeleteComment(taskId);

  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    setCreateError(null);
  }, [taskId]);

  const canCreate = userRole === 'owner' || userRole === 'admin' || userRole === 'member';

  const handleCreate = (content: string) => {
    setCreateError(null);
    createMutation.mutate(
      { content },
      {
        onError: (err) => {
          const apiErr = err as ApiError;
          setCreateError(apiErr.message || 'Failed to post comment.');
        },
      }
    );
  };

  const handleUpdate = (commentId: string, input: any) => {
    updateMutation.mutate({ commentId, input });
  };

  const handleDelete = (commentId: string) => {
    deleteMutation.mutate(commentId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-24 bg-gray-100 rounded animate-pulse" />
        <div className="h-24 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  if (error) {
    const apiErr = error as ApiError;
    return (
      <div className="bg-white border border-gray-200 rounded p-6 text-center">
        <p className="text-sm text-red-600">
          {apiErr.status === 403 ? 'You do not have permission to view comments.' : 'Failed to load comments.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Comments</h3>

      {canCreate && (
        <CommentForm
          onSubmit={handleCreate}
          isSubmitting={createMutation.isPending}
          error={createError}
        />
      )}

      {!canCreate && (
        <p className="text-sm text-gray-500 italic">
          You do not have permission to post comments on this task.
        </p>
      )}

      <div className="space-y-4">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              userRole={userRole}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              isUpdating={updateMutation.isPending && updateMutation.variables?.commentId === comment._id}
              isDeleting={deleteMutation.isPending && deleteMutation.variables === comment._id}
            />
          ))
        ) : (
          <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
            No comments yet. {canCreate && 'Be the first to share your thoughts!'}
          </div>
        )}
      </div>
    </div>
  );
}
