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

  // Fetch data
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
    // Navigate to jobs page with search params
    window.location.href = `/jobs?q=${encodeURIComponent(searchQuery)}&category=${selectedCategory}&location=${selectedLocation}`;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6">
                Find Your Dream Job
                <span className="block text-blue-200 text-xl sm:text-2xl md:text-3xl lg:text-5xl mt-2">Fast Hire Mela</span>
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-blue-100 mb-6 md:mb-8 px-4 sm:px-0">
                Discover thousands of job opportunities from top companies — powered by AI.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-4xl mx-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      type="text"
                      placeholder="Job title, keywords, or company"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm sm:text-base"
                    />
                  </div>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    placeholder="Location"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm sm:text-base"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white h-full text-sm sm:text-base"
                  icon={<ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                >
                  <span className="hidden sm:inline">Search</span>
                  <span className="sm:hidden">Go</span>
                </Button>
              </div>
            </motion.form>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8 md:mt-12"
            >
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-200">5K+</div>
                <div className="text-blue-100 text-sm sm:text-base">Active Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-200">100+</div>
                <div className="text-blue-100 text-sm sm:text-base">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-200">5K+</div>
                <div className="text-blue-100 text-sm sm:text-base">Job Seekers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-200">90%</div>
                <div className="text-blue-100 text-sm sm:text-base">Success Rate</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              AI-Powered Job Updates
            </h2>

            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Our AI automatically finds and verifies new jobs every day at 8:00 PM, 
              so you always get fresh, real opportunities.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl mb-2">🤖</div>
                <h3 className="font-semibold text-gray-900 mb-1">Smart Search</h3>
                <p className="text-gray-600 text-sm">AI finds the best jobs for you</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">✅</div>
                <h3 className="font-semibold text-gray-900 mb-1">Verified Jobs</h3>
                <p className="text-gray-600 text-sm">All jobs are checked for quality</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🕘</div>
                <h3 className="font-semibold text-gray-900 mb-1">Daily Updates</h3>
                <p className="text-gray-600 text-sm">New jobs every evening</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/user-guidance"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                📘 Learn how it works
              </Link>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">
                <strong>New here?</strong> Get started guide
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trending Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trending Categories</h2>
            <p className="text-gray-600 text-lg">Explore popular job categories</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories?.data?.categories?.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-lg p-4 sm:p-6 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.location.href = `/jobs?category=${category.id}`}
              >
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{category.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500">{category.job_count} jobs</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Jobs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Job Opportunities</h2>
            <p className="text-gray-600 text-lg">Fresh positions from top companies</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {jobs?.data?.jobs?.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card hover className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <img
                        src={job.company_logo || '/api/placeholder/60/60'}
                        alt={job.company_name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover"
                      />
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {job.type}
                      </span>
                    </div>
                    <CardTitle className="text-base sm:text-lg mb-2">{job.title}</CardTitle>
                    <div className="flex items-center text-gray-600 text-xs sm:text-sm mb-2">
                      <Building2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      {job.company_name}
                    </div>
                    <div className="flex items-center text-gray-600 text-xs sm:text-sm mb-3">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      {job.location}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 gap-2 sm:gap-0">
                      <div className="flex items-center">
                        {job.salary_min && job.salary_max
                          ? `₹${job.salary_min}L - ₹${job.salary_max}L`
                          : 'Not disclosed'
                        }
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {job.posted_time}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                      {job.skills?.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 text-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <Link to={`/jobs/${job.id}`}>
                      <Button variant="outline" className="w-full text-sm">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/jobs">
              <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                View All Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Top Companies */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Top Companies Hiring</h2>
            <p className="text-gray-600 text-lg">Join leading organizations</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {companies?.data?.map((company, index) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-lg p-4 sm:p-6 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.location.href = `/jobs?company=${company.id}`}
              >
                <img
                  src={company.logo_url || '/api/placeholder/80/80'}
                  alt={company.name}
                  className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 rounded-lg object-cover"
                />
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{company.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-2">{company.industry}</p>
                <div className="flex items-center justify-center text-xs sm:text-sm text-gray-600">
                  <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {company.open_jobs} jobs
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Find Your Dream Job?</h2>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-blue-100">
              Let our AI match you with right opportunities — trusted by thousands of successful job seekers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/jobs">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  Browse Jobs
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-gray-100">
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
