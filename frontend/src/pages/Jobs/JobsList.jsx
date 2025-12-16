import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Building2,
  Clock,
  IndianRupee,
  Briefcase,
  Users,
  X,
  SlidersHorizontal,
  Heart,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getJobs, getCategories, getCompanies, saveJob, unsaveJob } from '../../services/api';

// Utility functions
const formatPostedDate = (dateString) => {
  if (!dateString) return 'N/A';
  const now = new Date();
  const then = new Date(dateString);
  const diffInDays = Math.floor((now - then) / (1000 * 60 * 60 * 24));
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return then.toLocaleDateString();
};

const formatSalary = (min, max, currency = '₹') => {
  if (!min && !max) return 'Salary Not Disclosed';
  
  // Convert from database format (actual amount) to LPA format
  const minInLakhs = min ? (min / 100000).toFixed(1) : null;
  const maxInLakhs = max ? (max / 100000).toFixed(1) : null;
  
  if (min && max) return `${currency}${minInLakhs}L - ${currency}${maxInLakhs}L`;
  return min ? `${currency}${minInLakhs}L+` : `Up to ${currency}${maxInLakhs}L`;
};

const formatExperience = (min, max) => {
  if (!min && !max) return 'Any Experience';
  if (min && max) return `${min}-${max} years`;
  return min ? `${min}+ years` : `Entry Level`;
};

// Helper function for salary range conversion
const getSalaryRange = (range) => {
  if (!range) return { min: undefined, max: undefined };
  
  const ranges = {
    '0-3L': { min: 0, max: 300000 },    // 0-3 Lakhs
    '3-6L': { min: 300000, max: 600000 },  // 3-6 Lakhs
    '6-10L': { min: 600000, max: 1000000 }, // 6-10 Lakhs
    '10-15L': { min: 1000000, max: 1500000 }, // 10-15 Lakhs
    '15-25L': { min: 1500000, max: 2500000 }, // 15-25 Lakhs
    '25L+': { min: 2500000, max: undefined } // 25+ Lakhs
  };
  
  return ranges[range] || { min: undefined, max: undefined };
};

