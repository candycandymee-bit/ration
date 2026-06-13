import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Plus, Edit, Trash2, User, Mail, Phone, Users, Search, Filter, Download, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

function UsersTab({ onUpdate }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    rationCardNumber: '',
    name: '',
    email: '',
    phone: '',
    category: 'GENERAL',
    familyMembers: 1,
    riceQuota: 20,
    wheatQuota: 10,
    sugarQuota: 5,
    keroseneQuota: 3
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, categoryFilter, sortConfig]);

  const loadUsers = async () => {
    try {
      const data = await apiService.get('/api/admin/users');
      setUsers(data);
      setError('');
    } catch (error) {
      console.error('Failed to load users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.rationCardNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(user => user.category === categoryFilter);
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredUsers(filtered);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Check if user already exists (for add mode only)
      if (modalMode === 'add') {
        const existingUser = users.find(user => 
          user.rationCardNumber === formData.rationCardNumber || 
          user.email === formData.email
        );

        if (existingUser) {
          setError('User with this ration card number or email already exists.');
          setIsSubmitting(false);
          return;
        }
      }

      if (modalMode === 'add') {
        await apiService.post('/api/admin/users', formData);
      } else {
        await apiService.put(`/api/admin/users/${selectedUser.id}`, formData);
      }
      
      setShowModal(false);
      resetForm();
      loadUsers();
      onUpdate();
    } catch (error) {
      console.error('Failed to save user:', error);
      
      // Handle specific error cases
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else if (error.message && error.message.includes('409')) {
        setError('User with this ration card number or email already exists.');
      } else {
        setError('Failed to save user. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      rationCardNumber: user.rationCardNumber,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      category: user.category || 'GENERAL',
      familyMembers: user.familyMembers || 1,
      riceQuota: user.riceQuota,
      wheatQuota: user.wheatQuota,
      sugarQuota: user.sugarQuota,
      keroseneQuota: user.keroseneQuota
    });
    setModalMode('edit');
    setShowModal(true);
    setError('');
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      try {
        await apiService.delete(`/api/admin/users/${user.id}`);
        loadUsers();
        onUpdate();
        setError('');
      } catch (error) {
        console.error('Failed to delete user:', error);
        setError('Failed to delete user. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      rationCardNumber: '',
      name: '',
      email: '',
      phone: '',
      category: 'GENERAL',
      familyMembers: 1,
      riceQuota: 20,
      wheatQuota: 10,
      sugarQuota: 5,
      keroseneQuota: 3
    });
    setSelectedUser(null);
    setError('');
  };

  const openAddModal = () => {
    resetForm();
    setModalMode('add');
    setShowModal(true);
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'SC': return 'bg-purple-100 text-purple-800';
      case 'ST': return 'bg-indigo-100 text-indigo-800';
      case 'OBC': return 'bg-blue-100 text-blue-800';
      case 'GENERAL': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuotaPercentage = (consumed, quota) => {
    return quota > 0 ? Math.min((consumed / quota) * 100, 100) : 0;
  };

  const exportToCSV = () => {
    const headers = ['Ration Card', 'Name', 'Email', 'Phone', 'Category', 'Family Members', 'Rice Quota', 'Wheat Quota', 'Sugar Quota', 'Kerosene Quota'];
    const csvData = filteredUsers.map(user => [
      user.rationCardNumber,
      user.name,
      user.email,
      user.phone || '',
      user.category,
      user.familyMembers,
      user.riceQuota,
      user.wheatQuota,
      user.sugarQuota,
      user.keroseneQuota
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="flex items-center p-4 mb-4 text-red-800 bg-red-50 rounded-xl border border-red-200">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 lg:mb-0">User Management</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          
          <button
            onClick={openAddModal}
            className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, card number, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Filter</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Categories</option>
                <option value="GENERAL">General</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="OBC">OBC</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-center text-white rounded-2xl p-4 shadow-lg">
          <div className="text-sm font-medium opacity-80">Total Users</div>
          <div className="text-2xl font-bold">{filteredUsers.length}</div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-center  text-white rounded-2xl p-4 shadow-lg">
          <div className="text-sm font-medium opacity-80">Active This Month</div>
          <div className="text-2xl font-bold">
            {filteredUsers.filter(user => {
              const totalConsumed = (user.riceConsumed || 0) + (user.wheatConsumed || 0) + 
                                  (user.sugarConsumed || 0) + (user.keroseneConsumed || 0);
              return totalConsumed > 0;
            }).length}
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-center text-white rounded-2xl p-4 shadow-lg">
          <div className="text-sm font-medium opacity-80">Low Usage</div>
          <div className="text-2xl font-bold">
            {filteredUsers.filter(user => {
              const totalConsumed = (user.riceConsumed || 0) + (user.wheatConsumed || 0) + 
                                  (user.sugarConsumed || 0) + (user.keroseneConsumed || 0);
              const totalQuota = (user.riceQuota || 0) + (user.wheatQuota || 0) + 
                               (user.sugarQuota || 0) + (user.keroseneQuota || 0);
              return totalConsumed < totalQuota * 0.3;
            }).length}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                {[
                  { key: 'name', label: 'User Details' },
                  { key: 'keroseneQuota', label: 'Kerosene' },
                  { key: 'riceQuota', label: 'Rice Usage' },
                  { key: 'wheatQuota', label: 'Wheat Usage' },
                  { key: '', label: 'Actions' }
                ].map((header) => (
                  <th 
                    key={header.key}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:text-primary-600"
                    onClick={() => header.key && handleSort(header.key)}
                  >
                    <div className="flex items-center">
                      {header.label}
                      {sortConfig.key === header.key && (
                        sortConfig.direction === 'asc' ? 
                        <ChevronUp className="h-4 w-4 ml-1" /> : 
                        <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-white/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-2 rounded-full mr-3">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {user.rationCardNumber}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div 
                        className="h-2 rounded-full bg-primary-600"
                        style={{ width: `${getQuotaPercentage(user.keroseneConsumed, user.keroseneQuota)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600">
                      {user.keroseneConsumed || 0}/{user.keroseneQuota} L
                    </div>
                  </td>
                  
                  <td className="px-4 py-4">
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div 
                        className="h-2 rounded-full bg-amber-500"
                        style={{ width: `${getQuotaPercentage(user.riceConsumed, user.riceQuota)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600">
                      {user.riceConsumed || 0}/{user.riceQuota} kg
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div 
                        className="h-2 rounded-full bg-yellow-500"
                        style={{ width: `${getQuotaPercentage(user.wheatConsumed, user.wheatQuota)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600">
                      {user.wheatConsumed || 0}/{user.wheatQuota} kg
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="mb-4">
                <User className="h-12 w-12 text-gray-300 mx-auto" />
              </div>
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {modalMode === 'add' ? 'Add New User' : 'Edit User'}
            </h3>
            
            {/* Error message in modal */}
            {error && (
              <div className="flex items-center p-3 mb-4 text-red-800 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ration Card Number *
                  </label>
                  <input
                    type="text"
                    value={formData.rationCardNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, rationCardNumber: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                    disabled={modalMode === 'edit'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rice Quota (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.riceQuota}
                    onChange={(e) => setFormData(prev => ({ ...prev, riceQuota: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wheat Quota (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.wheatQuota}
                    onChange={(e) => setFormData(prev => ({ ...prev, wheatQuota: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sugar Quota (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.sugarQuota}
                    onChange={(e) => setFormData(prev => ({ ...prev, sugarQuota: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kerosene Quota (L)
                  </label>
                  <input
                    type="number"
                    value={formData.keroseneQuota}
                    onChange={(e) => setFormData(prev => ({ ...prev, keroseneQuota: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl shadow-md hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : (modalMode === 'add' ? 'Add User' : 'Update User')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-all disabled:opacity-50"
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

export default UsersTab;