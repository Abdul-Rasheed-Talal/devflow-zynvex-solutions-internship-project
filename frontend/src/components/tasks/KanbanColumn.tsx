import React, { useState } from 'react';
import type { Task, TaskStatus } from '../../types/task';
import { TASK_STATUSES } from '../../types/task';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDrop: (taskId: string, status: TaskStatus) => void;
  readOnly?: boolean;
}

export default function KanbanColumn({ status, tasks, onTaskClick, onStatusChange, onDrop, readOnly = false }: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const statusInfo = TASK_STATUSES.find(s => s.value === status);
  
  const handleDragOver = (e: React.DragEvent) => {
    if (readOnly) return;
    e.preventDefault(); // allow drop
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (readOnly) return;
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (readOnly) return;
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onDrop(taskId, status);
    }
  };

  return (
    <div 
      className={`flex flex-col rounded-xl p-3 w-full transition-colors duration-200 h-full min-h-[500px] shrink-0
        ${isDragOver ? 'bg-blue-50/50 ring-2 ring-blue-400 border-transparent' : 'bg-gray-100/80 border border-gray-200/50'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="font-semibold text-gray-800 text-sm tracking-wide">{statusInfo?.label || status}</h3>
        <span className="bg-white text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full border border-gray-200 shadow-sm">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 flex-grow">
        {tasks.map(task => (
          <TaskCard 
            key={task._id} 
            task={task} 
            onClick={onTaskClick}
            onStatusChange={onStatusChange}
            readOnly={readOnly}
          />
        ))}
        
        {/* Invisible drop zone when empty so the whole column is a valid drop target */}
        {tasks.length === 0 && (
          <div className="flex-grow flex flex-col items-center justify-center pointer-events-none opacity-50">
            {isDragOver ? (
              <p className="text-sm font-medium text-blue-500">Drop task here</p>
            ) : (
              <p className="text-xs font-medium text-gray-400">No tasks</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
