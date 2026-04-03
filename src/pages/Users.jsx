import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, Edit2, Plus, Shield } from 'lucide-react';
import apiCall from '../utils/api.js';

export default function Users() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    teamName: ''
  });

  // Check if current user is superadmin
  const isSuperAdmin = user?.role === 'superadmin';

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await apiCall('/users');
      setUsers(usersData);
      setError('');
    } catch (err) {
      setError('Error loading users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

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
        teamName: userToEdit.teamName || ''
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'user',
        teamName: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ username: '', email: '', password: '', role: 'user', teamName: '' });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setError('Only super admins can create users');
      return;
    }

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
          teamName: formData.teamName
        })
      });

      setUsers([newUser, ...users]);
      setError('');
      handleCloseModal();
    } catch (err) {
      setError('Error creating user: ' + err.message);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin || !editingUser) {
      setError('Only super admins can update users');
      return;
    }

    try {
      const updatedUser = await apiCall(`/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          role: formData.role,
          teamName: formData.teamName
        })
      });

      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setError('');
      handleCloseModal();
    } catch (err) {
      setError('Error updating user: ' + err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!isSuperAdmin) {
      setError('Only super admins can delete users');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await apiCall(`/users/${userId}`, {
        method: 'DELETE'
      });

      setUsers(users.filter(u => u.id !== userId));
      setError('');
    } catch (err) {
      setError('Error deleting user: ' + err.message);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50 p-4">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-900">Access Denied</h1>
          <p className="text-red-700 mt-2">Only super admins can access user management</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            Create User
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          /* Users table */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Username</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Team</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{u.username}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{u.teamName || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        u.role === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleOpenModal(u)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                        title="Edit user"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      {user?.id !== u.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete user"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))})
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h2>

            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Team Name</label>
                <input
                  type="text"
                  value={formData.teamName}
                  onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                  placeholder="e.g. Development, Marketing, Sales"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="mb-4">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              {!editingUser && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition font-semibold"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-2 rounded-lg transition font-semibold"
                >
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
