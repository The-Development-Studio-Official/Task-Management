import React, { useState, useEffect } from 'react';
import { Activity as ActivityIcon, Edit2, Plus, Shield, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import apiCall from '../utils/api.js';

export default function ActivityLog() {
  const { token } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const data = await apiCall('/activity-logs');
        setActivities(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchActivities();
  }, [token]);

  const getIcon = (action) => {
    if (action.includes('created')) return Plus;
    if (action.includes('deleted')) return Edit2;
    if (action.includes('role')) return Shield;
    return Edit2;
  };

  const getIconColor = (action) => {
    if (action.includes('created')) return 'text-emerald-600';
    if (action.includes('role')) return 'text-amber-500';
    return 'text-indigo-600';
  };

  const getIconBg = (action) => {
    if (action.includes('created')) return 'bg-emerald-50';
    if (action.includes('role')) return 'bg-amber-50';
    return 'bg-indigo-50';
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Activity Log</h1>
        <p className="text-gray-500 text-sm">Recent actions across your workspace</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_8px_32px_rgba(100,110,140,0.05)]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader className="animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            Error loading activities: {error}
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No activities recorded yet
          </div>
        ) : (
          <div className="flex flex-col">
            {activities.map((activity, index) => {
              const Icon = getIcon(activity.action);
              const iconColor = getIconColor(activity.action);
              const iconBg = getIconBg(activity.action);

              return (
                <div 
                  key={activity.id} 
                  className={`p-5 flex items-start gap-4 ${index !== activities.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg} ${iconColor}`}>
                    <Icon size={18} />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <div className="text-gray-800 text-sm">
                      <span className="font-bold text-gray-900">{activity.user?.username || 'System'}</span>{' '}
                      <span>{activity.action}</span>{' '}
                      <span className="text-gray-900">{activity.metadata || ''}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <ActivityIcon size={14} className="text-gray-400" />
                        {new Date(activity.createdAt).toLocaleDateString()} {new Date(activity.createdAt).toLocaleTimeString()}
                      </div>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 font-medium rounded text-[10px] tracking-wider uppercase">
                        LOG #{activity.id}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
