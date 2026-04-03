import React, { useEffect, useState } from 'react';
import {
  Search,
  RefreshCw,
  Plus,
  Clock,
  X,
  Loader,
  AlertCircle,
  Trash2,
  Edit,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { apiCall } from '../utils/api.js';

const emptyForm = {
  name: '',
  description: '',
  priority: 'medium',
  status: 'pending',
  assignedToId: null,
  deadline: '',
};

export default function Tasks() {
  const { token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchData = async ({ isRefresh = false } = {}) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);
      const [tasksRes, usersRes] = await Promise.all([
        apiCall('/tasks'),
        apiCall('/chat/users'),
      ]);

      setTasks(Array.isArray(tasksRes) ? tasksRes : []);
      setAllUsers(Array.isArray(usersRes) ? usersRes : []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'assignedToId' ? (value ? Number(value) : null) : value,
    }));
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      name: task.name,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      assignedToId: task.assignedToId,
      deadline: task.deadline ? task.deadline.split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingTask(null);
    setFormData(emptyForm);
    setIsModalOpen(false);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await apiCall('/tasks', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      await fetchData({ isRefresh: true });
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await apiCall(`/tasks/${editingTask.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      await fetchData({ isRefresh: true });
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await apiCall(`/tasks/${id}`, { method: 'DELETE' });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="section-title">Tasks</h1>
          <p className="section-subtitle">Plan, assign, and track work across your workspace.</p>
        </div>
        <div className="header-buttons">
          <button
            onClick={() => fetchData({ isRefresh: true })}
            className="btn btn-secondary"
            disabled={loading || refreshing}
            type="button"
          >
            <RefreshCw size={16} className={refreshing ? 'loader-inline' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button onClick={openCreateModal} className="btn btn-primary" type="button">
            <Plus size={18} />
            New Task
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-error mb-4">
          <AlertCircle size={17} />
          <span>{error}</span>
        </div>
      )}

      <div className="surface-card p-4 sm:p-5 mb-5">
        <div className="filter-controls">
          <div className="search-input relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="control-input pl-10"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="control-input">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="control-input">
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="surface-card table-shell">
        {loading ? (
          <div className="empty-state">
            <Loader className="loader-inline mx-auto mb-2 text-slate-400" />
            Loading tasks...
          </div>
        ) : (
          <table className="table-base tasks-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Assignee</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">No tasks found</td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id}>
                    <td data-label="Name">
                      <div className="flex items-start gap-2">
                        <Clock size={16} className="mt-0.5 text-indigo-600" />
                        <div>
                          <div className="font-semibold text-slate-900">{task.name}</div>
                          <div className="text-xs text-slate-500">{task.description || 'No description'}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Status">
                      <span className={`task-status-badge ${task.status === 'completed' ? 'status-completed' : task.status === 'in progress' ? 'status-progress' : 'status-pending'}`}>
                        {task.status}
                      </span>
                    </td>
                    <td data-label="Priority">
                      <span className={`badge-priority badge-${task.priority}`}>{task.priority}</span>
                    </td>
                    <td data-label="Due Date">{task.deadline ? new Date(task.deadline).toLocaleDateString() : '-'}</td>
                    <td data-label="Assignee">{task.assignedTo?.username || 'Unassigned'}</td>
                    <td data-label="Actions" className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(task)}
                          className="btn btn-secondary !min-h-0 !p-2"
                          type="button"
                          title="Edit task"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="btn btn-danger !min-h-0 !p-2"
                          type="button"
                          title="Delete task"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="surface-card w-full max-w-xl overflow-hidden">
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
                <p className="section-subtitle mt-1">
                  {editingTask ? 'Update task details.' : 'Add a new task to the board.'}
                </p>
              </div>
              <button className="btn btn-secondary !min-h-0 !p-2" onClick={closeModal} type="button">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask} className="p-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Task Name</label>
                <input name="name" value={formData.name} onChange={handleInputChange} required className="control-input" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="control-input resize-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="control-input">
                    <option value="pending">Pending</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleInputChange} className="control-input">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Deadline</label>
                  <input type="date" name="deadline" value={formData.deadline} onChange={handleInputChange} className="control-input" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Assign To</label>
                  <select name="assignedToId" value={formData.assignedToId || ''} onChange={handleInputChange} className="control-input">
                    <option value="">Unassigned</option>
                    {allUsers.map((workspaceUser) => (
                      <option key={workspaceUser.id} value={workspaceUser.id}>
                        {workspaceUser.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
