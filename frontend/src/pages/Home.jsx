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

  // Fetch data - Preserved exactly as requested
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs', { limit: 6 }],
    queryFn: () => getJobs({ limit: 6 }),
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories({ include_job_count: true }),
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
    <div className="min-h-screen bg-white">
      {/* Hero Section - Upgraded with modern gradients and layout */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white pt-10 pb-20 lg:pt-24 lg:pb-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-100 text-xs sm:text-sm font-medium mb-6 backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>AI-Verified Opportunities Updated Daily</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
                Find Your Dream Job <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-100">
                  Fast Hire Mela
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-blue-100/90 mb-10 max-w-2xl mx-auto font-medium">
                Discover thousands of job opportunities from top companies — precisely matched by our AI algorithms.
              </p>
            </motion.div>

            {/* Search Bar - Modern Glassmorphism Style */}
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/10 backdrop-blur-2xl p-2 sm:p-3 rounded-2xl lg:rounded-full border border-white/20 shadow-2xl max-w-4xl mx-auto group focus-within:bg-white/20 transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row gap-2">
                <div className="flex-[2] relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-200 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Job title, keywords, or company"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 lg:bg-transparent border-0 rounded-xl lg:rounded-none focus:ring-0 text-white placeholder-blue-200 text-sm sm:text-base outline-none"
                  />
                </div>
                <div className="hidden lg:block w-px h-8 self-center bg-white/20"></div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-200 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Location"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 lg:bg-transparent border-0 rounded-xl lg:rounded-none focus:ring-0 text-white placeholder-blue-200 text-sm sm:text-base outline-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-400 text-white h-14 px-8 lg:rounded-full font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  Find Jobs
                </Button>
              </div>
            </motion.form>

            {/* Quick Stats - Preserved and Styled */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 lg:mt-24 border-t border-white/10 pt-10"
            >
              {[
                { label: 'Active Jobs', val: '5K+' },
                { label: 'Companies', val: '100+' },
                { label: 'Job Seekers', val: '5K+' },
                { label: 'Success Rate', val: '90%' },
              ].map((stat, i) => (
                <div key={i} className="text-center group cursor-default">
                  <div className="text-2xl sm:text-4xl font-black text-white mb-1 group-hover:scale-110 transition-transform">{stat.val}</div>
                  <div className="text-blue-200/80 text-xs sm:text-sm font-bold uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* AI Features Section - Visual Polish */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-3xl mb-8 rotate-3 shadow-inner">
              <Sparkles className="w-10 h-10 text-blue-600 animate-pulse" />
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
              AI-Powered Job Updates
            </h2>

            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Our proprietary AI automatically finds and verifies new jobs every day at <span className="text-blue-600 font-bold">8:00 PM</span>,
              ensuring you access high-intent, real opportunities before anyone else.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[
                { icon: "🤖", title: "Smart Search", desc: "AI finds the best jobs for you" },
                { icon: "✅", title: "Verified Jobs", desc: "All jobs are checked for quality" },
                { icon: "🕘", title: "Daily Updates", desc: "New jobs every evening" }
              ].map((feature, idx) => (
                <div key={idx} className="p-8 bg-gray-50 rounded-3xl border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                  <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">{feature.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-xl">{feature.title}</h3>
                  <p className="text-gray-500 text-sm font-medium">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-6 rounded-2xl bg-gray-50 border border-dashed border-gray-300">
              <Link to="/user-guidance" className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-2 group">
                <span className="text-xl">📘</span> Learn how it works
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
              <div className="text-gray-600 font-medium">
                <strong>New here?</strong> Start with our onboarding guide
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trending Categories - Grid Polish */}
      <section className="py-24 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="text-left">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Trending Categories</h2>
              <p className="text-gray-500 font-medium">Explore high-growth sectors with fresh vacancies</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {categories?.data?.categories?.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-3xl p-6 text-center shadow-sm hover:shadow-xl transition-all border border-transparent hover:border-blue-100 cursor-pointer group"
                onClick={() => window.location.href = `/jobs?category=${category.id}`}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{category.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base leading-tight">{category.name}</h3>
                <div className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider">
                  {category.job_count} jobs
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Jobs - Card Styling Upgrade */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Latest Job Opportunities</h2>
            <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs?.data?.jobs?.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden group">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                        <img
                          src={job.company_logo || '/api/placeholder/60/60'}
                          alt={job.company_name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-contain"
                        />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                        {job.job_type}
                      </span>
                    </div>

                    <CardTitle className="text-xl font-bold mb-4 text-gray-900 group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </CardTitle>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-600 text-sm font-medium">
                        <Building2 className="w-4 h-4 mr-2 text-blue-500" />
                        {job.company_name}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm font-medium">
                        <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                        {job.location}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm mb-6 pb-6 border-b border-gray-50">
                      <div className="font-bold text-gray-900">
                        {job.salary_min && job.salary_max
                          ? `₹${job.salary_min}L - ₹${job.salary_max}L`
                          : <span className="text-gray-400 font-normal italic">Not disclosed</span>
                        }
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {job.posted_time}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {job.skills?.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <Link to={`/jobs/${job.id}`}>
                      <Button variant="outline" className="w-full rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 font-bold border-gray-200">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link to="/jobs">
              <Button size="lg" className="px-10 h-16 rounded-full font-black text-lg shadow-xl shadow-blue-500/20" icon={<ArrowRight className="w-6 h-6 ml-2" />}>
                Explore All Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Top Companies Hiring - Logo Wall */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Top Companies Hiring</h2>
            <p className="text-blue-300 font-medium">Join leading organizations worldwide</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {companies?.data?.map((company, index) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center transition-all cursor-pointer group"
                onClick={() => window.location.href = `/jobs?company=${company.id}`}
              >
                <div className="bg-white p-3 rounded-2xl inline-block mb-4 shadow-xl">
                  <img
                    src={company.logo_url || '/api/placeholder/80/80'}
                    alt={company.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                  />
                </div>
                <h3 className="font-bold text-white mb-1 text-sm sm:text-base">{company.name}</h3>
                <p className="text-xs text-blue-300 mb-3">{company.industry}</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-tighter">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {company.job_count} OPENINGS
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Bold and Clear */}
      <section className="py-20 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container relative mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-5xl font-black mb-6 text-white leading-tight">Ready to Find Your Dream Job?</h2>
            <p className="text-lg sm:text-xl mb-10 text-blue-100 max-w-2xl mx-auto font-medium">
              Join 5,000+ job seekers who found their next career move with Fast Hire Mela.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/jobs">
                <Button size="lg" className="w-full sm:w-auto px-10 h-16 rounded-2xl bg-white text-blue-600 hover:bg-gray-100 font-black text-lg shadow-2xl">
                  Browse All Jobs
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-10 h-16 rounded-2xl border-2 border-white text-white hover:bg-white/10 font-black text-lg">
                  Sign Up Free
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;