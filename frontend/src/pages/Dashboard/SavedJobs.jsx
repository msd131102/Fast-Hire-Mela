import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bookmark,
  ExternalLink,
  MapPin,
  IndianRupee,
  Clock,
  Building2,
  Briefcase,
  X,
  Filter,
  Search,
  Crown,
  Star,
  TrendingUp
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../components/ui/Toast';
import { getSavedJobs, unsaveJob, utils } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SavedJobs = () => {
  const { user, isPremium } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Fetch saved jobs
  const { data: savedJobsResponse, isLoading, error } = useQuery({
    queryKey: ['savedJobs'],
    queryFn: getSavedJobs,
    enabled: !!user && isPremium,
  });

  // Extract the actual saved jobs array from the response
  const savedJobs = savedJobsResponse?.data?.saved_jobs || [];

  // Unsave job mutation
  const unsaveJobMutation = useMutation({
    mutationFn: unsaveJob,
    onSuccess: () => {
      toast.success('Job removed from saved');
      queryClient.invalidateQueries(['savedJobs']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to remove job');
    },
  });

  const handleUnsaveJob = (jobId) => {
    unsaveJobMutation.mutate(jobId);
  };

  const filteredJobs = savedJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === 'all' || job.job_type === filterType;

    return matchesSearch && matchesFilter;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-4">Please login to view your saved jobs.</p>
          <Link to="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          <Card className="shadow-2xl border-0">
            <CardContent className="p-12 text-center">
              {/* Premium Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <Bookmark className="w-12 h-12 text-white" />
              </motion.div>

              {/* Premium Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full mb-6"
              >
                <Crown className="w-4 h-4 text-purple-600 mr-2" />
                <span className="text-purple-800 font-semibold text-sm">PREMIUM FEATURE</span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl font-bold text-gray-900 mb-4"
              >
                Save Your Dream Jobs
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-gray-600 mb-8 leading-relaxed"
              >
                Unlock the ability to save jobs and track your applications with our Premium plan. 
                Never lose track of opportunities that matter to you.
              </motion.p>

              {/* Features List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-4 mb-8"
              >
                <div className="flex items-center justify-center space-x-3 text-gray-700">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-green-600" />
                  </div>
                  <span>Save unlimited jobs</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-gray-700">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <span>Track application status</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-gray-700">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <Bookmark className="w-4 h-4 text-green-600" />
                  </div>
                  <span>Organize your job search</span>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link to="/premium/plans">
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold shadow-lg">
                    <Crown className="w-5 h-5 mr-2" />
                    Upgrade to Premium
                  </Button>
                </Link>
                <Link to="/jobs">
                  <Button variant="outline" className="px-8 py-3 text-lg">
                    Browse Jobs
                  </Button>
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error loading saved jobs</div>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Saved Jobs</h1>
              <p className="text-gray-600 mt-2">
                {savedJobs.length || 0} jobs saved for later review
              </p>
            </div>
            <Link to="/jobs">
              <Button variant="outline">
                <Briefcase className="w-4 h-4 mr-2" />
                Browse More Jobs
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search saved jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                    startIcon={<Search className="w-4 h-4" />}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterType === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilterType('all')}
                    size="sm"
                  >
                    All Jobs
                  </Button>
                  <Button
                    variant={filterType === 'Full-time' ? 'default' : 'outline'}
                    onClick={() => setFilterType('Full-time')}
                    size="sm"
                  >
                    Full-time
                  </Button>
                  <Button
                    variant={filterType === 'Part-time' ? 'default' : 'outline'}
                    onClick={() => setFilterType('Part-time')}
                    size="sm"
                  >
                    Part-time
                  </Button>
                  <Button
                    variant={filterType === 'Remote' ? 'default' : 'outline'}
                    onClick={() => setFilterType('Remote')}
                    size="sm"
                  >
                    Remote
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm || filterType !== 'all' ? 'No matching jobs found' : 'No saved jobs yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filterType !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Start saving jobs you\'re interested in to see them here'
                  }
                </p>
                <Link to="/jobs">
                  <Button>Browse Jobs</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <img
                            src={job.company_logo || '/api/placeholder/60/60'}
                            alt={job.company_name}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="min-w-0 flex-1">
                                <Link to={`/jobs/${job.id}`}>
                                  <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate">
                                    {job.title}
                                  </h3>
                                </Link>
                                <div className="flex items-center text-gray-600 mt-1">
                                  <Building2 className="w-4 h-4 mr-1" />
                                  <span className="truncate">{job.company_name}</span>
                                </div>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ml-2 flex-shrink-0 ${job.job_type === 'Full-time' ? 'bg-green-100 text-green-800' :
                                  job.job_type === 'Part-time' ? 'bg-blue-100 text-blue-800' :
                                    job.job_type === 'Remote' ? 'bg-purple-100 text-purple-800' :
                                      'bg-gray-100 text-gray-800'
                                }`}>
                                {job.job_type}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {job.location}
                              </div>
                              <div className="flex items-center">
                                <IndianRupee className="w-4 h-4 mr-1" />
                                {utils.formatSalary(job.salary_min, job.salary_max)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {utils.formatPostedDate(job.posted_date)}
                              </div>
                            </div>

                            {job.skills_required && job.skills_required.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {job.skills_required.slice(0, 4).map((skill, skillIndex) => (
                                  <span
                                    key={skillIndex}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {job.skills_required.length > 4 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                    +{job.skills_required.length - 4} more
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-4">
                              <div className="text-sm text-gray-500">
                                Saved {utils.formatPostedDate(job.saved_at)}
                              </div>
                              <div className="flex gap-2">
                                <Link to={`/jobs/${job.id}`}>
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                </Link>
                                {job.application_url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(job.application_url, '_blank')}
                                  >
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    Apply
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUnsaveJob(job.id)}
                                  disabled={unsaveJobMutation.isLoading}
                                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SavedJobs;
