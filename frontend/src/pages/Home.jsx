import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  TrendingUp,
  Building2,
  MapPin,
  Clock,
  ArrowRight,
  Star,
  Users,
  Briefcase,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { getJobs, getCategories, getCompanies } from '../services/api';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Fetch data - Preserving all logic
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs', { limit: 6 }],
    queryFn: () => getJobs({ limit: 6 }),
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: companies, isLoading: companiesLoading } = useQuery({
    queryKey: ['companies', { limit: 8 }],
    queryFn: () => getCompanies({ limit: 8 }),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    window.location.href = `/jobs?q=${encodeURIComponent(searchQuery)}&category=${selectedCategory}&location=${selectedLocation}`;
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-[#0F172A] overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -right-24 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 py-20 lg:py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.div className="mb-8">
              <span className="inline-block py-1 px-3 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold tracking-widest uppercase mb-4 border border-blue-500/20">
                The Future of Hiring is Here
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
                Find Your Dream Job <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                  Fast Hire Mela
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Discover thousands of job opportunities from top companies — powered by AI. Your next big career move starts with a single search.
              </p>
            </motion.div>

            {/* Search Bar - Enhanced UI */}
            <motion.form
              onSubmit={handleSearch}
              className="bg-white p-2 rounded-2xl md:rounded-[2rem] shadow-2xl max-w-4xl mx-auto flex flex-col lg:flex-row gap-2"
            >
              <div className="flex-1 relative flex items-center border-b lg:border-b-0 lg:border-r border-gray-100 px-4 py-2">
                <Search className="text-blue-500 w-5 h-5 mr-3" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-3 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 font-medium"
                />
              </div>
              <div className="flex-1 relative flex items-center px-4 py-2">
                <MapPin className="text-blue-500 w-5 h-5 mr-3" />
                <input
                  type="text"
                  placeholder="Location"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full py-3 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 font-medium"
                />
              </div>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl md:rounded-2xl transition-all shadow-lg shadow-blue-200"
                icon={<ArrowRight className="w-5 h-5 ml-2" />}
              >
                Search Jobs
              </Button>
            </motion.form>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16 border-t border-slate-800 pt-12 max-w-4xl mx-auto">
              {[
                { label: 'Active Jobs', val: '5K+' },
                { label: 'Companies', val: '100+' },
                { label: 'Job Seekers', val: '5K+' },
                { label: 'Success Rate', val: '90%' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl md:text-3xl font-black text-white">{stat.val}</div>
                  <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-xl border border-gray-100 flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-blue-600 text-white flex items-center justify-center rounded-3xl shadow-xl shadow-blue-200 mb-8"
            >
              <Sparkles className="w-10 h-10" />
            </motion.div>

            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
              AI-Powered Job Updates
            </h2>
            <p className="text-lg text-slate-600 mb-12 max-w-3xl leading-relaxed font-medium">
              Our AI automatically finds and verifies new jobs every day at <span className="text-blue-600 font-bold">8:00 PM</span>, 
              ensuring you get a head start on real, verified opportunities.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
              {[
                { icon: "🤖", title: "Smart Search", desc: "AI finds the best jobs for you" },
                { icon: "✅", title: "Verified Jobs", desc: "All jobs are checked for quality" },
                { icon: "🕘", title: "Daily Updates", desc: "New jobs every evening" }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-gray-200/50 hover:border-blue-200 transition-colors group">
                  <div className="text-4xl mb-4 transform transition-transform group-hover:scale-110">{item.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-col sm:flex-row items-center gap-6">
              <Link to="/user-guidance" className="group flex items-center gap-2 text-blue-600 font-bold text-lg hover:underline underline-offset-4">
                📘 Learn how it works
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Categories */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div className="text-left">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Trending Categories</h2>
              <p className="text-slate-500 text-lg font-medium">Explore popular industries hiring right now</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {categories?.data?.categories?.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl p-6 text-center border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all cursor-pointer"
                onClick={() => window.location.href = `/jobs?category=${category.id}`}
              >
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">{category.icon}</div>
                <h3 className="font-bold text-slate-900 mb-1">{category.name}</h3>
                <p className="text-xs font-bold text-blue-500 uppercase tracking-tighter">{category.job_count} jobs</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Jobs - Premium Grid */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Latest Opportunities</h2>
            <p className="text-slate-500 text-lg font-medium">Fresh positions verified by our AI agents</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs?.data?.jobs?.map((job, index) => (
              <motion.div
                key={job.id}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Card className="h-full border-none shadow-md hover:shadow-2xl transition-all rounded-[2rem] overflow-hidden bg-white">
                  <CardHeader className="p-8 pb-0">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 p-2 bg-white shadow-sm">
                        <img
                          src={job.company_logo || '/api/placeholder/60/60'}
                          alt={job.company_name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-[10px] uppercase tracking-widest font-black bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full border border-blue-100">
                        {job.type}
                      </span>
                    </div>
                    <CardTitle className="text-xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </CardTitle>
                    <div className="space-y-2">
                      <div className="flex items-center text-slate-500 text-sm font-semibold">
                        <Building2 className="w-4 h-4 mr-2 text-blue-400" />
                        {job.company_name}
                      </div>
                      <div className="flex items-center text-slate-500 text-sm font-semibold">
                        <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                        {job.location}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between py-4 border-y border-gray-50 mb-6">
                      <div className="font-bold text-slate-900">
                        {job.salary_min && job.salary_max
                          ? `₹${job.salary_min}L - ₹${job.salary_max}L`
                          : 'Not disclosed'}
                      </div>
                      <div className="flex items-center text-slate-400 text-xs font-bold uppercase">
                        <Clock className="w-3 h-3 mr-1" />
                        {job.posted_time}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-8">
                      {job.skills?.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="text-[10px] font-bold bg-slate-50 text-slate-500 px-3 py-1 rounded-lg border border-gray-100">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <Link to={`/jobs/${job.id}`} className="block">
                      <Button className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link to="/jobs">
              <Button size="lg" className="bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white px-10 py-4 font-black rounded-2xl transition-all shadow-xl shadow-gray-200" icon={<ArrowRight size={20} className="ml-2" />}>
                View All Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Top Companies */}
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-16 tracking-tight italic">Top Companies Hiring</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {companies?.data?.map((company, index) => (
              <motion.div
                key={company.id}
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-8 bg-white border border-gray-100 rounded-[2rem] hover:shadow-2xl hover:border-blue-100 transition-all cursor-pointer flex flex-col items-center"
                onClick={() => window.location.href = `/jobs?company=${company.id}`}
              >
                <div className="w-20 h-20 mb-6 grayscale group-hover:grayscale-0 transition-all">
                  <img
                    src={company.logo_url || '/api/placeholder/80/80'}
                    alt={company.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-1">{company.name}</h3>
                <p className="text-slate-400 font-medium text-sm mb-4">{company.industry}</p>
                <div className="inline-flex items-center text-blue-600 font-black text-xs uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-full">
                  <Briefcase size={12} className="mr-2" />
                  {company.open_jobs} Openings
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-6 relative z-10 text-center text-white">
          <h2 className="text-3xl md:text-6xl font-black mb-8 leading-tight tracking-tight">Ready to Find Your <br/>Dream Career?</h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto font-medium opacity-90 leading-relaxed">
            Let our AI match you with right opportunities — trusted by thousands of successful job seekers across India.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/jobs">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-50 px-12 py-5 font-black rounded-2xl shadow-2xl shadow-blue-900/40 transform transition hover:scale-105">
                Browse All Jobs
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" className="bg-blue-800/30 text-white border border-white/20 hover:bg-blue-800/50 px-12 py-5 font-black rounded-2xl backdrop-blur-md transform transition hover:scale-105">
                Sign Up Now — Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;