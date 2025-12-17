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
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getJobs, getCategories, getCompanies, saveJob, unsaveJob } from '../../services/api';

// --- Utility Functions ---
const formatPostedDate = (dateString) => {
  if (!dateString) return 'N/A';
  const now = new Date();
  const then = new Date(dateString);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const postDate = new Date(then.getFullYear(), then.getMonth(), then.getDate());
  const diffInDays = Math.floor((today - postDate) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;

  return postDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const formatSalary = (min, max, currency = '₹') => {
  if (!min && !max) return 'Salary Not Disclosed';
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

const getSalaryRange = (range) => {
  if (!range) return { min: undefined, max: undefined };
  const ranges = {
    '0-3L': { min: 0, max: 300000 },
    '3-6L': { min: 300000, max: 600000 },
    '6-10L': { min: 600000, max: 1000000 },
    '10-15L': { min: 1000000, max: 1500000 },
    '15-25L': { min: 1500000, max: 2500000 },
    '25L+': { min: 2500000, max: undefined }
  };
  return ranges[range] || { min: undefined, max: undefined };
};

// --- Job Card Component ---
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="hover:shadow-md transition-all duration-200 border-gray-200 group relative overflow-hidden">
        <Link to={`/jobs/${job.id}`}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-4">
              {/* Company Logo */}
              <div className="flex-shrink-0">
                <img
                  src={job.company_logo || '/api/placeholder/60/60'}
                  alt={job.company_name}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-contain border border-gray-100 p-1 bg-white"
                />
              </div>

              {/* Title & Basics */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {job.title}
                  </h3>
                </div>
                
                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-1">
                  <div className="flex items-center text-gray-600 text-sm font-medium">
                    <Building2 className="w-3.5 h-3.5 mr-1 text-gray-400" />
                    <span className="truncate">{job.company_name}</span>
                  </div>
                  <div className="flex items-center text-gray-500 text-xs">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    <span>{job.location}</span>
                  </div>
                </div>
              </div>

              {/* Desktop Save Button (Top Right) */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`hidden sm:flex p-2 rounded-full transition-colors ${
                  isSaved ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Meta Info Grid */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 mt-4 py-3 border-t border-b border-gray-50">
              <div className="flex items-center text-sm text-gray-700">
                <Briefcase className="w-4 h-4 mr-2 text-orange-400" />
                <span>{formatExperience(job.experience_min, job.experience_max)}</span>
              </div>
              <div className="flex items-center text-sm text-green-700 font-semibold">
                <IndianRupee className="w-4 h-4 mr-1" />
                <span>{formatSalary(job.salary_min, job.salary_max)}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-2 text-blue-400" />
                <span>{formatPostedDate(job.posted_date)}</span>
              </div>
              <div className="hidden sm:block">
                 <span className="text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-1 rounded">
                   {job.job_type?.replace('-', ' ') || 'Full-time'}
                 </span>
              </div>
            </div>

            {/* Skills & Mobile Footer */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex flex-wrap gap-1.5">
                {job.skills_required?.slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="text-[10px] sm:text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                    {skill}
                  </span>
                ))}
                {job.skills_required?.length > 3 && (
                   <span className="text-[10px] text-gray-400 mt-0.5">+{job.skills_required.length - 3} more</span>
                )}
              </div>
              
              <div className="sm:hidden flex items-center gap-2">
                 <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSave}
                    className={isSaved ? 'text-red-500' : 'text-gray-400'}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${isSaved ? 'fill-current' : ''}`} />
                    {isSaved ? 'Saved' : 'Save'}
                  </Button>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  );
};

// --- Sub-components (EmptyState, Skeleton, etc.) remain largely the same, optimized for spacing ---
const EmptyState = ({ onClearFilters }) => (
  <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
      <Briefcase className="w-10 h-10 text-gray-300" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs match your search</h3>
    <p className="text-gray-500 mb-6 max-w-xs mx-auto">
      Try changing your filters or keywords to find what you're looking for.
    </p>
    <Button onClick={onClearFilters} variant="primary">Clear All Filters</Button>
  </div>
);

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl p-6 shadow-sm border animate-pulse">
        <div className="flex gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg" />
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-1/4" />
            <div className="h-8 bg-gray-50 rounded w-full mt-4" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// --- Main JobsList Component ---
const JobsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    company: searchParams.get('company') || '',
    jobType: searchParams.get('job_type') || '',
    experience: searchParams.get('experience_level') || '',
    salary: searchParams.get('salary') || '',
    sortBy: searchParams.get('sort_by') || 'posted_date',
  }));

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'posted_date') params.set(key, value);
    });
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

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

  const { data: jobsData, isLoading: jobsLoading, error: jobsError } = useQuery({
    queryKey: ['jobs', queryParams],
    queryFn: () => getJobs(queryParams),
  });

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const { data: companies } = useQuery({ queryKey: ['companies'], queryFn: getCompanies });

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ search: '', category: '', location: '', company: '', jobType: '', experience: '', salary: '', sortBy: 'posted_date' });
    setCurrentPage(1);
    setShowFilters(false);
  }, []);

  const handleSaveJob = useCallback(async (jobId, isCurrentlySaved) => {
    try {
      isCurrentlySaved ? await unsaveJob(jobId) : await saveJob(jobId);
      setSavedJobs(prev => {
        const next = new Set(prev);
        isCurrentlySaved ? next.delete(jobId) : next.add(jobId);
        return next;
      });
    } catch (e) { console.error(e); }
  }, []);

  const activeFiltersCount = useMemo(() => 
    Object.entries(filters).filter(([k, v]) => v && v !== 'posted_date' && k !== 'search').length, 
  [filters]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Search Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <h1 className="hidden lg:block text-2xl font-bold text-gray-900 mr-4 whitespace-nowrap">Find Work</h1>
            
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Job title, keywords, or company..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base shadow-inner"
              />
            </div>

            <Button
              onClick={() => setShowFilters(true)}
              variant="outline"
              className="lg:hidden w-full flex items-center justify-center gap-2 h-12 rounded-xl border-gray-200 font-semibold"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-blue-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar (Desktop) / Drawer (Mobile) */}
          <AnimatePresence>
            {(showFilters || !isMobile) && (
              <>
                {isMobile && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 lg:hidden"
                    onClick={() => setShowFilters(false)}
                  />
                )}
                <motion.aside
                  initial={isMobile ? { y: '100%' } : { opacity: 0, x: -20 }}
                  animate={isMobile ? { y: 0 } : { opacity: 1, x: 0 }}
                  exit={isMobile ? { y: '100%' } : { opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className={`${
                    isMobile 
                    ? 'fixed bottom-0 left-0 right-0 h-[85vh] bg-white z-[60] rounded-t-3xl overflow-y-auto' 
                    : 'w-72 flex-shrink-0 sticky top-24 h-fit'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                        Refine Search
                      </h3>
                      <button onClick={clearFilters} className="text-sm text-blue-600 font-medium hover:underline">Reset</button>
                    </div>

                    <div className="space-y-6 pb-24 lg:pb-0">
                      {/* Filter Group: Category */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Job Category</label>
                        <select 
                          value={filters.category} 
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                          className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-blue-500"
                        >
                          <option value="">All Categories</option>
                          {categories?.data?.categories?.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                        </select>
                      </div>

                      {/* Filter Group: Location */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="City or state..."
                            value={filters.location}
                            onChange={(e) => handleFilterChange('location', e.target.value)}
                            className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm"
                          />
                        </div>
                      </div>

                      {/* Filter Group: Salary */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Salary Range (LPA)</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['0-3L', '3-6L', '6-10L', '10-15L', '15-25L', '25L+'].map(range => (
                            <button
                              key={range}
                              onClick={() => handleFilterChange('salary', filters.salary === range ? '' : range)}
                              className={`p-2 text-xs rounded-lg border transition-all ${
                                filters.salary === range 
                                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100' 
                                : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                              }`}
                            >
                              {range}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Experience & Job Type (Simplified for UI) */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Experience</label>
                        <select 
                          value={filters.experience} 
                          onChange={(e) => handleFilterChange('experience', e.target.value)}
                          className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm"
                        >
                          <option value="">Any Experience</option>
                          {['fresher', 'entry', 'mid', 'senior', 'lead'].map(l => (
                            <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {isMobile && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
                      <Button className="w-full py-4 rounded-2xl shadow-lg shadow-blue-100" onClick={() => setShowFilters(false)}>
                        Show {jobsData?.data?.pagination?.total_jobs || 0} Results
                      </Button>
                    </div>
                  )}
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Jobs Feed */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">
                  {jobsLoading ? 'Finding jobs...' : `${jobsData?.data?.pagination?.total_jobs || 0} Open Positions`}
                </h2>
                {!jobsLoading && <p className="text-gray-500 text-sm mt-0.5">Showing results based on your preferences</p>}
              </div>

              <div className="hidden lg:flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-gray-400 px-3">SORT:</span>
                <select 
                   value={filters.sortBy} 
                   onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                   className="text-sm font-semibold text-gray-700 bg-transparent outline-none pr-4"
                >
                  <option value="posted_date">Newest First</option>
                  <option value="salary_max">Highest Pay</option>
                  <option value="salary_min">Entry Pay</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {jobsLoading ? (
                <LoadingSkeleton />
              ) : jobsError ? (
                <div className="text-center p-12 bg-white rounded-2xl border">
                  <p className="text-red-500 font-medium mb-4">Something went wrong while fetching jobs.</p>
                  <Button onClick={() => window.location.reload()}>Try Again</Button>
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

            <div className="mt-10">
              <Pagination
                currentPage={currentPage}
                totalPages={jobsData?.data?.pagination?.total_pages || 1}
                onPageChange={setCurrentPage}
                isLoading={jobsLoading}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobsList;