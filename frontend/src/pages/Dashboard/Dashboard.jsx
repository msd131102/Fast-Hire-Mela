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
      color: 'bg-primary-600',
      link: '/profile'
    },
    {
      title: 'Browse Jobs',
      description: 'Find new opportunities',
      icon: Briefcase,
      color: 'bg-secondary-600',
      link: '/jobs'
    },
    {
      title: 'Saved Jobs',
      description: 'View your favorites',
      icon: Heart,
      color: 'bg-danger-600',
      link: '/saved-jobs'
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-text flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-surface flex items-center justify-center mx-auto mb-6 rounded-3xl border border-border shadow-sm">
            <User className="text-text" size={32} />
          </div>
          <h1 className="text-2xl font-pixel font-bold text-text mb-4 uppercase tracking-wider">Access Denied</h1>
          <p className="text-muted mb-8 text-lg">Please login to access your guild dashboard.</p>
          <Link to="/login" className="flex items-center justify-center gap-2 w-full py-4 bg-primary-600 text-text font-bold text-sm uppercase shadow-sm hover:-translate-y-1 transition-transform rounded-2xl border border-border">
            Login to Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text pt-24 pb-12 sm:pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Section */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-pixel font-bold text-text mb-4 tracking-wide leading-relaxed drop-shadow-sm">
                Welcome back, {user?.name?.split(' ')[0] || 'Hero'}! 👋
              </h1>
              <p className="text-muted text-lg">
                Here's what's happening with your quests today.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-primary-200 rounded-2xl shadow-sm text-primary-500 font-bold text-[10px] uppercase tracking-wider">
              <Zap size={14} fill="currentColor" />
              Guild Update: New AI Quests
            </div>
          </div>

          <div className="mt-8 relative overflow-hidden bg-primary-50 border border-primary-100 rounded-3xl p-6 sm:p-8 shadow-adventure">
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <p className="text-primary-800 font-bold text-sm sm:text-base text-center md:text-left max-w-2xl leading-loose uppercase">
                  Ready to Find Your Dream Quest? Join thousands of adventurers who found their perfect guild.
                </p>
                <Link to="/jobs" className="shrink-0 bg-primary-600 text-white border border-primary-700 rounded-2xl px-8 py-4 font-bold text-xs uppercase shadow-sm hover:-translate-y-1 active:translate-y-1 transition-transform flex items-center gap-2">
                  Launch Search <ArrowUpRight size={18} />
                </Link>
             </div>
             {/* Decorative Grid */}
             <div className="absolute top-0 right-0 -mr-10 -mt-10 w-64 h-64 opacity-20 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:16px_16px]" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Quick Actions Grid */}
            <section>
              <h2 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-4 ml-1">Shortcuts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {quickActions.map((action, index) => (
                  <Link key={index} to={action.link} className="group relative bg-surface border border-border rounded-3xl shadow-sm p-6 hover:-translate-y-2 hover:shadow-adventure transition-all">
                    <div className={`${action.color} rounded-2xl border border-border w-16 h-16 flex items-center justify-center mb-6 shadow-sm`}>
                      <action.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-sm font-bold mb-2 flex items-center justify-between uppercase tracking-wider">
                      {action.title}
                      <Plus className="h-4 w-4 text-muted group-hover:text-primary-500" />
                    </h3>
                    <p className="text-lg text-muted font-medium">{action.description}</p>
                  </Link>
                ))}
              </div>
            </section>

            {/* Recent Jobs Section */}
            <section className="bg-surface border border-border rounded-3xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border/50 flex items-center justify-between bg-background/50">
                <h2 className="text-lg font-pixel font-bold uppercase tracking-wider">Recent Quests</h2>
                <Link to="/jobs" className="text-primary-500 hover:text-primary-400 text-xs font-bold flex items-center gap-1 uppercase tracking-wider">
                  View All <ChevronRight size={16} />
                </Link>
              </div>

              <div className="p-6">
                {loadingJobs ? (
                  <div className="text-center py-20 font-bold uppercase tracking-wider text-primary-500 animate-pulse">
                    Loading Quests...
                  </div>
                ) : recentJobs.length > 0 ? (
                  <div className="grid gap-4">
                    {recentJobs.map((job) => (
                      <div key={job.id} className="group bg-white rounded-2xl border border-border p-5 hover:border-primary-200 transition-colors shadow-sm hover:shadow-adventure">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-3">
                           <h3 className="text-sm font-bold uppercase tracking-wider group-hover:text-primary-500 transition-colors">
                              <Link to={`/jobs/${job.slug}`}>{job.title}</Link>
                            </h3>
                            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-muted font-medium">
                              <div className="flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-lg border border-border">
                                <Building size={14} className="text-primary-400" /> {job.company}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin size={14} className="text-primary-400" /> {job.location}
                              </div>
                              <div className="flex items-center gap-1.5 text-warning-500 font-bold text-[10px] uppercase">
                                <IndianRupee size={12} /> {utils.formatSalary(job.salary_min, job.salary_max)} Gold
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-border/50 pt-4 sm:border-0 sm:pt-0">
                            <span className="text-xs text-muted font-medium flex items-center gap-1">
                              <Clock size={12} /> {utils.formatPostedDate(job.created_at)}
                            </span>
                            <Link to={`/jobs/${job.slug}`} className="px-5 py-2.5 bg-primary-50 rounded-xl border border-primary-100 hover:bg-primary-100 text-primary-600 text-xs font-bold uppercase transition-transform active:scale-95">
                              Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-background rounded-2xl border border-dashed border-border shadow-sm">
                    <Briefcase className="h-16 w-16 text-primary-200 mx-auto mb-6" />
                    <p className="text-muted font-bold text-sm uppercase tracking-wider">No recent quests found</p>
                    <Link to="/jobs" className="mt-6 inline-block text-primary-500 font-bold text-xs uppercase tracking-wider hover:text-primary-600">Start Searching</Link>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Profile Completion Card */}
            <div className="bg-surface border border-border rounded-3xl shadow-sm p-8 sticky top-32">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/50">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl border border-primary-200 flex items-center justify-center shadow-sm">
                  <User className="text-primary-600" size={32} />
                </div>
                <div className="text-right">
                  <span className="block text-2xl font-game font-bold text-text">{profileCompletion}%</span>
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider mt-1 block">Complete</span>
                </div>
              </div>
              
              <h2 className="text-lg font-bold uppercase tracking-wider mb-3">Profile Stats</h2>
              <p className="text-muted text-sm font-medium mb-6">A complete profile increases your visibility to guild masters by 3x.</p>
              
              <div className="space-y-6">
                <div className="w-full bg-background h-3 rounded-full overflow-hidden border border-border">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${profileCompletion}%` }}
                    className="h-full bg-primary-500" 
                  />
                </div>
                
                <Link to="/profile" className="flex items-center justify-center gap-2 w-full py-4 bg-white rounded-2xl border border-border text-text font-bold text-xs uppercase shadow-sm hover:-translate-y-1 hover:shadow-adventure transition-all group">
                  <Edit size={16} /> Update Profile
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Tips for user */}
              <div className="mt-8 pt-8 border-t border-border/50">
                <p className="text-[10px] font-bold text-primary-500 uppercase tracking-wider mb-4">Guild Tip</p>
                <div className="bg-primary-50 rounded-2xl border border-primary-100 p-4 text-sm font-medium text-primary-800">
                  "Add your latest campaigns to stand out in the magic-powered search results."
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
