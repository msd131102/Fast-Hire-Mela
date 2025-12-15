import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
    Search,
    Filter,
    MapPin,
    Building2,
    Clock,
    IndianRupee,
    Briefcase,
    Users,
    ChevronDown,
    X,
    SlidersHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'; // Added CardTitle
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner'; // Assuming this exists
import { getJobs, getCategories, getCompanies } from '../../services/api';

// --- Utility Functions (Keep your API utility functions) ---
// Note: Assuming `utils` with a formatting function like `formatPostedDate` exists or is imported.

// Dummy utility to simulate date formatting (Replace with your actual utility)
const formatPostedDate = (dateString) => {
    if (!dateString) return 'N/A';
    const now = new Date();
    const then = new Date(dateString);
    const diffInDays = Math.floor((now - then) / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return then.toLocaleDateString();
};


const JobsList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState(() => {
        // Initialize state from URL params
        const initialFilters = {
            search: searchParams.get('q') || '',
            category: searchParams.get('category') || '',
            location: searchParams.get('location') || '',
            company: searchParams.get('company') || '',
            jobType: searchParams.get('jobType') || '',
            experience: searchParams.get('experience') || '',
            salary: searchParams.get('salary') || '',
            sortBy: searchParams.get('sortBy') || 'latest',
        };
        return initialFilters;
    });
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isMobile, setIsMobile] = useState(false);

    // Check if mobile and handle body overflow for modal
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        // Only manage overflow for the mobile modal view
        if (showFilters && isMobile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showFilters, isMobile]);


    // Sync URL with filters (Debounce this for production to avoid excessive URL updates)
    useEffect(() => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'latest') params.set(key, value);
        });
        setSearchParams(params, { replace: true });
    }, [filters, setSearchParams]);


    // Fetch data
    const { data: jobsData, isLoading: jobsLoading } = useQuery({
        queryKey: ['jobs', filters, currentPage],
        queryFn: () => {
            const params = {
                page: currentPage,
                limit: 12,
                search: filters.search || undefined,
                location: filters.location || undefined,
                category: filters.category || undefined,
                company: filters.company || undefined, // Added company filter
                job_type: filters.jobType || undefined, // Added jobType filter
                experience_level: filters.experience || undefined, // Added experience filter
                salary_min: filters.salary ? getSalaryMin(filters.salary) : undefined, // Added salary filter
                salary_max: filters.salary ? getSalaryMax(filters.salary) : undefined, // Added salary filter
                sort_by: filters.sortBy === 'latest' ? 'posted_at' : filters.sortBy === 'salary_high' ? 'salary_max' : filters.sortBy === 'salary_low' ? 'salary_min' : 'posted_at',
                sort_order: filters.sortBy === 'salary_low' ? 'ASC' : 'DESC'
            };

            // Remove undefined values
            Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

            // Debug logging to help troubleshoot
            console.log('Jobs Query Params:', params);

            return getJobs(params);
        },
        keepPreviousData: true, // Keep previous data while loading new page/filters
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    });

    const { data: companies } = useQuery({
        queryKey: ['companies'],
        queryFn: getCompanies,
    });

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1); // Reset to page 1 on filter change
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on page change
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            category: '',
            location: '',
            company: '',
            jobType: '',
            experience: '',
            salary: '',
            sortBy: 'latest'
        });
        setCurrentPage(1);
        setShowFilters(false); // Close filters after clearing
    };

    const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
    const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Director', 'Executive'];
    const salaryRanges = ['0-3L', '3-6L', '6-10L', '10-15L', '15-25L', '25L+']; // Assuming L stands for Lakhs (INR)
    const sortOptions = [
        { value: 'latest', label: 'Latest' },
        { value: 'salary_high', label: 'Salary: High to Low' },
        { value: 'salary_low', label: 'Salary: Low to High' },
        // { value: 'experience', label: 'Experience Level' } // Removing as API doesn't seem to support sorting by Experience Level directly without custom logic
    ];

    const totalActiveFilters = Object.values(filters).filter(v => v && v !== 'latest').length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section - Sticky on Mobile for easy filter access */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
                <div className="container mx-auto px-4 py-4 lg:py-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h1 className="hidden lg:block text-3xl font-bold text-gray-900 mb-4">Job Opportunities</h1>

                        {/* Search Bar & Filter Button - Enhanced Layout */}
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <Input
                                    placeholder="Search jobs by title, skills, or company..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    icon={<Search className="w-5 h-5 text-gray-400" />}
                                    className="h-11 text-base lg:h-12 lg:text-sm"
                                />
                            </div>
                            <Button
                                onClick={() => setShowFilters(!showFilters)}
                                variant="outline"
                                className="relative flex items-center justify-center lg:hidden px-3 py-2 h-11"
                            >
                                <Filter className="w-5 h-5" />
                                {totalActiveFilters > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                        {totalActiveFilters}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar / Mobile Modal */}
                    {showFilters && isMobile && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 z-40"
                            onClick={() => setShowFilters(false)}
                        />
                    )}

                    <motion.div
                        initial={isMobile ? { opacity: 0, x: '-100%' } : { opacity: 0, x: -20 }}
                        animate={isMobile ? (showFilters ? { opacity: 1, x: 0 } : { opacity: 0, x: '-100%' }) : { opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`${isMobile ? (showFilters ? 'block' : 'hidden') : 'block'} 
              lg:block lg:w-80 flex-shrink-0 
              ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-80 max-w-[80%] overflow-y-auto bg-white shadow-xl' : 'lg:sticky lg:top-28'}`}
                    >
                        <Card className={`${isMobile ? 'h-full rounded-none' : ''}`}>
                            <CardHeader className="flex items-center justify-between border-b border-gray-200 sticky top-0 bg-white z-10">
                                <h3 className="font-bold text-gray-900 text-xl flex items-center gap-2">
                                    <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                                    Job Filters
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
                                            className="p-2"
                                        >
                                            <X className="w-5 h-5" />
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className={`space-y-6 p-6 ${isMobile ? 'pb-20' : ''}`}>
                                {/* Category Filter */}
                                <FilterGroup label="Category" icon={<Briefcase className="w-4 h-4 text-purple-500" />}>
                                    <select
                                        value={filters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base appearance-none bg-white pr-8"
                                    >
                                        <option value="">All Categories</option>
                                        {categories?.data?.categories?.map(category => (
                                            <option key={category.id} value={category.slug}>{category.name}</option>
                                        ))}
                                    </select>
                                </FilterGroup>

                                {/* Location Filter */}
                                <Input
                                    placeholder="City, State, or Country"
                                    value={filters.location}
                                    onChange={(e) => handleFilterChange('location', e.target.value)}
                                    icon={<MapPin className="w-4 h-4 text-red-500" />}
                                    label="Location"
                                />

                                {/* Company Filter */}
                                <FilterGroup label="Company" icon={<Building2 className="w-4 h-4 text-blue-500" />}>
                                    <select
                                        value={filters.company}
                                        onChange={(e) => handleFilterChange('company', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base appearance-none bg-white pr-8"
                                    >
                                        <option value="">All Companies</option>
                                        {companies?.data?.map(company => (
                                            <option key={company.id} value={company.id}>{company.name}</option>
                                        ))}
                                    </select>
                                </FilterGroup>

                                {/* Job Type Filter */}
                                <FilterGroup label="Job Type" icon={<Briefcase className="w-4 h-4 text-green-500" />}>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {jobTypes.map(type => (
                                            <label key={type} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                                <input
                                                    type="radio"
                                                    name="jobType"
                                                    value={type}
                                                    checked={filters.jobType === type}
                                                    onChange={(e) => handleFilterChange('jobType', e.target.value === filters.jobType ? '' : e.target.value)} // Toggle behavior
                                                    className="mr-3 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                                />
                                                <span className="text-sm text-gray-700 font-medium">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </FilterGroup>

                                {/* Experience Level Filter */}
                                <FilterGroup label="Experience Level" icon={<Users className="w-4 h-4 text-orange-500" />}>
                                    <select
                                        value={filters.experience}
                                        onChange={(e) => handleFilterChange('experience', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base appearance-none bg-white pr-8"
                                    >
                                        <option value="">All Levels</option>
                                        {experienceLevels.map(level => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>
                                </FilterGroup>

                                {/* Salary Range Filter */}
                                <FilterGroup label="Salary Range (LPA)" icon={<IndianRupee className="w-4 h-4 text-emerald-500" />}>
                                    <select
                                        value={filters.salary}
                                        onChange={(e) => handleFilterChange('salary', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base appearance-none bg-white pr-8"
                                    >
                                        <option value="">Any Salary</option>
                                        {salaryRanges.map(range => (
                                            <option key={range} value={range}>{range}</option>
                                        ))}
                                    </select>
                                </FilterGroup>

                                {/* Mobile Apply Button - Bottom fixed */}
                                {isMobile && (
                                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg z-50">
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

                    {/* Jobs List */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex-1"
                    >
                        {/* Results Header & Sort By */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 p-4 lg:p-0 bg-white lg:bg-transparent rounded-lg shadow-sm lg:shadow-none border lg:border-none">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {jobsLoading ? 'Searching...' : `${jobsData?.data?.pagination?.total_jobs || 0} Jobs Found`}
                                </h2>
                                <p className="text-gray-600 text-sm">
                                    {jobsLoading ? 'Please wait' : `Page ${currentPage} of ${jobsData?.data?.pagination?.total_pages || 1}`}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
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
                            ) : jobsData?.data?.jobs?.length > 0 ? (
                                jobsData.data.jobs.map((job, index) => (
                                    <JobCard key={job.id} job={job} index={index} />
                                ))
                            ) : (
                                <EmptyState clearFilters={clearFilters} />
                            )}
                        </div>

                        {/* Pagination */}
                        {jobsData?.data?.pagination?.total_pages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={jobsData.data.pagination.total_pages}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

// --- Sub-Components for Cleanliness and Reusability ---

const FilterGroup = ({ label, children, icon }) => (
    <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            {icon}
            <span className="ml-2">{label}</span>
        </label>
        <div className="relative">
            {children}
            {/* Add a ChevronDown for dropdowns to clearly indicate interaction */}
            {React.isValidElement(children) && children.type === 'select' && (
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            )}
        </div>
    </div>
);

const JobCard = ({ job, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
    >
        <Card hover className="cursor-pointer transition-all duration-300 hover:shadow-lg">
            <Link to={`/jobs/${job.id}`}>
                <CardContent className="p-4 sm:p-6">
                    {/* Mobile-First Layout */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                        {/* Logo and Main Info */}
                        <div className="flex items-center gap-3 sm:flex-col">
                            <img
                                src={job.company_logo || '/api/placeholder/60/60'}
                                alt={job.company_name}
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-contain border p-1 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate hover:text-blue-600 transition-colors mb-1">
                                    {job.title}
                                </h3>
                                <div className="flex items-center text-gray-600 text-sm">
                                    <Building2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-500 flex-shrink-0" />
                                    <span className="font-medium truncate">{job.company_name}</span>
                                </div>
                            </div>
                        </div>

                        {/* Job Type Badge - Always visible on mobile, inline on desktop */}
                        <div className="flex justify-between items-start sm:items-center gap-2">
                            <span className="inline-block text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex-shrink-0">
                                {job.job_type || 'Full-time'}
                            </span>
                            <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                <span className="hidden sm:inline">{formatPostedDate(job.posted_at)}</span>
                                <span className="sm:hidden">{formatPostedDate(job.posted_at).split(' ')[0]}</span>
                            </div>
                        </div>
                    </div>

                    {/* Location - Full width on mobile */}
                    <div className="flex items-center text-gray-600 text-sm mt-3 sm:mt-2">
                        <MapPin className="w-4 h-4 mr-1 text-gray-500 flex-shrink-0" />
                        <span className="truncate">{job.location}</span>
                    </div>

                    {/* Secondary Details (Experience, Salary) - Better mobile layout */}
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 sm:gap-x-6 sm:gap-y-2 text-sm text-gray-700 mt-3 sm:mt-3 pt-3 sm:pt-3 border-t">
                        <div className="flex items-center">
                            <Briefcase className="w-4 h-4 mr-1 text-orange-500 flex-shrink-0" />
                            <span className="text-xs sm:text-sm">
                                {job.experience_min && job.experience_max ? `${job.experience_min}-${job.experience_max} Yrs` : 'Any Exp'}
                            </span>
                        </div>
                        <div className="flex items-center text-green-700 font-medium">
                            <IndianRupee className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="text-xs sm:text-sm">
                                {job.salary_min && job.salary_max ? `₹${job.salary_min}L-${job.salary_max}L` : 'Salary Undisclosed'}
                            </span>
                        </div>
                    </div>

                    {/* Skills - Better mobile spacing */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
                        {job.skills_required?.slice(0, 4).map((skill, idx) => (
                            <span
                                key={idx}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 sm:px-3 rounded-full font-medium"
                            >
                                {skill}
                            </span>
                        ))}
                        {job.skills_required?.length > 4 && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 sm:px-3 rounded-full">
                                +{job.skills_required.length - 4}
                            </span>
                        )}
                    </div>
                </CardContent>
            </Link>
        </Card>
    </motion.div>
);

const LoadingSkeleton = () => (
    Array.from({ length: 5 }).map((_, index) => (
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

const EmptyState = ({ clearFilters }) => (
    <div className="text-center py-16 bg-white rounded-xl shadow-md border">
        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Jobs Match Your Criteria</h3>
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            We couldn't find any job postings that match your current filters. Try broadening your search or clearing the filters below.
        </p>
        <Button onClick={clearFilters} variant="secondary">
            Clear All Filters
        </Button>
    </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const renderPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    const pages = renderPageNumbers();

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <Button
                variant="outline"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                Previous
            </Button>

            {pages[0] > 1 && <span className="px-2">...</span>}

            {pages.map((page) => (
                <Button
                    key={page}
                    variant={currentPage === page ? 'primary' : 'outline'}
                    onClick={() => onPageChange(page)}
                    className="w-10 h-10"
                >
                    {page}
                </Button>
            ))}

            {pages[pages.length - 1] < totalPages && <span className="px-2">...</span>}

            <Button
                variant="outline"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next
            </Button>
        </div>
    );
};

export default JobsList;
