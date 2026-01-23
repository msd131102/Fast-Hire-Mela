import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Building2, MapPin, Clock, ArrowRight, Briefcase, 
  Sparkles, Code, Headphones, BarChart, Layers, Globe, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Card, CardTitle } from '../components/ui/Card';
import SEO from '../components/seo/SEO';
import OptimizedImage from '../components/ui/OptimizedImage';
import { getJobs, getCategories, getCompanies, utils } from '../services/api';

/* ---------------- ICON MAPPER ---------------- */
const CategoryIcon = ({ name, className }) => {
  const iconMap = { Briefcase, Code, Headphones, BarChart, Layers, Globe, Sparkles };
  const Icon = iconMap[name] || Briefcase;
  return <Icon className={className} />;
};

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

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
    window.location.href = `/jobs?q=${encodeURIComponent(searchQuery)}&location=${selectedLocation}`;
  };

  return (
    <>
      <SEO {...seoConfig} />

      <div className="min-h-screen bg-[#F8FAFC]">
        {/* ================= HERO SECTION ================= */}
        <section className="relative bg-[#020617] pt-24 pb-20 lg:pt-48 lg:pb-56 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-400 text-[10px] md:text-xs font-semibold tracking-wide mb-6 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                VERIFIED BY AI TECHNOLOGY
              </div>

              <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                Your Career <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">
                  Starts Here.
                </span>
              </h1>

              <p className="text-gray-400 text-sm md:text-xl mb-10 max-w-2xl mx-auto font-medium px-4">
                FastHireMela connects you with daily AI-verified opportunities from India's top companies.
              </p>

              {/* SEARCH COMMAND BAR */}
              <form 
                onSubmit={handleSearch}
                className="bg-white p-2 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-1 max-w-3xl mx-auto border border-white/20"
              >
                <div className="relative flex-[1.2] w-full border-b md:border-b-0 md:border-r border-gray-100">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Role or Company"
                    className="w-full pl-10 pr-4 py-3 md:py-4 bg-transparent text-gray-900 outline-none font-medium text-sm md:text-base"
                  />
                </div>
                <div className="relative flex-1 w-full">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    placeholder="Location"
                    className="w-full pl-10 pr-4 py-3 md:py-4 bg-transparent text-gray-900 outline-none font-medium text-sm md:text-base"
                  />
                </div>
                <Button className="w-full md:w-auto h-12 md:h-14 px-8 rounded-xl md:rounded-full font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all text-sm">
                  Search
                </Button>
              </form>
            </motion.div>
          </div>
        </section>

        {/* ================= CATEGORIES (Grid on Mobile) ================= */}
        <section className="py-12 -mt-10 relative z-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {categories?.data?.categories?.map((cat) => (
                <motion.div
                  key={cat.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => (window.location.href = `/jobs?category=${cat.id}`)}
                  className="bg-white border border-gray-100 rounded-2xl p-4 md:p-6 text-center shadow-sm hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-50 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600 transition-colors">
                    <CategoryIcon name={cat.icon} className="w-5 h-5 md:w-6 md:h-6 text-blue-600 group-hover:text-white" />
                  </div>
                  <h3 className="text-xs md:text-sm font-bold text-gray-900 mb-1 truncate">{cat.name}</h3>
                  <p className="text-[9px] md:text-[11px] text-blue-600 font-bold bg-blue-50 py-0.5 px-2 rounded-full inline-block">
                    {cat.job_count || 0} Jobs
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= LATEST JOBS (DOUBLE GRID MOBILE) ================= */}
        <section className="py-12 md:py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
              <div>
                <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] md:text-sm uppercase mb-1 md:mb-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Fresh Opportunities
                </div>
                <h2 className="text-3xl lg:text-5xl font-black text-gray-900 tracking-tight">
                  Featured Jobs
                </h2>
              </div>
              <Link to="/jobs" className="hidden md:block">
                <Button variant="outline" className="rounded-full border-2 font-bold px-8">
                  View All <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* THE DOUBLE GRID: grid-cols-2 on mobile */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {jobs?.data?.jobs?.map((job) => (
                <motion.div key={job.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
                  <Card className="group h-full bg-white rounded-2xl md:rounded-3xl p-3 md:p-6 border border-gray-100 hover:border-blue-200 transition-all flex flex-col shadow-sm">
                    <div className="flex justify-between items-start mb-3 md:mb-6">
                      <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-lg md:rounded-xl flex items-center justify-center border border-gray-50 shadow-sm overflow-hidden p-1.5">
                        <OptimizedImage
                          src={job.company_logo || '/api/placeholder/80/80'}
                          alt={job.company_name}
                          className="object-contain w-full h-full"
                          width={60} height={60}
                        />
                      </div>
                      <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tight bg-gray-50 text-gray-500 px-2 py-1 rounded md:rounded-lg">
                        {job.job_type}
                      </span>
                    </div>

                    <CardTitle className="text-xs md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1 md:mb-2 leading-tight">
                      {job.title}
                    </CardTitle>

                    <div className="flex items-center text-[10px] md:text-sm text-gray-500 font-medium mb-3 md:mb-6">
                      <Building2 className="w-3 h-3 md:w-4 md:h-4 mr-1 text-blue-500 shrink-0" />
                      <span className="truncate">{job.company_name}</span>
                    </div>

                    <div className="mt-auto pt-3 md:pt-6 border-t border-gray-50">
                      <div className="flex flex-col gap-1 md:gap-0 md:flex-row md:justify-between md:items-center mb-3 md:mb-4">
                        <span className="text-xs md:text-lg font-black text-gray-900">
                          {job.salary_min ? `₹${job.salary_min}L` : 'Market'}
                        </span>
                        <div className="flex items-center text-[9px] md:text-xs text-gray-400 font-medium">
                          <Clock className="w-3 h-3 mr-1" />
                          {utils.formatPostedDate(job.posted_date)}
                        </div>
                      </div>
                      <Link to={`/jobs/${job.slug}`}>
                        <Button className="w-full h-9 md:h-12 rounded-lg md:rounded-xl text-[10px] md:text-sm font-bold bg-gray-900 group-hover:bg-blue-600 transition-all text-white">
                          Apply
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
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
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-2xl md:text-5xl font-black text-gray-900 mb-2 md:mb-4">Top Companies</h2>
              <div className="w-12 md:w-20 h-1 md:h-1.5 bg-blue-600 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {companies?.data?.map((company) => (
                <motion.div
                  key={company.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => (window.location.href = `/jobs?company=${company.id}`)}
                  className="p-4 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white transition-all cursor-pointer text-center"
                >
                  <div className="w-12 h-12 md:w-20 md:h-20 bg-white rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-6 shadow-sm border border-gray-50">
                    <OptimizedImage
                      src={company.logo_url || '/vite.svg'}
                      alt={company.name}
                      className="max-w-[70%] max-h-[70%] object-contain"
                      width={100} height={100}
                    />
                  </div>
                  <p className="font-bold text-gray-900 text-xs md:text-base mb-1 truncate px-1">{company.name}</p>
                  <p className="text-[9px] md:text-xs font-semibold text-blue-600">
                    {company.job_count || 0} Openings
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;