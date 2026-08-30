import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCreateProject } from '../../hooks/useProjectQueries';
import ProjectForm from '../../components/projects/ProjectForm';
import type { CreateProjectInput, UpdateProjectInput } from '../../types/project';
import type { ApiError } from '../../types/auth';

export default function NewProjectPage() {
  const navigate = useNavigate();
  const createMutation = useCreateProject();
  const [apiError, setApiError] = useState<string | null>(null);

  function handleSubmit(data: CreateProjectInput | UpdateProjectInput) {
    setApiError(null);
    createMutation.mutate(data as CreateProjectInput, {
      onSuccess: (response) => {
        navigate(`/app/projects/${response.data._id}`);
      },
      onError: (err) => {
        const apiErr = err as ApiError;
        setApiError(apiErr.message || 'Failed to create project. Please try again.');
      },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Create project</h1>
        <p className="mt-1 text-sm text-gray-500">
          Set up a new project for your team.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded p-6 max-w-2xl">
        <ProjectForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
          error={apiError}
        />
      </div>
    </div>
  );
}
