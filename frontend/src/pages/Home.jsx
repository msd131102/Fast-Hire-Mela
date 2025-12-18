import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Building2,
  MapPin,
  Clock,
  ArrowRight,
  Briefcase,
  Sparkles,
  MousePointer2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Card, CardTitle } from '../components/ui/Card';
import { getJobs, getCategories, getCompanies, utils } from '../services/api';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const { data: jobs } = useQuery({
    queryKey: ['jobs', { limit: 6 }],
    queryFn: () => getJobs({ limit: 6 }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories({ include_job_count: true }),
  });

  const { data: companies } = useQuery({
    queryKey: ['companies', { limit: 8 }],
    queryFn: () => getCompanies({ limit: 8 }),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    window.location.href = `/jobs?q=${encodeURIComponent(searchQuery)}&category=${selectedCategory}&location=${selectedLocation}`;
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] selection:bg-blue-100 selection:text-blue-900">
      
      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden bg-[#0A0C10] text-white pt-24 pb-20 lg:pt-36 lg:pb-44">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
        </div>

        <div className="container relative mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-300 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-8 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Recruitment 2.0</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black mb-8 tracking-tighter leading-[0.9] text-white">
              Fast Hire Mela <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-200">
                Work Smarter
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              Fast Hire Mela bridges the gap between ambition and opportunity with daily AI-verified listings.
            </p>

            {/* Premium Search Bar */}
            <motion.form
              onSubmit={handleSearch}
              className="bg-white/[0.03] backdrop-blur-3xl p-2 rounded-2xl lg:rounded-full border border-white/10 shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] max-w-5xl mx-auto flex flex-col lg:flex-row gap-2"
            >
              <div className="flex-[1.5] relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  placeholder="What role are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-white/5 lg:bg-transparent border-0 rounded-xl lg:rounded-none text-white placeholder-gray-500 text-sm focus:ring-0 outline-none font-medium"
                />
              </div>
              <div className="hidden lg:block w-[1px] h-8 self-center bg-white/10"></div>
              <div className="flex-1 relative group">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  placeholder="City or Remote"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-white/5 lg:bg-transparent border-0 rounded-xl lg:rounded-none text-white placeholder-gray-500 text-sm focus:ring-0 outline-none font-medium"
                />
              </div>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white h-14 lg:h-auto px-10 lg:rounded-full font-bold transition-all active:scale-95 whitespace-nowrap"
              >
                Search Jobs
              </Button>
            </motion.form>

            <div className="flex flex-wrap justify-center gap-8 mt-20 opacity-40 grayscale pointer-events-none">
              <span className="text-xs font-bold tracking-widest uppercase">Trusted by Students</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- AI FEATURES --- */}
      <section className="py-24 border-b border-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <Sparkles className="text-blue-600" />, title: "Daily 8 PM Drop", desc: "Our AI curates and verifies high-intent roles every evening." },
              { icon: <Briefcase className="text-indigo-600" />, title: "Verified Listings", desc: "Every company is vetted to ensure zero spam or ghost jobs." },
              { icon: <MousePointer2 className="text-blue-600" />, title: "1-Click Apply", desc: "Streamlined applications designed for the modern professional." }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-white hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CATEGORIES --- */}
      <section className="py-24 bg-[#F8F9FF]">
        <div className="container mx-auto px-6 text-center lg:text-left">
          <div className="mb-16">
            <h2 className="text-3xl lg:text-5xl font-black text-gray-900 mb-4 tracking-tight">Explore by Sector</h2>
            <p className="text-gray-500 font-semibold uppercase text-xs tracking-[0.2em]">High Growth Opportunities</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories?.data?.categories?.map((category, index) => (
              <motion.div
                key={category.id}
                whileHover={{ y: -5, backgroundColor: '#fff' }}
                onClick={() => window.location.href = `/jobs?category=${category.id}`}
                className="bg-white/40 backdrop-blur-sm border border-gray-100 p-8 rounded-[2rem] cursor-pointer transition-all shadow-sm hover:shadow-xl"
              >
                <div className="text-4xl mb-6">{category.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{category.name}</h3>
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
                  {category.job_count || 0} Open
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- LATEST JOBS --- */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl lg:text-6xl font-black text-gray-900 mb-4 tracking-tighter leading-none">Latest Openings</h2>
              <p className="text-gray-500 font-medium">Freshly dropped opportunities for your next career move.</p>
            </div>
            <Link to="/jobs">
              <Button variant="outline" className="rounded-full border-gray-200 px-8 font-bold h-12">View All Jobs</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs?.data?.jobs?.map((job) => (
              <motion.div key={job.id} whileHover={{ y: -8 }}>
                <Card className="rounded-[2.5rem] border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.15)] transition-all p-2 overflow-hidden">
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center p-2 border border-gray-100">
                        <img src={job.company_logo || '/api/placeholder/60/60'} alt="" className="w-full h-full object-contain" />
                      </div>
                      <span className="px-4 py-1.5 rounded-full bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest">
                        {job.job_type}
                      </span>
                    </div>

                    <CardTitle className="text-xl font-bold mb-3 text-gray-900 leading-snug h-14 line-clamp-2">
                      {job.title}
                    </CardTitle>

                    <div className="flex flex-col gap-2 mb-8">
                      <div className="flex items-center text-gray-500 text-sm font-semibold">
                        <Building2 className="w-4 h-4 mr-2 text-blue-500" /> {job.company_name}
                      </div>
                      <div className="flex items-center text-gray-500 text-sm font-semibold">
                        <MapPin className="w-4 h-4 mr-2 text-blue-500" /> {job.location}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-50 mb-8">
                      <div className="text-sm font-black text-gray-900">
                        {job.salary_min ? `₹${job.salary_min}L - ₹${job.salary_max}L` : "Market Comp"}
                      </div>
                      <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                        <Clock className="w-3 h-3 mr-1" /> {utils.formatPostedDate(job.posted_date)}
                      </div>
                    </div>

                    <Link to={`/jobs/${job.id}`}>
                      <Button className="w-full rounded-2xl h-14 font-black shadow-lg shadow-blue-100 hover:shadow-blue-200 transition-all">
                        Check Eligibility
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TOP COMPANIES --- */}
      <section className="py-24 bg-[#0A0C10] text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-black mb-4 tracking-tight">Hiring Companies</h2>
            <p className="text-blue-400 font-bold uppercase text-[10px] tracking-[0.3em]">Direct Access To Companies</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
            {companies?.data?.map((company) => (
              <div 
                key={company.id} 
                onClick={() => window.location.href = `/jobs?company=${company.id}`}
                className="bg-white/[0.03] border border-white/5 p-8 rounded-[2rem] text-center hover:bg-white/[0.07] transition-all cursor-pointer group"
              >
                <div className="bg-white p-4 rounded-3xl inline-block mb-6 shadow-2xl group-hover:scale-110 transition-transform">
                  <img src={company.logo_url || '/api/placeholder/80/80'} alt="" className="w-12 h-12 object-contain grayscale group-hover:grayscale-0 transition-all" />
                </div>
                <h3 className="font-bold text-white mb-1">{company.name}</h3>
                <p className="text-xs text-gray-500 mb-4">{company.industry}</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-[10px] font-black tracking-widest">
                  {company.job_count || 0} OPENINGS
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-[3rem] p-12 lg:p-24 text-center relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(59,130,246,0.5)]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl lg:text-6xl font-black text-white mb-8 tracking-tighter leading-none">Your Next Career Chapter Starts Here.</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto px-12 h-16 rounded-2xl bg-white text-blue-600 hover:bg-gray-50 font-black shadow-2xl">Create Profile</Button>
                </Link>
                <Link to="/jobs">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-12 h-16 rounded-2xl border-white/30 text-blue-600 hover:bg-white/10 font-black backdrop-blur-md">Browse Jobs</Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;