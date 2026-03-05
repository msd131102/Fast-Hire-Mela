import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Building2, MapPin, Clock, ArrowRight, Briefcase,
  Sparkles, Code, Headphones, BarChart, Layers, Globe, TrendingUp
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Card, CardTitle } from '../components/ui/Card';
import SEO from '../components/seo/SEO';
import OptimizedImage from '../components/ui/OptimizedImage';
import { getJobs, getCategories, getCompanies, utils } from '../services/api';
import Hero3DScene from '../components/common/Hero3DScene';

/* ---------------- ICON MAPPER ---------------- */
const CategoryIcon = ({ name, className }) => {
  const iconMap = { Briefcase, Code, Headphones, BarChart, Layers, Globe, Sparkles };
  const Icon = iconMap[name] || Briefcase;
  return <Icon className={className} />;
};

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const navigate = useNavigate();

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

      <div className="min-h-screen bg-[#F8FAFC]">
        {/* ================= HERO SECTION (Apple-Style 3D) ================= */}
        <section className="relative min-h-[90vh] bg-[#000000] overflow-hidden flex items-center justify-center py-20 lg:py-0 font-sans selection:bg-blue-500/30">

          {/* Real 3D Background (Spline-like) */}
          <Hero3DScene />

          {/* Fallback/Overlay Gradients for blending */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
            <div className="absolute top-[-20%] left-[20%] w-[60vw] h-[60vw] bg-indigo-600/10 blur-[150px] rounded-full mix-blend-screen" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen" />
          </div>

          <div className="container mx-auto px-4 relative z-10 w-full perspective-1000">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} // Apple ease-out cuve
              className="text-center max-w-5xl mx-auto"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Floating Badge */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 text-gray-300 text-[11px] font-medium tracking-[0.2em] uppercase backdrop-blur-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] mb-8 md:mb-12 hover:bg-white/[0.06] transition-colors cursor-default"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span>Next-Gen Hiring Platform</span>
              </motion.div>

              {/* Main Heading with Layered 3D Text */}
              <div className="relative mb-10 md:mb-14 group perspective-text">
                <motion.h1
                  className="text-5xl md:text-7xl lg:text-8xl font-semibold text-white tracking-tight leading-[1] md:leading-[0.95]"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  <span className="block bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent drop-shadow-2xl">
                    Discover Your
                  </span>
                  <span className="block mt-2 md:mt-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 relative z-10">
                    Dream Career.
                  </span>
                </motion.h1>
                {/* Glow/Reflection behind text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-32 bg-blue-500/20 blur-[80px] -z-10 rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-1000" />
              </div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-gray-400 text-base md:text-2xl mb-12 max-w-2xl mx-auto font-normal leading-relaxed text-balance"
              >
                Connect with AI-verified opportunities from India's top tech giants. Simple, fast, and transparent.
              </motion.p>

              {/* 3D Floating Search Bar */}
              <motion.div
                className="relative max-w-3xl mx-auto group"
                initial={{ opacity: 0, y: 40, rotateX: 10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.8, duration: 1, type: "spring", bounce: 0.2 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Glass container with depth */}
                <div className="relative bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-2 rounded-2xl md:rounded-full shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:bg-white/[0.04] group-hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.7)] group-hover:-translate-y-1">

                  <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-2">

                    {/* Role Input */}
                    <div className="relative flex-1 w-full md:w-auto h-14 bg-black/20 rounded-xl md:rounded-l-full md:rounded-r-none border border-white/5 focus-within:bg-black/40 focus-within:border-white/10 transition-colors group/input">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within/input:text-blue-400 transition-colors" />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search role or company..."
                        className="w-full h-full pl-12 pr-4 bg-transparent text-white placeholder-gray-600 outline-none text-base font-medium"
                      />
                    </div>

                    {/* Location Input */}
                    <div className="relative flex-1 w-full md:w-auto h-14 bg-black/20 rounded-xl md:rounded-none border border-white/5 focus-within:bg-black/40 focus-within:border-white/10 transition-colors group/input">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within/input:text-blue-400 transition-colors" />
                      <input
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        placeholder="City or remote"
                        className="w-full h-full pl-12 pr-4 bg-transparent text-white placeholder-gray-600 outline-none text-base font-medium"
                      />
                    </div>

                    {/* Search Button */}
                    <Button
                      type="submit"
                      className="w-full md:w-auto h-14 px-8 rounded-xl md:rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-300 relative overflow-hidden"
                    >
                      Search
                    </Button>
                  </form>
                </div>

                {/* Reflective shine below bar */}
                <div className="absolute -bottom-10 left-10 right-10 h-4 bg-blue-500/10 blur-[30px] rounded-full pointer-events-none" />
              </motion.div>

              {/* Floating "AI Verified" Toast - decorative 3D element */}
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="hidden lg:flex absolute right-[-5%] top-1/3 p-4 rounded-2xl bg-white/[0.05] backdrop-blur-md border border-white/10 items-center justify-center gap-4 animate-float-slow rotate-[5deg] hover:rotate-0 transition-transform duration-500 shadow-2xl"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><Sparkles size={20} /></div>
                <div className="text-left">
                  <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">New Jobs</div>
                  <div className="text-white font-bold text-sm">+250 Added Today</div>
                </div>
              </motion.div>

            </motion.div>
          </div>

          <style>{`
            .perspective-1000 { perspective: 1000px; }
            @keyframes pulse-slow {
              0%, 100% { opacity: 0.3; transform: scale(1); }
              50% { opacity: 0.15; transform: scale(1.1); }
            }
            .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
            @keyframes float-slow {
              0%, 100% { transform: translateY(0px) rotate(5deg); }
              50% { transform: translateY(-20px) rotate(3deg); }
            }
            .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
          `}</style>
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

                    <div className="flex items-center text-[10px] md:text-sm text-gray-500 font-medium mb-3 md:mb-6">
                      <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1 text-blue-500 shrink-0" />
                      <span className="truncate">{job.location || 'Remote'}</span>
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