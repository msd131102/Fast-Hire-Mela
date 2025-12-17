import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Building2, MapPin, Clock, Users, Share2, ExternalLink, 
  XCircle, ArrowLeft, Bookmark, Calendar, TrendingUp, ChevronRight, Info, Zap 
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../components/ui/toastUtils';
import { 
  getJobDetails, getSimilarJobs, saveJob, unsaveJob, getSavedJobs, utils 
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
      toast.success(data.message || 'Job saved!');
      queryClient.invalidateQueries(['savedJobs']);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to save'),
  });

  const unsaveJobMutation = useMutation({
    mutationFn: unsaveJob,
    onSuccess: (data) => {
      toast.success('Removed from saved');
      queryClient.invalidateQueries(['savedJobs']);
    },
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

  const handleApply = () => {
    if (!user) { navigate('/login'); return; }
    if (job?.apply_link) window.open(job.apply_link, '_blank');
  };

  const handleSaveJob = async () => {
    if (!user) { navigate('/login'); return; }
    setIsSaving(true);
    try {
      if (isJobSaved) await unsaveJobMutation.mutateAsync(id);
      else await saveJobMutation.mutateAsync(id);
    } finally { setIsSaving(false); }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><LoadingSpinner size="lg" /></div>;

  if (error || !job) return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="text-center max-w-sm">
        <XCircle className="w-16 h-16 text-slate-200 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Job Unavailable</h2>
        <p className="text-slate-500 mb-8">This position has been filled or removed.</p>
        <Link to="/jobs"><Button className="w-full rounded-full py-6">Back to Search</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFF]">
      {/* --- DESKTOP NAVIGATION --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 hidden lg:block">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/jobs" className="flex items-center gap-2 text-slate-500 hover:text-black transition-all font-semibold">
            <ArrowLeft size={18} /> Back
          </Link>
          <div className="flex items-center gap-4">
            <button onClick={() => {}} className="p-2 hover:bg-slate-50 rounded-full transition-all text-slate-400 hover:text-black">
              <Share2 size={20} />
            </button>
            <button 
              onClick={handleSaveJob} 
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all border ${
                isJobSaved ? 'bg-black text-white border-black' : 'bg-white text-slate-600 border-slate-200 hover:border-black'
              }`}
            >
              <Bookmark size={18} className={isJobSaved ? 'fill-white' : ''} />
              {isJobSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:py-12 pb-32">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* MAIN CONTENT */}
          <div className="flex-1 space-y-12">
            {/* Header Section */}
            <header className="pt-8 lg:pt-0">
              <div className="flex items-start justify-between mb-8">
                <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-3xl bg-slate-50 border border-slate-100 p-2 overflow-hidden flex items-center justify-center shadow-sm">
                  <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-contain" />
                </div>
                <div className="flex lg:hidden gap-2">
                   <button onClick={() => {}} className="p-3 bg-white border border-slate-100 rounded-full shadow-sm"><Share2 size={20} /></button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                   <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-tighter italic">Verified Role</span>
                   <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-tighter">{job.job_type}</span>
                </div>
                <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-slate-500 font-medium">
                  <div className="flex items-center gap-2 text-slate-900 font-bold underline decoration-blue-500 underline-offset-4 cursor-pointer">
                    <Building2 size={18} className="text-blue-500" /> {job.company_name}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={18} /> {job.location}
                  </div>
                </div>
              </div>
            </header>

            {/* QUICK STATS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100 rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm">
               {[
                 { label: 'Package', val: utils.formatSalary(job.salary_min, job.salary_max), icon: TrendingUp },
                 { label: 'Experience', val: utils.formatExperience(job.experience_min, job.experience_max), icon: Users },
                 { label: 'Deadline', val: '7 Days Left', icon: Calendar },
                 { label: 'Industry', val: job.industry || 'Tech', icon: Info }
               ].map((item, i) => (
                 <div key={i} className="bg-white p-6 flex flex-col items-center text-center">
                   <item.icon size={20} className="text-blue-500 mb-3" />
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                   <p className="text-xs font-black text-slate-900 truncate w-full">{item.val}</p>
                 </div>
               ))}
            </div>

            {/* TAB CONTENT */}
            <div className="space-y-8">
              <div className="flex border-b border-slate-100 gap-8 overflow-x-auto no-scrollbar">
                {['description', 'requirements', 'benefits'].map((t) => (
                  <button 
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`pb-4 text-sm font-black uppercase tracking-tighter transition-all relative ${
                      activeTab === t ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  >
                    {t}
                    {activeTab === t && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />}
                  </button>
                ))}
              </div>
              <div className="prose prose-slate max-w-none prose-p:leading-relaxed text-slate-600 font-medium">
                {activeTab === 'description' && <div dangerouslySetInnerHTML={{ __html: job.description }} />}
                {activeTab === 'requirements' && <div dangerouslySetInnerHTML={{ __html: job.responsibilities }} />}
                {activeTab === 'benefits' && <div dangerouslySetInnerHTML={{ __html: job.skills_required }} />}
              </div>
            </div>
          </div>

          {/* SIDEBAR (DESKTOP ONLY) */}
          <aside className="hidden lg:block w-80 space-y-8">
            <div className="sticky top-32 space-y-6">
              <Card className="rounded-[2.5rem] border-none bg-slate-900 text-white p-8 shadow-2xl">
                <h3 className="text-xl font-bold mb-2">Interested?</h3>
                <p className="text-slate-400 text-sm mb-8">Direct applications are usually reviewed within 48 hours.</p>
                <Button onClick={handleApply} className="w-full bg-blue-600 hover:bg-blue-700 h-16 rounded-2xl font-bold text-lg flex items-center justify-center gap-2">
                  Apply Now <ExternalLink size={20} />
                </Button>
              </Card>

              <div className="space-y-4 px-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">More from this company</h4>
                {similarJobs?.slice(0, 3).map(sJob => (
                  <Link key={sJob.id} to={`/jobs/${sJob.id}`} className="group flex items-center gap-4 py-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-bold group-hover:bg-blue-50 group-hover:text-blue-600 transition-all text-xs border border-slate-100">{sJob.company_name?.charAt(0)}</div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-900 truncate group-hover:text-blue-600">{sJob.title}</p>
                      <p className="text-xs text-slate-400">{sJob.location}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* --- MOBILE ACTION BAR (FLOATING ISLAND) --- */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
        <div className="bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] p-3 flex items-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
           <button 
             onClick={handleSaveJob}
             className={`w-14 h-14 flex items-center justify-center rounded-[2rem] transition-all ${
               isJobSaved ? 'bg-white text-black' : 'bg-slate-800 text-white border border-slate-700'
             }`}
           >
             <Bookmark size={24} className={isJobSaved ? 'fill-black' : ''} />
           </button>
           <button 
             onClick={handleApply}
             className="flex-1 h-14 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[2rem] text-sm tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
           >
             APPLY NOW <ExternalLink size={18} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;