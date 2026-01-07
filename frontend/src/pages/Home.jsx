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
  MousePointer2,
  Code,
  Headphones,
  BarChart,
  Layers,
  Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Card, CardTitle } from '../components/ui/Card';
import SEO from '../components/seo/SEO';
import OptimizedImage from '../components/ui/OptimizedImage';
import { getJobs, getCategories, getCompanies, utils } from '../services/api';

/* ---------------- ICON MAPPER ---------------- */
const CategoryIcon = ({ name, className }) => {
  const iconMap = {
    Briefcase,
    Code,
    Headphones,
    BarChart,
    Layers,
    Globe,
    Sparkles
  };
  const Icon = iconMap[name] || Briefcase;
  return <Icon className={className} />;
};

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  /* ---------------- SEO ---------------- */
  const seoConfig = {
    title: 'Jobs in India - Latest Openings | FastHireMela',
    description:
      'Find verified jobs and apply to latest openings across India. AI-powered job portal.',
    canonicalUrl: 'https://www.fasthiremela.online/',
    isHomepage: true
  };

  /* ---------------- DATA ---------------- */
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
    window.location.href = `/jobs?q=${encodeURIComponent(
      searchQuery
    )}&category=${selectedCategory}&location=${selectedLocation}`;
  };

  return (
    <>
      <SEO {...seoConfig} />

      <div className="min-h-screen bg-[#FDFDFF]">

        {/* ================= HERO ================= */}
        <section className="relative bg-[#0A0C10] text-white pt-24 pb-20 lg:pt-36 lg:pb-44 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-300 text-xs font-bold uppercase mb-8">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Recruitment
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black mb-8 tracking-tight leading-tight">
                Fast Hire Mela <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
                  Work Smarter
                </span>
              </h1>

              <p className="text-gray-400 text-base sm:text-xl mb-12 max-w-2xl mx-auto">
                Daily AI-verified jobs for freshers & professionals.
              </p>

              <form
                onSubmit={handleSearch}
                className="bg-white/5 backdrop-blur-xl p-3 rounded-2xl sm:rounded-full flex flex-col sm:flex-row gap-2 max-w-4xl mx-auto"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Job title or skill"
                    className="w-full pl-10 pr-4 py-3 bg-transparent text-white outline-none"
                  />
                </div>

                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    placeholder="Location"
                    className="w-full pl-10 pr-4 py-3 bg-transparent text-white outline-none"
                  />
                </div>

                <Button className="h-12 px-8 rounded-xl sm:rounded-full font-bold">
                  Search Jobs
                </Button>
              </form>
            </motion.div>
          </div>
        </section>

        {/* ================= CATEGORIES ================= */}
        <section className="py-20 bg-[#F8F9FF]">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories?.data?.categories?.map((cat) => (
                <motion.div
                  key={cat.id}
                  whileHover={{ y: -6 }}
                  onClick={() =>
                    (window.location.href = `/jobs?category=${cat.id}`)
                  }
                  className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-lg cursor-pointer"
                >
                  <CategoryIcon
                    name={cat.icon}
                    className="w-8 h-8 text-blue-600 mx-auto mb-4"
                  />
                  <h3 className="text-sm font-bold text-gray-900">
                    {cat.name}
                  </h3>
                  <p className="text-[10px] text-gray-500 font-bold mt-1">
                    {cat.job_count || 0} Open
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= JOBS ================= */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl lg:text-5xl font-black text-gray-900">
                Latest Openings
              </h2>
              <Link to="/jobs">
                <Button variant="outline" className="rounded-full">
                  View All
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {jobs?.data?.jobs?.map((job) => (
                <motion.div key={job.id} whileHover={{ y: -6 }}>
                  <Card className="h-full rounded-2xl p-4 sm:p-6 flex flex-col">
                    {/* LOGO FIXED */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center border border-gray-200 shadow-sm overflow-hidden">
                        <OptimizedImage
                          src={job.company_logo_url || job.company_logo || '/vite.svg'}
                          alt={job.company_name}
                          className="max-w-[80%] max-h-[80%] object-contain"
                          width={80}
                          height={80}
                        />
                      </div>
                      <span className="text-[10px] font-bold uppercase bg-gray-900 text-white px-3 py-1 rounded-full">
                        {job.job_type}
                      </span>
                    </div>

                    <CardTitle className="text-sm sm:text-lg line-clamp-2 mb-2">
                      {job.title}
                    </CardTitle>

                    <p className="text-xs sm:text-sm text-gray-500 mb-4 flex items-center">
                      <Building2 className="w-3 h-3 mr-1 text-blue-500" />
                      {job.company_name}
                    </p>

                    <div className="mt-auto">
                      <p className="text-xs font-bold mb-2">
                        {job.salary_min ? `₹${job.salary_min}L` : 'Market'}
                      </p>

                      <div className="flex items-center text-[10px] text-gray-400 mb-3">
                        <Clock className="w-3 h-3 mr-1" />
                        {utils.formatPostedDate(job.posted_date)}
                      </div>

                      <Link to={`/jobs/${job.slug}`}>
                        <Button className="w-full h-10 sm:h-12 text-xs sm:text-sm font-bold">
                          Apply
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= COMPANIES ================= */}
        <section className="py-24 bg-[#0A0C10] text-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl lg:text-5xl font-black mb-3">
                Hiring Companies
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {companies?.data?.map((company) => (
                <div
                  key={company.id}
                  onClick={() =>
                    (window.location.href = `/jobs?company=${company.id}`)
                  }
                  className="bg-white/5 p-6 rounded-2xl text-center hover:bg-white/10 transition cursor-pointer"
                >
                  {/* LOGO FIXED */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg border border-gray-100">
                    <OptimizedImage
                      src={company.logo_url || '/vite.svg'}
                      alt={company.name}
                      className="max-w-[75%] max-h-[75%] object-contain"
                      width={120}
                      height={120}
                    />
                  </div>

                  <p className="font-bold text-sm">{company.name}</p>
                  <p className="text-[10px] text-gray-400">
                    {company.job_count || 0} Openings
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
