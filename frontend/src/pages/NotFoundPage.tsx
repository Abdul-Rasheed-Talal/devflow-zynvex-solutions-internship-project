import { Link } from 'react-router-dom';

/**
 * 404 page for unmatched routes.
 */
export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-6xl font-semibold text-neutral-300">404</p>
        <h1 className="mt-4 text-xl font-semibold text-neutral-900">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          The page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
