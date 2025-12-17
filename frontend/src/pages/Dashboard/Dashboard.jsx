import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { userAPI, jobsAPI, utils } from '../../services/api';
import { calculateProfileCompletion } from '../../utils/profileUtils';
import {
  User,
  Briefcase,
  Heart,
  Edit,
  Plus,
  Clock,
  MapPin,
  Building,
  IndianRupee,
  ChevronRight,
  ArrowUpRight,
  Zap
} from 'lucide-react';
import { cn } from '../../utils/cn';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const hasLoadedData = useRef(false);

  useEffect(() => {
    if (hasLoadedData.current) return;
    hasLoadedData.current = true;

    const loadProfileData = async () => {
      if (user) {
        try {
          const response = await userAPI.getProfile();
          if (response.success && response.data.user) {
            setProfileData(response.data.user);
          } else {
            setProfileData(user);
          }
        } catch (error) {
          console.error('Error fetching profile data:', error);
          setProfileData(user);
        }
      }
    };

    const loadRecentJobs = async () => {
      setLoadingJobs(true);
      try {
        const response = await jobsAPI.getLatestJobs(6);
        let jobsData = [];
        if (response && response.data && response.data.jobs) {
          jobsData = response.data.jobs;
        } else if (response && response.jobs) {
          jobsData = response.jobs;
        } else if (Array.isArray(response)) {
          jobsData = response;
        }
        setRecentJobs(jobsData);
      } catch (error) {
        console.error('Error fetching recent jobs:', error);
        setRecentJobs([]);
      } finally {
        setLoadingJobs(false);
      }
    };

    loadProfileData();
    loadRecentJobs();
  }, [user]);

  const profileCompletion = calculateProfileCompletion({ ...profileData, email: user?.email });

  const quickActions = [
    {
      title: 'Update Profile',
      description: 'Keep your profile fresh',
      icon: Edit,
      color: 'bg-blue-600',
      link: '/profile'
    },
    {
      title: 'Browse Jobs',
      description: 'Find new opportunities',
      icon: Briefcase,
      color: 'bg-indigo-600',
      link: '/jobs'
    },
    {
      title: 'Saved Jobs',
      description: 'View your favorites',
      icon: Heart,
      color: 'bg-rose-600',
      link: '/saved-jobs'
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10">
            <User className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-black text-white mb-4">Access Restricted</h1>
          <p className="text-gray-500 mb-8">Please login to access your personalized job dashboard.</p>
          <Link to="/login" className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">
            Login to Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 sm:pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Section */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-3xl sm:text-5xl font-black tracking-tighter mb-2"
              >
                Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
              </motion.h1>
              <p className="text-gray-500 text-lg font-medium">
                Here's what's happening with your job search today.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-bold">
              <Zap size={14} fill="currentColor" />
              8 PM Update: Atomic AI Jobs are live
            </div>
          </div>

          <div className="mt-8 relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-900/20">
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <p className="text-white font-black text-lg sm:text-xl text-center md:text-left max-w-2xl leading-snug">
                  Ready to Find Your Dream Job? Join thousands of seekers who found their perfect match.
                </p>
                <Link to="/jobs" className="shrink-0 bg-white text-black px-8 py-4 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  Launch Search <ArrowUpRight size={18} />
                </Link>
             </div>
             {/* Decorative Circles */}
             <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Quick Actions Grid */}
            <section>
              <h2 className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] mb-4 ml-1">Shortcuts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <Link key={index} to={action.link} className="group relative bg-white/[0.03] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.05] hover:border-white/20 transition-all">
                    <div className={`${action.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-black mb-1 flex items-center justify-between">
                      {action.title}
                      <Plus className="h-4 w-4 text-gray-600 group-hover:text-white" />
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">{action.description}</p>
                  </Link>
                ))}
              </div>
            </section>

            {/* Recent Jobs Section */}
            <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-black">Recent Jobs</h2>
                <Link to="/jobs" className="text-blue-500 hover:text-blue-400 text-sm font-black flex items-center gap-1 uppercase tracking-wider">
                  View All <ChevronRight size={16} />
                </Link>
              </div>

              <div className="p-6">
                {loadingJobs ? (
                  <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : recentJobs.length > 0 ? (
                  <div className="grid gap-4">
                    {recentJobs.map((job) => (
                      <div key={job.id} className="group bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.04] hover:border-white/10 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <h3 className="text-lg font-black group-hover:text-blue-400 transition-colors">
                              <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                            </h3>
                            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-500 font-bold">
                              <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg">
                                <Building size={14} className="text-blue-500" /> {job.company}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin size={14} /> {job.location}
                              </div>
                              <div className="flex items-center gap-1.5 text-emerald-500">
                                <IndianRupee size={14} /> {utils.formatSalary(job.salary_min, job.salary_max)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-white/5 pt-4 sm:border-0 sm:pt-0">
                            <span className="text-xs text-gray-600 font-black flex items-center gap-1">
                              <Clock size={14} /> {utils.formatPostedDate(job.created_at)}
                            </span>
                            <Link to={`/jobs/${job.id}`} className="px-5 py-2.5 bg-white/10 hover:bg-blue-600 text-white rounded-xl text-xs font-black transition-all active:scale-95">
                              Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white/[0.01] rounded-3xl border border-dashed border-white/10">
                    <Briefcase className="h-12 w-12 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold">No recent jobs found</p>
                    <Link to="/jobs" className="mt-4 inline-block text-blue-500 font-black text-sm uppercase">Start Searching</Link>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Profile Completion Card */}
            <div className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 rounded-[2.5rem] p-8 sticky top-32">
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20">
                  <User className="text-white" size={24} />
                </div>
                <div className="text-right">
                  <span className="block text-3xl font-black text-white">{profileCompletion}%</span>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Complete</span>
                </div>
              </div>
              
              <h2 className="text-xl font-black mb-2">Profile Strength</h2>
              <p className="text-gray-500 text-sm font-medium mb-6">A complete profile increases your visibility to recruiters by 3x.</p>
              
              <div className="space-y-4">
                <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/5 p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${profileCompletion}%` }}
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full" 
                  />
                </div>
                
                <Link to="/profile" className="flex items-center justify-center gap-2 w-full py-4 bg-white text-black rounded-2xl font-black text-sm hover:bg-gray-200 transition-all mt-4 group">
                  <Edit size={16} /> Update Profile
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Tips for user */}
              <div className="mt-8 pt-8 border-t border-white/5">
                <p className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-4">Pro Tip</p>
                <div className="bg-white/5 rounded-2xl p-4 text-xs font-bold text-gray-400 italic">
                  "Add your latest projects to stand out in the AI-powered search results."
                </div>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;