// Job Card Component
const JobCard = ({ job, index, onSaveToggle, isSaved }) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaving(true);
    try {
      await onSaveToggle(job.id, isSaved);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
        <Link to={`/jobs/${job.id}`}>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
              {/* Company Logo and Basic Info */}
              <div className="flex items-start gap-3 lg:flex-col">
                <img
                  src={job.company_logo || '/api/placeholder/60/60'}
                  alt={job.company_name}
                  className="w-12 h-12 lg:w-14 lg:h-14 rounded-lg object-contain border p-1 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex items-center text-gray-600 text-sm mt-1">
                    <Building2 className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{job.company_name}</span>
                  </div>
                </div>
              </div>

              {/* Job Type and Posted Date */}
              <div className="flex flex-1 items-center justify-between lg:justify-end gap-2">
                <span className="inline-block text-xs font-semibold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
                  {job.job_type ? job.job_type.replace('-', ' ') : 'Full-time'}
                </span>
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{formatPostedDate(job.posted_date)}</span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center text-gray-600 text-sm mt-3">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span>{job.location}</span>
            </div>

            {/* Experience and Salary */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700 mt-3 pt-3 border-t">
              <div className="flex items-center">
                <Briefcase className="w-4 h-4 mr-1 text-orange-500" />
                <span>{formatExperience(job.experience_min, job.experience_max)}</span>
              </div>
              <div className="flex items-center text-green-700 font-medium">
                <IndianRupee className="w-4 h-4 mr-1" />
                <span>{formatSalary(job.salary_min, job.salary_max)}</span>
              </div>
            </div>

            {/* Skills */}
            {job.skills_required && job.skills_required.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {job.skills_required.slice(0, 4).map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {job.skills_required.length > 4 && (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                    +{job.skills_required.length - 4}
                  </span>
                )}
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="text-gray-500 hover:text-red-500 hover:bg-red-50"
              >
                <Heart
                  className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`}
                />
                {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
              </Button>
            </div>
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  );
};

// Loading Skeleton Component
const LoadingSkeleton = () => (
  Array.from({ length: 6 }).map((_, index) => (
    <div key={index} className="bg-white rounded-xl p-6 shadow-md animate-pulse border">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-gray-200 rounded-lg flex-shrink-0"></div>
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="flex gap-4 pt-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <div className="h-5 bg-gray-100 rounded-full w-16"></div>
            <div className="h-5 bg-gray-100 rounded-full w-20"></div>
            <div className="h-5 bg-gray-100 rounded-full w-14"></div>
          </div>
        </div>
      </div>
    </div>
  ))
);

// Empty State Component
const EmptyState = ({ onClearFilters }) => (
  <div className="text-center py-16 bg-white rounded-xl shadow-md border">
    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <h3 className="text-2xl font-bold text-gray-900 mb-2">No Jobs Found</h3>
    <p className="text-gray-600 mb-6 max-w-sm mx-auto">
      We couldn't find any job postings that match your criteria. Try adjusting your filters or search terms.
    </p>
    <Button onClick={onClearFilters} variant="outline">
      Clear All Filters
    </Button>
  </div>
);

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange, isLoading }) => {
  const pages = useMemo(() => {
    const pageNumbers = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        size="sm"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>

      {pages[0] > 1 && (
        <>
          <Button
            variant="outline"
            onClick={() => onPageChange(1)}
            size="sm"
            className="w-10 h-10"
          >
            1
          </Button>
          {pages[0] > 2 && <span className="px-2">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? 'primary' : 'outline'}
          onClick={() => onPageChange(page)}
          size="sm"
          className="w-10 h-10"
        >
          {page}
        </Button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="px-2">...</span>}
          <Button
            variant="outline"
            onClick={() => onPageChange(totalPages)}
            size="sm"
            className="w-10 h-10"
          >
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        size="sm"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

const JobsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [isMobile, setIsMobile] = useState(false);

  // Initialize filters from URL params
  const [filters, setFilters] = useState(() => {
    const initialFilters = {
      search: searchParams.get('q') || '',
      category: searchParams.get('category') || '',
      location: searchParams.get('location') || '',
      company: searchParams.get('company') || '',
      jobType: searchParams.get('job_type') || '',
      experience: searchParams.get('experience_level') || '',
      salary: searchParams.get('salary') || '',
      sortBy: searchParams.get('sort_by') || 'posted_date',
    };
    return initialFilters;
  });

  const [currentPage, setCurrentPage] = useState(1);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sync URL with filters
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'posted_date') params.set(key, value);
    });
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Build query parameters
  const queryParams = useMemo(() => {
    const salaryRange = getSalaryRange(filters.salary);
    return {
      page: currentPage,
      limit: 12,
      search: filters.search || undefined,
      location: filters.location || undefined,
      category: filters.category || undefined,
      company: filters.company || undefined,
      job_type: filters.jobType || undefined,
      experience_level: filters.experience || undefined,
      salary_min: salaryRange.min,
      salary_max: salaryRange.max,
      sort_by: filters.sortBy === 'latest' ? 'posted_date' : filters.sortBy,
      sort_order: filters.sortBy === 'salary_low' ? 'ASC' : 'DESC'
    };
  }, [filters, currentPage]);

  // Fetch jobs
  const { data: jobsData, isLoading: jobsLoading, error: jobsError } = useQuery({
    queryKey: ['jobs', queryParams],
    queryFn: () => getJobs(queryParams),
    keepPreviousData: true,
  });

  // Fetch categories and companies
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: getCompanies,
  });

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      location: '',
      company: '',
      jobType: '',
      experience: '',
      salary: '',
      sortBy: 'posted_date'
    });
    setCurrentPage(1);
    setShowFilters(false);
  }, []);

  // Handle save/unsave job
  const handleSaveJob = useCallback(async (jobId, isCurrentlySaved) => {
    try {
      if (isCurrentlySaved) {
        await unsaveJob(jobId);
        setSavedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      } else {
        await saveJob(jobId);
        setSavedJobs(prev => new Set([...prev, jobId]));
      }
    } catch (error) {
      console.error('Error toggling save job:', error);
    }
  }, []);

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(v => v && v !== 'posted_date').length;
  }, [filters]);

  const jobTypes = ['full-time', 'part-time', 'contract', 'internship', 'remote', 'hybrid'];
  const experienceLevels = ['fresher', 'entry', 'mid', 'senior', 'lead', 'executive'];
  const salaryRanges = ['0-3L', '3-6L', '6-10L', '10-15L', '15-25L', '25L+'];
  const sortOptions = [
    { value: 'posted_date', label: 'Latest' },
    { value: 'salary_max', label: 'Salary: High to Low' },
    { value: 'salary_min', label: 'Salary: Low to High' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Job Opportunities</h1>

            {/* Search Bar */}
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search jobs by title, skills, or company..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 h-11 w-full"
                />
              </div>
            </div>

            {/* Filter Button */}
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="relative lg:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {(showFilters || !isMobile) && (
              <>
                {isMobile && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 z-20"
                    onClick={() => setShowFilters(false)}
                  />
                )}
                <motion.div
                  initial={isMobile ? { x: '-100%' } : { opacity: 0, x: -20 }}
                  animate={isMobile ? (showFilters ? { x: 0 } : { x: '-100%' }) : { opacity: 1, x: 0 }}
                  exit={isMobile ? { x: '-100%' } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`${isMobile
                      ? 'fixed left-0 top-0 h-full w-80 z-30 overflow-y-auto bg-white shadow-xl'
                      : 'lg:w-80 flex-shrink-0'
                    }`}
                >
                  <Card className={isMobile ? 'h-full rounded-none' : 'lg:sticky lg:top-24'}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                          Filters
                        </h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-sm"
                          >
                            Clear
                          </Button>
                          {isMobile && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowFilters(false)}
                            >
                              <X className="w-5 h-5" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* Category Filter */}
                        <div>
                          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            <Briefcase className="w-4 h-4 mr-2 text-purple-500" />
                            Category
                          </label>
                          <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          >
                            <option value="">All Categories</option>
                            {categories?.data?.categories?.map(category => (
                              <option key={category.id} value={category.slug}>{category.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Location Filter */}
                        <div>
                          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="w-4 h-4 mr-2 text-red-500" />
                            Location
                          </label>
                          <Input
                            placeholder="City, State, or Country"
                            value={filters.location}
                            onChange={(e) => handleFilterChange('location', e.target.value)}
                          />
                        </div>

                        {/* Company Filter */}
                        <div>
                          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            <Building2 className="w-4 h-4 mr-2 text-blue-500" />
                            Company
                          </label>
                          <select
                            value={filters.company}
                            onChange={(e) => handleFilterChange('company', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          >
                            <option value="">All Companies</option>
                            {companies?.data?.map(company => (
                              <option key={company.id} value={company.id}>{company.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Job Type Filter */}
                        <div>
                          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            <Briefcase className="w-4 h-4 mr-2 text-green-500" />
                            Job Type
                          </label>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {jobTypes.map(type => (
                              <label key={type} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                                <input
                                  type="radio"
                                  name="jobType"
                                  value={type}
                                  checked={filters.jobType === type}
                                  onChange={(e) => handleFilterChange('jobType', e.target.value)}
                                  className="mr-3 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 capitalize">{type.replace('-', ' ')}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Experience Level Filter */}
                        <div>
                          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            <Users className="w-4 h-4 mr-2 text-orange-500" />
                            Experience Level
                          </label>
                          <select
                            value={filters.experience}
                            onChange={(e) => handleFilterChange('experience', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          >
                            <option value="">All Levels</option>
                            {experienceLevels.map(level => (
                              <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                            ))}
                          </select>
                        </div>

                        {/* Salary Range Filter */}
                        <div>
                          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            <IndianRupee className="w-4 h-4 mr-2 text-emerald-500" />
                            Salary Range (LPA)
                          </label>
                          <select
                            value={filters.salary}
                            onChange={(e) => handleFilterChange('salary', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          >
                            <option value="">Any Salary</option>
                            {salaryRanges.map(range => (
                              <option key={range} value={range}>{range}</option>
                            ))}
                          </select>
                        </div>

                        {/* Sort By */}
                        <div>
                          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            <ChevronDown className="w-4 h-4 mr-2 text-gray-500" />
                            Sort By
                          </label>
                          <select
                            value={filters.sortBy}
                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          >
                            {sortOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Mobile Apply Button */}
                      {isMobile && (
                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg z-40">
                          <Button
                            onClick={() => setShowFilters(false)}
                            className="w-full"
                            size="lg"
                          >
                            Show {jobsData?.data?.pagination?.total_jobs || 0} Results
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Jobs List */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 p-4 bg-white rounded-lg shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {jobsLoading ? 'Searching...' : `${jobsData?.data?.pagination?.total_jobs || 0} Jobs Found`}
                </h2>
                <p className="text-gray-600 text-sm">
                  {jobsLoading ? 'Please wait' : `Page ${currentPage} of ${jobsData?.data?.pagination?.total_pages || 1}`}
                </p>
              </div>

              {/* Desktop Sort */}
              <div className="hidden lg:flex items-center gap-2">
                <label htmlFor="sort-by" className="text-sm text-gray-700 font-medium">Sort by:</label>
                <div className="relative">
                  <select
                    id="sort-by"
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white pr-8"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Job Cards */}
            <div className="space-y-4">
              {jobsLoading ? (
                <LoadingSkeleton />
              ) : jobsError ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-md border">
                  <p className="text-red-600 mb-4">Error loading jobs. Please try again.</p>
                  <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
              ) : jobsData?.data?.jobs?.length > 0 ? (
                jobsData.data.jobs.map((job, index) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    index={index}
                    onSaveToggle={handleSaveJob}
                    isSaved={savedJobs.has(job.id)}
                  />
                ))
              ) : (
                <EmptyState onClearFilters={clearFilters} />
              )}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={jobsData?.data?.pagination?.total_pages || 1}
              onPageChange={setCurrentPage}
              isLoading={jobsLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsList;
