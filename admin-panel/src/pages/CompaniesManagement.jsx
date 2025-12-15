import React, { useState, useEffect } from 'react';
import { Building2, Search, Settings, Download, Eye, Pencil, Trash2, Plus, X, XCircle, CheckCircle, MapPin, Mail, Phone, Globe } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { cn } from '../utils/cn';
import { companiesAPI } from '../services/api';

const CompaniesManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(null);

  // Helper function to transform company data
  const transformCompanyData = (companiesData) => {
    return (Array.isArray(companiesData) ? companiesData : []).map(company => ({
      ...company,
      jobCount: parseInt(company.job_count) || 0,
      status: company.is_active !== false ? 'active' : 'inactive', // Default to active if no is_active field
      createdAt: company.created_at,
      updatedAt: company.updated_at,
      email: company.email || 'N/A',
      phone: company.phone || 'N/A'
    }));
  };

  // Fetch companies from API
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await companiesAPI.getCompanies();
        console.log('Companies API response:', response.data);
        // Ensure we always set an array - data is nested in response.data.data
        const companiesData = response.data?.data || response.data || [];

        // Transform API response to match frontend expectations
        const transformedCompanies = transformCompanyData(companiesData);

        setCompanies(transformedCompanies);
      } catch (error) {
        console.error('Error fetching companies:', error);
        setCompanies([]); // Set empty array on error
        // Error is handled by the API interceptor
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const filteredCompanies = (companies || []).filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || company.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleSelectCompany = (companyId) => {
    setSelectedCompanies(prev =>
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCompanies.length === filteredCompanies.length) {
      setSelectedCompanies([]);
    } else {
      setSelectedCompanies(filteredCompanies.map(company => company.id));
    }
  };

  const handleDeleteCompany = (companyId) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      setCompanies(prev => prev.filter(company => company.id !== companyId));
      setSelectedCompanies(prev => prev.filter(id => id !== companyId));
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedCompanies.length} companies?`)) {
      try {
        await Promise.all(selectedCompanies.map(companyId => companiesAPI.deleteCompany(companyId)));
        setCompanies(prev => prev.filter(company => !selectedCompanies.includes(company.id)));
        setSelectedCompanies([]);
      } catch (error) {
        console.error('Error deleting companies:', error);
      }
    }
  };

  const handleToggleStatus = async (companyId) => {
    const company = companies.find(c => c.id === companyId);
    if (!company) return;

    try {
      if (company.status === 'active') {
        await companiesAPI.blockCompany(companyId);
        setCompanies(prev => prev.map(c =>
          c.id === companyId ? { ...c, status: 'inactive' } : c
        ));
      } else {
        await companiesAPI.unblockCompany(companyId);
        setCompanies(prev => prev.map(c =>
          c.id === companyId ? { ...c, status: 'active' } : c
        ));
      }
    } catch (error) {
      console.error('Error updating company status:', error);
    }
  };

  const exportCompanies = () => {
    try {
      // Get the filtered companies data
      const exportData = filteredCompanies.map(company => ({
        'Company Name': company.name || '',
        'Description': company.description || '',
        'Industry': company.industry || '',
        'Status': company.status || 'active',
        'Job Count': company.jobCount || 0,
        'Location': company.location || '',
        'Email': company.email || '',
        'Phone': company.phone || '',
        'Website': company.website || '',
        'Created Date': new Date(company.createdAt).toLocaleDateString(),
        'Updated Date': new Date(company.updatedAt).toLocaleDateString()
      }));

      // Convert to CSV
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row =>
          headers.map(header => {
            const value = row[header];
            // Escape commas and quotes in values
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `companies_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success message
      console.log('Companies exported successfully');
    } catch (error) {
      console.error('Error exporting companies:', error);
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Companies Management</h1>
          <p className="text-gray-600">Manage company profiles and job postings</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Companies</p>
              <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Companies</p>
              <p className="text-2xl font-bold text-gray-900">
                {companies.filter(c => c.status === 'active').length}
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
              <p className="text-sm text-gray-600">Inactive Companies</p>
              <p className="text-2xl font-bold text-gray-900">
                {companies.filter(c => c.status === 'inactive').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Job Postings</p>
              <p className="text-2xl font-bold text-gray-900">
                {companies.reduce((sum, c) => sum + (c.jobCount || 0), 0)}
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
              placeholder="Search companies by name, description, or industry..."
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

          <Button variant="outline" onClick={exportCompanies}>
            <Download className="h-5 w-5 mr-2" />
            Export
          </Button>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedCompanies.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedCompanies.length} compan{selectedCompanies.length > 1 ? 'ies' : 'y'} selected
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

      {/* Companies Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCompanies.length === filteredCompanies.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Industry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jobs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCompanies.includes(company.id)}
                      onChange={() => handleSelectCompany(company.id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{company.name}</div>
                        <div className="text-sm text-gray-500">{company.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {company.industry || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(company.id)}
                      className={cn(
                        "px-2 py-1 text-xs rounded-full font-medium",
                        company.status === 'active'
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      )}
                    >
                      {company.status || 'active'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {company.jobCount || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {company.location ? (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {company.location}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="space-y-1">
                      {company.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {company.email}
                        </div>
                      )}
                      {company.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {company.phone}
                        </div>
                      )}
                      {company.website && (
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-1" />
                          <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Website
                          </a>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(company.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCurrentCompany(company);
                          setShowEditModal(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCompany(company.id)}
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

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Company</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const companyData = {
                name: formData.get('name'),
                description: formData.get('description'),
                industry: formData.get('industry'),
                location: formData.get('location'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                website: formData.get('website'),
              };

              try {
                await companiesAPI.createCompany(companyData);
                setShowAddModal(false);
                // Refresh companies list
                const response = await companiesAPI.getCompanies();
                const companiesData = response.data?.data || response.data || [];
                setCompanies(transformCompanyData(companiesData));
              } catch (error) {
                console.error('Error creating company:', error);
              }
            }}>
              <div className="space-y-4">
                <Input
                  name="name"
                  label="Company Name"
                  required
                />
                <Input
                  name="description"
                  label="Description"
                  textarea
                  rows={3}
                />
                <Input
                  name="industry"
                  label="Industry"
                />
                <Input
                  name="location"
                  label="Location"
                />
                <Input
                  name="email"
                  label="Email"
                  type="email"
                />
                <Input
                  name="phone"
                  label="Phone"
                />
                <Input
                  name="website"
                  label="Website"
                  type="url"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Company
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {showEditModal && currentCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Company</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowEditModal(false);
                  setCurrentCompany(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const companyData = {
                name: formData.get('name'),
                description: formData.get('description'),
                industry: formData.get('industry'),
                location: formData.get('location'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                website: formData.get('website'),
              };

              try {
                await companiesAPI.updateCompany(currentCompany.id, companyData);
                setShowEditModal(false);
                setCurrentCompany(null);
                // Refresh companies list
                const response = await companiesAPI.getCompanies();
                const companiesData = response.data?.data || response.data || [];
                setCompanies(transformCompanyData(companiesData));
              } catch (error) {
                console.error('Error updating company:', error);
              }
            }}>
              <div className="space-y-4">
                <Input
                  name="name"
                  label="Company Name"
                  defaultValue={currentCompany.name}
                  required
                />
                <Input
                  name="description"
                  label="Description"
                  textarea
                  rows={3}
                  defaultValue={currentCompany.description}
                />
                <Input
                  name="industry"
                  label="Industry"
                  defaultValue={currentCompany.industry}
                />
                <Input
                  name="location"
                  label="Location"
                  defaultValue={currentCompany.location}
                />
                <Input
                  name="email"
                  label="Email"
                  type="email"
                  defaultValue={currentCompany.email}
                />
                <Input
                  name="phone"
                  label="Phone"
                  defaultValue={currentCompany.phone}
                />
                <Input
                  name="website"
                  label="Website"
                  type="url"
                  defaultValue={currentCompany.website}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentCompany(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Update Company
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompaniesManagement;
