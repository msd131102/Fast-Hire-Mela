import React, { useState, useEffect } from 'react';
import { Users, Search, Settings, Download, Eye, Pencil, Trash2, UserPlus, XCircle, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { cn } from '../utils/cn';
import { usersAPI } from '../services/api';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editUser, setEditUser] = useState({
    name: '',
    email: '',
    phone: '',
    is_premium: false,
    premium_expiry: '',
    is_active: true
  });
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'job_seeker'
  });

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await usersAPI.getUsers();
        console.log('Users API response:', response.data);
        // Handle the nested data structure from backend
        const usersData = response.data?.data?.users || response.data?.users || response.data || [];
        // Ensure we always set an array
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]); // Set empty array on error
        // Error is handled by the API interceptor
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesRole = filterRole === 'all' || user.role === filterRole;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await usersAPI.deleteUser(userId);
        setUsers(prev => prev.filter(user => user.id !== userId));
        setSelectedUsers(prev => prev.filter(id => id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      try {
        await Promise.all(selectedUsers.map(userId => usersAPI.deleteUser(userId)));
        setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
        setSelectedUsers([]);
      } catch (error) {
        console.error('Error deleting users:', error);
      }
    }
  };

  const handleToggleStatus = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    try {
      if (user.status === 'active') {
        await usersAPI.blockUser(userId);
        setUsers(prev => prev.map(u =>
          u.id === userId ? { ...u, status: 'inactive', is_active: false } : u
        ));
      } else {
        await usersAPI.unblockUser(userId);
        setUsers(prev => prev.map(u =>
          u.id === userId ? { ...u, status: 'active', is_active: true } : u
        ));
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleAddUser = async () => {
    try {
      // Validate required fields
      if (!newUser.name || !newUser.email || !newUser.password) {
        alert('Please fill in all required fields');
        return;
      }

      // Create the user via API
      const response = await usersAPI.createUser(newUser);

      // Add the new user to the local state
      setUsers(prev => [...prev, response.data.user || response.data]);

      // Reset form and close modal
      setNewUser({ name: '', email: '', password: '', role: 'job_seeker' });
      setShowAddModal(false);

      alert('User created successfully!');
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to create user. Please try again.');
    }
  };

  const handleInputChange = (field, value) => {
    setNewUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Edit user handlers
  const handleEditInputChange = (field, value) => {
    setEditUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditUser = async () => {
    try {
      if (!currentUser || !editUser.name || !editUser.email) {
        alert('Please fill in all required fields');
        return;
      }

      // Prepare update data
      const updateData = {
        name: editUser.name,
        email: editUser.email,
        phone: editUser.phone || null,
        is_premium: editUser.is_premium,
        premium_expiry: editUser.premium_expiry || null,
        is_active: editUser.is_active
      };

      // Update user via API
      const response = await usersAPI.updateUser(currentUser.id, updateData);

      // Update user in local state
      setUsers(prev => prev.map(user => 
        user.id === currentUser.id 
          ? { 
              ...user, 
              ...updateData,
              status: updateData.is_active ? 'active' : 'inactive'
            }
          : user
      ));

      // Reset form and close modal
      setEditUser({
        name: '',
        email: '',
        phone: '',
        is_premium: false,
        premium_expiry: '',
        is_active: true
      });
      setCurrentUser(null);
      setShowEditModal(false);

      alert('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  // Populate edit form when user is selected
  useEffect(() => {
    if (currentUser) {
      setEditUser({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        is_premium: currentUser.is_premium || currentUser.premium || false,
        premium_expiry: currentUser.premium_expiry ? 
          new Date(currentUser.premium_expiry).toISOString().split('T')[0] : '',
        is_active: currentUser.is_active !== false && currentUser.status !== 'inactive'
      });
    }
  }, [currentUser]);

  const exportUsers = () => {
    // Export functionality
    console.log('Exporting users...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <UserPlus className="h-5 w-5 mr-2" />
          Add User
        </Button>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Add New User
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter user name"
                    value={newUser.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={newUser.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={newUser.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newUser.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                  >
                    <option value="job_seeker">Job Seeker</option>
                    <option value="employer">Employer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddUser}
                >
                  Add User
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Edit User
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter user name"
                    value={editUser.name}
                    onChange={(e) => handleEditInputChange('name', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={editUser.email}
                    onChange={(e) => handleEditInputChange('email', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    value={editUser.phone}
                    onChange={(e) => handleEditInputChange('phone', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Premium Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={editUser.is_premium ? 'premium' : 'regular'}
                    onChange={(e) => handleEditInputChange('is_premium', e.target.value === 'premium')}
                  >
                    <option value="regular">Regular User</option>
                    <option value="premium">Premium User</option>
                  </select>
                </div>
                {editUser.is_premium && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Premium Expiry Date
                    </label>
                    <Input
                      type="date"
                      value={editUser.premium_expiry}
                      onChange={(e) => handleEditInputChange('premium_expiry', e.target.value)}
                      className="w-full"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={editUser.is_active ? 'active' : 'inactive'}
                    onChange={(e) => handleEditInputChange('is_active', e.target.value === 'active')}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentUser(null);
                    setEditUser({
                      name: '',
                      email: '',
                      phone: '',
                      is_premium: false,
                      premium_expiry: '',
                      is_active: true
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditUser}
                >
                  Update User
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <XCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Inactive Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'inactive').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Premium Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.is_premium || u.premium).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Roles</option>
            <option value="job_seeker">Job Seeker</option>
            <option value="employer">Employer</option>
            <option value="admin">Admin</option>
          </select>

          <Button variant="outline" onClick={exportUsers}>
            <Download className="h-5 w-5 mr-2" />
            Export
          </Button>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Premium
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{user.email || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 text-xs rounded-full",
                      "bg-gray-100 text-gray-800"
                    )}>
                      User
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className={cn(
                        "px-2 py-1 text-xs rounded-full font-medium",
                        user.status === 'active'
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      )}
                    >
                      {user.status}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {user.is_premium || user.premium ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        Premium
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.created_at || user.createdAt || user.joinedDate ?
                      new Date(user.created_at || user.createdAt || user.joinedDate).toLocaleDateString() :
                      'N/A'
                    }
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.updated_at || user.updatedAt || user.lastActive ?
                      new Date(user.updated_at || user.updatedAt || user.lastActive).toLocaleDateString() :
                      'N/A'
                    }
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCurrentUser(user);
                          setShowEditModal(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default UsersManagement;
