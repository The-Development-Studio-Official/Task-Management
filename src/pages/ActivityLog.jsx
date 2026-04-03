import React, { useEffect, useState } from 'react';
import { Activity as ActivityIcon, Edit2, Plus, Shield, Loader, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { apiCall } from '../utils/api.js';

export default function ActivityLog() {
  const { token } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchActivities = async ({ isRefresh = false } = {}) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);
      const data = await apiCall('/activity-logs');
      setActivities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) fetchActivities();
  }, [token]);

  const getActivityConfig = (action = '') => {
    const normalized = action.toLowerCase();
    if (normalized.includes('created')) return { Icon: Plus, tone: 'status-completed' };
    if (normalized.includes('deleted')) return { Icon: Trash2, tone: 'status-pending' };
    if (normalized.includes('role')) return { Icon: Shield, tone: 'status-progress' };
    return { Icon: Edit2, tone: 'status-progress' };
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="section-title">Activity Log</h1>
          <p className="section-subtitle">Workspace audit trail for tasks, users, and role changes.</p>
        </div>
        <div className="header-buttons">
          <button type="button" className="btn btn-secondary" onClick={() => fetchActivities({ isRefresh: true })}>
            <RefreshCw size={16} className={refreshing ? 'loader-inline' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-error mb-4">
          <AlertCircle size={16} />
          <span>Error loading activities: {error}</span>
        </div>
      )}

      <div className="surface-card overflow-hidden">
        {loading ? (
          <div className="empty-state">
            <Loader className="loader-inline mx-auto mb-2 text-slate-400" />
            Loading activity...
          </div>
        ) : activities.length === 0 ? (
          <div className="empty-state">No activities recorded yet</div>
        ) : (
          <div className="activity-list p-2 sm:p-3">
            {activities.map((activity) => {
              const { Icon, tone } = getActivityConfig(activity.action);
              return (
                <article key={activity.id} className="activity-item">
                  <div className={`task-status-badge ${tone}`}>
                    <Icon size={14} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-800">
                      <span className="font-semibold text-slate-900">{activity.user?.username || 'System'}</span>{' '}
                      {activity.action}{' '}
                      <span className="font-medium text-slate-700">{activity.metadata || ''}</span>
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <ActivityIcon size={12} />
                        {new Date(activity.createdAt).toLocaleDateString()} {new Date(activity.createdAt).toLocaleTimeString()}
                      </span>
                      <span className="task-status-badge status-progress">LOG #{activity.id}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
