import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

/* ---------------- ANIMATION VARIANTS ---------------- */
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const hoverScale = {
  whileHover: { y: -8, transition: { duration: 0.3, ease: "easeOut" } },
  whileTap: { scale: 0.97 }
};

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

  const { data: jobs } = useQuery({ queryKey: ['jobs', { limit: 6 }], queryFn: () => getJobs({ limit: 6 }) });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => getCategories({ include_job_count: true }) });
  const { data: companies } = useQuery({ queryKey: ['companies', { limit: 8 }], queryFn: () => getCompanies({ limit: 8 }) });

  const handleSearch = (e) => {
    e.preventDefault();
    window.location.href = `/jobs?q=${encodeURIComponent(searchQuery)}&location=${selectedLocation}`;
  };

  return (
    <>
      <SEO {...seoConfig} />

      <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden">
        {/* ================= HERO SECTION ================= */}
        <section className="relative bg-[#020617] pt-28 pb-24 lg:pt-56 lg:pb-64 overflow-hidden">
          {/* PREMIUM FIGMA BACKGROUND GRADIENTS */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1], 
                opacity: [0.3, 0.5, 0.3],
                rotate: [0, 45, 0] 
              }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/20 blur-[140px] rounded-full" 
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1], 
                opacity: [0.2, 0.4, 0.2] 
              }}
              transition={{ duration: 15, repeat: Infinity, delay: 2 }}
              className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/15 blur-[140px] rounded-full" 
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="text-center max-w-5xl mx-auto"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 text-xs font-bold tracking-widest mb-8 backdrop-blur-xl">
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                AI-POWERED JOB MATCHING
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-5xl md:text-8xl lg:text-9xl font-black text-white mb-8 leading-[0.95] tracking-tighter">
                Find your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-indigo-300 to-cyan-400">
                  dream career.
                </span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-gray-400 text-lg md:text-2xl mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                Verified daily opportunities from India's most innovative tech giants and startups.
              </motion.p>

              {/* GLASS SEARCH BAR */}
              <motion.form 
                variants={fadeInUp}
                onSubmit={handleSearch}
                className="bg-white/95 backdrop-blur-2xl p-2 md:p-3 rounded-3xl md:rounded-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] flex flex-col md:flex-row items-center gap-2 max-w-4xl mx-auto border border-white/20"
              >
                <div className="relative flex-[1.4] w-full group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Job Title or Company"
                    className="w-full pl-12 pr-6 py-4 bg-transparent text-gray-900 outline-none font-medium text-base"
                  />
                </div>
                <div className="hidden md:block w-px h-8 bg-gray-200" />
                <div className="relative flex-1 w-full group">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
                  <input
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    placeholder="Location"
                    className="w-full pl-12 pr-6 py-4 bg-transparent text-gray-900 outline-none font-medium text-base"
                  />
                </div>
                <Button className="w-full md:w-auto h-14 md:h-16 px-10 rounded-2xl md:rounded-full font-bold bg-blue-600 hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all text-base shadow-xl shadow-blue-500/25">
                  Find Jobs
                </Button>
              </motion.form>
            </motion.div>
          </div>
        </section>

        {/* ================= CATEGORIES ================= */}
        <section className="py-12 -mt-16 relative z-20">
          <div className="container mx-auto px-4">
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
            >
              {categories?.data?.categories?.map((cat) => (
                <motion.div
                  key={cat.id}
                  variants={fadeInUp}
                  {...hoverScale}
                  onClick={() => (window.location.href = `/jobs?category=${cat.id}`)}
                  className="bg-white/80 backdrop-blur-md border border-white rounded-3xl p-6 text-center shadow-sm hover:shadow-2xl hover:bg-white transition-all cursor-pointer group"
                >
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 group-hover:rotate-6 transition-all duration-300">
                    <CategoryIcon name={cat.icon} className="w-6 h-6 text-blue-600 group-hover:text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{cat.name}</h3>
                  <p className="text-[11px] text-blue-600 font-bold bg-blue-50/50 py-1 px-3 rounded-full inline-block">
                    {cat.job_count || 0} Openings
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ================= LATEST JOBS ================= */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest mb-3">
                  <span className="w-8 h-[2px] bg-blue-600" />
                  Featured Jobs
                </div>
                <h2 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter">
                  Newest Opportunities
                </h2>
              </motion.div>
              <Link to="/jobs">
                <Button variant="outline" className="rounded-full border-2 font-bold px-10 h-14 hover:bg-gray-900 hover:text-white transition-all">
                  Browse All <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>

            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8"
            >
              {jobs?.data?.jobs?.map((job) => (
                <motion.div key={job.id} variants={fadeInUp} {...hoverScale}>
                  <Card className="group h-full bg-white rounded-[32px] p-5 md:p-8 border border-gray-100 hover:border-blue-400 transition-all flex flex-col shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm overflow-hidden p-2 group-hover:scale-110 transition-transform">
                        <OptimizedImage
                          src={job.company_logo || '/api/placeholder/80/80'}
                          alt={job.company_name}
                          className="object-contain w-full h-full"
                          width={60} height={60}
                        />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">
                        {job.job_type}
                      </span>
                    </div>

                    <CardTitle className="text-lg md:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2 leading-tight">
                      {job.title}
                    </CardTitle>

                    <div className="flex items-center text-sm text-gray-500 font-medium mb-8">
                      <Building2 className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="truncate">{job.company_name}</span>
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-50 flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-black text-gray-900">
                          {job.salary_min ? `₹${job.salary_min}L` : 'Market'}
                        </span>
                        <div className="flex items-center text-xs text-gray-400 font-medium">
                          <Clock className="w-4 h-4 mr-1.5" />
                          {utils.formatPostedDate(job.posted_date)}
                        </div>
                      </div>
                      <Link to={`/jobs/${job.slug}`}>
                        <Button className="w-full h-12 md:h-14 rounded-2xl font-bold bg-gray-900 group-hover:bg-blue-600 transition-all text-white shadow-lg">
                          Apply Now
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ================= TOP COMPANIES ================= */}
        <section className="py-24 bg-gray-50/50">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Hiring Partners</h2>
              <div className="w-24 h-2 bg-blue-600 mx-auto rounded-full" />
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
            >
              {companies?.data?.map((company) => (
                <motion.div
                  key={company.id}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => (window.location.href = `/jobs?company=${company.id}`)}
                  className="p-8 rounded-[40px] border border-white bg-white shadow-sm hover:shadow-xl transition-all cursor-pointer text-center group"
                >
                  <div className="w-20 h-20 bg-gray-50 rounded-[24px] flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-50 transition-colors border border-gray-100 shadow-inner">
                    <OptimizedImage
                      src={company.logo_url || '/vite.svg'}
                      alt={company.name}
                      className="max-w-[60%] max-h-[60%] object-contain"
                      width={100} height={100}
                    />
                  </div>
                  <p className="font-bold text-gray-900 text-lg mb-1 truncate">{company.name}</p>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                    {company.job_count || 0} Jobs
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;