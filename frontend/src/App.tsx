import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GitHubCallback from './pages/auth/GitHubCallback';
import ProjectsPage from './pages/projects/ProjectsPage';
import NewProjectPage from './pages/projects/NewProjectPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import ProjectTasksPage from './pages/tasks/ProjectTasksPage';
import SettingsPage from './pages/SettingsPage';
import UpgradePage from './pages/UpgradePage';
import TeamPage from './pages/team/TeamPage';
import AnnouncementsPage from './pages/team/AnnouncementsPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import { useAuthStore } from './stores/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Root */}
          <Route path="/" element={<LandingPage />} />

          {/* Protected Application Routes */}
          <Route path="/app" element={<ProtectedRoute />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/new" element={<NewProjectPage />} />
            <Route path="projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="projects/:projectId/tasks" element={<ProjectTasksPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="upgrade" element={<UpgradePage />} />
          </Route>

          {/* Public Authentication Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/github/callback" element={<GitHubCallback />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
