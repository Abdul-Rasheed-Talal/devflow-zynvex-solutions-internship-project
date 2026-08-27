import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xl font-bold tracking-tight text-gray-900">DevFlow</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        {/* Global decorative background blobs for cohesive page flow */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob pointer-events-none"></div>
        <div className="absolute top-64 -right-4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000 pointer-events-none"></div>

        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            
            {/* Left Column - Text & CTAs */}
            <div className="lg:col-span-6 text-center lg:text-left relative z-10">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:leading-[1.15]">
                Capture, organize, and tackle your work <span className="text-blue-600">from anywhere.</span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto lg:mx-0 text-lg text-gray-500 sm:text-xl">
                Escape the clutter and chaos. Unleash your team's productivity with an AI-powered project management workspace designed for modern developers.
              </p>
              
              <div className="mt-10 sm:flex sm:justify-center lg:justify-start gap-3 max-w-lg mx-auto lg:mx-0">
                <div className="relative flex-1 rounded-md shadow-sm">
                  <input
                    type="email"
                    name="email"
                    id="hero-email"
                    className="block w-full rounded-md border-gray-300 px-4 py-3.5 text-base placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 shadow-sm border bg-white"
                    placeholder="Enter your email address"
                  />
                </div>
                <div className="mt-3 sm:mt-0 shrink-0">
                  <Link
                    to="/register"
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-8 py-3.5 text-base font-medium text-white hover:bg-blue-700 shadow-sm transition-colors"
                  >
                    Sign up - it's free!
                  </Link>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-gray-500 flex flex-col sm:flex-row items-center sm:justify-center lg:justify-start gap-2">
                <p>By signing up, you agree to our Terms and Privacy Policy.</p>
                <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
                <button className="text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                  Watch video
                </button>
              </div>
            </div>

            {/* Right Column - Kanban UI Mockup */}
            <div className="lg:col-span-6 mt-16 lg:mt-0 hidden md:block relative z-10">
              <div className="relative mx-auto w-full max-w-lg">
                <div className="relative rounded-xl bg-white border border-gray-200 shadow-2xl overflow-hidden transform transition-transform hover:scale-[1.02] duration-300">
                  <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="mx-auto bg-white border border-gray-200 rounded text-[10px] font-medium text-gray-500 px-24 py-1">devflow.app/board</div>
                  </div>
                  
                  <div className="bg-gray-100 p-5 h-80 flex gap-4 overflow-hidden">
                    <div className="w-1/3 shrink-0 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">To Do</span>
                        <span className="text-xs text-gray-400 bg-gray-200 px-2 rounded-full">2</span>
                      </div>
                      <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
                        <div className="w-8 h-2 bg-blue-500 rounded mb-2"></div>
                        <div className="h-3 bg-gray-800 rounded w-3/4 mb-2"></div>
                        <div className="h-2 bg-gray-300 rounded w-full mb-3"></div>
                      </div>
                      <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
                        <div className="w-8 h-2 bg-purple-500 rounded mb-2"></div>
                        <div className="h-3 bg-gray-800 rounded w-5/6 mb-3"></div>
                      </div>
                    </div>

                    <div className="w-1/3 shrink-0 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">In Progress</span>
                        <span className="text-xs text-gray-400 bg-gray-200 px-2 rounded-full">1</span>
                      </div>
                      <div className="bg-white p-3 rounded shadow-sm border border-blue-200 ring-1 ring-blue-500/20 transform -rotate-1 scale-105 z-10 transition-transform">
                        <div className="w-8 h-2 bg-emerald-500 rounded mb-2"></div>
                        <div className="h-3 bg-gray-800 rounded w-full mb-2"></div>
                        <div className="h-2 bg-gray-300 rounded w-2/3 mb-3"></div>
                      </div>
                    </div>

                    <div className="w-1/3 shrink-0 flex flex-col gap-3 opacity-60">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Review</span>
                        <span className="text-xs text-gray-400 bg-gray-200 px-2 rounded-full">3</span>
                      </div>
                      <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
                        <div className="w-8 h-2 bg-amber-500 rounded mb-2"></div>
                        <div className="h-3 bg-gray-800 rounded w-full mb-3"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section: AI Project Health */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            
            {/* Left Column - AI UI Mockup */}
            <div className="lg:col-span-6 order-2 lg:order-1 mt-16 lg:mt-0 hidden md:block relative z-10">
              <div className="relative mx-auto w-full max-w-lg">
                <div className="relative rounded-xl bg-white border border-gray-200 shadow-2xl overflow-hidden transform transition-transform hover:-translate-y-1 duration-300">
                  <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      <span className="text-xs font-medium text-gray-700">AI Health Insights</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">System Optimal</span>
                  </div>
                  
                  <div className="p-5 font-mono text-sm space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-purple-700 font-bold text-[10px]">AI</span>
                      </div>
                      <div>
                        <p className="text-gray-700 leading-relaxed">Analyzing sprint velocity and current blockers...</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 shrink-0 border-l-2 border-b-2 border-gray-300 rounded-bl-lg ml-3"></div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 w-full text-xs space-y-2">
                        <div className="flex justify-between text-gray-500">
                          <span>Burn down rate:</span>
                          <span className="text-emerald-600 font-medium">Steady</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                          <span>Blocker risk:</span>
                          <span className="text-amber-600 font-medium">Moderate</span>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-2">
                          <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-full w-[76%]"></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-purple-700 font-bold text-[10px]">AI</span>
                      </div>
                      <div>
                        <p className="text-gray-700 leading-relaxed">Recommendation: Reallocate 1 developer to the Database Migration task to ensure on-time delivery.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Text */}
            <div className="lg:col-span-6 order-1 lg:order-2 text-center lg:text-left relative z-10">
              <h2 className="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl">
                Track project health with <span className="text-purple-600">AI insights.</span>
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                Stop guessing about your team's velocity. DevFlow's built-in AI constantly analyzes your tasks, predicts bottlenecks, and provides actionable recommendations to keep your sprints on track.
              </p>
              <ul className="mt-8 space-y-4 text-left inline-block lg:block">
                <li className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  </div>
                  <span className="text-gray-600 text-sm md:text-base">Automated risk detection and bottleneck alerts.</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  </div>
                  <span className="text-gray-600 text-sm md:text-base">Real-time sprint velocity analysis.</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  </div>
                  <span className="text-gray-600 text-sm md:text-base">Smart resource allocation recommendations.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Feature Grid: Core Capabilities */}
        <section className="relative bg-white border-y border-gray-100 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Everything you need to ship faster</h2>
              <p className="mt-4 text-lg text-gray-500">A complete toolset designed specifically for software engineering teams to manage the entire development lifecycle.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Project Management</h3>
                <p className="text-gray-500 leading-relaxed">Create and organize multiple projects. Keep all related tasks, documents, and team members in one dedicated workspace.</p>
              </div>
              
              <div className="p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 border border-gray-100">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Task Tracking</h3>
                <p className="text-gray-500 leading-relaxed">Break down complex work into manageable tasks. Assign owners, set priorities, and track progress from backlog to completion.</p>
              </div>
              
              <div className="p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 border border-gray-100">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Team Collaboration</h3>
                <p className="text-gray-500 leading-relaxed">Invite team members to your workspace with role-based permissions. Maintain clear visibility over who is working on what.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-20 text-center z-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">Ready to streamline your workflow?</h2>
            <p className="text-lg text-gray-500 mb-10">
              Join teams of developers who use DevFlow to build better software, faster.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-gray-900 hover:bg-black shadow-lg hover:shadow-xl transition-all"
            >
              Create Your Free Account
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xl font-bold tracking-tight text-gray-900">DevFlow</span>
            <span className="text-gray-400 text-sm mt-2">
              &copy; {new Date().getFullYear()} DevFlow. All rights reserved.
            </span>
          </div>
          <div className="flex space-x-8 text-sm font-medium text-gray-500">
            <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <Link to="/login" className="hover:text-gray-900 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-gray-900 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
