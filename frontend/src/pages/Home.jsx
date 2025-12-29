import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Building2, MapPin, Clock, ArrowRight, Briefcase, Sparkles, 
  MousePointer2, Code, Headphones, BarChart, Layers, Globe, Zap, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import SEO from '../components/seo/SEO';
import OptimizedImage from '../components/ui/OptimizedImage';
import { getJobs, getCategories, getCompanies, utils } from '../services/api';

// --- Dynamic Icon Mapper ---
const IconComponent = ({ name, className }) => {
  const iconMap = {
    Briefcase, Code, Headphones, BarChart, Layers, Globe, Building2, Sparkles, Zap, ShieldCheck
  };
  const Icon = iconMap[name] || Briefcase;
  return <Icon className={className} />;
};

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const seoConfig = {
    title: 'Jobs in India - Latest Openings | FastHireMela',
    description: 'Find verified jobs and apply to latest openings across India.',
    keywords: 'jobs in India, job openings, apply jobs, latest jobs',
    canonicalUrl: 'https://www.fasthiremela.online/',
    isHomepage: true
  };

  const { data: jobs } = useQuery({ queryKey: ['jobs', { limit: 6 }], queryFn: () => getJobs({ limit: 6 }) });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => getCategories({ include_job_count: true }) });
  const { data: companies } = useQuery({ queryKey: ['companies', { limit: 8 }], queryFn: () => getCompanies({ limit: 8 }) });

  const handleSearch = (e) => {
    e.preventDefault();
    window.location.href = `/jobs?q=${encodeURIComponent(searchQuery)}&category=${selectedCategory}&location=${selectedLocation}`;
  };

  return (
    <>
      <SEO {...seoConfig} />
      <div className="min-h-screen bg-[#F8FAFC] selection:bg-blue-600 selection:text-white">

        {/* --- PREMIUM HERO SECTION --- */}
        <section className="relative pt-24 pb-20 lg:pt-40 lg:pb-52 bg-[#05070A] overflow-hidden">
          {/* Ambient Light Effects */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full" />
          
          <div className="container relative mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-5xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase mb-10 backdrop-blur-md">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>The Future of Job Hunting</span>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-white mb-8 tracking-tighter leading-[0.85]">
                Hire <span className="text-blue-500">Fast.</span> <br />
                Work <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-200">Better.</span>
              </h1>

              <p className="text-gray-400 text-lg md:text-xl mb-14 max-w-2xl mx-auto font-light leading-relaxed">
                Connect with India's top employers through our AI-driven placement ecosystem.
              </p>

              {/* Ultra-Modern Search Bar */}
              <form onSubmit={handleSearch} className="relative z-20 group">
                <div className="bg-white/5 backdrop-blur-2xl p-2 rounded-2xl lg:rounded-full border border-white/10 shadow-2xl flex flex-col lg:flex-row gap-2 max-w-4xl mx-auto transition-all group-focus-within:border-blue-500/50">
                  <div className="flex-[1.5] relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Job title, skills or company"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-16 pr-6 py-5 bg-transparent border-0 text-white placeholder-gray-500 focus:ring-0 outline-none text-base"
                    />
                  </div>
                  <div className="hidden lg:block w-px h-10 bg-white/10 self-center" />
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Location"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full pl-16 pr-6 py-5 bg-transparent border-0 text-white placeholder-gray-500 focus:ring-0 outline-none text-base"
                    />
                  </div>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white h-16 lg:h-auto px-10 lg:rounded-full font-bold shadow-xl shadow-blue-600/20">
                    Find Jobs
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </section>

        {/* --- CATEGORIES SECTION --- */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">Market Sectors</h2>
                <p className="text-blue-600 font-bold text-sm tracking-widest uppercase mt-2">Explore Industry Vertical</p>
              </div>
              <div className="h-px flex-1 bg-gray-100 hidden md:block mx-10 mb-4" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {categories?.data?.categories?.map((cat) => (
                <div key={cat.id} onClick={() => window.location.href = `/jobs?category=${cat.id}`} className="group cursor-pointer">
                  <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-transparent group-hover:border-blue-100 group-hover:bg-blue-50/30 transition-all duration-500 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                      <IconComponent name={cat.icon} className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{cat.name}</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{cat.job_count || 0} Vacancies</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- LATEST JOBS GRID (PREMIUM CARD DESIGN) --- */}
        <section className="py-24 bg-gray-50/50">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter">Live Openings</h2>
              <Link to="/jobs" className="text-blue-600 font-bold flex items-center gap-2 group text-sm">
                View Gallery <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {jobs?.data?.jobs?.map((job) => (
                <motion.div key={job.id} whileHover={{ y: -10 }} className="h-full">
                  <div className="bg-white border border-gray-100 rounded-[2rem] p-8 h-full shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 relative flex flex-col">
                    <div className="flex justify-between items-start mb-10">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl p-2 border border-gray-100 shadow-inner">
                        <OptimizedImage src={job.company_logo || '/api/placeholder/64/64'} className="w-full h-full object-contain" />
                      </div>
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                        {job.job_type}
                      </span>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight tracking-tight line-clamp-2 h-14">
                        {job.title}
                      </h3>
                      <div className="flex items-center text-gray-500 font-medium mb-8">
                        <Building2 className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="text-sm">{job.company_name}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Package</p>
                        <p className="text-lg font-black text-gray-900 leading-none">
                          {job.salary_min ? `₹${job.salary_min}L+` : "Best in Market"}
                        </p>
                      </div>
                      <Link to={`/jobs/${job.slug}`}>
                        <Button className="rounded-2xl h-12 px-8 bg-gray-900 text-white hover:bg-blue-600 transition-colors">
                          Apply
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- HIRING COMPANIES SECTION --- */}
        <section className="py-32 bg-[#05070A] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px]" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">Top Recruiters</h2>
              <p className="text-gray-500 font-bold uppercase tracking-[0.4em] text-xs">Direct Partnerships</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {companies?.data?.map((company) => (
                <div key={company.id} className="group bg-white/5 border border-white/10 p-10 rounded-[3rem] text-center hover:bg-white/10 transition-all duration-500 cursor-pointer">
                  <div className="w-20 h-20 bg-white rounded-3xl p-4 mx-auto mb-6 group-hover:rotate-6 transition-transform">
                    <OptimizedImage src={company.logo_url || '/api/placeholder/80/80'} className="w-full h-full object-contain" />
                  </div>
                  <h4 className="text-white font-bold text-lg mb-1">{company.name}</h4>
                  <p className="text-blue-400 text-[10px] font-black tracking-widest uppercase">{company.job_count || 0} Positions</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- PREMIUM CTA SECTION --- */}
        <section className="py-24 px-6">
          <div className="container mx-auto">
            <div className="bg-blue-600 rounded-[4rem] p-12 lg:p-32 text-center relative overflow-hidden shadow-2xl shadow-blue-600/40">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-indigo-900" />
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
              
              <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-5xl lg:text-7xl font-black text-white mb-10 tracking-tighter leading-none">
                  Ready for your next big move?
                </h2>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link to="/register">
                    <Button size="lg" className="w-full sm:w-auto px-14 h-20 rounded-3xl bg-white text-blue-600 hover:scale-105 transition-transform font-black text-xl">
                      Get Started
                    </Button>
                  </Link>
                  <Link to="/jobs">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto px-14 h-20 rounded-3xl border-white/40 text-white hover:bg-white/10 backdrop-blur-md font-black text-xl">
                      Search Jobs
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
