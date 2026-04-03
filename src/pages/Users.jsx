import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, Edit2, Plus, Shield, AlertCircle, Loader, RefreshCw, X } from 'lucide-react';
import { apiCall } from '../utils/api.js';

const emptyForm = {
  username: '',
  email: '',
  password: '',
  role: 'user',
  teamName: '',
};

export default function Users() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const isSuperAdmin = user?.role === 'superadmin';

  const fetchUsers = async ({ isRefresh = false } = {}) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const usersData = await apiCall('/users');
      setUsers(Array.isArray(usersData) ? usersData : []);
      setError('');
    } catch (err) {
      setError('Error loading users: ' + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const handleOpenModal = (userToEdit = null) => {
    if (!isSuperAdmin) {
      setError('Only super admins can manage users');
      return;
    }

    setEditingUser(userToEdit);
    if (userToEdit) {
      setFormData({
        username: userToEdit.username,
        email: userToEdit.email,
        password: '',
        role: userToEdit.role,
        teamName: userToEdit.teamName || '',
      });
    } else {
      setFormData(emptyForm);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData(emptyForm);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) return;

    if (!formData.username || !formData.email || !formData.password) {
      setError('Username, email, and password are required');
      return;
    }

    try {
      const newUser = await apiCall('/users', {
        method: 'POST',
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          teamName: formData.teamName,
        }),
      });

      setUsers((prev) => [newUser, ...prev]);
      setError('');
      handleCloseModal();
    } catch (err) {
      setError('Error creating user: ' + err.message);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin || !editingUser) return;

    try {
      const updatedUser = await apiCall(`/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          role: formData.role,
          teamName: formData.teamName,
        }),
      });

      setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      setError('');
      handleCloseModal();
    } catch (err) {
      setError('Error updating user: ' + err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!isSuperAdmin) return;
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await apiCall(`/users/${userId}`, { method: 'DELETE' });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setError('');
    } catch (err) {
      setError('Error deleting user: ' + err.message);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="page-shell">
        <div className="surface-card p-8 text-center">
          <Shield className="mx-auto mb-3 h-12 w-12 text-rose-600" />
          <h1 className="section-title">Access Denied</h1>
          <p className="section-subtitle">Only super admins can access user management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="section-title">User Management</h1>
          <p className="section-subtitle">Manage workspace members, teams, and permission roles.</p>
        </div>
        <div className="header-buttons">
          <button type="button" className="btn btn-secondary" onClick={() => fetchUsers({ isRefresh: true })}>
            <RefreshCw size={16} className={refreshing ? 'loader-inline' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16} />
            Create User
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-error mb-4">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="surface-card table-shell">
        {loading ? (
          <div className="empty-state">
            <Loader className="loader-inline mx-auto mb-2 text-slate-400" />
            Loading users...
          </div>
        ) : (
          <table className="table-base users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Team</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">No users found</td>
                </tr>
              ) : (
                users.map((workspaceUser) => (
                  <tr key={workspaceUser.id}>
                    <td data-label="Username">{workspaceUser.username}</td>
                    <td data-label="Email">{workspaceUser.email}</td>
                    <td data-label="Team">{workspaceUser.teamName || '-'}</td>
                    <td data-label="Role">
                      <span className={`task-status-badge ${
                        workspaceUser.role === 'superadmin'
                          ? 'status-progress'
                          : workspaceUser.role === 'admin'
                            ? 'status-pending'
                            : 'status-completed'
                      }`}>
                        {workspaceUser.role}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(workspaceUser)}
                          className="btn btn-secondary !min-h-0 !p-2"
                          title="Edit user"
                          type="button"
                        >
                          <Edit2 size={15} />
                        </button>
                        {user?.id !== workspaceUser.id && (
                          <button
                            onClick={() => handleDeleteUser(workspaceUser.id)}
                            className="btn btn-danger !min-h-0 !p-2"
                            title="Delete user"
                            type="button"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="surface-card w-full max-w-lg overflow-hidden">
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{editingUser ? 'Edit User' : 'Create User'}</h2>
                <p className="section-subtitle mt-1">Manage account and team information.</p>
              </div>
              <button className="btn btn-secondary !min-h-0 !p-2" onClick={handleCloseModal} type="button">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="control-input"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Team Name</label>
                <input
                  type="text"
                  value={formData.teamName}
                  onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                  placeholder="Development, Marketing, Sales"
                  className="control-input"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="control-input"
                  required
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="control-input"
                    required
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="control-input"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              <div className="flex gap-2 border-t border-slate-100 pt-4">
                <button type="submit" className="btn btn-primary flex-1">
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
