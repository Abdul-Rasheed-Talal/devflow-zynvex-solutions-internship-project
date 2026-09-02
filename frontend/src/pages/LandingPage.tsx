import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="bg-gray-50 font-sans text-gray-900 min-h-screen relative">
      {/* Clean Subtle Grid Pattern Background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-40" 
        style={{ backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      ></div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold tracking-tight text-blue-600">DevFlow</span>
            </div>
            <nav className="flex space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium shadow-sm transition-colors"
              >
                Start for free
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
          <h1 className="text-5xl tracking-tight font-extrabold text-gray-900 sm:text-6xl md:text-7xl">
            <span className="block xl:inline">Project management for</span>{' '}
            <span className="block text-blue-600 xl:inline">software teams</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-500 sm:text-xl md:mt-8">
            DevFlow is the definitive AI-powered platform to track issues, manage tasks, and synchronize with GitHub. Built for developers, designed for speed.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3 border border-transparent text-base font-medium rounded text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 shadow-sm transition-colors"
            >
              Get Started
            </Link>
            <a
              href="#pricing"
              className="px-8 py-3 border border-gray-300 text-base font-medium rounded text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 shadow-sm transition-colors"
            >
              View Pricing
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-white py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need to ship faster
              </p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <div className="pt-6">
                  <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8 border border-gray-100 shadow-sm h-full">
                    <div className="-mt-6">
                      <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-md shadow-lg">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Advanced Task Tracking</h3>
                      <p className="mt-5 text-base text-gray-500">
                        Organize your workflow with Kanban boards, priorities, and detailed task assignments.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8 border border-gray-100 shadow-sm h-full">
                    <div className="-mt-6">
                      <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-md shadow-lg">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">AI Project Health Tracker</h3>
                      <p className="mt-5 text-base text-gray-500">
                        Gemini AI automatically analyzes your project activity and provides actionable health insights.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8 border border-gray-100 shadow-sm h-full">
                    <div className="-mt-6">
                      <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-md shadow-lg">
                        <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z" />
                        </svg>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">GitHub Live Sync</h3>
                      <p className="mt-5 text-base text-gray-500">
                        Import repositories with 1-click. View open issues and PRs directly in your project dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="bg-gray-100 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              No hidden fees. Free forever for individuals, powerful tools for teams.
            </p>
          </div>
          
          <div className="max-w-7xl mx-auto mt-16 px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 lg:max-w-4xl">
            {/* Basic Tier */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col h-full">
              <div className="p-8 border-b border-gray-200 flex-1">
                <h3 className="text-2xl font-semibold text-gray-900">Basic</h3>
                <p className="mt-4 flex items-baseline text-5xl font-extrabold text-gray-900">
                  $0
                  <span className="ml-1 text-xl font-medium text-gray-500">/mo</span>
                </p>
                <p className="mt-6 text-gray-500">Perfect for individuals and small side projects.</p>
                <ul className="mt-6 space-y-4">
                  <li className="flex text-gray-700">
                    <span className="text-blue-500 mr-2">✓</span> Up to 3 Active Projects
                  </li>
                  <li className="flex text-gray-700">
                    <span className="text-blue-500 mr-2">✓</span> Basic Task Management
                  </li>
                  <li className="flex text-gray-700">
                    <span className="text-blue-500 mr-2">✓</span> Standard Team Directory
                  </li>
                </ul>
              </div>
              <div className="p-8 bg-gray-50 rounded-b-lg">
                <Link
                  to="/register"
                  className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                >
                  Start for free
                </Link>
              </div>
            </div>

            {/* Pro Tier */}
            <div className="bg-white border-2 border-blue-600 rounded-lg shadow-lg flex flex-col h-full relative">
              <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 rounded-full bg-blue-600 animate-pulse"></div>
              <div className="p-8 border-b border-gray-200 flex-1">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4">Most Popular</span>
                <h3 className="text-2xl font-semibold text-gray-900">Pro</h3>
                <p className="mt-4 flex items-baseline text-5xl font-extrabold text-gray-900">
                  $15
                  <span className="ml-1 text-xl font-medium text-gray-500">/mo</span>
                </p>
                <p className="mt-6 text-gray-500">For professional teams that need advanced capabilities.</p>
                <ul className="mt-6 space-y-4">
                  <li className="flex text-gray-700">
                    <span className="text-blue-500 mr-2">✓</span> Unlimited Projects
                  </li>
                  <li className="flex text-gray-700 font-medium">
                    <span className="text-blue-500 mr-2">✓</span> AI Project Health Tracker
                  </li>
                  <li className="flex text-gray-700 font-medium">
                    <span className="text-blue-500 mr-2">✓</span> Advanced GitHub Integration
                  </li>
                  <li className="flex text-gray-700">
                    <span className="text-blue-500 mr-2">✓</span> Global Analytics Dashboards
                  </li>
                  <li className="flex text-gray-700">
                    <span className="text-blue-500 mr-2">✓</span> Advanced RBAC Profiles
                  </li>
                </ul>
              </div>
              <div className="p-8 bg-gray-50 rounded-b-lg">
                <Link
                  to="/register"
                  className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Upgrade to Pro
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center flex-col sm:flex-row">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} DevFlow. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="text-gray-400 hover:text-gray-500 text-sm">
              Privacy
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500 text-sm">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
