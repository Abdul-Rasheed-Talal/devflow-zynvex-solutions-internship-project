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
}

export default function KanbanColumn({ status, tasks, onTaskClick, onStatusChange, onDrop }: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const statusInfo = TASK_STATUSES.find(s => s.value === status);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onDrop(taskId, status);
    }
  };

  return (
    <div 
      className={`flex flex-col rounded-lg p-3 min-w-[280px] sm:min-w-[320px] w-full transition-colors duration-200 h-full min-h-[500px] shrink-0
        ${isDragOver ? 'bg-gray-100 ring-2 ring-blue-400 border-transparent' : 'bg-gray-50 border border-gray-200'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex justify-between items-center mb-3 px-1">
        <h3 className="font-semibold text-gray-700">{statusInfo?.label || status}</h3>
        <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
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
          />
        ))}
        
        {tasks.length === 0 && (
          <div className={`flex-grow border-2 border-dashed rounded flex items-center justify-center p-4 transition-colors ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}>
            <p className="text-sm text-gray-400 pointer-events-none">Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
}
