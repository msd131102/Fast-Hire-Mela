import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, ChevronUp, ChevronDown, Eye, EyeOff, Save, X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { cn } from '../utils/cn';

const FAQManagement = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
    order: 0,
    status: 'active'
  });

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockFaqs = [
      {
        id: 1,
        question: 'How do I post a job?',
        answer: 'To post a job, navigate to the Jobs section and click on "Add New Job". Fill in the required details and submit.',
        category: 'jobs',
        order: 1,
        status: 'active',
        views: 150,
        helpful: 120,
        notHelpful: 30
      },
      {
        id: 2,
        question: 'What are the subscription plans?',
        answer: 'We offer Basic, Professional, and Enterprise plans with different features and pricing.',
        category: 'pricing',
        order: 2,
        status: 'active',
        views: 200,
        helpful: 180,
        notHelpful: 20
      },
      {
        id: 3,
        question: 'How do I reset my password?',
        answer: 'Click on "Forgot Password" on the login page and follow the instructions sent to your email.',
        category: 'account',
        order: 3,
        status: 'active',
        views: 100,
        helpful: 95,
        notHelpful: 5
      }
    ];
    setFaqs(mockFaqs);
    setLoading(false);
  }, []);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'jobs', label: 'Jobs' },
    { value: 'pricing', label: 'Pricing' },
    { value: 'account', label: 'Account' },
    { value: 'technical', label: 'Technical' },
    { value: 'billing', label: 'Billing' }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || faq.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingFaq) {
      // Update existing FAQ
      setFaqs(faqs.map(faq => 
        faq.id === editingFaq.id 
          ? { ...faq, ...formData }
          : faq
      ));
      setEditingFaq(null);
    } else {
      // Add new FAQ
      const newFaq = {
        id: Date.now(),
        ...formData,
        views: 0,
        helpful: 0,
        notHelpful: 0
      };
      setFaqs([...faqs, newFaq]);
    }

    // Reset form
    setFormData({
      question: '',
      answer: '',
      category: 'general',
      order: 0,
      status: 'active'
    });
    setShowAddForm(false);
  };

  const handleEdit = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
      status: faq.status
    });
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      setFaqs(faqs.filter(faq => faq.id !== id));
    }
  };

  const toggleStatus = (id) => {
    setFaqs(faqs.map(faq => 
      faq.id === id 
        ? { ...faq, status: faq.status === 'active' ? 'inactive' : 'active' }
        : faq
    ));
  };

  const reorderFaqs = (id, direction) => {
    const index = faqs.findIndex(faq => faq.id === id);
    const newFaqs = [...faqs];
    
    if (direction === 'up' && index > 0) {
      [newFaqs[index], newFaqs[index - 1]] = [newFaqs[index - 1], newFaqs[index]];
    } else if (direction === 'down' && index < faqs.length - 1) {
      [newFaqs[index], newFaqs[index + 1]] = [newFaqs[index + 1], newFaqs[index]];
    }
    
    setFaqs(newFaqs);
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
          <h1 className="text-2xl font-bold text-gray-900">FAQ Management</h1>
          <p className="text-gray-600">Manage frequently asked questions</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add FAQ
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Info className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total FAQs</p>
              <p className="text-2xl font-bold text-gray-900">{faqs.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{faqs.filter(f => f.status === 'active').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Eye className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{faqs.reduce((sum, f) => sum + f.views, 0)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Helpful Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {faqs.length > 0 
                  ? Math.round((faqs.reduce((sum, f) => sum + f.helpful, 0) / 
                              (faqs.reduce((sum, f) => sum + f.helpful + f.notHelpful, 0) || 1)) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
            </h2>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingFaq(null);
                setFormData({
                  question: '',
                  answer: '',
                  category: 'general',
                  order: 0,
                  status: 'active'
                });
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter question"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {categories.filter(c => c.value !== 'all').map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Answer
              </label>
              <textarea
                required
                rows={4}
                value={formData.answer}
                onChange={(e) => setFormData({...formData, answer: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter answer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Display order"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingFaq(null);
                  setFormData({
                    question: '',
                    answer: '',
                    category: 'general',
                    order: 0,
                    status: 'active'
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingFaq ? 'Update FAQ' : 'Add FAQ'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FAQs List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Helpful
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFaqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {faq.question}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {faq.answer}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {faq.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(faq.id)}
                      className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        faq.status === 'active'
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      )}
                    >
                      {faq.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {faq.views}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">{faq.helpful}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-red-600">{faq.notHelpful}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => reorderFaqs(faq.id, 'up')}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        disabled={faq.order === 1}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => reorderFaqs(faq.id, 'down')}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(faq)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <Info className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No FAQs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first FAQ'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQManagement;
