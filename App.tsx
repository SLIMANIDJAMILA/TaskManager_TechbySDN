
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Task, Status, Priority } from './types';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { PlusIcon, SunIcon, MoonIcon, UploadIcon, DownloadIcon } from './components/icons';

// Sample data for initial load if localStorage is empty
const initialTasks: Task[] = [
  { id: '1', title: 'Setup Project', description: 'Initialize React project with TypeScript and Tailwind CSS.', dueDate: '2024-08-15', priority: Priority.High, status: Status.Completed },
  { id: '2', title: 'Create Components', description: 'Build all necessary UI components like TaskCard, Modal, etc.', dueDate: '2024-08-18', priority: Priority.High, status: Status.InProgress },
  { id: '3', title: 'Implement State Management', description: 'Use React hooks for state and data persistence.', dueDate: '2024-08-20', priority: Priority.Medium, status: Status.ToDo },
  { id: '4', title: 'Add Dark Mode', description: 'Implement a toggle for light and dark themes.', dueDate: '2024-08-22', priority: Priority.Low, status: Status.ToDo },
];

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority'>('dueDate');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load tasks and theme from localStorage on initial render
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('tasks');
      setTasks(storedTasks ? JSON.parse(storedTasks) : initialTasks);

      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'dark') {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      setTasks(initialTasks);
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error("Failed to save tasks to localStorage", error);
    }
  }, [tasks]);

  // Handle dark mode toggling
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      const newIsDark = !prev;
      if (newIsDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newIsDark;
    });
  }, []);

  const handleAddTask = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
        setTasks(tasks.filter(t => t.id !== taskId));
    }
  };
  
  const handleStatusChange = (taskId: string, status: Status) => {
    setTasks(tasks.map(task => task.id === taskId ? { ...task, status } : task));
  };

  const handleSaveTask = (task: Task) => {
    if (taskToEdit) {
      setTasks(tasks.map(t => t.id === task.id ? task : t));
    } else {
      setTasks([...tasks, task]);
    }
    setIsModalOpen(false);
  };

  // Memoized filtering and sorting of tasks
  const filteredTasks = useMemo(() => {
    const priorityOrder = { [Priority.High]: 1, [Priority.Medium]: 2, [Priority.Low]: 3 };
    return tasks
      .filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || task.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else { // sortBy 'priority'
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
      });
  }, [tasks, searchTerm, statusFilter, priorityFilter, sortBy]);

  const completedTasksCount = useMemo(() => tasks.filter(t => t.status === Status.Completed).length, [tasks]);
  const progressPercentage = tasks.length > 0 ? (completedTasksCount / tasks.length) * 100 : 0;

  // Data import/export functions
  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'tasks.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [tasks]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          if (typeof content === 'string') {
            const importedTasks = JSON.parse(content);
            // Basic validation
            if (Array.isArray(importedTasks) && importedTasks.every(t => 'id' in t && 'title' in t)) {
              if (window.confirm('This will overwrite your current tasks. Are you sure?')) {
                setTasks(importedTasks);
              }
            } else {
              alert('Invalid JSON file format.');
            }
          }
        } catch (error) {
          alert('Error reading or parsing the file.');
          console.error("Import error:", error);
        }
      };
      reader.readAsText(file);
    }
    // Reset file input
    if(event.target) event.target.value = '';
  };

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <header className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary dark:text-primary-light">ZenTask</h1>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json"/>
            <button onClick={handleImportClick} title="Import Tasks" className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><UploadIcon className="w-5 h-5 sm:w-6 sm:h-6" /></button>
            <button onClick={handleExport} title="Export Tasks" className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><DownloadIcon className="w-5 h-5 sm:w-6 sm:h-6" /></button>
            <button onClick={toggleDarkMode} title="Toggle Theme" className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              {isDarkMode ? <SunIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" /> : <MoonIcon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Dashboard Summary */}
        <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-2">{completedTasksCount} of {tasks.length} tasks completed.</p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <input type="text" placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:w-auto flex-grow px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
          <div className="flex flex-col sm:flex-row gap-4">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as Status | 'All')} className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="All">All Statuses</option>
              {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as Priority | 'All')} className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="All">All Priorities</option>
              {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
             <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'priority')} className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
            </select>
          </div>
        </div>

        {/* Task List */}
        {filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map(task => (
                <TaskCard key={task.id} task={task} onEdit={handleEditTask} onDelete={handleDeleteTask} onStatusChange={handleStatusChange} />
            ))}
            </div>
        ) : (
            <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">No tasks found. Try adjusting your filters or adding a new task!</p>
            </div>
        )}
      </main>

      <button onClick={handleAddTask} className="fixed bottom-8 right-8 bg-primary hover:bg-primary-dark text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-slate-900">
        <PlusIcon className="w-8 h-8" />
      </button>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveTask} 
        taskToEdit={taskToEdit} 
      />
    </div>
  );
};

export default App;
