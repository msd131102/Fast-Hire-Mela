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
        <section className="relative bg-[#020617] pt-32 pb-32 lg:pt-48 lg:pb-56 overflow-hidden">
          {/* Visual Accents */}
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 text-xs font-semibold tracking-wide mb-8 backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                VERIFIED BY AI TECHNOLOGY
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-[1.1] tracking-tight">
                Your Career <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">
                  Starts Here.
                </span>
              </h1>

              <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium">
                FastHireMela connects you with daily AI-verified opportunities from India's top companies.
              </p>

              {/* SEARCH COMMAND BAR */}
              <form 
                onSubmit={handleSearch}
                className="bg-white p-2 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-2 max-w-3xl mx-auto border border-white/20"
              >
                <div className="relative flex-[1.2] w-full">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Job title, skills, or company"
                    className="w-full pl-12 pr-4 py-4 bg-transparent text-gray-900 outline-none font-medium"
                  />
                </div>
                <div className="hidden md:block w-px h-8 bg-gray-200" />
                <div className="relative flex-1 w-full">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    placeholder="Location"
                    className="w-full pl-12 pr-4 py-4 bg-transparent text-gray-900 outline-none font-medium"
                  />
                </div>
                <Button className="w-full md:w-auto h-14 px-10 rounded-xl md:rounded-full font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">
                  Find Jobs
                </Button>
              </form>
            </motion.div>
          </div>
        </section>

        {/* ================= CATEGORIES (Horizontal Scroll on Mobile) ================= */}
        <section className="py-16 -mt-12 relative z-20">
          <div className="container mx-auto px-4">
            <div className="flex overflow-x-auto pb-6 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 no-scrollbar">
              {categories?.data?.categories?.map((cat) => (
                <motion.div
                  key={cat.id}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  onClick={() => (window.location.href = `/jobs?category=${cat.id}`)}
                  className="min-w-[160px] bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-xl hover:border-blue-100 transition-all cursor-pointer group"
                >
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                    <CategoryIcon name={cat.icon} className="w-6 h-6 text-blue-600 group-hover:text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{cat.name}</h3>
                  <p className="text-[11px] text-blue-600 font-bold bg-blue-50 py-1 px-2 rounded-full inline-block">
                    {cat.job_count || 0} Jobs
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= LATEST JOBS ================= */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase mb-2">
                  <TrendingUp className="w-4 h-4" />
                  Fresh Opportunities
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
                  Featured Openings
                </h2>
              </div>
              <Link to="/jobs">
                <Button variant="outline" className="rounded-full border-2 hover:bg-gray-50 font-bold px-8">
                  View All Jobs <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs?.data?.jobs?.map((job) => (
                <motion.div key={job.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
                  <Card className="group h-full bg-white rounded-3xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/5 transition-all flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm overflow-hidden p-2">
                        <OptimizedImage
                          src={job.company_logo || '/api/placeholder/80/80'}
                          alt={job.company_name}
                          className="object-contain w-full h-full"
                          width={60} height={60}
                        />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-50 text-gray-500 px-3 py-1.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {job.job_type}
                      </span>
                    </div>

                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
                      {job.title}
                    </CardTitle>

                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center text-sm text-gray-500 font-medium">
                        <Building2 className="w-4 h-4 mr-1.5 text-blue-500" />
                        {job.company_name}
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-50">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold text-gray-900">
                          {job.salary_min ? `₹${job.salary_min}L` : 'Market Standard'}
                        </span>
                        <div className="flex items-center text-xs text-gray-400 font-medium">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          {utils.formatPostedDate(job.posted_date)}
                        </div>
                      </div>
                      <Link to={`/jobs/${job.slug}`}>
                        <Button className="w-full h-12 rounded-xl font-bold bg-gray-900 group-hover:bg-blue-600 transition-all text-white">
                          Apply Now
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= TOP HIRING COMPANIES ================= */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-black text-gray-900 mb-4">Top Companies Hiring</h2>
              <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {companies?.data?.map((company) => (
                <motion.div
                  key={company.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => (window.location.href = `/jobs?company=${company.id}`)}
                  className="p-8 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xl transition-all cursor-pointer text-center"
                >
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-50">
                    <OptimizedImage
                      src={company.logo_url || '/vite.svg'}
                      alt={company.name}
                      className="max-w-[70%] max-h-[70%] object-contain"
                      width={100} height={100}
                    />
                  </div>
                  <p className="font-bold text-gray-900 mb-1">{company.name}</p>
                  <p className="text-xs font-semibold text-blue-600">
                    {company.job_count || 0} Open Positions
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