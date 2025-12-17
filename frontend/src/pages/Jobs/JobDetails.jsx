import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Users,
  Briefcase,
  Share2,
  ExternalLink,
  XCircle,
  ArrowLeft,
  Bookmark,
  Calendar,
  TrendingUp
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../components/ui/toastUtils';
import {
  getJobDetails,
  getSimilarJobs,
  getSavedJobs,
  saveJob,
  unsaveJob,
  utils
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';

/* =======================
   IST SAFE DEADLINE FORMAT
======================= */
const formatDeadlineDate = (dateString) => {
  if (!dateString) return 'No deadline';

  const ist = new Date(
    new Date(dateString).toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata'
    })
  );

  return ist.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

/* =======================
   DAYS LEFT CALCULATION
======================= */
const getDaysUntilDeadline = (deadline) => {
  if (!deadline) return null;

  const now = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
  );
  const end = new Date(
    new Date(deadline).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
  );

  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
};

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('description');
  const [isSaving, setIsSaving] = useState(false);

  const jobId = Number(id);

  /* =======================
     SAVED JOBS
  ======================= */
  const { data: savedJobs = [] } = useQuery({
    queryKey: ['savedJobs'],
    queryFn: getSavedJobs,
    enabled: !!user,
    select: (res) => res?.data?.saved_jobs || []
  });

  const isJobSaved = savedJobs.some(j => j.id === jobId);

  /* =======================
     MUTATIONS
  ======================= */
  const saveJobMutation = useMutation({
    mutationFn: saveJob,
    onSuccess: () => {
      toast.success('Job saved successfully');
      queryClient.invalidateQueries(['savedJobs']);
    }
  });

  const unsaveJobMutation = useMutation({
    mutationFn: unsaveJob,
    onSuccess: () => {
      toast.success('Job removed from saved jobs');
      queryClient.invalidateQueries(['savedJobs']);
    }
  });

  /* =======================
     JOB DETAILS
  ======================= */
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => getJobDetails(id),
    enabled: !!id,
    select: (res) => res?.data?.job
  });

  /* =======================
     SIMILAR JOBS
  ======================= */
  const { data: similarJobs = [] } = useQuery({
    queryKey: ['similarJobs', id],
    queryFn: () => getSimilarJobs(id),
    enabled: !!id,
    select: (res) => res?.data?.jobs || []
  });

  /* =======================
     HANDLERS
  ======================= */
  const handleApply = () => {
    if (!user) {
      toast.error('Please login to apply');
      navigate('/login');
      return;
    }

    if (job?.apply_link) {
      window.open(job.apply_link, '_blank');
    } else {
      toast.error('Application link not available');
    }
  };

  const handleSaveJob = async () => {
    if (!user) {
      toast.error('Please login to save jobs');
      navigate('/login');
      return;
    }

    if (!user.is_premium && !user.isPremium) {
      toast.info('Saving jobs is a premium feature');
      navigate('/premium-checkout');
      return;
    }

    setIsSaving(true);
    try {
      if (isJobSaved) {
        await unsaveJobMutation.mutateAsync(jobId);
      } else {
        await saveJobMutation.mutateAsync(jobId);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: job?.title,
        text: `Check out this ${job?.title} job`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  /* =======================
     DEADLINE LOGIC
  ======================= */
  const daysUntilDeadline = getDaysUntilDeadline(job?.application_deadline);
  const isUrgent =
    typeof daysUntilDeadline === 'number' &&
    daysUntilDeadline > 0 &&
    daysUntilDeadline <= 7;

  /* =======================
     STATES
  ======================= */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <XCircle className="w-14 h-14 text-red-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between">
          <Link to="/jobs" className="flex items-center text-gray-600">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
          </Link>
          <Button variant="ghost" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
        {/* MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-6">
          {/* JOB HEADER */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <img
                  src={job.company_logo || '/api/placeholder/80/80'}
                  alt={job.company_name}
                  className="w-16 h-16 rounded-lg border"
                />
                <div>
                  <h1 className="text-2xl font-bold">{job.title}</h1>
                  <div className="flex gap-3 text-sm text-gray-600 mt-1">
                    <span className="flex items-center"><Building2 className="w-4 h-4 mr-1" />{job.company_name}</span>
                    <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{job.location}</span>
                  </div>
                </div>
              </div>

              {/* INFO CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-green-50 p-4 rounded">
                  <TrendingUp className="mb-1 text-green-600" />
                  {utils.formatSalary(job.salary_min, job.salary_max)}
                </div>
                <div className="bg-blue-50 p-4 rounded">
                  <Briefcase className="mb-1 text-blue-600" />
                  {job.job_type}
                </div>
                <div className="bg-purple-50 p-4 rounded">
                  <Users className="mb-1 text-purple-600" />
                  {utils.formatExperience(job.experience_min, job.experience_max)}
                </div>
                <div className={`p-4 rounded ${isUrgent ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <Calendar className="mb-1" />
                  {job.application_deadline
                    ? isUrgent
                      ? `${daysUntilDeadline} days left`
                      : formatDeadlineDate(job.application_deadline)
                    : 'No deadline'}
                </div>
              </div>

              {/* SKILLS */}
              {job.skills_required?.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {job.skills_required.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* TABS */}
              <div className="border-b mt-8 flex gap-6">
                {['description', 'requirements', 'benefits'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={activeTab === tab ? 'border-b-2 border-blue-600 pb-2' : 'pb-2'}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="mt-6 prose max-w-none">
                {activeTab === 'description' && <div dangerouslySetInnerHTML={{ __html: job.description }} />}
                {activeTab === 'requirements' && <div dangerouslySetInnerHTML={{ __html: job.responsibilities }} />}
                {activeTab === 'benefits' && (
                  job.benefits
                    ? <div dangerouslySetInnerHTML={{ __html: job.benefits }} />
                    : <p>No benefits information provided.</p>
                )}
              </div>

              <div className="hidden lg:flex mt-8">
                <Button size="lg" onClick={handleApply} className="flex-1">
                  <ExternalLink className="mr-2" /> Apply Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* COMPANY INFO */}
          <Card>
            <CardHeader>
              <CardTitle>About {job.company_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div dangerouslySetInnerHTML={{ __html: job.company_description || '' }} />
            </CardContent>
          </Card>

          {/* SIMILAR JOBS */}
          {similarJobs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Similar Jobs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {similarJobs.slice(0, 3).map(sj => (
                  <Link key={sj.id} to={`/jobs/${sj.id}`} className="block border p-3 rounded hover:bg-gray-50">
                    <h4 className="font-semibold">{sj.title}</h4>
                    <p className="text-sm text-gray-600">{sj.company_name}</p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="lg:sticky lg:top-24">
          <Card>
            <CardHeader>
              <CardTitle>Job Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p><b>Posted:</b> {utils.formatPostedDate(job.posted_date)}</p>
              <p><b>Deadline:</b> {formatDeadlineDate(job.application_deadline)}</p>
              <Button
                className="mt-4 w-full"
                onClick={handleSaveJob}
                disabled={isSaving}
                variant={isJobSaved ? 'default' : 'outline'}
              >
                <Bookmark className="mr-2" />
                {isJobSaved ? 'Saved' : 'Save Job'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MOBILE FOOTER */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-white border-t">
        <div className="flex gap-3">
          <Button
            variant={isJobSaved ? 'default' : 'outline'}
            onClick={handleSaveJob}
            className="w-1/4"
          >
            <Bookmark />
          </Button>
          <Button className="flex-1" onClick={handleApply}>
            Apply Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
