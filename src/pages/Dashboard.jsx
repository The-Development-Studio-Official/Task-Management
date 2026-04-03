import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  RefreshCw, CheckCircle2, AlertTriangle, Clock,
  Users, Briefcase, Target, User, ArrowRight, CheckSquare, Loader, ClipboardList
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../contexts/AuthContext.jsx';
import { apiCall } from '../utils/api.js';

export default function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async ({ isRefresh = false } = {}) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const [statsData, tasksData] = await Promise.all([
        apiCall('/dashboard/stats'),
        apiCall('/dashboard/recent-tasks'),
      ]);

      setStats(statsData);
      setRecentTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const chartData = stats ? [
    { name: 'Completed', value: stats.completedTasks, color: '#10b981' },
    { name: 'In Progress', value: stats.inProgressTasks, color: '#0ea5e9' },
    { name: 'Pending', value: stats.totalTasks - stats.completedTasks - stats.inProgressTasks, color: '#f59e0b' }
  ].filter(item => item.value > 0) : [];

  const completionRate = stats?.totalTasks
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  const statCards = stats ? [
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      meta: 'Across all teams',
      icon: CheckSquare,
      iconClass: 'icon-purple',
      tone: 'primary',
    },
    {
      title: 'Completed',
      value: stats.completedTasks,
      meta: `${completionRate}% completion rate`,
      icon: CheckCircle2,
      iconClass: 'icon-green',
      tone: 'success',
    },
    {
      title: 'In Progress',
      value: stats.inProgressTasks,
      meta: 'Actively moving',
      icon: Clock,
      iconClass: 'icon-blue',
      tone: 'info',
    },
    {
      title: 'Overdue',
      value: stats.overdueTasks,
      meta: 'Needs attention',
      icon: AlertTriangle,
      iconClass: 'icon-red',
      tone: 'danger',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      meta: 'On the workspace',
      icon: Users,
      iconClass: 'icon-gray',
      tone: 'neutral',
    },
    {
      title: 'My Tasks',
      value: stats.myTasks,
      meta: 'Created by you',
      icon: Briefcase,
      iconClass: 'icon-orange',
      tone: 'warning',
    },
    {
      title: 'Assigned to Me',
      value: stats.assignedToMe,
      meta: 'Direct ownership',
      icon: Target,
      iconClass: 'icon-pink',
      tone: 'accent',
    },
  ] : [];

  const getStatusClass = (status) => {
    if (status === 'completed') return 'status-completed';
    if (status === 'in progress') return 'status-progress';
    return 'status-pending';
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Dashboard</h1>
          <p>Track task health, recent activity, and the work that needs attention.</p>
        </div>
        <button
          className="btn-refresh"
          type="button"
          onClick={() => fetchDashboardData({ isRefresh: true })}
          disabled={loading || refreshing}
        >
          <RefreshCw size={16} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="dashboard-alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="dashboard-loading">
          <Loader className="dashboard-spinner" />
        </div>
      ) : stats ? (
        <>
          <section className="dashboard-overview">
            <div className="dashboard-hero">
              <div className="dashboard-hero-copy">
                <span className="dashboard-eyebrow">Today&apos;s snapshot</span>
                <h2>{completionRate}% of tracked work is completed</h2>
                <p>
                  {stats.overdueTasks > 0
                    ? `${stats.overdueTasks} tasks are overdue and need follow-up.`
                    : 'No overdue tasks right now.'}
                </p>
              </div>
              <div className="dashboard-hero-metrics">
                <div className="hero-metric">
                  <span className="hero-metric-label">Open work</span>
                  <strong>{Math.max(stats.totalTasks - stats.completedTasks, 0)}</strong>
                </div>
                <div className="hero-metric">
                  <span className="hero-metric-label">Assigned to you</span>
                  <strong>{stats.assignedToMe}</strong>
                </div>
              </div>
            </div>

            <div className="stats-grid">
              {statCards.map((card) => {
                const Icon = card.icon;

                return (
                  <article key={card.title} className={`stat-card tone-${card.tone}`}>
                    <div className="stat-card-top">
                      <div className="stat-info">
                        <span className="stat-title">{card.title}</span>
                        <span className="stat-value">{card.value}</span>
                        <span className="stat-meta">{card.meta}</span>
                      </div>
                      <div className={`stat-icon ${card.iconClass}`}>
                        <Icon size={22} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <div className="dashboard-bottom">
            <div className="card-section task-status">
              <div className="section-header section-header-tight">
                <div>
                  <span className="section-kicker">Performance</span>
                  <h3>Task Status</h3>
                </div>
                <span className="chart-summary">{chartData.reduce((sum, item) => sum + item.value, 0)} tasks</span>
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
              <div className="chart-legend">
                {chartData.length === 0 ? (
                  <div className="chart-empty">
                    <ClipboardList size={18} />
                    <span>No task data yet</span>
                  </div>
                ) : (
                  chartData.map((item) => (
                    <div key={item.name} className="chart-legend-item">
                      <span className="chart-dot" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card-section recent-tasks">
              <div className="section-header section-header-tight">
                <div>
                  <span className="section-kicker">Activity</span>
                  <h3>Recent Tasks</h3>
                </div>
                <Link href="/tasks" className="view-all">
                  View all <ArrowRight size={16} />
                </Link>
              </div>
              <div className="task-list">
                {recentTasks.length === 0 ? (
                  <div className="task-empty-state">No tasks yet</div>
                ) : (
                  recentTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="task-item">
                      <div className="task-checkbox-icon">
                        <CheckSquare size={18} />
                      </div>
                      <div className="task-details">
                        <div className="task-name">{task.name}</div>
                        <div className="task-meta">
                          <span className={`task-status-badge ${getStatusClass(task.status)}`}>
                            {task.status}
                          </span>
                          <span className={task.status === 'completed' ? 'text-success' : task.status === 'in progress' ? 'text-info' : 'text-danger'}>
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
