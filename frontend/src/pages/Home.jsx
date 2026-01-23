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

/* ---------------- ICON MAPPER ---------------- */
const iconMap = { Briefcase, Code, Headphones, BarChart, Layers, Globe, Sparkles };
const CategoryIcon = ({ name, className }) => {
  const Icon = iconMap[name] || Briefcase;
  return <Icon className={className} />;
};

/* ---------------- MOTION VARIANTS ---------------- */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } }
};

const cardHover = {
  hover: {
    y: -6,
    boxShadow: '0 20px 50px rgba(15,23,42,0.15)',
    transition: { duration: 0.2, ease: 'easeOut' }
  }
};

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const seoConfig = {
    title: 'Jobs in India - Latest Openings | FastHireMela',
    description: 'Find verified jobs and apply to latest openings across India.',
    canonicalUrl: 'https://www.fasthiremela.online/',
    isHomepage: true
  };

  const { data: jobs, isLoading: jobsLoading } = useQuery({
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
    navigate(`/jobs?q=${encodeURIComponent(searchQuery)}&location=${selectedLocation}`);
  };

  return (
    <>
      <SEO {...seoConfig} />

      <div className="min-h-screen bg-[#F8FAFC]">

        {/* ================= HERO ================= */}
        <section className="relative bg-[#020617] pt-28 pb-24 lg:pt-48 lg:pb-56 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -left-32 w-[40%] h-[40%] bg-blue-600/20 blur-[140px] rounded-full" />
            <div className="absolute -bottom-32 -right-32 w-[40%] h-[40%] bg-indigo-600/10 blur-[140px] rounded-full" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-400 text-xs font-semibold mb-6">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                VERIFIED BY AI TECHNOLOGY
              </div>

              <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-white leading-tight mb-6">
                Your Career <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">
                  Starts Here.
                </span>
              </h1>

              <p className="text-gray-400 text-sm md:text-xl max-w-2xl mx-auto mb-10">
                AI-verified job opportunities from India’s top companies.
              </p>

              <motion.form
                onSubmit={handleSearch}
                whileHover={{ scale: 1.01 }}
                className="bg-white p-2 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-1 max-w-3xl mx-auto"
              >
                <div className="relative flex-[1.2] w-full border-b md:border-b-0 md:border-r border-gray-100">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Role or Company"
                    className="w-full pl-10 pr-4 py-3 bg-transparent outline-none text-sm md:text-base"
                  />
                </div>
                <div className="relative flex-1 w-full">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    placeholder="Location"
                    className="w-full pl-10 pr-4 py-3 bg-transparent outline-none text-sm md:text-base"
                  />
                </div>
                <Button className="w-full md:w-auto h-12 px-8 rounded-xl md:rounded-full font-bold bg-blue-600 hover:bg-blue-700">
                  Search
                </Button>
              </motion.form>
            </motion.div>
          </div>
        </section>

        {/* ================= CATEGORIES ================= */}
        <section className="py-14 -mt-12 relative z-20">
          <div className="container mx-auto px-4">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
            >
              {categories?.data?.categories?.map(cat => (
                <motion.div
                  key={cat.id}
                  variants={fadeUp}
                  whileHover="hover"
                  onClick={() => navigate(`/jobs?category=${cat.id}`)}
                  className="bg-white border rounded-2xl p-5 text-center cursor-pointer"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CategoryIcon name={cat.icon} className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-bold">{cat.name}</h3>
                  <p className="text-xs text-blue-600 font-semibold mt-1">
                    {cat.job_count || 0} Jobs
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ================= FEATURED JOBS ================= */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {jobsLoading
                ? [...Array(6)].map((_, i) => (
                    <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
                  ))
                : jobs?.data?.jobs?.map(job => (
                    <motion.div
                      key={job.id}
                      variants={fadeUp}
                      whileHover="hover"
                    >
                      <Card className="h-full p-6 rounded-3xl border hover:border-blue-200 transition">
                        <CardTitle className="mb-2 text-lg font-bold">
                          {job.title}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mb-4">{job.company_name}</p>
                        <div className="mt-auto flex justify-between items-center">
                          <span className="font-bold">
                            {job.salary_min ? `₹${job.salary_min} LPA` : 'Market'}
                          </span>
                          <Link to={`/jobs/${job.slug}`}>
                            <Button className="rounded-lg bg-gray-900 hover:bg-blue-600 text-white">
                              Apply
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
            </motion.div>
          </div>
        </section>

        {/* ================= COMPANIES ================= */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {companies?.data?.map(company => (
                <motion.div
                  key={company.id}
                  variants={fadeUp}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate(`/jobs?company=${company.id}`)}
                  className="p-6 rounded-3xl bg-gray-50 cursor-pointer text-center"
                >
                  <OptimizedImage
                    src={company.logo_url || '/vite.svg'}
                    alt={company.name}
                    className="mx-auto mb-4 max-h-12"
                  />
                  <p className="font-bold">{company.name}</p>
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
