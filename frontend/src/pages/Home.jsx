import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Building2, MapPin, ArrowRight, Briefcase,
  Code, Headphones, BarChart, Layers, Globe, Zap, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import SEO from '../components/seo/SEO';
import OptimizedImage from '../components/ui/OptimizedImage';
import { getJobs, getCategories, getCompanies } from '../services/api';

/* ------------------ MOBILE DETECTION ------------------ */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
};

/* ------------------ ICON MAP ------------------ */
const IconComponent = ({ name, className }) => {
  const iconMap = {
    Briefcase, Code, Headphones, BarChart, Layers,
    Globe, Zap, ShieldCheck
  };
  const Icon = iconMap[name] || Briefcase;
  return <Icon className={className} />;
};

const Home = () => {
  const isMobile = useIsMobile();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const seoConfig = {
    title: 'Jobs in India - Latest Openings | FastHireMela',
    description: 'Find verified jobs and apply to latest openings across India.',
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

        {/* ---------------- HERO ---------------- */}
        <section className="relative pt-28 pb-24 lg:pt-40 lg:pb-52 bg-[#05070A] overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px]" />

          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={isMobile ? { opacity: 0, y: 24 } : false}
              animate={isMobile ? { opacity: 1, y: 0 } : false}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-center max-w-5xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase mb-10">
                <Zap className="w-3.5 h-3.5" />
                The Future of Job Hunting
              </div>

              <h1 className="text-[2.8rem] sm:text-5xl md:text-7xl lg:text-9xl font-black text-white mb-6 sm:mb-8 leading-tight">
                Hire <span className="text-blue-500">Fast.</span><br />
                Work <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-200">Better.</span>
              </h1>

              <p className="text-gray-400 text-base sm:text-lg md:text-xl mb-10 sm:mb-14 max-w-xl sm:max-w-2xl mx-auto">
                Connect with India's top employers through our AI-driven placement ecosystem.
              </p>

              <form onSubmit={handleSearch}>
                <motion.div
                  whileFocusWithin={isMobile ? { scale: 1.02 } : {}}
                  transition={{ type: 'spring', stiffness: 180, damping: 15 }}
                  className="bg-white/5 backdrop-blur-2xl p-3 sm:p-2 rounded-2xl lg:rounded-full border border-white/10 flex flex-col lg:flex-row gap-2 max-w-4xl mx-auto"
                >
                  <div className="flex-1 relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Job title, skills or company"
                      className="w-full pl-14 sm:pl-16 pr-5 py-4 sm:py-5 bg-transparent text-white outline-none"
                    />
                  </div>

                  <div className="flex-1 relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      placeholder="Location"
                      className="w-full pl-14 sm:pl-16 pr-5 py-4 sm:py-5 bg-transparent text-white outline-none"
                    />
                  </div>

                  <Button className="bg-blue-600 h-14 lg:h-auto px-10 rounded-xl lg:rounded-full font-bold">
                    Find Jobs
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          </div>
        </section>

        {/* ---------------- CATEGORIES ---------------- */}
        <section className="py-24 bg-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {categories?.data?.categories?.map(cat => (
                <motion.div
                  key={cat.id}
                  whileTap={isMobile ? { scale: 0.96 } : {}}
                  className="cursor-pointer"
                  onClick={() => window.location.href = `/jobs?category=${cat.id}`}
                >
                  <div className="bg-gray-50 p-6 sm:p-8 rounded-[2.5rem] text-center hover:bg-blue-50/40 transition">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent name={cat.icon} className="w-7 h-7 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-sm">{cat.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{cat.job_count || 0} Jobs</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- JOBS ---------------- */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {jobs?.data?.jobs?.map(job => (
                <motion.div
                  key={job.id}
                  initial={isMobile ? { opacity: 0, y: 20 } : false}
                  whileInView={isMobile ? { opacity: 1, y: 0 } : false}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45 }}
                >
                  <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow hover:shadow-xl transition h-full flex flex-col">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
                      {job.title}
                    </h3>
                    <p className="text-gray-500 mb-6">{job.company_name}</p>

                    <Link to={`/jobs/${job.slug}`} className="mt-auto">
                      <Button
                        as={motion.button}
                        whileTap={isMobile ? { scale: 0.94 } : {}}
                        className="w-full rounded-xl bg-gray-900 text-white hover:bg-blue-600"
                      >
                        Apply
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- CTA ---------------- */}
        <section className="py-24 px-4">
          <div className="max-w-[1400px] mx-auto">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-900 p-10 sm:p-16 lg:p-32 rounded-[4rem] text-center text-white">
              <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black mb-10">
                Ready for your next big move?
              </h2>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  as={motion.button}
                  whileTap={isMobile ? { scale: 0.95 } : {}}
                  className="bg-white text-blue-600 h-16 px-12 rounded-3xl font-black"
                >
                  Get Started
                </Button>

                <Button
                  as={motion.button}
                  whileTap={isMobile ? { scale: 0.95 } : {}}
                  variant="outline"
                  className="border-white text-white h-16 px-12 rounded-3xl font-black"
                >
                  Search Jobs
                </Button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default Home;
