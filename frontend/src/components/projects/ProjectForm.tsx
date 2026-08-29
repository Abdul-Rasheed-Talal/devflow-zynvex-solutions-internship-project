import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  CreateProjectInput,
  UpdateProjectInput,
  Project,
  ProjectStatus,
  ProjectPriority,
} from '../../types/project';
import { PROJECT_STATUSES, PROJECT_PRIORITIES } from '../../types/project';

interface ProjectFormProps {
  /** If provided, the form operates in edit mode */
  project?: Project;
  onSubmit: (data: CreateProjectInput | UpdateProjectInput) => void;
  isSubmitting: boolean;
  error: string | null;
}

export default function ProjectForm({ project, onSubmit, isSubmitting, error }: ProjectFormProps) {
  const navigate = useNavigate();
  const isEditing = !!project;

  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? 'planning');
  const [priority, setPriority] = useState<ProjectPriority>(project?.priority ?? 'medium');
  const [startDate, setStartDate] = useState(project?.startDate?.split('T')[0] ?? '');
  const [dueDate, setDueDate] = useState(project?.dueDate?.split('T')[0] ?? '');
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    // Client-side validation
    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError('Project name is required.');
      return;
    }
    if (trimmedName.length > 100) {
      setValidationError('Project name must not exceed 100 characters.');
      return;
    }
    if (description.length > 1000) {
      setValidationError('Description must not exceed 1000 characters.');
      return;
    }
    if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
      setValidationError('Due date cannot be earlier than start date.');
      return;
    }

    const data: CreateProjectInput | UpdateProjectInput = {
      name: trimmedName,
      description: description.trim() || undefined,
      status,
      priority,
      startDate: startDate || undefined,
      dueDate: dueDate || undefined,
    };

    onSubmit(data);
  }

  const displayError = validationError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {displayError && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded"
          role="alert"
        >
          {displayError}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-1">
          Project name <span className="text-red-500">*</span>
        </label>
        <input
          id="project-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          required
          autoFocus
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g. DevFlow v2.0"
        />
        <p className="mt-1 text-xs text-gray-400">{name.length}/100</p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="project-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
          placeholder="Brief project description"
        />
        <p className="mt-1 text-xs text-gray-400">{description.length}/1000</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Status */}
        <div>
          <label htmlFor="project-status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="project-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="project-priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="project-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as ProjectPriority)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {PROJECT_PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Start Date */}
        <div>
          <label htmlFor="project-start-date" className="block text-sm font-medium text-gray-700 mb-1">
            Start date
          </label>
          <input
            id="project-start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Due Date */}
        <div>
          <label htmlFor="project-due-date" className="block text-sm font-medium text-gray-700 mb-1">
            Due date
          </label>
          <input
            id="project-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={startDate || undefined}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save changes' : 'Create project')}
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
