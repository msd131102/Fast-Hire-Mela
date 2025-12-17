import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Users,
  Briefcase,
  Share2,
  ExternalLink,
  XCircle,
  ArrowLeft,
  Bookmark,
  Calendar,
  TrendingUp,
  ChevronRight,
  Info
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../components/ui/toastUtils';
import { 
  getJobDetails, 
  getSimilarJobs,
  saveJob,
  unsaveJob,
  getSavedJobs,
  utils 
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('description');
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  // Logic remains identical to your source
  const { data: savedJobsData } = useQuery({
    queryKey: ['savedJobs'],
    queryFn: () => getSavedJobs(),
    enabled: !!user,
    select: (data) => data?.data?.saved_jobs || [],
  });

  const jobId = parseInt(id);
  const isJobSaved = savedJobsData?.some(savedJob => savedJob.id === jobId);

  const saveJobMutation = useMutation({
    mutationFn: saveJob,
    onSuccess: (data) => {
      toast.success(data.message || 'Job saved successfully!');
      queryClient.invalidateQueries(['savedJobs']);
      setTimeout(() => { navigate('/dashboard/saved-jobs'); }, 1500);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save job');
    },
  });

  const unsaveJobMutation = useMutation({
    mutationFn: unsaveJob,
    onSuccess: (data) => {
      toast.success(data.message || 'Job removed from saved jobs');
      queryClient.invalidateQueries(['savedJobs']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to remove job');
    },
  });

  const { data: jobData, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => getJobDetails(id),
    enabled: !!id,
    select: (data) => data?.data?.job, 
  });

  const job = jobData;

  const { data: similarJobs } = useQuery({
    queryKey: ['similarJobs', id],
    queryFn: () => id ? getSimilarJobs(id) : Promise.resolve({ data: { jobs: [] } }),
    enabled: !!id,
    select: (data) => data?.data?.jobs || [],
  });

  useEffect(() => {
    if (job) console.log('Job viewed:', job.id);
  }, [job]);

  const handleApply = () => {
    if (!user) {
      toast.error('Please login to apply');
      navigate('/login');
      return;
    }
    if (job?.apply_link) {
      window.open(job.apply_link, '_blank');
    } else {
      toast.error('No application URL available');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.title,
          text: `Check out this ${job?.title} at ${job?.company_name}`,
          url: window.location.href,
        });
      } catch (e) { console.log(e); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  const handleSaveJob = async () => {
    if (!user) { navigate('/login'); return; }
    const isUserPremium = user.is_premium || user.isPremium;
    if (!isUserPremium) { navigate('/premium-checkout'); return; }

    setIsSaving(true);
    try {
      if (isJobSaved) await unsaveJobMutation.mutateAsync(id);
      else await saveJobMutation.mutateAsync(id);
    } finally { setIsSaving(false); }
  };

  const safeParseDate = (dateString) => {
    if (!dateString) return null;
    const [y, m, d] = dateString.split('T')[0].split('-');
    return new Date(Number(y), Number(m) - 1, Number(d));
  };

  const formatIndianDate = (dateString) => {
    const date = safeParseDate(dateString);
    return date ? date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
  };

  const getDaysUntilDeadline = (deadline) => {
    const dDate = safeParseDate(deadline);
    if (!dDate) return null;
    const today = new Date();
    today.setHours(0,0,0,0);
    return Math.ceil((dDate - today) / (1000 * 60 * 60 * 24));
  };

  const daysUntilDeadline = getDaysUntilDeadline(job?.application_deadline);
  const isUrgent = typeof daysUntilDeadline === 'number' && daysUntilDeadline > 0 && daysUntilDeadline <= 7;

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><LoadingSpinner size="lg" /></div>;

  if (error || !job) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center p-10 bg-white rounded-3xl shadow-xl border border-gray-100 max-w-md">
        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6 opacity-20" />
        <h2 className="text-3xl font-black text-gray-900 mb-3">Job Expired</h2>
        <p className="text-gray-500 mb-8 font-medium">This opportunity is no longer available or has been moved.</p>
        <Link to="/jobs"><Button className="w-full py-6 rounded-2xl font-bold">Browse Live Jobs</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 lg:pb-12">
      {/* Premium Glass Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/jobs" className="group flex items-center text-slate-500 hover:text-blue-600 font-bold transition-all text-sm">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            BACK TO FEED
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
              <Share2 size={20} />
            </button>
            <div className="hidden lg:block h-6 w-[1px] bg-slate-200 mx-2" />
            <Button 
                onClick={handleSaveJob} 
                variant={isJobSaved ? "default" : "outline"} 
                className="hidden lg:flex items-center gap-2 rounded-xl"
                disabled={isSaving}
            >
              <Bookmark className={isJobSaved ? 'fill-white' : ''} size={18} />
              {isJobSaved ? 'Saved' : 'Save for later'}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content: Left Column (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2rem] overflow-hidden">
                <CardContent className="p-8">
                  {/* Top Profile Area */}
                  <div className="flex flex-col md:flex-row gap-6 mb-8">
                    <div className="relative shrink-0">
                        <img
                            src={job.company_logo || '/api/placeholder/80/80'}
                            alt={job.company_name}
                            className="w-20 h-20 md:w-24 md:h-24 rounded-3xl object-cover border-4 border-slate-50 shadow-inner"
                        />
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
                          {job.job_type || 'Full Time'}
                        </span>
                        {isUrgent && (
                          <span className="bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-rose-100 flex items-center gap-1">
                            <Clock size={12} /> Closing Soon
                          </span>
                        )}
                      </div>
                      <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                        {job.title}
                      </h1>
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-slate-500 font-semibold">
                        <span className="flex items-center gap-1.5"><Building2 size={18} className="text-blue-500" /> {job.company_name}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={18} className="text-slate-400" /> {job.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Core Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {[
                        { label: 'Salary (INR)', val: utils.formatSalary(job.salary_min, job.salary_max), icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                        { label: 'Experience', val: utils.formatExperience(job.experience_min, job.experience_max), icon: Users, color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
                        { label: 'Deadline', val: daysUntilDeadline ? `${daysUntilDeadline}d left` : 'No Limit', icon: Calendar, color: isUrgent ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-slate-50 text-slate-700 border-slate-100' },
                        { label: 'Views', val: job.view_count || '0', icon: Info, color: 'bg-blue-50 text-blue-700 border-blue-100' },
                    ].map((item, idx) => (
                      <div key={idx} className={`${item.color} p-4 rounded-2xl border flex flex-col items-center text-center`}>
                        <item.icon size={20} className="mb-2 opacity-80" />
                        <span className="text-xs font-black uppercase opacity-60 mb-1 tracking-wider">{item.label}</span>
                        <span className="text-sm font-black truncate w-full">{item.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Dynamic Tabs Section */}
                  <div className="bg-slate-50/50 rounded-[1.5rem] p-2 mb-8 inline-flex w-full overflow-x-auto no-scrollbar">
                    {['description', 'requirements', 'benefits'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 rounded-xl text-sm font-black transition-all capitalize whitespace-nowrap flex-1 ${
                          activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="prose prose-slate max-w-none text-slate-600 leading-relaxed font-medium"
                    >
                      {activeTab === 'description' && <div dangerouslySetInnerHTML={{ __html: job.description }} />}
                      {activeTab === 'requirements' && <div dangerouslySetInnerHTML={{ __html: job.responsibilities }} />}
                      {activeTab === 'benefits' && <div dangerouslySetInnerHTML={{ __html: job.skills_required }} />}
                    </motion.div>
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Company Bio */}
            <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2rem]">
                <CardHeader className="p-8 pb-0">
                    <CardTitle className="text-xl font-black">About The Company</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <img src={job.company_logo || '/api/placeholder/60/60'} className="w-14 h-14 rounded-2xl" alt="" />
                        <div>
                            <h3 className="font-black text-slate-900">{job.company_name}</h3>
                            <span className="text-slate-400 font-bold text-sm">{job.industry || 'Technology Sector'}</span>
                        </div>
                    </div>
                    <div className="text-slate-500 text-sm leading-relaxed mb-6 font-medium" dangerouslySetInnerHTML={{ __html: job.company_description }} />
                    <Link to={`/jobs?company=${job.company_id}`}>
                        <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 font-black text-xs px-6">VISIT COMPANY PROFILE</Button>
                    </Link>
                </CardContent>
            </Card>
          </div>

          {/* Sidebar: Right Column (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
             <div className="lg:sticky lg:top-24 space-y-6">
                
                {/* Apply Card - Desktop Sidebar */}
                <Card className="border-none shadow-xl shadow-blue-900/10 rounded-[2rem] bg-blue-600 text-white overflow-hidden hidden lg:block">
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-2">
                            <p className="text-blue-100 text-xs font-black uppercase tracking-[0.2em]">Ready to apply?</p>
                            <h3 className="text-xl font-black">Take the next step in your career.</h3>
                        </div>
                        <Button onClick={handleApply} className="w-full bg-white text-blue-600 hover:bg-blue-50 py-7 rounded-2xl font-black text-md flex items-center justify-center gap-3">
                            APPLY FOR THIS JOB <ExternalLink size={20} />
                        </Button>
                        <p className="text-center text-[10px] text-blue-200 font-bold">Applications are typically reviewed within 4-5 business days.</p>
                    </CardContent>
                </Card>

                {/* Similar Jobs */}
                {similarJobs?.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Similar Openings</h3>
                    {similarJobs.slice(0, 3).map((sJob) => (
                      <Link key={sJob.id} to={`/jobs/${sJob.id}`} className="block group">
                        <Card className="border-none shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden group-hover:-translate-y-1">
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-xl shrink-0 flex items-center justify-center font-black text-slate-300">
                                {sJob.company_name?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-black text-slate-900 truncate text-sm">{sJob.title}</h4>
                              <p className="text-slate-400 text-xs font-bold truncate">{sJob.company_name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-black text-emerald-600">{utils.formatSalary(sJob.salary_min, sJob.salary_max)}</span>
                                <ChevronRight size={12} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
             </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Footer - Re-imagined */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50">
        <div className="flex gap-4 items-center max-w-md mx-auto">
          <button 
            onClick={handleSaveJob}
            disabled={isSaving}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-center ${
              isJobSaved ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500'
            }`}
          >
            <Bookmark size={24} className={isJobSaved ? 'fill-white' : ''} />
          </button>
          <Button 
            onClick={handleApply} 
            className="flex-1 py-4 h-auto rounded-2xl bg-blue-600 font-black text-sm tracking-widest flex items-center justify-center gap-3"
          >
            APPLY NOW <ExternalLink size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;