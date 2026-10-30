import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Search,
  Eye,
  Mail,
  Phone,
  Calendar,
  Award,
  TrendingUp,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { referralsAPI } from '../services/api';

const ReferralsManagement = () => {
  const [referrals, setReferrals] = useState([]);
  const [filteredReferrals, setFilteredReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalReferrals: 0,
    conversionRate: 0
  });

  useEffect(() => {
    fetchReferrals();
  }, []);

  useEffect(() => {
    const filtered = referrals.filter(referral => {
      const matchesSearch =
        referral.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        referral.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || referral.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    setFilteredReferrals(filtered);
  }, [referrals, searchTerm, statusFilter]);

  useEffect(() => {
    const newStats = {
      total: referrals.length,
      pending: referrals.filter(r => r.status === 'pending').length,
      approved: referrals.filter(r => r.status === 'approved').length,
      rejected: referrals.filter(r => r.status === 'rejected').length,
      totalReferrals: referrals.reduce((sum, r) => sum + (r.referral_count || 0), 0),
      conversionRate: referrals.length > 0 
        ? ((referrals.filter(r => r.status === 'approved').length / referrals.length) * 100).toFixed(1)
        : 0
    };
    setStats(newStats);
  }, [referrals]);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const res = await referralsAPI.getReferrals();
      if (res.data?.success) {
        setReferrals(res.data.referrals || []);
      }
    } catch (err) {
      console.error('Error fetching referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await referralsAPI.updateReferralStatus(id, { status });
      if (res.success) {
        setReferrals(prev =>
          prev.map(r => (r.id === id ? { ...r, status } : r))
        );
        alert(`Referral ${status} successfully!`);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Status update failed');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return variants[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      approved: <CheckCircle className="h-4 w-4" />,
      rejected: <XCircle className="h-4 w-4" />,
      pending: <Clock className="h-4 w-4" />
    };
    return icons[status] || <Clock className="h-4 w-4" />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportData = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Referrals', 'Status', 'Submitted Date'],
      ...filteredReferrals.map(ref => [
        ref.name,
        ref.email,
        ref.phone || '',
        ref.referral_count || 0,
        ref.status,
        formatDate(ref.created_at)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `referrals_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading referrals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Referrals Management</h1>
              <p className="text-gray-500 mt-1">Verify and manage user referrals for premium access</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={exportData}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                onClick={fetchReferrals}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.conversionRate}%</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* FILTERS AND SEARCH */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </Card>

        {/* REFERRALS TABLE */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referral Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referred Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReferrals.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <Users className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-lg font-medium">No referrals found</p>
                        <p className="text-sm mt-1">
                          {searchTerm || statusFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Referrals will appear here once users submit them'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReferrals.map((referral) => (
                    <tr key={referral.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{referral.name}</p>
                          <p className="text-sm text-gray-500">ID: {referral.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            {referral.email}
                          </div>
                          {referral.mobile && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="h-4 w-4 mr-2 text-gray-400" />
                              {referral.mobile}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {referral.referral_count || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(referral.status)}`}>
                          {getStatusIcon(referral.status)}
                          <span className="ml-1">{referral.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {formatDate(referral.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => {
                              setSelectedReferral(referral);
                              setShowDetails(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          {referral.status === 'pending' && (
                            <>
                              <Button
                                onClick={() => updateStatus(referral.id, 'approved')}
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button
                                onClick={() => updateStatus(referral.id, 'rejected')}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* REFERRAL DETAILS MODAL */}
      {showDetails && selectedReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Referral Details</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Referral ID: {selectedReferral.id}
                  </p>
                </div>
                <Button
                  onClick={() => setShowDetails(false)}
                  variant="outline"
                  size="sm"
                >
                  ×
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* User Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">User Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-sm text-gray-900">{selectedReferral.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{selectedReferral.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-sm text-gray-900">{selectedReferral.mobile || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(selectedReferral.status)}`}>
                      {getStatusIcon(selectedReferral.status)}
                      <span className="ml-1">{selectedReferral.status}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Referral Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Referral Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Referrals</p>
                    <p className="text-sm text-gray-900">{selectedReferral.referral_count || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Premium Eligible</p>
                    <p className="text-sm text-gray-900">
                      {selectedReferral.premium_eligible ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Submitted Date</p>
                    <p className="text-sm text-gray-900">{formatDate(selectedReferral.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="text-sm text-gray-900">
                      {selectedReferral.updated_at 
                        ? formatDate(selectedReferral.updated_at)
                        : 'Not updated'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Referred Users List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Referred Users ({selectedReferral.referred_users?.length || 0})
                </h3>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  {selectedReferral.referred_users && selectedReferral.referred_users.length > 0 ? (
                    <div className="p-4 space-y-2">
                      {selectedReferral.referred_users.map((user, index) => (
                        <div key={index} className="flex items-center py-2 px-3 bg-gray-50 rounded">
                          <span className="text-sm font-medium text-gray-900 w-8">
                            {index + 1}.
                          </span>
                          <span className="text-sm text-gray-700">{user}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p>No referred users found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Notes */}
              {selectedReferral.admin_notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Admin Notes</h3>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-gray-700">{selectedReferral.admin_notes}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedReferral.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => {
                      updateStatus(selectedReferral.id, 'approved');
                      setShowDetails(false);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Referral
                  </Button>
                  <Button
                    onClick={() => {
                      updateStatus(selectedReferral.id, 'rejected');
                      setShowDetails(false);
                    }}
                    variant="outline"
                    className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Referral
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralsManagement;
