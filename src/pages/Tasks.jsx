import React, { useState, useEffect } from 'react';
import { 
  Search, RefreshCw, Plus, Clock, MoreVertical, X, Loader, AlertCircle, Trash2, Edit
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import apiCall from '../utils/api.js';

export default function Tasks() {
  const { token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    assignedToId: null,
    deadline: ''
  });

  // Fetch tasks and users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tasksRes = await apiCall('/tasks');
        const usersRes = await apiCall('/chat/users');

        setTasks(Array.isArray(tasksRes) ? tasksRes : []);
        setAllUsers(Array.isArray(usersRes) ? usersRes : []);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'assignedToId' ? (value ? parseInt(value) : null) : value }));
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const newTask = await apiCall('/tasks', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      setTasks([newTask, ...tasks]);
      setFormData({ name: '', description: '', priority: 'medium', status: 'pending', assignedToId: null, deadline: '' });
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const updatedTask = await apiCall(`/tasks/${editingTask.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });

      setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t));
      setEditingTask(null);
      setFormData({ name: '', description: '', priority: 'medium', status: 'pending', assignedToId: null, deadline: '' });
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await apiCall(`/tasks/${id}`, {
        method: 'DELETE'
      });
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      name: task.name,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      assignedToId: task.assignedToId,
      deadline: task.deadline ? task.deadline.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="p-8 relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Tasks</h1>
          <p className="text-gray-500 text-sm">Manage and track your projects</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition shadow-sm">
            <RefreshCw size={16} />
            Refresh
          </button>
          <button 
            onClick={() => {
              setEditingTask(null);
              setFormData({ name: '', description: '', priority: 'medium', status: 'pending', assignedToId: null, deadline: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
          >
            <Plus size={18} />
            New Task
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Filters Area */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[300px] relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-sm text-sm"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-500 shadow-sm appearance-none outline-none pr-10 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2724%27%20height%3D%2724%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20stroke%3D%27%236b7280%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpolyline%20points%3D%276%209%2012%2015%2018%209%27%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select 
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-500 shadow-sm appearance-none outline-none pr-10 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2724%27%20height%3D%2724%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20stroke%3D%27%236b7280%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpolyline%20points%3D%276%209%2012%2015%2018%209%27%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat cursor-pointer"
        >
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_8px_32px_rgba(100,110,140,0.05)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader className="animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs font-semibold">
                  <th className="py-4 px-6 font-medium">Name</th>
                  <th className="py-4 px-4 font-medium">Status</th>
                  <th className="py-4 px-4 font-medium">Priority</th>
                  <th className="py-4 px-4 font-medium">Due Date</th>
                  <th className="py-4 px-4 font-medium">Assignee</th>
                  <th className="py-4 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      No tasks found
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                      <td className="py-4 px-6 flex items-start gap-2">
                        <div className="mt-1">
                          <Clock size={16} className="text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 mb-1">{task.name}</div>
                          <div className={task.status === 'completed' ? 'text-green-600 text-xs' : task.status === 'in progress' ? 'text-blue-600 text-xs' : 'text-red-600 text-xs'}>
                            {task.status.toUpperCase()}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                          task.status === 'completed' ? 'bg-green-50 text-green-600' :
                          task.status === 'in progress' ? 'bg-indigo-50 text-indigo-600' :
                          'bg-yellow-50 text-yellow-600'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded uppercase tracking-wide ${
                          task.priority === 'high' ? 'bg-red-100 text-red-600' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-600">
                        {task.deadline ? new Date(task.deadline).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                            {task.assignedTo?.username?.charAt(0).toUpperCase() || '—'}
                          </div>
                          <span className="text-sm text-gray-700 font-medium">{task.assignedTo?.username || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => openEditModal(task)}
                            className="text-gray-400 hover:text-blue-600 transition p-1"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-gray-400 hover:text-red-600 transition p-1"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Backdrop & Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[600px] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-start p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
                <p className="text-sm text-gray-500">Fill in the details to {editingTask ? 'update the' : 'create a new'} task.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-gray-900">Task Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="What needs to be done?" 
                    required
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-gray-900">Description</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the work, requirements, or details..." 
                    rows="4"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-bold text-gray-900">Status</label>
                    <select 
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2724%27%20height%3D%2724%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20stroke%3D%27%236b7280%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpolyline%20points%3D%276%209%2012%2015%2018%209%27%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat cursor-pointer text-gray-700"
                    >
                      <option value="pending">Pending</option>
                      <option value="in progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-bold text-gray-900">Priority</label>
                    <select 
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2724%27%20height%3D%2724%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20stroke%3D%27%236b7280%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpolyline%20points%3D%276%209%2012%2015%2018%209%27%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat cursor-pointer text-gray-700"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-gray-900">Deadline</label>
                  <input 
                    type="date" 
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-600"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-gray-900">Assign To</label>
                  <select 
                    name="assignedToId"
                    value={formData.assignedToId || ''}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2724%27%20height%3D%2724%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20stroke%3D%27%236b7280%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpolyline%20points%3D%276%209%2012%2015%2018%209%27%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat cursor-pointer text-gray-700"
                  >
                    <option value="">Unassigned</option>
                    {allUsers.map(user => (
                      <option key={user.id} value={user.id}>{user.username}</option>
                    ))}
                  </select>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 -m-6 -mb-6 mt-6">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition"
                  >
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
