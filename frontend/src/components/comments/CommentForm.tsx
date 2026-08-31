import { useState } from 'react';

interface CommentFormProps {
  initialContent?: string;
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  isSubmitting: boolean;
  error?: string | null;
  placeholder?: string;
  submitLabel?: string;
}

export default function CommentForm({
  initialContent = '',
  onSubmit,
  onCancel,
  isSubmitting,
  error,
  placeholder = 'Write a comment...',
  submitLabel = 'Comment',
}: CommentFormProps) {
  const [content, setContent] = useState(initialContent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content);
    if (!initialContent) {
      setContent(''); // clear after submit only if it's a new comment form
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm" role="alert">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="comment-content" className="sr-only">
          Comment content
        </label>
        <textarea
          id="comment-content"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          disabled={isSubmitting}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-3 py-1.5 bg-white text-gray-700 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
