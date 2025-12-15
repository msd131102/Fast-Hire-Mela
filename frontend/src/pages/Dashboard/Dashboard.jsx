import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userAPI, jobsAPI, utils } from '../../services/api';
import { calculateProfileCompletion, getProfileCompletionStatus } from '../../utils/profileUtils';
import {
  User,
  Briefcase,
  Heart,
  Edit,
  Plus,
  Clock,
  MapPin,
  Building,
  IndianRupee
} from 'lucide-react';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Load profile data on component mount only - use ref to prevent re-running
  const hasLoadedData = useRef(false);

  useEffect(() => {
    // Only load data once on mount
    if (hasLoadedData.current) return;
    hasLoadedData.current = true;

    const loadProfileData = async () => {
      if (user) {
        try {
          // Fetch fresh profile data from API (same as Profile.jsx)
          const response = await userAPI.getProfile();
          if (response.success && response.data.user) {
            setProfileData(response.data.user);
          } else {
            // Fallback to context user data if API fails
            setProfileData(user);
          }
        } catch (error) {
          console.error('Error fetching profile data:', error);
          // Fallback to context user data if API fails
          setProfileData(user);
        }
      }
    };

    const loadRecentJobs = async () => {
      setLoadingJobs(true);
      try {
        const response = await jobsAPI.getLatestJobs(6); // Get 6 recent jobs
        console.log('🧪 Recent jobs API response:', response);

        // Handle the actual response structure from the API
        let jobsData = [];
        if (response && response.data && response.data.jobs) {
          jobsData = response.data.jobs;
        } else if (response && response.jobs) {
          jobsData = response.jobs;
        } else if (Array.isArray(response)) {
          jobsData = response;
        }

        console.log('📊 Processed jobs data:', jobsData);
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
  }, [user]); // Only depend on user existence, not on user changes

  const profileCompletion = calculateProfileCompletion({ ...profileData, email: user?.email });

  const quickActions = [
    {
      title: 'Update Profile',
      description: 'Keep your profile up to date',
      icon: Edit,
      color: 'bg-blue-500',
      link: '/profile'
    },
    {
      title: 'Browse Jobs',
      description: 'Find your next opportunity',
      icon: Briefcase,
      color: 'bg-green-500',
      link: '/jobs'
    },
    {
      title: 'Saved Jobs',
      description: 'View your saved positions',
      icon: Heart,
      color: 'bg-red-500',
      link: '/saved-jobs'
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please login to access dashboard
          </h1>
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-0 mt-0 !pt-0 !mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-0 pt-0 !mt-0 !pt-0">

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'User'}! 👋
          </h1>
          <p className="text-gray-600 mb-4">
            Here's what's happening with your job search today.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 font-medium text-center">
              Ready to Find Your Dream Job? Join thousands of job seekers who found their perfect match. Check every day 8 pm update day jobs atomic AI.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${action.color} p-3 rounded-lg`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <Plus className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600">
                {action.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Jobs
              </h2>
              <Link
                to="/jobs"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            {loadingJobs ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading recent jobs...</p>
              </div>
            ) : recentJobs.length > 0 ? (
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          <Link
                            to={`/jobs/${job.id}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {job.title}
                          </Link>
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Building className="h-4 w-4 mr-1" />
                          <span className="mr-4">{job.company}</span>
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="mr-4">{job.location}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <IndianRupee className="h-4 w-4 mr-1" />
                          <span className="mr-4">
                            {utils.formatSalary(job.salary_min, job.salary_max)}
                          </span>
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{utils.formatPostedDate(job.created_at)}</span>
                        </div>
                      </div>
                      <Link
                        to={`/jobs/${job.id}`}
                        className="ml-4 inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  No recent jobs available
                </p>
                <Link
                  to="/jobs"
                  className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Browse All Jobs
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Profile Completion */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Profile Completion
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Complete your profile
                  </span>
                  <span className="text-sm text-gray-500">
                    {profileCompletion}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${profileCompletion}%` }}></div>
                </div>
              </div>
              <Link
                to="/profile"
                className="ml-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                Complete Profile
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
