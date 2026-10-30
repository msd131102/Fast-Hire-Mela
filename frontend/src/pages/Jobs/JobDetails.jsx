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
import OptimizedImage from '../../components/ui/OptimizedImage';
import { useToast } from '../../components/ui/toastUtils';
import {
  getJobDetails, getSimilarJobs, saveJob, unsaveJob, getSavedJobs, trackApplication, utils
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const JobDetails = () => {
  const { slug } = useParams();
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

  const isJobSaved = savedJobsData?.some(savedJob => savedJob.slug === slug);

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
    queryKey: ['job', slug],
    queryFn: () => getJobDetails(slug),
    enabled: !!slug,
    select: (data) => data?.data?.job,
  });

  const { data: similarJobs } = useQuery({
    queryKey: ['similarJobs', slug],
    queryFn: () => slug ? getSimilarJobs(slug) : Promise.resolve({ data: { jobs: [] } }),
    enabled: !!slug,
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
      if (isJobSaved) await unsaveJobMutation.mutateAsync(slug);
      else await saveJobMutation.mutateAsync(slug);
    } finally { setIsSaving(false); }
  };

  const handleApplyJob = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // Track application for logged-in users
      await trackApplication(slug);
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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><LoadingSpinner size="lg" /></div>;
  if (error || !job) return <div className="p-20 text-center font-black bg-background text-text">Job Not Found</div>;

  return (
    <div className="min-h-screen bg-background text-text">

      {/* MOBILE HEADER - APP STYLE */}
      <div className="lg:hidden sticky top-0 z-50 bg-surface/80 border-b border-border backdrop-blur-md px-6 py-4 flex items-center justify-between">
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
                <div className="w-16 h-16 rounded-2xl bg-white border border-border p-2.5 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
                  <OptimizedImage 
                    src={job.company_logo || '/api/placeholder/40/40'} 
                    alt={`${job.company_name} logo`} 
                    className="w-full h-full object-contain" 
                    width={64}
                    height={64}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text flex items-center gap-1">
                    {job.company_name} <ShieldCheck size={16} className="text-primary-500 fill-primary-500/20" />
                  </h3>
                  <p className="text-muted font-medium text-sm">{job.location}</p>
                </div>
              </div>

              <h1 className="text-4xl lg:text-6xl font-pixel font-bold text-text leading-[1.1]">
                {job.title}
              </h1>

              {/* DATA STRIP - HIGH END APP LOOK */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {[
                  { label: 'Package', val: utils.formatSalary(job.salary_min, job.salary_max), color: 'bg-success-50 text-success-700 border border-success-200' },
                  { label: 'Exp', val: utils.formatExperience(job.experience_min, job.experience_max), color: 'bg-primary-50 text-primary-700 border border-primary-200' },
                  { label: 'Type', val: job.job_type, color: 'bg-surface text-muted border border-border' },
                  { label: 'Status', val: 'Active', color: 'bg-warning-50 text-warning-700 border border-warning-200' },
                ].map((item, idx) => (
                  <div key={idx} className={`${item.color} px-5 py-3 rounded-2xl shrink-0 shadow-sm`}>
                    <p className="text-[10px] font-bold uppercase opacity-80 mb-0.5 tracking-wider">{item.label}</p>
                    <p className="text-sm font-bold">{item.val}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* TABBED CONTENT */}
            <section className="mt-12">
              <div className="flex px-6 lg:px-0 gap-8 border-b border-border">
                {['description', 'requirements', 'benefits'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`pb-4 text-xs font-black uppercase tracking-[0.2em] relative transition-all ${activeTab === t ? 'text-primary-400' : 'text-muted hover:text-text'}`}
                  >
                    {t}
                    {activeTab === t && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-full shadow-glow-primary" />}
                  </button>
                ))}
              </div>

              <div className="px-6 lg:px-0 py-10 prose prose-invert max-w-none">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-muted text-lg leading-relaxed font-medium"
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
            <div className="sticky top-24 p-8 bg-surface rounded-[2.5rem] space-y-6 border border-border shadow-adventure">
              <div>
                <h4 className="text-2xl font-pixel font-bold mb-2 text-text">Start Application</h4>
                <p className="text-muted text-sm font-medium">Join a fast-growing team at {job.company_name}.</p>
              </div>
              <Button onClick={handleApplyJob} variant="primary" className="w-full py-4 rounded-2xl text-lg">
                Apply Now
              </Button>
              <button
                onClick={handleSaveJob}
                className="w-full py-4 rounded-2xl border border-border font-bold text-muted hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm"
              >
                {isJobSaved ? 'Saved in Collection' : (user && !user.is_premium ? 'Save for Later (Premium)' : 'Save for Later')}
              </button>
              <button
                onClick={handleShare}
                className="w-full py-4 rounded-2xl border border-border font-bold text-muted hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Share2 size={18} />
                Share Quest
              </button>
            </div>
          </aside>
        </div>
      </main>

      <div className="lg:hidden fixed bottom-8 left-6 right-6 z-50">
        <div className="bg-surface/95 backdrop-blur-2xl rounded-3xl p-3 flex items-center gap-2 shadow-adventure border border-border">

          {/* SHARE BUTTON */}
          <button
            onClick={handleShare}
            className="w-14 h-14 flex items-center justify-center rounded-2xl bg-primary-50 text-primary-600 active:scale-95 transition-all hover:bg-primary-100"
            aria-label="Share Job"
          >
            <Share2 size={22} />
          </button>

          {/* SAVE BUTTON */}
          <button
            onClick={handleSaveJob}
            className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all active:scale-95 ${isJobSaved ? 'bg-danger-500 text-white shadow-sm' : 'bg-primary-50 text-primary-600 hover:bg-danger-50 hover:text-danger-500'
              }`}
          >
            <Bookmark size={24} className={isJobSaved ? 'fill-white' : ''} />
          </button>

          {/* APPLY BUTTON */}
          <button
            onClick={handleApplyJob}
            className="flex-1 h-14 bg-primary-500 text-white font-bold rounded-2xl text-xs tracking-wider flex items-center justify-center gap-1 active:scale-95 transition-all shadow-sm"
          >
            APPLY NOW
          </button>
        </div>
      </div>

    </div>
  );
};

export default JobDetails;
