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
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const queryClient = useQueryClient();

  // Check if job is saved
  const { data: savedJobsData } = useQuery({
    queryKey: ['savedJobs'],
    queryFn: () => {
      // Use the proper API endpoint to get saved jobs
      return getSavedJobs();
    },
    enabled: !!user,
    select: (data) => data?.data?.saved_jobs || [],
  });

  // Ensure id is an integer for comparison
  const jobId = parseInt(id);
  const isJobSaved = savedJobsData?.some(savedJob => savedJob.id === jobId);

  // Save job mutation
  const saveJobMutation = useMutation({
    mutationFn: saveJob,
    onSuccess: (data) => {
      toast.success(data.message || 'Job saved successfully!');
      queryClient.invalidateQueries(['savedJobs']);
      // Navigate to saved jobs page after successful save
      setTimeout(() => {
        navigate('/dashboard/saved-jobs');
      }, 1500); // Small delay to let user see the toast
    },
    onError: (error) => {
      // Using a more robust error message pattern
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
    // Use 'select' to normalize the data shape
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
      // Track job view analytics
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
      // User is authenticated, open the application link
      window.open(job.apply_link, '_blank');
    } else {
      // Handle case where no application URL exists
      toast.error('No external application URL available for this job');
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
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleSaveJob = () => {
    if (!user) {
      toast.error('Please login to save jobs');
      navigate('/login');
      return;
    }

    // Check if user is premium - check both possible properties
    const isUserPremium = user.is_premium || user.isPremium;
    
    if (!isUserPremium) {
      toast.info('Saving jobs is a premium feature. Please upgrade to premium!');
      navigate('/premium-checkout');
      return;
    }

    // User is premium, proceed with save/unsave operation
    if (isJobSaved) {
      unsaveJobMutation.mutate(id);
    } else {
      saveJobMutation.mutate(id);
    }
  };

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
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Link to="/jobs">
            <Button>Browse Other Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    // Added padding-bottom for sticky mobile footer
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        {/* Made header sticky */}
        <div className="container mx-auto px-4 py-4">
          <Link to="/jobs" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Link>
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
              {/* Job Header */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  {/* IMPROVEMENT: Better responsive header layout */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
                    
                    {/* Left Side (Logo & Info) */}
                    <div className="flex items-start space-x-4 mb-4 sm:mb-0">
                      <img
                        src={job.company_logo || '/api/placeholder/80/80'}
                        alt={job.company_name}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                        <div className="flex items-center text-gray-600 mb-1">
                          <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{job.company_name}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Side (Actions) - Hidden on mobile, visible on desktop/tablet */}
                    <div className="hidden sm:flex flex-col space-y-2 mt-2 sm:mt-0 sm:items-end">
                      <Button
                        variant={isJobSaved ? "secondary" : "outline"}
                        size="sm"
                        onClick={handleSaveJob}
                        disabled={saveJobMutation.isLoading || unsaveJobMutation.isLoading}
                      >
                        <Bookmark 
                          className={`w-4 h-4 mr-2 ${isJobSaved ? 'fill-yellow-500 text-yellow-500' : 'text-gray-500'}`} 
                        />
                        {isJobSaved ? 'Job Saved' : 'Save Job'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>

                  {/* Job Meta (remains the same) */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {/* Salary */}
                    <div className="text-center p-3 bg-gray-100 rounded-lg">
                      <span className="text-2xl text-green-600 mx-auto mb-1 block">₹</span>
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {utils.formatSalary(job.salary_min, job.salary_max)}
                      </div>
                      <div className="text-xs text-gray-500">Salary</div>
                    </div>
                    {/* Job Type */}
                    <div className="text-center p-3 bg-gray-100 rounded-lg">
                      <Briefcase className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-sm font-semibold text-gray-900 truncate">{job.job_type || 'N/A'}</div>
                      <div className="text-xs text-gray-500">Job Type</div>
                    </div>
                    {/* Posted */}
                    <div className="text-center p-3 bg-gray-100 rounded-lg">
                      <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {utils.formatPostedDate(job.posted_at)}
                      </div>
                      <div className="text-xs text-gray-500">Posted</div>
                    </div>
                    {/* Experience */}
                    <div className="text-center p-3 bg-gray-100 rounded-lg">
                      <Users className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {utils.formatExperience(job.experience_min, job.experience_max)}
                      </div>
                      <div className="text-xs text-gray-500">Experience</div>
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

                  {/* Job Description, Requirements, Benefits (Using Tailwind Prose for readability) */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Job Description</h3>
                    <div 
                      className="prose prose-gray max-w-none leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: job.description }}
                    />
                  </div>

                  {job.requirements && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Requirements</h3>
                      <div 
                        className="prose prose-gray max-w-none leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: job.requirements }}
                      />
                    </div>
                  )}

                  {job.benefits && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Benefits</h3>
                      <div 
                        className="prose prose-gray max-w-none leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: job.benefits }}
                      />
                    </div>
                  )}

                  {/* Apply Button - Visible only on Desktop/Tablet (hidden on mobile to use sticky footer) */}
                  <div className="hidden lg:flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
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
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{job.company_name}</h3>
                      <p className="text-gray-600 text-sm">{job.industry}</p>
                    </div>
                  </div>
                  {job.company_description && (
                    <div 
                      className="prose prose-gray max-w-none leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: job.company_description }}
                    />
                  )}
                  <div className="mt-4">
                    <Link to={`/jobs?company=${job.company_id}`}>
                      <Button variant="outline">
                        View All Jobs at {job.company_name}
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
              {/* IMPROVEMENT: Make sidebar sticky on large screens */}
              <div className="lg:sticky lg:top-[6.5rem]">
                {/* Adjusted top value to account for main header */}

                {/* Job Summary */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Job Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Posted:</span>
                        <span className="font-medium">{utils.formatPostedDate(job.posted_at)}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Views:</span>
                        <span className="font-medium">{job.views || 0}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Applications:</span>
                        <span className="font-medium">{job.application_count || 0}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-gray-600">Deadline:</span>
                        <span className={`font-medium ${job.deadline && new Date(job.deadline) < new Date() ? 'text-red-500' : 'text-gray-900'}`}>
                          {job.deadline ? utils.formatPostedDate(job.deadline) : 'No deadline'}
                        </span>
                      </div>
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
                      <div className="space-y-4">
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

      {/* === IMPROVEMENT: STICKY MOBILE/TABLET FOOTER === */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-white border-t shadow-2xl z-50">
        <div className="flex gap-3 items-center">
          <Button
            variant={isJobSaved ? "default" : "outline"}
            size="lg"
            onClick={handleSaveJob}
            className="w-1/4 flex-shrink-0"
            disabled={saveJobMutation.isLoading || unsaveJobMutation.isLoading}
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
