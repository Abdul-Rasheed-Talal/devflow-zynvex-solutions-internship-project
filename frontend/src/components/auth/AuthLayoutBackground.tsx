import React from 'react';

export default function AuthLayoutBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gray-50 text-gray-900 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* Wireframe App Background */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block bg-gray-50 overflow-hidden">
        {/* Fake Header */}
        <div className="absolute top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center px-6 z-0">
          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
            <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
          </div>
          <div className="ml-6 w-48 h-4 bg-gray-200 rounded"></div>
          <div className="ml-auto flex gap-4 items-center">
             <div className="w-44 h-7 bg-gray-100 border border-gray-200 rounded px-3 flex items-center">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <div className="w-16 h-2 bg-gray-200 ml-2 rounded"></div>
             </div>
             <div className="w-7 h-7 bg-gray-200 rounded-full"></div>
             <div className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white shadow-sm"></div>
          </div>
        </div>
        
        {/* Fake Sidebar */}
        <div className="absolute top-14 left-0 bottom-0 w-64 bg-gray-50 border-r border-gray-200 py-6 px-4 flex flex-col gap-2 z-0">
          <div className="w-full h-9 bg-blue-50 text-blue-600 rounded flex items-center px-3 border border-blue-100">
            <div className="w-4 h-4 bg-blue-300 rounded-sm"></div>
            <div className="ml-3 w-2/3 h-2.5 bg-blue-400 rounded"></div>
          </div>
          <div className="w-full h-9 flex items-center px-3">
            <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
            <div className="ml-3 w-1/2 h-2.5 bg-gray-300 rounded"></div>
          </div>
          <div className="w-full h-9 flex items-center px-3">
            <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
            <div className="ml-3 w-3/4 h-2.5 bg-gray-300 rounded"></div>
          </div>
          <div className="w-full h-9 flex items-center px-3">
            <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
            <div className="ml-3 w-2/3 h-2.5 bg-gray-300 rounded"></div>
          </div>
          
          <div className="mt-6 mb-1 px-3">
             <div className="w-1/3 h-2 bg-gray-300 rounded"></div>
          </div>
          <div className="w-full h-8 flex items-center px-3">
            <div className="w-full h-2.5 bg-gray-200 rounded"></div>
          </div>
          <div className="w-full h-8 flex items-center px-3">
            <div className="w-4/5 h-2.5 bg-gray-200 rounded"></div>
          </div>
        </div>
        
        {/* Fake Dashboard Grid (Kanban style spanning full width & height) */}
        <div className="absolute top-14 left-64 right-0 bottom-0 p-8 flex gap-6 overflow-hidden z-0 bg-gray-100/30">
          
          {/* Column 1: To Do */}
          <div className="w-[280px] shrink-0 bg-gray-100/80 rounded-lg p-3 flex flex-col gap-3 border border-gray-200 shadow-sm h-full">
             <div className="flex justify-between items-center mb-1 px-1">
               <div className="w-20 h-3 bg-gray-400 rounded"></div>
               <div className="w-5 h-4 bg-gray-300 rounded"></div>
             </div>
             
             {/* Card 1 */}
             <div className="w-full bg-white rounded shadow-sm border border-gray-200 p-4 flex flex-col gap-3">
               <div className="w-12 h-1.5 bg-blue-300 rounded-full"></div>
               <div className="space-y-1.5">
                 <div className="w-full h-2.5 bg-gray-400 rounded"></div>
                 <div className="w-5/6 h-2.5 bg-gray-400 rounded"></div>
               </div>
               <div className="mt-2 flex justify-between items-end">
                  <div className="w-16 h-2 bg-gray-200 rounded"></div>
                  <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"></div>
               </div>
             </div>
             
             {/* Card 2 */}
             <div className="w-full bg-white rounded shadow-sm border border-gray-200 p-4 flex flex-col gap-3">
               <div className="flex gap-1.5">
                  <div className="w-10 h-1.5 bg-purple-300 rounded-full"></div>
                  <div className="w-12 h-1.5 bg-emerald-300 rounded-full"></div>
               </div>
               <div className="space-y-1.5">
                 <div className="w-full h-2.5 bg-gray-400 rounded"></div>
                 <div className="w-3/4 h-2.5 bg-gray-400 rounded"></div>
               </div>
               <div className="mt-2 flex justify-between items-end">
                  <div className="w-12 h-2 bg-gray-200 rounded"></div>
                  <div className="flex -space-x-2">
                     <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white z-10"></div>
                     <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white z-0"></div>
                  </div>
               </div>
             </div>
             {/* Card 3 */}
             <div className="w-full bg-white rounded shadow-sm border border-gray-200 p-4 flex flex-col gap-3 opacity-60">
               <div className="space-y-1.5">
                 <div className="w-full h-2.5 bg-gray-300 rounded"></div>
                 <div className="w-1/2 h-2.5 bg-gray-300 rounded"></div>
               </div>
             </div>
          </div>
          
          {/* Column 2: In Progress */}
          <div className="w-[280px] shrink-0 bg-gray-100/80 rounded-lg p-3 flex flex-col gap-3 border border-gray-200 shadow-sm h-full">
             <div className="flex justify-between items-center mb-1 px-1">
               <div className="w-24 h-3 bg-gray-400 rounded"></div>
               <div className="w-5 h-4 bg-gray-300 rounded"></div>
             </div>
             
             {/* Card 3 */}
             <div className="w-full bg-white rounded shadow-md border-l-2 border-blue-500 border-y border-r border-gray-200 p-4 flex flex-col gap-3">
               <div className="w-14 h-1.5 bg-amber-300 rounded-full"></div>
               <div className="space-y-1.5">
                 <div className="w-full h-2.5 bg-gray-500 rounded"></div>
                 <div className="w-2/3 h-2.5 bg-gray-500 rounded"></div>
               </div>
               <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
                  <div className="w-1/2 bg-blue-500 h-1.5 rounded-full"></div>
               </div>
               <div className="mt-1 flex justify-between items-end">
                  <div className="w-10 h-2 bg-gray-200 rounded"></div>
                  <div className="w-6 h-6 rounded-full bg-blue-200 border-2 border-white"></div>
               </div>
             </div>
             
             {/* Card 4 */}
             <div className="w-full bg-white rounded shadow-sm border border-gray-200 p-4 flex flex-col gap-3 opacity-75">
               <div className="w-12 h-1.5 bg-emerald-300 rounded-full"></div>
               <div className="space-y-1.5">
                 <div className="w-4/5 h-2.5 bg-gray-400 rounded"></div>
               </div>
               <div className="mt-2 flex justify-between items-end">
                  <div className="w-12 h-2 bg-gray-200 rounded"></div>
                  <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"></div>
               </div>
             </div>
             {/* Card 6 */}
             <div className="w-full bg-white rounded shadow-sm border border-gray-200 p-4 flex flex-col gap-3 opacity-60">
               <div className="space-y-1.5">
                 <div className="w-5/6 h-2.5 bg-gray-300 rounded"></div>
                 <div className="w-2/3 h-2.5 bg-gray-300 rounded"></div>
               </div>
             </div>
          </div>
          
          {/* Column 3: Review */}
          <div className="w-[280px] shrink-0 bg-gray-100/80 rounded-lg p-3 flex flex-col gap-3 border border-gray-200 shadow-sm h-full">
             <div className="flex justify-between items-center mb-1 px-1">
               <div className="w-16 h-3 bg-gray-400 rounded"></div>
               <div className="w-5 h-4 bg-gray-300 rounded"></div>
             </div>
             
             {/* Card 5 */}
             <div className="w-full bg-white rounded shadow-sm border border-gray-200 p-4 flex flex-col gap-3">
               <div className="w-16 h-1.5 bg-rose-300 rounded-full"></div>
               <div className="space-y-1.5">
                 <div className="w-full h-2.5 bg-gray-400 rounded"></div>
                 <div className="w-1/2 h-2.5 bg-gray-400 rounded"></div>
               </div>
               <div className="mt-2 flex justify-between items-end">
                  <div className="flex gap-2">
                     <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
                     <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
                  </div>
                  <div className="flex -space-x-2">
                     <div className="w-6 h-6 rounded-full bg-emerald-200 border-2 border-white z-20"></div>
                     <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white z-10"></div>
                     <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white z-0 flex items-center justify-center text-[8px] text-gray-500 font-bold">+1</div>
                  </div>
               </div>
             </div>
             {/* Card 8 */}
             <div className="w-full bg-white rounded shadow-sm border border-gray-200 p-4 flex flex-col gap-3 opacity-60">
               <div className="w-10 h-1.5 bg-blue-300 rounded-full"></div>
               <div className="space-y-1.5">
                 <div className="w-full h-2.5 bg-gray-300 rounded"></div>
               </div>
             </div>
          </div>

          {/* Column 4: Done */}
          <div className="w-[280px] shrink-0 bg-gray-100/80 rounded-lg p-3 flex flex-col gap-3 border border-gray-200 shadow-sm h-full opacity-70">
             <div className="flex justify-between items-center mb-1 px-1">
               <div className="w-16 h-3 bg-gray-400 rounded"></div>
               <div className="w-5 h-4 bg-gray-300 rounded"></div>
             </div>
             {/* Card 6 */}
             <div className="w-full bg-white rounded shadow-sm border border-gray-200 p-4 flex flex-col gap-3">
               <div className="space-y-1.5">
                 <div className="w-full h-2.5 bg-gray-300 rounded line-through"></div>
                 <div className="w-2/3 h-2.5 bg-gray-300 rounded line-through"></div>
               </div>
             </div>
             {/* Card 10 */}
             <div className="w-full bg-white rounded shadow-sm border border-gray-200 p-4 flex flex-col gap-3">
               <div className="space-y-1.5">
                 <div className="w-full h-2.5 bg-gray-300 rounded line-through"></div>
                 <div className="w-4/5 h-2.5 bg-gray-300 rounded line-through"></div>
               </div>
             </div>
             {/* Card 11 */}
             <div className="w-full bg-white rounded shadow-sm border border-gray-200 p-4 flex flex-col gap-3">
               <div className="space-y-1.5">
                 <div className="w-3/4 h-2.5 bg-gray-300 rounded line-through"></div>
               </div>
             </div>
          </div>
          
          {/* Column 5: Archived (Partially visible) */}
          <div className="w-[280px] shrink-0 bg-gray-100/80 rounded-lg p-3 flex flex-col gap-3 border border-gray-200 shadow-sm h-full opacity-40">
             <div className="flex justify-between items-center mb-1 px-1">
               <div className="w-20 h-3 bg-gray-400 rounded"></div>
               <div className="w-5 h-4 bg-gray-300 rounded"></div>
             </div>
             <div className="w-full bg-white rounded shadow-sm border border-gray-200 p-4 flex flex-col gap-3">
               <div className="space-y-1.5">
                 <div className="w-full h-2.5 bg-gray-300 rounded line-through"></div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Blur & Dark Overlay (Creates the modal focus effect) */}
      <div className="absolute inset-0 backdrop-blur-[4px] bg-slate-900/40 pointer-events-none hidden sm:block z-0"></div>

      {/* Foreground Form Container */}
      <div className="relative max-w-md w-full bg-white p-8 shadow-2xl rounded-2xl z-10">
        {children}
      </div>
    </div>
  );
}
