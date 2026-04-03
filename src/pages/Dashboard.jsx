import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, CheckCircle2, AlertTriangle, Clock,
  Users, Briefcase, Target, User, ArrowRight, CheckSquare, Loader
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../contexts/AuthContext.jsx';
import apiCall from '../utils/api.js';

export default function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const statsData = await apiCall('/dashboard/stats');
        const tasksData = await apiCall('/dashboard/recent-tasks');

        setStats(statsData);
        setRecentTasks(Array.isArray(tasksData) ? tasksData : []);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  const chartData = stats ? [
    { name: 'Overdue', value: stats.overdueTasks, color: '#f43f5e' },
    { name: 'In Progress', value: stats.inProgressTasks, color: '#0ea5e9' }
  ] : [];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Dashboard</h1>
          <p>Here's what's happening today.</p>
        </div>
        <button className="btn-refresh">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader className="animate-spin text-gray-400" />
        </div>
      ) : stats ? (
        <>
          <div className="stats-grid">
            <div className="stats-row-top w-full flex gap-6">
              <div className="stat-card flex-1">
                <div className="stat-info">
                  <span className="stat-title">Total Tasks</span>
                  <span className="stat-value">{stats.totalTasks}</span>
                </div>
                <div className="stat-icon icon-purple">
                  <CheckSquare size={24} />
                </div>
              </div>

              <div className="stat-card flex-1">
                <div className="stat-info">
                  <span className="stat-title">Completed</span>
                  <span className="stat-value">{stats.completedTasks}</span>
                </div>
                <div className="stat-icon icon-green">
                  <CheckCircle2 size={24} />
                </div>
              </div>

              <div className="stat-card flex-1">
                <div className="stat-info">
                  <span className="stat-title">In Progress</span>
                  <span className="stat-value">{stats.inProgressTasks}</span>
                </div>
                <div className="stat-icon icon-blue">
                  <Clock size={24} />
                </div>
              </div>

              <div className="stat-card flex-1">
                <div className="stat-info">
                  <span className="stat-title">Overdue</span>
                  <span className="stat-value">{stats.overdueTasks}</span>
                </div>
                <div className="stat-icon icon-red">
                  <AlertTriangle size={24} />
                </div>
              </div>
            </div>

            <div className="stats-row-bottom w-full flex gap-6">
              <div className="stat-card" style={{ maxWidth: '30%' }}>
                <div className="stat-info">
                  <span className="stat-title">Total Users</span>
                  <span className="stat-value">{stats.totalUsers}</span>
                </div>
                <div className="stat-icon icon-gray">
                  <Users size={24} />
                </div>
              </div>

              <div className="stat-card" style={{ maxWidth: '30%' }}>
                <div className="stat-info">
                  <span className="stat-title">My Tasks</span>
                  <span className="stat-value">{stats.myTasks}</span>
                </div>
                <div className="stat-icon icon-orange">
                  <Briefcase size={24} />
                </div>
              </div>

              <div className="stat-card" style={{ maxWidth: '30%' }}>
                <div className="stat-info">
                  <span className="stat-title">Assigned to Me</span>
                  <span className="stat-value">{stats.assignedToMe}</span>
                </div>
                <div className="stat-icon icon-pink">
                  <Target size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-bottom flex gap-6 mt-4">
            <div className="card-section task-status flex-shrink-0 w-[350px]">
              <div className="section-header">
                Task Status
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-section recent-tasks flex-1">
              <div className="section-header">
                Recent Tasks
                <span className="view-all">
                  View all <ArrowRight size={16} />
                </span>
              </div>
              <div className="task-list">
                {recentTasks.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">No tasks yet</div>
                ) : (
                  recentTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="task-item">
                      <div className="task-checkbox-icon">
                        <CheckSquare size={18} />
                      </div>
                      <div className="task-details">
                        <div className="task-name">{task.name}</div>
                        <div className="task-meta">
                          <span className={task.status === 'completed' ? 'text-green-600' : task.status === 'in progress' ? 'text-blue-600' : 'text-red-600'}>
                            {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                          </span>
                          <span className={`badge-priority badge-${task.priority?.toLowerCase()}`}>{task.priority}</span>
                        </div>
                      </div>
                      <div className="task-assignee">
                        <User size={14} /> {task.assignedTo?.username || 'Unassigned'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
