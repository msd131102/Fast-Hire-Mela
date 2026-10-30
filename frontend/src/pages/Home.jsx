import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import * as Icons from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Card, CardTitle } from '../components/ui/Card';
import SEO from '../components/seo/SEO';
import OptimizedImage from '../components/ui/OptimizedImage';
import { getJobs, getCategories, getCompanies, utils } from '../services/api';

/* ---------------- ICON MAPPER ---------------- */
const CategoryIcon = ({ name, className }) => {
  // Dynamically render the icon based on the exact name sent by the backend
  // If the backend sends 'Rocket', it renders Icons['Rocket']
  const DynamicIcon = name && Icons[name] ? Icons[name] : Icons.Briefcase;
  return <DynamicIcon className={className} />;
};

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Live direct search query
  const { data: searchResults, isFetching: isSearching } = useQuery({
    queryKey: ['liveSearch', searchQuery],
    queryFn: () => getJobs({ search: searchQuery.trim(), limit: 5 }),
    enabled: searchQuery.trim().length >= 2,
    staleTime: 1000 * 30,
  });

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const seoConfig = {
    title: 'Jobs in India - Latest Openings | FastHireMela',
    description: 'Find verified jobs and apply to latest openings across India. AI-powered job portal.',
    canonicalUrl: 'https://www.fasthiremela.online/',
    isHomepage: true
  };

  const { data: jobs } = useQuery({
    queryKey: ['jobs', { limit: 6 }],
    queryFn: () => getJobs({ limit: 6 })
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories({ include_job_count: true })
  });

  const { data: companies } = useQuery({
    queryKey: ['companies', { limit: 8 }],
    queryFn: () => getCompanies({ limit: 8 })
  });

  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to jobs page with query params
    navigate(`/jobs?q=${encodeURIComponent(searchQuery)}&location=${selectedLocation}`);
  };

  return (
    <>
      <SEO {...seoConfig} />

      <div className="min-h-screen bg-background text-text">
        {/* ================= HERO SECTION (Handcrafted Adventure) ================= */}
        <section className="relative min-h-[90vh] overflow-hidden flex items-center justify-center py-20 lg:py-0">

          {/* Pixel Art Background */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/hero_bg.png" 
              alt="Pixel Art Landscape" 
              className="w-full h-full object-cover object-bottom"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = '/src/assets/fasthiremela-hero.png'; // Fallback
              }}
            />
            {/* Dark overlay for text readability (always dark because the image is dark) */}
            <div className="absolute inset-0 bg-black/60" />
          </div>

          <div className="container mx-auto px-4 relative z-10 w-full">
            <div className="text-center max-w-5xl mx-auto mt-20">
              
              <div className="inline-flex items-center gap-2 border border-primary-300 bg-primary-50/80 backdrop-blur-md px-6 py-2 rounded-full mb-8 shadow-sm">
                <Icons.Sparkles className="w-4 h-4 text-primary-500" />
                <span className="text-primary-600 font-semibold text-[10px] md:text-sm uppercase tracking-widest">
                  A New Journey Begins
                </span>
              </div>

              {/* Main Heading */}
              <div className="relative mb-10 md:mb-14 group">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-pixel font-bold text-text tracking-wide leading-[1.2] drop-shadow-md">
                  <span className="block text-white">
                    Start Your
                  </span>
                  <span className="block mt-4 text-warning-400">
                    Career Quest
                  </span>
                </h1>
              </div>

              <p className="text-white/90 text-lg md:text-2xl mb-12 max-w-3xl mx-auto tracking-wide leading-relaxed bg-black/20 backdrop-blur-sm p-6 rounded-3xl border border-white/10 shadow-lg">
                Explore a vast world of verified opportunities from top guilds. Equip your skills and embark on your next adventure!
              </p>

              {/* Search Bar */}
              <div className="relative max-w-4xl mx-auto" ref={searchDropdownRef}>
                <div className="bg-surface/90 backdrop-blur-md border border-border p-3 rounded-[2rem] shadow-adventure">
                  <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-3">
                    
                    <div className="relative flex-1 w-full bg-background border-2 border-border rounded-2xl focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/10 transition-all shadow-inner">
                      <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          if (e.target.value.trim().length >= 2) {
                            setIsDropdownOpen(true);
                          } else {
                            setIsDropdownOpen(false);
                          }
                        }}
                        onFocus={() => {
                          if (searchQuery.trim().length >= 2) {
                            setIsDropdownOpen(true);
                          }
                        }}
                        placeholder="Search quest or guild..."
                        className="w-full h-14 pl-12 pr-4 bg-transparent text-text placeholder-muted font-medium text-lg outline-none rounded-2xl"
                      />
                    </div>

                    <div className="relative flex-1 w-full bg-background border-2 border-border rounded-2xl focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/10 transition-all shadow-inner">
                      <Icons.MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                      <input
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        placeholder="Realm or remote"
                        className="w-full h-14 pl-12 pr-4 bg-transparent text-text placeholder-muted font-medium text-lg outline-none rounded-2xl"
                      />
                    </div>

                    <Button type="submit" variant="primary" size="lg" className="w-full md:w-auto h-14 text-lg px-8 rounded-2xl font-ui">
                      Search
                    </Button>
                  </form>
                </div>

                {/* Direct Live Search Dropdown */}
                <AnimatePresence>
                  {isDropdownOpen && searchQuery.trim().length >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 top-full mt-2 z-50 bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden text-left"
                    >
                      <div className="p-3 border-b border-border/60 bg-muted/10 flex items-center justify-between text-xs font-semibold text-muted">
                        <span className="font-pixel tracking-wider text-primary-500 uppercase">
                          MATCHING QUESTS
                        </span>
                        {isSearching && (
                          <span className="flex items-center gap-1.5 text-primary-500">
                            <Icons.Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Scouting...
                          </span>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
                        {searchResults?.data?.jobs && searchResults.data.jobs.length > 0 ? (
                          searchResults.data.jobs.map((job) => (
                            <Link
                              key={job.id}
                              to={`/jobs/${job.slug || job.id}`}
                              onClick={() => setIsDropdownOpen(false)}
                              className="p-3.5 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 flex items-center justify-between gap-3 transition-colors group cursor-pointer"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-primary-100/50 dark:bg-primary-900/30 flex items-center justify-center shrink-0 border border-primary-200/50 group-hover:scale-105 transition-transform">
                                  {job.company_logo_url ? (
                                    <img
                                      src={job.company_logo_url}
                                      alt={job.company_name}
                                      className="w-7 h-7 object-contain rounded"
                                    />
                                  ) : (
                                    <Icons.Briefcase className="w-5 h-5 text-primary-500" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-ui font-semibold text-sm text-text truncate group-hover:text-primary-600 transition-colors">
                                    {job.title}
                                  </h4>
                                  <p className="text-xs text-muted truncate flex items-center gap-2 mt-0.5 font-ui">
                                    <span>{job.company_name || 'Guild'}</span>
                                    {job.location && (
                                      <>
                                        <span className="inline-block w-1 h-1 rounded-full bg-muted/60" />
                                        <span>{job.location}</span>
                                      </>
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {job.job_type && (
                                  <span className="text-[10px] font-pixel px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 border border-primary-200">
                                    {job.job_type.replace('_', ' ')}
                                  </span>
                                )}
                                <Icons.ArrowRight className="w-4 h-4 text-muted group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                              </div>
                            </Link>
                          ))
                        ) : !isSearching ? (
                          <div className="p-6 text-center text-muted font-ui text-sm">
                            <Icons.SearchX className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            No matching quests found for "{searchQuery}"
                          </div>
                        ) : null}
                      </div>

                      {searchResults?.data?.jobs && searchResults.data.jobs.length > 0 && (
                        <div className="p-2.5 bg-muted/5 border-t border-border/60 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              setIsDropdownOpen(false);
                              handleSearch(e);
                            }}
                            className="text-xs font-ui font-medium text-primary-600 hover:text-primary-700 flex items-center justify-center gap-1.5 mx-auto"
                          >
                            <span>View all results for "{searchQuery}"</span>
                            <Icons.ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </section>

        {/* ================= CATEGORIES (Grid on Mobile) ================= */}
        <section className="py-12 -mt-10 relative z-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {categories?.data?.categories?.filter(cat => Number(cat.job_count) > 0)?.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => (window.location.href = `/jobs?category=${cat.id}`)}
                  className="bg-surface border border-border p-4 md:p-6 text-center rounded-3xl shadow-sm hover:shadow-adventure hover:border-primary-200 transition-all cursor-pointer group hover:-translate-y-1"
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-primary-50/50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 group-hover:scale-110 transition-all">
                    <CategoryIcon name={cat.icon} className="w-6 h-6 text-primary-500" />
                  </div>
                  <h3 className="text-xs md:text-sm font-bold text-text mb-2 truncate">{cat.name}</h3>
                  <p className="text-[10px] md:text-xs text-primary-500 font-semibold uppercase tracking-wider">
                    {cat.job_count || 0} Quests
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= LATEST JOBS (DOUBLE GRID MOBILE) ================= */}
        <section className="py-12 md:py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
              <div>
                <div className="flex items-center gap-2 text-warning-500 font-bold text-[10px] md:text-sm uppercase mb-3 tracking-wider">
                  <Icons.TrendingUp className="w-4 h-4" />
                  New Quests Available
                </div>
                <h2 className="text-3xl lg:text-5xl font-pixel font-bold text-text tracking-wide">
                  Quest Board
                </h2>
              </div>
              <Link to="/jobs" className="hidden md:block">
                <Button variant="outline" className="rounded-full border px-8 py-3 font-semibold shadow-sm hover:shadow-adventure transition-all">
                  View All <Icons.ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* THE DOUBLE GRID: grid-cols-2 on mobile */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {jobs?.data?.jobs?.map((job) => (
                <div key={job.id}>
                  <Card hover padding="md" className="h-full flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 shrink-0 bg-white rounded-2xl border border-border flex items-center justify-center p-2 shadow-sm">
                        <OptimizedImage
                          src={job.company_logo || '/api/placeholder/80/80'}
                          alt={job.company_name}
                          className="object-contain w-full h-full rounded-xl"
                          width={60} height={60}
                          priority={true}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-warning-500 uppercase tracking-wider bg-warning-50 px-2 py-1 rounded-full">
                        {job.job_type}
                      </span>
                    </div>

                    <CardTitle className="text-sm md:text-xl font-game font-bold text-text group-hover:text-primary-500 transition-colors line-clamp-2 mb-3">
                      {job.title}
                    </CardTitle>

                    <div className="flex items-center text-[11px] md:text-sm text-muted font-medium mb-2 md:mb-4">
                      <Icons.Building2 className="w-3 h-3 md:w-4 md:h-4 mr-2 text-primary-400 shrink-0" />
                      <span className="truncate">{job.company_name}</span>
                    </div>

                    <div className="flex items-center text-[11px] md:text-sm text-muted font-medium mb-3 md:mb-6">
                      <Icons.MapPin className="w-3 h-3 md:w-4 md:h-4 mr-2 text-primary-400 shrink-0" />
                      <span className="truncate">{job.location || 'Remote'}</span>
                    </div>

                    <div className="mt-auto pt-4 border-t border-border/50">
                      <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center mb-4">
                        <span className="text-lg md:text-xl font-bold text-warning-500">
                          {job.salary_min ? `₹${job.salary_min}L Gold` : ''}
                        </span>
                        <div className="flex items-center text-xs text-muted font-medium">
                          <Icons.Clock className="w-3 h-3 mr-1.5" />
                          {utils.formatPostedDate(job.posted_date)}
                        </div>
                      </div>
                      <Link to={`/jobs/${job.slug}`}>
                        <Button className="w-full bg-surface text-primary-600 border border-primary-200 hover:bg-primary-50">
                          Accept Quest
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </div>
              ))}
            </div>

            <Link to="/jobs" className="mt-8 block md:hidden">
              <Button variant="outline" className="w-full rounded-xl border-2 font-bold h-12">
                View All Openings
              </Button>
            </Link>
          </div>
        </section>

        {/* ================= TOP HIRING COMPANIES (Grid on Mobile) ================= */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-pixel font-bold text-text mb-4">Top Guilds</h2>
              <div className="w-20 h-1.5 bg-primary-400 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {companies?.data?.map((company) => (
                <div
                  key={company.id}
                  onClick={() => (window.location.href = `/jobs?company=${company.id}`)}
                  className="p-4 md:p-8 border border-border rounded-3xl bg-surface hover:shadow-adventure hover:border-primary-200 transition-all cursor-pointer text-center group hover:-translate-y-1"
                >
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-2xl border border-border flex items-center justify-center mx-auto mb-5 shadow-sm p-3 group-hover:scale-105 transition-transform">
                    <OptimizedImage
                      src={company.logo_url || '/vite.svg'}
                      alt={company.name}
                      className="max-w-full max-h-full object-contain filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                      width={100} height={100}
                    />
                  </div>
                  <p className="font-bold text-text text-sm md:text-base mb-1 truncate px-1">{company.name}</p>
                  <p className="text-xs font-semibold text-primary-500">
                    {company.job_count || 0} Openings
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;