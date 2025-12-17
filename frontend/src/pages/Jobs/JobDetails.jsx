import { useState } from 'react';
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

/* =========================
   INDIA-SAFE DATE HELPERS
========================= */
const safeParseDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return null;

  const parts = dateString.split('T')[0].split('-');
  if (parts.length !== 3) return null;

  const [y, m, d] = parts;
  return new Date(Number(y), Number(m) - 1, Number(d));
};

const formatDeadlineDate = (dateString) => {
  const date = safeParseDate(dateString);
  if (!date) return 'No deadline';

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getDaysUntilDeadline = (deadline) => {
  const deadlineDate = safeParseDate(deadline);
  if (!deadlineDate) return null;

  const today = new Date();
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return Math.ceil(
    (deadlineDate - todayDate) / (1000 * 60 * 60 * 24)
  );
};

const formatPostedDateSafe = (dateString) => {
  const date = safeParseDate(dateString);
  if (!date) return 'N/A';

  const today = new Date();
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const diff = Math.floor(
    (todayDate - date) / (1000 * 60 * 60 * 24)
  );

  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
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

  /* SAVED JOBS */
  const { data: savedJobs = [] } = useQuery({
    queryKey: ['savedJobs'],
    queryFn: getSavedJobs,
    enabled: !!user,
    select: (res) => res?.data?.saved_jobs || []
  });

  const isJobSaved = savedJobs.some(j => j.id === jobId);

  /* MUTATIONS */
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

  /* JOB DETAILS */
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => getJobDetails(id),
    enabled: !!id,
    select: (res) => res?.data?.job
  });

  /* SIMILAR JOBS */
  const { data: similarJobs = [] } = useQuery({
    queryKey: ['similarJobs', id],
    queryFn: () => getSimilarJobs(id),
    enabled: !!id,
    select: (res) => res?.data?.jobs || []
  });

  /* HANDLERS */
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
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({
        title: job?.title,
        text: `Check out this ${job?.title} job`,
        url: window.location.href
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied');
    }
  };

  const daysUntilDeadline = getDaysUntilDeadline(job?.application_deadline);
  const isUrgent =
    typeof daysUntilDeadline === 'number' &&
    daysUntilDeadline > 0 &&
    daysUntilDeadline <= 7;

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
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold">{job.title}</h1>
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-24">
          <Card>
            <CardHeader>
              <CardTitle>Job Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p><b>Posted:</b> {formatPostedDateSafe(job.posted_date)}</p>
              <p><b>Deadline:</b> {formatDeadlineDate(job.application_deadline)}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
