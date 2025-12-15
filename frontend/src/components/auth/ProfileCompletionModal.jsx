import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { useToast } from '../../components/ui/toastUtils';
import { calculateProfileCompletion, getProfileCompletionStatus } from '../../utils/profileUtils';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { User, Briefcase, GraduationCap, Settings, Link, CheckCircle } from 'lucide-react';

const ProfileCompletionModal = ({ isOpen, onClose, onComplete }) => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState({
    // Personal Information
    name: '',
    phone: '',
    bio: '',

    // Location Information
    city: '',
    state: '',
    country: '',

    // Professional Information
    current_job_title: '',
    current_company: '',
    experience_years: '',
    industry: '',
    education_level: '',

    // Skills & Education
    skills: '',

    // Social Links
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',

    // Job Preferences
    preferred_job_types: '',
    preferred_locations: '',
    preferred_salary_min: '',
    preferred_salary_max: '',
    salary_currency: 'INR',
    is_open_to_work: true
  });

  // Initialize profile data when user is available
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '', // Add email field
        bio: user.bio || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || '',
        current_job_title: user.current_job_title || '',
        current_company: user.current_company || '',
        experience_years: user.experience_years || '',
        industry: user.industry || '',
        education_level: user.education_level || '',
        skills: user.skills || '',
        linkedin_url: user.linkedin_url || '',
        github_url: user.github_url || '',
        portfolio_url: user.portfolio_url || '',
        website_url: user.website_url || '',
        profile_picture: user.profile_picture || '',
        preferred_job_types: user.preferred_job_types || '',
        preferred_locations: user.preferred_locations || '',
        preferred_salary_min: user.preferred_salary_min || '',
        preferred_salary_max: user.preferred_salary_max || '',
        salary_currency: user.salary_currency || 'INR',
        is_open_to_work: user.is_open_to_work !== undefined ? user.is_open_to_work : true
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const profileCompletion = calculateProfileCompletion({ ...profileData, email: user?.email });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await userAPI.updateProfileForm(profileData);

      if (response.success) {
        updateUser(response.data.user);
        toast.success('Profile completed successfully!');

        // Call the onComplete callback if provided
        if (onComplete) {
          onComplete();
        }

        // Close modal and redirect to dashboard
        setTimeout(() => {
          onClose();
          navigate('/dashboard');
        }, 1000);
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipForNow = () => {
    if (onComplete) {
      onComplete();
    }
    onClose();
    navigate('/dashboard');
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'skills', label: 'Skills & Education', icon: GraduationCap },
    { id: 'preferences', label: 'Job Preferences', icon: Settings },
    { id: 'social', label: 'Social Links', icon: Link }
  ];

  const renderPersonalInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name *"
          name="name"
          value={profileData.name}
          onChange={handleInputChange}
          placeholder="Enter your full name"
          required
        />
        <Input
          label="Phone Number"
          name="phone"
          type="tel"
          value={profileData.phone}
          onChange={handleInputChange}
          placeholder="+91 98765 43210"
        />
        <Input
          label="City *"
          name="city"
          value={profileData.city}
          onChange={handleInputChange}
          placeholder="e.g., Bangalore"
          required
        />
        <Input
          label="State"
          name="state"
          value={profileData.state}
          onChange={handleInputChange}
          placeholder="e.g., Karnataka"
        />
        <Input
          label="Country *"
          name="country"
          value={profileData.country}
          onChange={handleInputChange}
          placeholder="e.g., India"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
        <textarea
          name="bio"
          value={profileData.bio}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tell us about yourself..."
        />
      </div>
    </div>
  );

  const renderProfessional = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Current Job Title *"
          name="current_job_title"
          value={profileData.current_job_title}
          onChange={handleInputChange}
          placeholder="e.g., Software Engineer"
          required
        />
        <Input
          label="Current Company"
          name="current_company"
          value={profileData.current_company}
          onChange={handleInputChange}
          placeholder="e.g., Google"
        />
        <Input
          label="Experience Years *"
          name="experience_years"
          type="number"
          value={profileData.experience_years}
          onChange={handleInputChange}
          placeholder="e.g., 5"
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Education Level *</label>
          <select
            name="education_level"
            value={profileData.education_level}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Education Level</option>
            <option value="high_school">High School</option>
            <option value="diploma">Diploma</option>
            <option value="bachelors">Bachelor's Degree</option>
            <option value="masters">Master's Degree</option>
            <option value="phd">PhD</option>
            <option value="other">Other</option>
          </select>
        </div>
        <Input
          label="Industry *"
          name="industry"
          value={profileData.industry}
          onChange={handleInputChange}
          placeholder="e.g., Information Technology"
          required
        />
      </div>
    </div>
  );

  const renderSkillsEducation = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Skills *</label>
        <textarea
          name="skills"
          value={profileData.skills}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., JavaScript, React, Node.js, Python, AWS..."
          required
        />
        <p className="text-sm text-gray-500 mt-1">Separate skills with commas</p>
      </div>
    </div>
  );

  const renderJobPreferences = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Job Types</label>
          <textarea
            name="preferred_job_types"
            value={profileData.preferred_job_types}
            onChange={handleInputChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Full-time, Part-time, Remote, Contract"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Locations</label>
          <textarea
            name="preferred_locations"
            value={profileData.preferred_locations}
            onChange={handleInputChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Bangalore, Mumbai, Pune, Hyderabad"
          />
        </div>
        <Input
          label="Minimum Expected Salary"
          name="preferred_salary_min"
          type="number"
          value={profileData.preferred_salary_min}
          onChange={handleInputChange}
          placeholder="e.g., 800000"
        />
        <Input
          label="Maximum Expected Salary"
          name="preferred_salary_max"
          type="number"
          value={profileData.preferred_salary_max}
          onChange={handleInputChange}
          placeholder="e.g., 1200000"
        />
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Salary Currency</label>
          <select
            name="salary_currency"
            value={profileData.salary_currency}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="INR">INR - Indian Rupee</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSocialLinks = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="LinkedIn URL"
          name="linkedin_url"
          type="url"
          value={profileData.linkedin_url}
          onChange={handleInputChange}
          placeholder="https://linkedin.com/in/yourprofile"
        />
        <Input
          label="GitHub URL"
          name="github_url"
          type="url"
          value={profileData.github_url}
          onChange={handleInputChange}
          placeholder="https://github.com/yourusername"
        />
        <Input
          label="Portfolio URL"
          name="portfolio_url"
          type="url"
          value={profileData.portfolio_url}
          onChange={handleInputChange}
          placeholder="https://yourportfolio.com"
        />
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return renderPersonalInfo();
      case 'professional':
        return renderProfessional();
      case 'skills':
        return renderSkillsEducation();
      case 'preferences':
        return renderJobPreferences();
      case 'social':
        return renderSocialLinks();
      default:
        return renderPersonalInfo();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleSkipForNow}
      size="lg"
      title="Complete Your Profile"
      closeOnBackdropClick={false}
    >
      <form onSubmit={handleSubmit}>
        {/* Welcome Message */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-blue-600" />
            <div>
              <h4 className="text-lg font-semibold text-blue-900">Welcome to Fast Hire Mela! 🎉</h4>
              <p className="text-blue-700 text-sm mt-1">
                Complete your profile to increase visibility to recruiters and get better job matches.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Completion Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Profile Completion</span>
            <span className="text-sm font-semibold text-blue-600">{profileCompletion}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${profileCompletion}%` }}
            ></div>
          </div>
          {profileCompletion >= 60 && (
            <p className="text-sm text-green-600 mt-2">Great! Your profile is looking good!</p>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-1" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mb-6 max-h-96 overflow-y-auto">
          {renderTabContent()}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleSkipForNow}
            disabled={loading}
          >
            Skip for Now
          </Button>
          <div className="space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveTab(tabs[(tabs.findIndex(t => t.id === activeTab) + 1) % tabs.length].id)}
              disabled={loading}
            >
              Next Tab
            </Button>
            <Button
              type="submit"
              disabled={loading || profileCompletion < 30}
              className="min-w-[120px]"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </Button>
          </div>
        </div>

        {profileCompletion < 30 && (
          <p className="text-xs text-amber-600 mt-2 text-center">
            Please fill at least the required fields (marked with *) to continue
          </p>
        )}
      </form>
    </Modal>
  );
};

export default ProfileCompletionModal;
