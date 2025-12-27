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
  SlidersHorizontal,
  Heart,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { getJobs, getCategories, getCompanies, saveJob, unsaveJob } from '../../services/api';
import Pagination from '../../components/ui/Pagination';

// --- Utility Functions ---
const formatPostedDate = (dateString) => {
  if (!dateString) return 'N/A';
  const ukDate = new Date(dateString);
  const indiaTime = new Date(ukDate.getTime() + (5.5 * 60 * 60 * 1000));
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const postDate = new Date(indiaTime.getFullYear(), indiaTime.getMonth(), indiaTime.getDate());
  const diffInDays = Math.floor((today - postDate) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return indiaTime.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

const formatSalaryShort = (max, currency = '₹') => {
  if (!max) return 'N/A';
  return `${currency}${(max / 100000).toFixed(0)}L`;
};

const getSalaryRange = (range) => {
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

// --- Updated Job Card Component (Optimized for 2-column Grid) ---
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
      className="h-full"
    >
      <Card className="h-full hover:shadow-md transition-all duration-200 border-gray-200 group relative overflow-hidden flex flex-col">
        <Link to={`/jobs/${job.slug}`} className="flex flex-col h-full">
          <CardContent className="p-3 sm:p-5 flex flex-col h-full">
            
            {/* Header: Logo and Save */}
            <div className="flex justify-between items-start mb-2.5">
              <div className="bg-white p-1 rounded-lg border border-gray-100 shadow-sm flex-shrink-0">
                <img
                  src={job.company_logo || '/api/placeholder/40/40'}
                  alt={job.company_name}
                  className="w-9 h-9 sm:w-12 sm:h-12 object-contain"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`p-1.5 rounded-full transition-colors ${
                  isSaved ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Title & Company - Line clamp keeps grid even */}
            <div className="flex-1">
              <h3 className="text-[13px] sm:text-base font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                {job.title}
              </h3>
              <p className="text-[11px] sm:text-sm text-gray-500 mt-1 truncate font-medium">
                {job.company_name}
              </p>
            </div>

            {/* Bottom Meta Section */}
            <div className="mt-3 pt-3 border-t border-gray-50 space-y-1.5">
              <div className="flex items-center text-[10px] sm:text-xs text-gray-600">
                <MapPin className="w-3 h-3 mr-1 text-gray-400 shrink-0" />
                <span className="truncate">{job.location}</span>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center text-[10px] sm:text-xs font-bold text-green-600">
                  <IndianRupee className="w-3 h-3 mr-0.5 shrink-0" />
                  <span>{formatSalaryShort(job.salary_max)}</span>
                </div>
                <div className="flex items-center text-[9px] sm:text-[11px] text-gray-400">
                  <Clock className="w-2.5 h-2.5 mr-1" />
                  {formatPostedDate(job.posted_date)}
                </div>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  );
};

const LoadingSkeleton = () => (
  <div className="bg-white rounded-xl p-4 shadow-sm border animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="w-10 h-10 bg-gray-100 rounded-lg" />
      <div className="w-8 h-8 bg-gray-100 rounded-full" />
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
      <div className="h-2 bg-gray-50 rounded w-1/2 mt-4" />
    </div>
  </div>
);

const EmptyState = ({ onClearFilters }) => (
  <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
    <h3 className="text-lg font-bold text-gray-900 mb-1">No jobs found</h3>
    <p className="text-gray-500 text-sm mb-6">Try adjusting your filters.</p>
    <Button onClick={onClearFilters} variant="primary">Clear All</Button>
  </div>
);

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
      salary_min: salaryRange.min,
      salary_max: salaryRange.max,
      sort_by: filters.sortBy === 'latest' ? 'posted_date' : filters.sortBy,
    };
  }, [filters, currentPage]);

  const { data: jobsData, isLoading: jobsLoading, error: jobsError } = useQuery({
    queryKey: ['jobs', queryParams],
    queryFn: () => getJobs(queryParams),
  });

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ search: '', category: '', location: '', salary: '', sortBy: 'posted_date' });
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

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Fixed Search Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <Button
              onClick={() => setShowFilters(true)}
              variant="outline"
              className="lg:hidden p-2.5 h-auto rounded-xl border-gray-200"
            >
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar / Filter Drawer */}
          <AnimatePresence>
            {(showFilters || !isMobile) && (
              <>
                {isMobile && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-gray-900/60 z-50 lg:hidden"
                    onClick={() => setShowFilters(false)}
                  />
                )}
                <motion.aside
                  initial={isMobile ? { y: '100%' } : { opacity: 0, x: -20 }}
                  animate={isMobile ? { y: 0 } : { opacity: 1, x: 0 }}
                  exit={isMobile ? { y: '100%' } : { opacity: 0 }}
                  className={`${isMobile ? 'fixed bottom-0 left-0 right-0 h-[80vh] bg-white z-[60] rounded-t-3xl overflow-y-auto shadow-2xl' : 'w-64 flex-shrink-0 sticky top-24 h-fit'}`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> Filters</h3>
                      <button onClick={clearFilters} className="text-xs text-blue-600 font-bold">Reset</button>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</label>
                        <select
                          value={filters.category}
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none"
                        >
                          <option value="">All Categories</option>
                          {categories?.data?.categories?.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Salary Range</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['0-3L', '3-6L', '6-10L', '10-15L'].map(range => (
                            <button
                              key={range}
                              onClick={() => handleFilterChange('salary', filters.salary === range ? '' : range)}
                              className={`p-2 text-[10px] rounded-lg border transition-all ${filters.salary === range ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-600'}`}
                            >
                              {range}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {isMobile && (
                    <div className="p-4 bg-white border-t sticky bottom-0">
                      <Button className="w-full py-3 rounded-xl" onClick={() => setShowFilters(false)}>Show Results</Button>
                    </div>
                  )}
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Main Feed */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                {jobsLoading ? 'Searching...' : `${jobsData?.data?.pagination?.total_jobs || 0} Jobs`}
              </h2>
            </div>

            {/* TWO COLUMN GRID ON MOBILE */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-6">
              {jobsLoading ? (
                [...Array(6)].map((_, i) => <LoadingSkeleton key={i} />)
              ) : jobsError ? (
                <div className="col-span-full text-center p-10 bg-white rounded-xl border">Error loading jobs.</div>
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
                <div className="col-span-full"><EmptyState onClearFilters={clearFilters} /></div>
              )}
            </div>

            <div className="mt-8">
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