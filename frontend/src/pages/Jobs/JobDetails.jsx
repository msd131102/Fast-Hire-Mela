import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2, MapPin, Share2, ExternalLink,
  XCircle, ArrowLeft, Bookmark, Calendar, TrendingUp, ChevronRight, Zap, ShieldCheck
} from 'lucide-react';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../components/ui/toastUtils';
import {
  getJobDetails, getSimilarJobs, saveJob, unsaveJob, getSavedJobs, trackApplication, utils
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

  // API Logic (Identical to source)
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
      toast.success('Job Bookmarked');
      queryClient.invalidateQueries(['savedJobs']);
    },
  });

  const unsaveJobMutation = useMutation({
    mutationFn: unsaveJob,
    onSuccess: () => queryClient.invalidateQueries(['savedJobs']),
  });

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => getJobDetails(id),
    enabled: !!id,
    select: (data) => data?.data?.job,
  });

  const { data: similarJobs } = useQuery({
    queryKey: ['similarJobs', id],
    queryFn: () => id ? getSimilarJobs(id) : Promise.resolve({ data: { jobs: [] } }),
    enabled: !!id,
    select: (data) => data?.data?.jobs || [],
  });

  const handleSaveJob = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!user.is_premium) {
      toast.error('Save jobs is a premium feature. Upgrade to premium!');
      navigate('/premium');
      return;
    }

    setIsSaving(true);
    try {
      if (isJobSaved) await unsaveJobMutation.mutateAsync(id);
      else await saveJobMutation.mutateAsync(id);
    } finally { setIsSaving(false); }
  };

  const handleApplyJob = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // Track application for logged-in users
      await trackApplication(id);
      toast.success('Application tracked successfully');

      // Redirect to external application link
      window.open(job.apply_link, '_blank');
    } catch (error) {
      toast.error('Failed to track application');
      // Still redirect to external link even if tracking fails
      window.open(job.apply_link, '_blank');
    }
  };

  const handleShare = async () => {
    if (!job) return;

    const shareData = {
      title: `${job.title} at ${job.company_name}`,
      text: `Check out this job: ${job.title} at ${job.company_name} in ${job.location}`,
      url: window.location.href
    };

    if (navigator.share) {
      // Mobile native share
      try {
        await navigator.share(shareData);
        toast.success('Job shared successfully!');
      } catch (error) {
        console.log('Native share failed, using clipboard fallback:', error);
        handleClipboardFallback(shareData);
      }
    } else {
      // Desktop/fallback - copy to clipboard
      handleClipboardFallback(shareData);
    }
  };

  const handleClipboardFallback = async (shareData) => {
    try {
      await navigator.clipboard.writeText(shareData.url);
      toast.success('Job link copied to clipboard!');
    } catch (error) {
      console.error('Clipboard copy failed:', error);
      toast.error('Failed to copy link. Please copy manually.');
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><LoadingSpinner size="lg" /></div>;
  if (error || !job) return <div className="p-20 text-center font-black">Job Not Found</div>;

  return (
    <div className="min-h-screen bg-white">

      {/* MOBILE HEADER - APP STYLE */}
      <div className="lg:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2"><ArrowLeft size={24} /></button>
        <div className="flex gap-2">
          <button onClick={handleShare} className="p-2"><Share2 size={22} /></button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto lg:px-12 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-16">

          <div className="flex-1">
            {/* HERO SECTION */}
            <section className="px-6 lg:px-0 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 p-2 shadow-sm">
                  <img src={job.company_logo} alt="" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1">
                    {job.company_name} <ShieldCheck size={16} className="text-blue-500 fill-blue-50" />
                  </h3>
                  <p className="text-slate-500 font-medium text-sm">{job.location}</p>
                </div>
              </div>

              <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[0.95]">
                {job.title}
              </h1>

              {/* DATA STRIP - HIGH END APP LOOK */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {[
                  { label: 'Package', val: utils.formatSalary(job.salary_min, job.salary_max), color: 'bg-emerald-50 text-emerald-700' },
                  { label: 'Exp', val: utils.formatExperience(job.experience_min, job.experience_max), color: 'bg-blue-50 text-blue-700' },
                  { label: 'Type', val: job.job_type, color: 'bg-slate-100 text-slate-700' },
                  { label: 'Status', val: 'Active', color: 'bg-orange-50 text-orange-700' },
                ].map((item, idx) => (
                  <div key={idx} className={`${item.color} px-5 py-3 rounded-2xl shrink-0`}>
                    <p className="text-[10px] font-black uppercase opacity-60 mb-0.5 tracking-widest">{item.label}</p>
                    <p className="text-sm font-black">{item.val}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* TABBED CONTENT */}
            <section className="mt-12">
              <div className="flex px-6 lg:px-0 gap-8 border-b border-slate-100">
                {['description', 'requirements', 'benefits'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`pb-4 text-xs font-black uppercase tracking-[0.2em] relative transition-all ${activeTab === t ? 'text-blue-600' : 'text-slate-400'}`}
                  >
                    {t}
                    {activeTab === t && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />}
                  </button>
                ))}
              </div>

              <div className="px-6 lg:px-0 py-10 prose prose-slate max-w-none">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-slate-600 text-lg leading-relaxed font-medium"
                  >
                    {activeTab === 'description' && <div dangerouslySetInnerHTML={{ __html: job.description }} />}
                    {activeTab === 'requirements' && <div dangerouslySetInnerHTML={{ __html: job.responsibilities }} />}
                    {activeTab === 'benefits' && <div dangerouslySetInnerHTML={{ __html: job.skills_required }} />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>
          </div>

          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block w-96">
            <div className="sticky top-12 p-10 bg-slate-50 rounded-[3rem] space-y-8 border border-slate-100 shadow-sm">
              <div>
                <h4 className="text-2xl font-black mb-2 text-slate-900">Start Application</h4>
                <p className="text-slate-500 font-medium">Join a fast-growing team at {job.company_name}.</p>
              </div>
              <Button onClick={handleApplyJob} className="w-full py-8 rounded-[2rem] bg-blue-600 text-white font-black text-xl shadow-2xl shadow-blue-200">
                Apply Now
              </Button>
              <button
                onClick={handleSaveJob}
                className="w-full py-4 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-white transition-all"
              >
                {isJobSaved ? 'Saved in Collection' : (user && !user.is_premium ? 'Save for Later (Premium)' : 'Save for Later')}
              </button>
              <button
                onClick={handleShare}
                className="w-full py-4 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-white transition-all flex items-center justify-center gap-2"
              >
                <Share2 size={18} />
                Share Job
              </button>
            </div>
          </aside>
        </div>
      </main>

      {/* THE ELITE DOCK (MOBILE ONLY) */}
      <div className="lg:hidden fixed bottom-8 left-6 right-6 z-50">
        <div className="bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] p-3 flex items-center gap-2 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-white/10">

          {/* SHARE BUTTON */}
          <button
            onClick={handleShare}
            className="w-14 h-14 flex items-center justify-center rounded-[1.8rem] bg-slate-800 text-slate-300 active:scale-90 transition-all"
            aria-label="Share Job"
          >
            <Share2 size={22} />
          </button>

          {/* SAVE BUTTON */}
          <button
            onClick={handleSaveJob}
            className={`w-14 h-14 flex items-center justify-center rounded-[1.8rem] transition-all active:scale-90 ${isJobSaved ? 'bg-blue-600 text-white shadow-inner' : 'bg-slate-800 text-slate-400'
              }`}
          >
            <Bookmark size={24} className={isJobSaved ? 'fill-white' : ''} />
          </button>

          {/* APPLY BUTTON */}
          <button
            onClick={handleApplyJob}
            className="flex-1 h-14 bg-white text-black font-black rounded-[1.8rem] text-[11px] tracking-[0.15em] flex items-center justify-center gap-1 active:scale-95 transition-all shadow-xl"
          >
            APPLY NOW <Zap size={16} className="fill-black" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default JobDetails;
