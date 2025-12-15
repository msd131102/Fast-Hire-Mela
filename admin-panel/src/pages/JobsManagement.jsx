import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { jobsAPI, categoriesAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  X,
  MapPin,
  Building,
  Briefcase,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  Check,
  Clock,
  DollarSign,
  Tag,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const JobsManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [currentPage, searchTerm, statusFilter, typeFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined
      };

      // Remove undefined values
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const response = await jobsAPI.getJobs(params);
      setJobs(response.data.data.jobs || []);
      setTotalPages(response.data.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await jobsAPI.updateStatus(jobId, newStatus);
      fetchJobs();
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await jobsAPI.deleteJob(jobId);
        fetchJobs();
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedJobs.length === 0) {
      alert('Please select at least one job');
      return;
    }

    try {
      await jobsAPI.bulkDelete(selectedJobs);
      setSelectedJobs([]);
      fetchJobs();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const handleSelectJob = (jobId) => {
    setSelectedJobs(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleSelectAll = () => {
    if (selectedJobs.length === jobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(jobs.map(job => job.id));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      expired: { bg: 'bg-red-100', text: 'text-red-800', label: 'Expired' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs Management</h1>
          <p className="text-gray-600">Manage all job postings on the platform</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Job
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search jobs by title, company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedJobs.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedJobs.length} job{selectedJobs.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('deactivate')}
                >
                  <X className="h-4 w-4 mr-1" />
                  Deactivate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Jobs</CardTitle>
          <CardDescription>Manage and monitor all job postings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {jobs.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your filters or search terms'
                    : 'Get started by adding your first job posting'
                  }
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">
                      <input
                        type="checkbox"
                        checked={selectedJobs.length === jobs.length && jobs.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="text-left p-4 font-medium text-gray-900">Job Details</th>
                    <th className="text-left p-4 font-medium text-gray-900">Company</th>
                    <th className="text-left p-4 font-medium text-gray-900">Type</th>
                    <th className="text-left p-4 font-medium text-gray-900">Location</th>
                    <th className="text-left p-4 font-medium text-gray-900">Salary</th>
                    <th className="text-left p-4 font-medium text-gray-900">Status</th>
                    <th className="text-left p-4 font-medium text-gray-900">Posted</th>
                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedJobs.includes(job.id)}
                          onChange={() => handleSelectJob(job.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="p-4">
                        <div>
                          <h4 className="font-medium text-gray-900">{job.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{job.slug}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{job.company_name || job.company}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {job.job_type || job.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{job.location}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {job.salary_min && job.salary_max
                              ? `${job.salary_currency || 'INR'} ${parseInt(job.salary_min).toLocaleString()} - ${parseInt(job.salary_max).toLocaleString()}`
                              : job.salary || 'Not specified'
                            }
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(job.status)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {job.posted_date ? new Date(job.posted_date).toLocaleDateString() : (job.posted || 'N/A')}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              try {
                                console.log('Fetching job details for ID:', job.id);
                                const response = await jobsAPI.getJob(job.id);
                                console.log('Full job details:', response.data);
                                setEditingJob(response.data.data || response.data);
                                setShowEditModal(true);
                              } catch (error) {
                                console.error('Error fetching job details:', error);
                                toast.error('Failed to load job details');
                                // Fallback to table data
                                setEditingJob(job);
                                setShowEditModal(true);
                              }
                            }}
                            title="View/Edit Job"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              try {
                                console.log('Fetching job details for ID:', job.id);
                                const response = await jobsAPI.getJob(job.id);
                                console.log('Full job details:', response.data);
                                setEditingJob(response.data.data || response.data);
                                setShowEditModal(true);
                              } catch (error) {
                                console.error('Error fetching job details:', error);
                                toast.error('Failed to load job details');
                                // Fallback to table data
                                setEditingJob(job);
                                setShowEditModal(true);
                              }
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteJob(job.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Showing {jobs.length} of {totalPages * 10} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Job Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Job"
        size="lg"
      >
        <JobForm
          onSubmit={async (data) => {
            try {
              console.log('Creating job with data:', data);
              const response = await jobsAPI.createJob(data);
              console.log('Create response:', response);
              toast.success('Job created successfully!');
              setShowAddModal(false);
              fetchJobs();
            } catch (error) {
              console.error('Error creating job:', error);
              toast.error(error.response?.data?.message || 'Failed to create job');
            }
          }}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Job Modal */}
      <Modal
        isOpen={showEditModal && editingJob}
        onClose={() => {
          setShowEditModal(false);
          setEditingJob(null);
        }}
        title="Edit Job"
        size="lg"
      >
        <JobForm
          initialData={editingJob}
          onSubmit={async (data) => {
            try {
              console.log('Updating job with data:', data);
              const response = await jobsAPI.updateJob(editingJob.id, data);
              console.log('Update response:', response);
              toast.success('Job updated successfully!');
              setShowEditModal(false);
              setEditingJob(null);
              fetchJobs();
            } catch (error) {
              console.error('Error updating job:', error);
              console.error('Error response:', error.response?.data);
              toast.error(error.response?.data?.message || 'Failed to update job');
            }
          }}
          onCancel={() => {
            setShowEditModal(false);
            setEditingJob(null);
          }}
        />
      </Modal>
    </div>
  );
};

// Job Form Component
const JobForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company_id: '',
    category_id: '',
    location: '',
    job_type: 'full-time',
    salary_min: '',
    salary_max: '',
    salary_currency: 'INR',
    experience_level: 'entry',
    skills_required: '',
    responsibilities: '',
    eligibility: '',
    education_required: '',
    apply_link: '',
    application_deadline: '',
    work_mode: 'onsite',
    is_active: true,
    is_featured: false,
  });

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Initialize form data when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('Setting initial data for edit form:', initialData);

      // Format application_deadline for date input
      let formattedDeadline = '';
      if (initialData.application_deadline) {
        const deadline = new Date(initialData.application_deadline);
        if (!isNaN(deadline.getTime())) {
          formattedDeadline = deadline.toISOString().split('T')[0];
        }
      }

      // Format skills_required if it's an array
      let formattedSkills = '';
      if (initialData.skills_required) {
        if (Array.isArray(initialData.skills_required)) {
          formattedSkills = initialData.skills_required.join(', ');
        } else if (typeof initialData.skills_required === 'string') {
          formattedSkills = initialData.skills_required;
        }
      }

      // Format responsibilities if it's an array
      let formattedResponsibilities = '';
      if (initialData.responsibilities) {
        if (Array.isArray(initialData.responsibilities)) {
          formattedResponsibilities = initialData.responsibilities.join('\n');
        } else if (typeof initialData.responsibilities === 'string') {
          formattedResponsibilities = initialData.responsibilities;
        }
      }

      setFormData(prevData => ({
        ...prevData,
        title: initialData.title || '',
        description: initialData.description || '',
        company_id: initialData.company_id || '',
        category_id: initialData.category_id || '',
        location: initialData.location || '',
        job_type: initialData.job_type || initialData.type || 'full-time',
        salary_min: initialData.salary_min || '',
        salary_max: initialData.salary_max || '',
        salary_currency: initialData.salary_currency || 'INR',
        experience_level: initialData.experience_level || 'entry',
        skills_required: formattedSkills,
        responsibilities: formattedResponsibilities,
        eligibility: initialData.eligibility || initialData.eligibility_criteria || '',
        education_required: initialData.education_required || '',
        apply_link: initialData.apply_link || '',
        application_deadline: formattedDeadline,
        work_mode: initialData.work_mode || 'onsite',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
        is_featured: initialData.is_featured || false,
      }));
    }
  }, [initialData]);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories...');
        const response = await categoriesAPI.getCategories({ active_only: true });
        console.log('Categories response:', response.data);
        setCategories(response.data.data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company ID
          </label>
          <input
            type="number"
            name="company_id"
            value={formData.company_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Optional - Leave empty if not associated with a company"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          {categoriesLoading ? (
            <select
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            >
              <option>Loading categories...</option>
            </select>
          ) : (
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location *
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Type *
          </label>
          <select
            name="job_type"
            value={formData.job_type}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="remote">Remote</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Experience Level
          </label>
          <select
            name="experience_level"
            value={formData.experience_level}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="fresher">Fresher</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
            <option value="lead">Team Lead</option>
            <option value="executive">Executive</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Work Mode
          </label>
          <select
            name="work_mode"
            value={formData.work_mode}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="onsite">On-site</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Salary
          </label>
          <input
            type="number"
            name="salary_min"
            value={formData.salary_min}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Salary
          </label>
          <input
            type="number"
            name="salary_max"
            value={formData.salary_max}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            name="salary_currency"
            value={formData.salary_currency}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Application Deadline
          </label>
          <input
            type="date"
            name="application_deadline"
            value={formData.application_deadline}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Skills Required
        </label>
        <textarea
          name="skills_required"
          value={formData.skills_required}
          onChange={handleChange}
          rows={2}
          placeholder="e.g., JavaScript, React, Node.js (comma separated)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Responsibilities
        </label>
        <textarea
          name="responsibilities"
          value={formData.responsibilities}
          onChange={handleChange}
          rows={3}
          placeholder="List key responsibilities..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Eligibility Criteria
        </label>
        <textarea
          name="eligibility"
          value={formData.eligibility}
          onChange={handleChange}
          rows={2}
          placeholder="Eligibility requirements..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Education Required
        </label>
        <input
          type="text"
          name="education_required"
          value={formData.education_required}
          onChange={handleChange}
          placeholder="e.g., Bachelor's degree in Computer Science"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Application Link
        </label>
        <input
          type="url"
          name="apply_link"
          value={formData.apply_link}
          onChange={handleChange}
          placeholder="https://example.com/apply"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Active</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_featured"
            checked={formData.is_featured}
            onChange={handleChange}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Featured</span>
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : (initialData ? 'Update Job' : 'Create Job')}
        </Button>
      </div>
    </form>
  );
};

export default JobsManagement;
