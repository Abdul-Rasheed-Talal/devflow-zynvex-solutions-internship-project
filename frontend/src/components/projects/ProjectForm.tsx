import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGitHubRepos } from '../../hooks/useGitHubQueries';
import { useTeamWorkspaces } from '../../hooks/useTeamWorkspaceQueries';
import { useAuthStore } from '../../stores/authStore';
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
  const { user } = useAuthStore();
  
  const isEdit = !!project;

  const [formData, setFormData] = useState({
    name: project?.name ?? '',
    description: project?.description ?? '',
    status: project?.status ?? ('planning' as ProjectStatus),
    priority: project?.priority ?? ('medium' as ProjectPriority),
    startDate: project?.startDate?.split('T')[0] ?? '',
    dueDate: project?.dueDate?.split('T')[0] ?? '',
    githubRepo: project?.githubRepo ?? '',
    teamId: '',
  });

  const [showRepoModal, setShowRepoModal] = useState(false);
  const { data: reposData, isLoading: isLoadingRepos, error: repoError } = useGitHubRepos();
  const { data: globalTeams } = useTeamWorkspaces();
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    // Client-side validation
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setValidationError('Project name is required.');
      return;
    }
    if (trimmedName.length > 100) {
      setValidationError('Project name must not exceed 100 characters.');
      return;
    }
    if (formData.description.length > 1000) {
      setValidationError('Description must not exceed 1000 characters.');
      return;
    }
    if (formData.startDate && formData.dueDate && new Date(formData.dueDate) < new Date(formData.startDate)) {
      setValidationError('Due date cannot be earlier than start date.');
      return;
    }

    const data: CreateProjectInput | UpdateProjectInput = {
      name: trimmedName,
      description: formData.description.trim() || undefined,
      status: formData.status,
      priority: formData.priority,
      startDate: formData.startDate || undefined,
      dueDate: formData.dueDate || undefined,
      githubRepo: formData.githubRepo.trim() || undefined,
      teamId: formData.teamId || undefined,
    };

    onSubmit(data);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRepoSelect = (repo: any) => {
    setFormData((prev) => ({
      ...prev,
      name: repo.name,
      description: repo.description || '',
      githubRepo: repo.full_name,
    }));
    setShowRepoModal(false);
  };

  const displayError = validationError || error;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {displayError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded" role="alert">
            {displayError}
          </div>
        )}

        {/* GitHub Import */}
        {!isEdit && (
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded border border-gray-200">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-gray-900">Import from GitHub</h4>
                {user?.subscriptionPlan !== 'pro' && (
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">Pro</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Auto-fill project details and enable live syncing</p>
            </div>
            {user?.subscriptionPlan === 'pro' ? (
              <button
                type="button"
                onClick={() => setShowRepoModal(true)}
                className="px-3 py-1.5 bg-white text-gray-700 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Select Repository
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/app/upgrade')}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        )}

        {/* Name */}
        <div>
          <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-1">
            Project name *
          </label>
          <input
            id="project-name"
            type="text"
            required
            maxLength={100}
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. Website Redesign"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="project-desc" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="project-desc"
            rows={3}
            maxLength={1000}
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="What is this project about?"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <label htmlFor="project-status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="project-status"
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as ProjectStatus }))}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {PROJECT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
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
              value={formData.priority}
              onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value as ProjectPriority }))}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {PROJECT_PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
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
              value={formData.startDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
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
              value={formData.dueDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
              min={formData.startDate || undefined}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Global Team Pre-assignment (New projects only) */}
        {!isEdit && globalTeams && globalTeams.length > 0 && (
          <div>
            <label htmlFor="project-team" className="block text-sm font-medium text-gray-700 mb-1">
              Assign Global Team (Optional)
            </label>
            <select
              id="project-team"
              value={formData.teamId}
              onChange={(e) => setFormData((prev) => ({ ...prev, teamId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">-- No team (assign members manually later) --</option>
              {globalTeams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.members.length + 1} members)
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Members of the selected team will automatically be added as project collaborators.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save changes' : 'Create project')}
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

      {showRepoModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowRepoModal(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Select a Repository</h3>
                
                {!user?.githubUsername ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-4">You need to connect your GitHub account first.</p>
                    <button
                      onClick={() => {
                        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
                        if (clientId) window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo user:email`;
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800"
                    >
                      Connect GitHub
                    </button>
                  </div>
                ) : isLoadingRepos ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : repoError ? (
                  <div className="text-red-600 text-sm py-4">Failed to load repositories. You may need to reconnect GitHub.</div>
                ) : reposData?.data?.length === 0 ? (
                  <div className="text-gray-500 text-sm py-4">No repositories found.</div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                      {reposData?.data.map((repo) => (
                        <li 
                          key={repo.id} 
                          className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                          onClick={() => handleRepoSelect(repo)}
                        >
                          <div>
                            <p className="text-sm font-medium text-blue-600">{repo.full_name}</p>
                            {repo.description && <p className="text-xs text-gray-500 mt-1">{repo.description}</p>}
                          </div>
                          {repo.private && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Private</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowRepoModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
