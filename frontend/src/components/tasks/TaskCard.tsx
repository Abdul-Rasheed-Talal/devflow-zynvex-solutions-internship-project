import React from 'react';
import type { Task, TaskStatus } from '../../types/task';
import { TASK_STATUSES } from '../../types/task';
import { TaskStatusBadge, TaskPriorityBadge, TaskLabelBadge } from './TaskBadges';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
}

export default function TaskCard({ task, onClick, onStatusChange }: TaskCardProps) {
  const isOverdue = task.dueDate && task.status !== 'done' && new Date(task.dueDate) < new Date();

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task._id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.5';
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    if (onStatusChange) {
      onStatusChange(task._id, e.target.value as TaskStatus);
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return 'border-l-gray-300';
      case 'in_progress': return 'border-l-blue-400';
      case 'review': return 'border-l-purple-400';
      case 'done': return 'border-l-green-400';
      default: return 'border-l-gray-200';
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onClick && onClick(task)}
      className={`bg-white border-y border-r border-l-4 border-y-gray-200 border-r-gray-200 ${getStatusColor(task.status)} rounded-lg p-4 shadow-sm hover:shadow-md transition-all flex flex-col h-full ${onClick ? 'cursor-pointer' : ''} cursor-grab active:cursor-grabbing group`}
    >
      <div className="flex justify-between items-start mb-2 gap-4">
        <div className="flex items-start gap-2">
          {/* Drag Handle Icon - subtle by default, darker on hover */}
          <div className="text-gray-300 group-hover:text-gray-500 transition-colors mt-0.5" title="Drag to move">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4zm6-16a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2" title={task.title}>
            {task.title}
          </h3>
        </div>
        <div className="flex flex-col gap-1 items-end shrink-0">
          <TaskPriorityBadge priority={task.priority} />
        </div>
      </div>
      
      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-grow">
          {task.description}
        </p>
      )}

      {!task.description && <div className="flex-grow"></div>}

      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.map((label, idx) => (
            <TaskLabelBadge key={`${label}-${idx}`} label={label} />
          ))}
        </div>
      )}

      {task.dueDate && (
        <div className={`text-xs mb-3 flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span title={isOverdue ? 'Overdue' : 'Due date'}>
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            {isOverdue && ' (Overdue)'}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
        {onStatusChange ? (
          <select
            value={task.status}
            onChange={handleStatusChange}
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-medium bg-gray-50 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-full px-2 py-1 pr-6 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
            style={{
               backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
               backgroundPosition: `right 0.2rem center`,
               backgroundRepeat: `no-repeat`,
               backgroundSize: `1.2em 1.2em`
            }}
          >
            {TASK_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        ) : (
          <TaskStatusBadge status={task.status} />
        )}
        
        {task.assignee ? (
          <div className="text-xs text-gray-600 truncate max-w-[120px]" title={task.assignee.name}>
            {task.assignee.name}
          </div>
        ) : (
          <div className="text-xs text-gray-400 italic">
            Unassigned
          </div>
        )}
      </div>
    </div>
  );
}
