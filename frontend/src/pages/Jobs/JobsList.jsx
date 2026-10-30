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
      <Card className="h-full hover:shadow-adventure-hover transition-all duration-300 border border-border bg-surface group relative overflow-hidden flex flex-col hover:-translate-y-1 rounded-[2rem]">
        <Link to={`/jobs/${job.slug}`} className="flex flex-col h-full">
          <CardContent className="p-3 sm:p-5 flex flex-col h-full">
            
            {/* Header: Logo and Save */}
            <div className="flex justify-between items-start mb-2.5">
              <div className="bg-white p-2 rounded-2xl border border-border shadow-sm flex-shrink-0">
                <img
                  src={job.company_logo || "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/960px-Flag_of_India.svg.png?20240827082344"}
                  alt={job.company_name}
                  className="w-9 h-9 sm:w-12 sm:h-12 object-contain"
                  onError={(e) => {
                    if (e.target.src !== "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/960px-Flag_of_India.svg.png?20240827082344") {
                      e.target.src = "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/960px-Flag_of_India.svg.png?20240827082344";
                    }
                  }}
                />
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`p-1.5 rounded-full transition-colors ${
                  isSaved ? 'bg-danger-500/20 text-danger-500' : 'bg-secondary-800 text-muted hover:bg-danger-500/20 hover:text-danger-500'
                }`}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Title & Company - Line clamp keeps grid even */}
            <div className="flex-1">
              <h3 className="text-[13px] sm:text-base font-pixel font-bold text-text line-clamp-2 leading-tight group-hover:text-primary-500 transition-colors">
                {job.title}
              </h3>
              <p className="text-[11px] sm:text-sm text-muted mt-1 truncate font-medium">
                {job.company_name}
              </p>
            </div>

            {/* Bottom Meta Section */}
            <div className="mt-3 pt-3 border-t border-border space-y-1.5">
              <div className="flex items-center text-[10px] sm:text-xs text-muted">
                <MapPin className="w-3 h-3 mr-1 text-primary-500 shrink-0" />
                <span className="truncate">{job.location}</span>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center text-[10px] sm:text-xs font-bold text-warning-500 text-lg">
                  <IndianRupee className="w-3 h-3 mr-0.5 shrink-0" />
                  <span>{formatSalaryShort(job.salary_max)} Gold</span>
                </div>
                <div className="flex items-center text-[9px] sm:text-[11px] text-muted font-medium">
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
  <div className="bg-surface rounded-3xl p-4 shadow-sm border border-border animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="w-12 h-12 bg-primary-50/50 rounded-2xl" />
      <div className="w-8 h-8 bg-primary-50/50 rounded-full" />
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-border rounded w-full" />
      <div className="h-3 bg-border rounded w-2/3" />
      <div className="h-2 bg-background rounded w-1/2 mt-4" />
    </div>
  </div>
);

const EmptyState = ({ onClearFilters }) => (
  <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-border shadow-sm">
    <Briefcase className="w-12 h-12 text-primary-200 mx-auto mb-4" />
    <h3 className="text-lg font-pixel font-bold text-text mb-1 tracking-wide">No Quests Found</h3>
    <p className="text-muted text-sm mb-6">Try adjusting your filters.</p>
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
    <div className="min-h-screen bg-background text-text">
      {/* Fixed Search Header (Mobile/Tablet Only) */}
      <header className="lg:hidden bg-surface border-b border-border sticky top-16 sm:top-20 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Search quests by title, skill, or keyword..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-12 pr-4 py-3 sm:py-3.5 bg-background border-2 border-border focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 font-medium text-base sm:text-lg outline-none text-text placeholder-muted rounded-2xl transition-all shadow-inner"
              />
            </div>
            <Button
              onClick={() => setShowFilters(true)}
              variant="outline"
              className="lg:hidden px-4 py-3 sm:py-3.5 h-auto rounded-2xl border-2 border-border bg-surface text-text hover:border-primary-300 hover:text-primary-500 transition-all flex items-center gap-2 shadow-sm"
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
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden"
                    onClick={() => setShowFilters(false)}
                  />
                )}
                <motion.aside
                  initial={isMobile ? { y: '100%' } : { opacity: 0, x: -20 }}
                  animate={isMobile ? { y: 0 } : { opacity: 1, x: 0 }}
                  exit={isMobile ? { y: '100%' } : { opacity: 0 }}
                  className={`${isMobile ? 'fixed bottom-0 left-0 right-0 h-[80vh] bg-surface border-t border-border z-[60] overflow-y-auto shadow-adventure rounded-t-3xl' : 'w-64 flex-shrink-0 sticky top-24 h-fit border border-border bg-surface shadow-sm rounded-3xl'}`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-4">
                      <h3 className="font-pixel font-bold text-sm uppercase tracking-wider flex items-center gap-2 text-primary-600"><SlidersHorizontal className="w-4 h-4" /> Filters</h3>
                      <button onClick={clearFilters} className="text-xs text-muted hover:text-primary-500 font-semibold uppercase transition-colors">Reset</button>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Category</label>
                        <select
                          value={filters.category}
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                          className="w-full p-2 bg-background border border-border rounded-lg text-sm text-text outline-none focus:border-primary-500"
                        >
                          <option value="">All Categories</option>
                          {categories?.data?.categories?.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Salary Range</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['0-3L', '3-6L', '6-10L', '10-15L'].map(range => (
                            <button
                              key={range}
                              onClick={() => handleFilterChange('salary', filters.salary === range ? '' : range)}
                              className={`p-2 text-[10px] sm:text-xs font-semibold rounded-xl border transition-all ${filters.salary === range ? 'bg-primary-50 border-primary-300 text-primary-700 shadow-sm' : 'bg-white border-border text-muted hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50/50'}`}
                            >
                              {range}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {isMobile && (
                    <div className="p-4 bg-surface border-t border-border sticky bottom-0">
                      <Button className="w-full py-3 rounded-xl" onClick={() => setShowFilters(false)}>Show Results</Button>
                    </div>
                  )}
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Main Feed */}
          <div className="flex-1">
            {/* Desktop Search Bar */}
            <div className="hidden lg:block relative group mb-6">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Search quests by title, skill, or keyword..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-14 pr-4 py-4 bg-surface border-2 border-border focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 font-medium text-lg outline-none text-text placeholder-muted rounded-2xl transition-all shadow-sm hover:shadow-adventure"
              />
            </div>

            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-pixel font-bold text-text tracking-wide">
                {jobsLoading ? 'Searching...' : `${jobsData?.data?.pagination?.total_jobs || 0} Quests`}
              </h2>
            </div>

            {/* TWO COLUMN GRID ON MOBILE */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-6">
              {jobsLoading ? (
                [...Array(6)].map((_, i) => <LoadingSkeleton key={i} />)
              ) : jobsError ? (
                <div className="col-span-full text-center p-10 bg-surface border-4 border-border shadow-pixel font-game text-xl">Error loading quests.</div>
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
