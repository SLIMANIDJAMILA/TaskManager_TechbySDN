
import React from 'react';
import { Task, Status, Priority } from '../types';
import { EditIcon, TrashIcon } from './icons';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Status) => void;
}

const priorityColors = {
  [Priority.Low]: 'border-l-green-500',
  [Priority.Medium]: 'border-l-yellow-500',
  [Priority.High]: 'border-l-red-500',
};

const statusColors = {
  [Status.ToDo]: 'bg-slate-500',
  [Status.InProgress]: 'bg-blue-500',
  [Status.Completed]: 'bg-green-600',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== Status.Completed;

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 flex flex-col justify-between border-l-4 ${priorityColors[task.priority]} transition-transform transform hover:scale-105 animate-slide-in-up`}>
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{task.title}</h3>
          <div className="flex items-center space-x-2">
            <button onClick={() => onEdit(task)} className="text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              <EditIcon className="w-5 h-5" />
            </button>
            <button onClick={() => onDelete(task.id)} className="text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{task.description}</p>
      </div>

      <div className="flex flex-col space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Due Date:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${isOverdue ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'}`}>
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        </div>

        <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Status:</span>
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task.id, e.target.value as Status)}
              className={`text-white text-xs font-semibold px-2 py-1 rounded-full appearance-none border-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-slate-800 ${statusColors[task.status]}`}
            >
              {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>
      </div>
    </div>
  );
};
