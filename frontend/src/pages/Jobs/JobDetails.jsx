import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
  CheckCircle,
  AlertCircle
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

  // Get saved jobs
  const { data: savedJobsData } = useQuery({
    queryKey: ['savedJobs'],
    queryFn: () => {
      return getSavedJobs();
    },
    enabled: !!user,
    select: (data) => data?.data?.saved_jobs || [],
  });

  const jobId = parseInt(id);
  const isJobSaved = savedJobsData?.some(savedJob => savedJob.id === jobId);

  // Save job mutation
  const saveJobMutation = useMutation({
    mutationFn: saveJob,
    onSuccess: (data) => {
      toast.success(data.message || 'Job saved successfully!');
      queryClient.invalidateQueries(['savedJobs']);
      setTimeout(() => {
        navigate('/dashboard/saved-jobs');
      }, 1500);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to save job';
      toast.error(errorMessage);
    },
  });

  // Unsave job mutation
  const unsaveJobMutation = useMutation({
    mutationFn: unsaveJob,
    onSuccess: (data) => {
      toast.success(data.message || 'Job removed from saved jobs');
      queryClient.invalidateQueries(['savedJobs']);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to remove job';
      toast.error(errorMessage);
    },
  });

  // Fetch job details
  const { data: jobData, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => getJobDetails(id),
    enabled: !!id,
    select: (data) => data?.data?.job, 
  });

  const job = jobData;

  // Fetch similar jobs
  const { data: similarJobs } = useQuery({
    queryKey: ['similarJobs', id],
    queryFn: () => id ? getSimilarJobs(id) : Promise.resolve({ data: { jobs: [] } }),
    enabled: !!id,
    select: (data) => data?.data?.jobs || [],
  });

  // Track job view
  useEffect(() => {
    if (job) {
      console.log('Job viewed:', job.id);
    }
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
      toast.error('No application URL available for this job');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.title,
          text: `Check out this ${job?.title} position at ${job?.company_name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleSaveJob = async () => {
    if (!user) {
      toast.error('Please login to save jobs');
      navigate('/login');
      return;
    }

    const isUserPremium = user.is_premium || user.isPremium;
    
    if (!isUserPremium) {
      toast.info('Saving jobs is a premium feature. Please upgrade to premium!');
      navigate('/premium-checkout');
      return;
    }

    setIsSaving(true);
    try {
      if (isJobSaved) {
        await unsaveJobMutation.mutateAsync(id);
      } else {
        await saveJobMutation.mutateAsync(id);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate days until deadline
 const safeParseDate = (dateString) => {
  if (!dateString) return null;

  const [y, m, d] = dateString.split('T')[0].split('-');
  return new Date(Number(y), Number(m) - 1, Number(d));
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Link to="/jobs">
            <Button className="w-full">Browse Other Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/jobs" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-gray-600 hover:text-gray-900"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Job Header Card */}
              <Card className="mb-6 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
                    <div className="flex items-start space-x-4 mb-4 sm:mb-0">
                      <img
                        src={job.company_logo || '/api/placeholder/80/80'}
                        alt={job.company_name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                      />
                      <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 mr-1" />
                            {job.company_name}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {job.location}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="hidden sm:flex items-center space-x-2">
                      <Button
                        variant={isJobSaved ? "default" : "outline"}
                        size="sm"
                        onClick={handleSaveJob}
                        disabled={isSaving || saveJobMutation.isLoading || unsaveJobMutation.isLoading}
                      >
                        <Bookmark 
                          className={`w-4 h-4 mr-2 ${isJobSaved ? 'fill-white' : ''}`} 
                        />
                        {isJobSaved ? 'Saved' : 'Save'}
                      </Button>
                    </div>
                  </div>

                  {/* Key Information Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <TrendingUp className="w-5 h-5 text-green-600 mb-2" />
                      <div className="text-sm font-semibold text-gray-900">
                        {utils.formatSalary(job.salary_min, job.salary_max)}
                      </div>
                      <div className="text-xs text-gray-600">Salary (India)</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <Briefcase className="w-5 h-5 text-blue-600 mb-2" />
                      <div className="text-sm font-semibold text-gray-900 capitalize">{job.job_type || 'N/A'}</div>
                      <div className="text-xs text-gray-600">Job Type</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <Users className="w-5 h-5 text-purple-600 mb-2" />
                      <div className="text-sm font-semibold text-gray-900">
                        {utils.formatExperience(job.experience_min, job.experience_max)}
                      </div>
                      <div className="text-xs text-gray-600">Experience</div>
                    </div>
                    <div className={`p-4 rounded-lg border ${isUrgent ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                      <Calendar className={`w-5 h-5 mb-2 ${isUrgent ? 'text-red-600' : 'text-gray-600'}`} />
                      <div className="text-sm font-semibold text-gray-900">
                        {job.application_deadline ? (
                          isUrgent ? `${daysUntilDeadline} days left` : utils.formatPostedDate(job.application_deadline)
                        ) : 'No deadline'}
                      </div>
                      <div className="text-xs text-gray-600">Deadline</div>
                    </div>
                  </div>

                  {/* Skills */}
                  {job.skills_required && job.skills_required.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.skills_required.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Job Details Tabs */}
                  <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-8">
                      {['description', 'requirements', 'benefits'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                            activeTab === tab
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="prose prose-gray max-w-none">
                    {activeTab === 'description' && job.description && (
                      <div 
                        dangerouslySetInnerHTML={{ __html: job.description }}
                      />
                    )}
                    {activeTab === 'requirements' && job.responsibilities && (
                      <div 
                        dangerouslySetInnerHTML={{ __html: job.responsibilities }}
                      />
                    )}
                    {activeTab === 'benefits' && job.skills_required && (
                      <div 
                        dangerouslySetInnerHTML={{ __html: job.skills_required }}
                      />
                    )}
                  </div>

                  {/* Apply Button - Desktop */}
                  <div className="hidden lg:flex mt-6 pt-6 border-t border-gray-200">
                    <Button
                      size="lg"
                      onClick={handleApply}
                      className="flex-1"
                    >
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle>About {job.company_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={job.company_logo || '/api/placeholder/60/60'}
                      alt={job.company_name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{job.company_name}</h3>
                      <p className="text-gray-600 text-sm">{job.industry || 'Technology'}</p>
                    </div>
                  </div>
                  {job.company_description && (
                    <div 
                      className="prose prose-gray max-w-none text-sm"
                      dangerouslySetInnerHTML={{ __html: job.company_description }}
                    />
                  )}
                  <div className="mt-4">
                    <Link to={`/jobs?company=${job.company_id}`}>
                      <Button variant="outline" size="sm">
                        View All Jobs
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="lg:sticky lg:top-24 space-y-6">
                {/* Job Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Job Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Posted:</span>
                        <span className="font-medium">{utils.formatPostedDate(job.posted_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Views:</span>
                        <span className="font-medium">{job.view_count || 0}</span>
                      </div>
                      {job.application_deadline && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Deadline:</span>
                          <span className={`font-medium ${isUrgent ? 'text-red-600' : 'text-gray-900'}`}>
                            {utils.formatPostedDate(job.application_deadline)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Similar Jobs */}
                {similarJobs && similarJobs.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Similar Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {similarJobs.slice(0, 3).map((similarJob) => (
                          <Link
                            key={similarJob.id}
                            to={`/jobs/${similarJob.id}`}
                            className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <h4 className="font-semibold text-gray-900 mb-1 truncate">{similarJob.title}</h4>
                            <div className="text-sm text-gray-600 mb-2 truncate">{similarJob.company_name}</div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 truncate">{similarJob.location}</span>
                              <span className="text-green-600 font-medium flex-shrink-0">
                                {utils.formatSalary(similarJob.salary_min, similarJob.salary_max)}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-4">
                        <Link to="/jobs">
                          <Button variant="outline" className="w-full">
                            View More Jobs
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-white border-t shadow-2xl z-50">
        <div className="flex gap-3 items-center">
          <Button
            variant={isJobSaved ? "default" : "outline"}
            size="lg"
            onClick={handleSaveJob}
            className="w-1/4 flex-shrink-0"
            disabled={isSaving || saveJobMutation.isLoading || unsaveJobMutation.isLoading}
          >
            <Bookmark
              className={`w-6 h-6 ${isJobSaved ? 'fill-white text-white' : 'text-gray-500'}`}
            />
          </Button>
          <Button
            size="lg"
            onClick={handleApply}
            className="flex-auto"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Apply Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
