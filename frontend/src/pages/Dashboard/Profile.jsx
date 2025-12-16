import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { useToast } from '../../components/ui/toastUtils';
import { calculateProfileCompletion, getProfileCompletionStatus } from '../../utils/profileUtils';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import ScrollToTop from '../../components/common/ScrollToTop';
import { X, Plus, Edit2, Trash2 } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
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
    postal_code: '',
    address: '',

    // Professional Information
    current_job_title: '',
    current_company: '',
    experience_years: '',
    industry: '',
    education_level: '',

    // Skills & Education
    skills: '',

    // Social Links
    website_url: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',

    // Job Preferences
    preferred_job_types: '',
    preferred_locations: '',
    preferred_salary_min: '',
    preferred_salary_max: '',
    salary_currency: 'USD',
    is_open_to_work: false,
    profile_visibility: 'public',

    // Profile Picture
    profile_picture: ''
  });

  // Load profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        console.log('🔍 Fetching profile data from database...');
        const response = await userAPI.getProfile();

        if (response.success && response.data.user) {
          const userData = response.data.user;
          console.log('✅ Profile data loaded:', userData);

          setProfileData({
            name: userData.name || '',
            phone: userData.phone || '',
            bio: userData.bio || '',

            // Location Information
            city: userData.city || '',
            state: userData.state || '',
            country: userData.country || '',
            postal_code: userData.postal_code || '',
            address: userData.address || '',

            // Professional Information
            current_job_title: userData.current_job_title || '',
            current_company: userData.current_company || '',
            experience_years: userData.experience_years || '',
            industry: userData.industry || '',
            education_level: userData.education_level || '',

            // Skills & Education
            skills: userData.skills || '',

            // Social Links
            website_url: userData.website_url || '',
            linkedin_url: userData.linkedin_url || '',
            github_url: userData.github_url || '',
            portfolio_url: userData.portfolio_url || '',

            // Job Preferences
            preferred_job_types: userData.preferred_job_types || '',
            preferred_locations: userData.preferred_locations || '',
            preferred_salary_min: userData.preferred_salary_min || '',
            preferred_salary_max: userData.preferred_salary_max || '',
            salary_currency: userData.salary_currency || 'USD',
            is_open_to_work: userData.is_open_to_work || false,
            profile_visibility: userData.profile_visibility || 'public',

            // Profile Picture
            profile_picture: userData.profile_picture || '',

            // Date fields for member since calculation
            created_at: userData.created_at,
            premium_expiry: userData.premium_expiry,
            is_premium: userData.is_premium
          });
        } else {
          console.log('⚠️ Profile API response:', response);
          // Fallback to auth context user data if API fails
          if (user) {
            setProfileData({
              name: user.name || '',
              phone: user.phone || '',
              bio: user.bio || '',
              city: user.city || '',
              state: user.state || '',
              country: user.country || '',
              postal_code: user.postal_code || '',
              address: user.address || '',
              current_job_title: user.current_job_title || '',
              current_company: user.current_company || '',
              experience_years: user.experience_years || '',
              industry: user.industry || '',
              education_level: user.education_level || '',
              skills: user.skills || '',
              website_url: user.website_url || '',
              linkedin_url: user.linkedin_url || '',
              github_url: user.github_url || '',
              portfolio_url: user.portfolio_url || '',
              preferred_job_types: user.preferred_job_types || '',
              preferred_locations: user.preferred_locations || '',
              preferred_salary_min: user.preferred_salary_min || '',
              preferred_salary_max: user.preferred_salary_max || '',
              salary_currency: user.salary_currency || 'USD',
              is_open_to_work: user.is_open_to_work || false,
              profile_visibility: user.profile_visibility || 'public',
              profile_picture: user.profile_picture || '',

              // Date fields for member since calculation
              created_at: user.created_at,
              premium_expiry: user.premium_expiry,
              is_premium: user.is_premium
            });
          }
        }
      } catch (error) {
        console.error('❌ Error fetching profile data:', error);
        // Fallback to auth context user data if API fails
        if (user) {
          setProfileData({
            name: user.name || '',
            phone: user.phone || '',
            bio: user.bio || '',
            city: user.city || '',
            state: user.state || '',
            country: user.country || '',
            postal_code: user.postal_code || '',
            address: user.address || '',
            current_job_title: user.current_job_title || '',
            current_company: user.current_company || '',
            experience_years: user.experience_years || '',
            industry: user.industry || '',
            education_level: user.education_level || '',
            skills: user.skills || '',
            website_url: user.website_url || '',
            linkedin_url: user.linkedin_url || '',
            github_url: user.github_url || '',
            portfolio_url: user.portfolio_url || '',
            preferred_job_types: user.preferred_job_types || '',
            preferred_locations: user.preferred_locations || '',
            preferred_salary_min: user.preferred_salary_min || '',
            preferred_salary_max: user.preferred_salary_max || '',
            salary_currency: user.salary_currency || 'USD',
            is_open_to_work: user.is_open_to_work || false,
            profile_visibility: user.profile_visibility || 'public',
            profile_picture: user.profile_picture || '',

            // Date fields for member since calculation
            created_at: user.created_at,
            premium_expiry: user.premium_expiry,
            is_premium: user.is_premium
          });
        }
      } finally {
        setFetchingProfile(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProfilePictureUrlChange = (url) => {
    setProfileData(prev => ({
      ...prev,
      profile_picture: url
    }));
  };

  const profileCompletion = calculateProfileCompletion({ ...profileData, email: user?.email });

  // Safe date formatting function
  const getMemberSinceDate = (user) => {
    console.log('🔍 getMemberSinceDate called with user:', user);
    
    if (!user) {
      console.log('❌ No user provided');
      return 'Unknown';
    }
    
    console.log('📊 User data:', {
      is_premium: user.is_premium,
      premium_expiry: user.premium_expiry,
      created_at: user.created_at
    });
    
    // For premium users, use premium_expiry date from database
    if (user.is_premium && user.premium_expiry) {
      const date = new Date(user.premium_expiry);
      console.log('💎 Premium user, expiry date:', user.premium_expiry, 'parsed:', date);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString();
      } else {
        console.log('❌ Invalid premium_expiry date');
      }
    }
    
    // For regular users, use created_at date
    if (user.created_at) {
      const date = new Date(user.created_at);
      console.log('👤 Regular user, created_at:', user.created_at, 'parsed:', date);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString();
      } else {
        console.log('❌ Invalid created_at date');
      }
    }
    
    console.log('❌ No valid date found, returning Unknown');
    return 'Unknown';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await userAPI.updateProfileForm(profileData);

      if (response.success) {
        updateUser(response.data.user);
        toast.success('Profile updated successfully!');
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

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'professional', label: 'Professional', icon: '💼' },
    { id: 'skills', label: 'Skills & Education', icon: '🎓' },
    { id: 'preferences', label: 'Job Preferences', icon: '⚙️' },
    { id: 'social', label: 'Social Links', icon: '🔗' }
  ];

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {profileData.profile_picture ? (
              <img
                src={profileData.profile_picture}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <span className="text-3xl text-gray-400" style={{ display: profileData.profile_picture ? 'none' : 'flex' }}>
              {user?.name?.[0] || user?.email?.[0] || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{user?.name}</h3>
            <p className="text-gray-500">{user?.email}</p>
            <p className="text-sm text-gray-400">Member since {getMemberSinceDate(profileData)}</p>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture URL</label>
              <input
                type="url"
                value={profileData.profile_picture}
                onChange={(e) => handleProfilePictureUrlChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/profile-picture.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">Enter a URL to your profile picture</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Full Name"
          name="name"
          value={profileData.name}
          onChange={handleInputChange}
          placeholder="Enter your full name"
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
          label="City"
          name="city"
          value={profileData.city}
          onChange={handleInputChange}
          placeholder="e.g., Bangalore"
        />
        <Input
          label="State"
          name="state"
          value={profileData.state}
          onChange={handleInputChange}
          placeholder="e.g., Karnataka"
        />
        <Input
          label="Country"
          name="country"
          value={profileData.country}
          onChange={handleInputChange}
          placeholder="e.g., India"
        />
        <Input
          label="Postal Code"
          name="postal_code"
          value={profileData.postal_code}
          onChange={handleInputChange}
          placeholder="e.g., 560001"
        />
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <textarea
            name="address"
            value={profileData.address}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your full address"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            name="bio"
            value={profileData.bio}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>
    </div>
  );

  const renderProfessional = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Current Job Title"
          name="current_job_title"
          value={profileData.current_job_title}
          onChange={handleInputChange}
          placeholder="e.g., Senior Software Engineer"
        />
        <Input
          label="Current Company"
          name="current_company"
          value={profileData.current_company}
          onChange={handleInputChange}
          placeholder="e.g., Google"
        />
        <Input
          label="Experience Years"
          name="experience_years"
          type="number"
          value={profileData.experience_years}
          onChange={handleInputChange}
          placeholder="e.g., 5"
        />
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Education Level</label>
          <select
            name="education_level"
            value={profileData.education_level}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          label="Industry"
          name="industry"
          value={profileData.industry}
          onChange={handleInputChange}
          placeholder="e.g., Information Technology"
        />
      </div>
    </div>
  );

  const renderSkillsEducation = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
          <textarea
            name="skills"
            value={profileData.skills}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., JavaScript, React, Node.js, Python, AWS..."
          />
          <p className="text-sm text-gray-500 mt-1">Separate skills with commas</p>
        </div>
      </div>
    </div>
  );

  const renderJobPreferences = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Job Types</label>
          <textarea
            name="preferred_job_types"
            value={profileData.preferred_job_types}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Full-time, Part-time, Remote, Contract, Internship"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Locations</label>
          <textarea
            name="preferred_locations"
            value={profileData.preferred_locations}
            onChange={handleInputChange}
            rows={3}
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
            <option value="USD">USD - US Dollar</option>
            <option value="INR">INR - Indian Rupee</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="is_open_to_work"
              checked={profileData.is_open_to_work}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Open to work opportunities</span>
          </label>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
          <select
            name="profile_visibility"
            value={profileData.profile_visibility}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="public">Public - Anyone can view my profile</option>
            <option value="private">Private - Only recruiters can view my profile</option>
            <option value="hidden">Hidden - Profile is not visible</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSocialLinks = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <Input
          label="Website URL"
          name="website_url"
          type="url"
          value={profileData.website_url}
          onChange={handleInputChange}
          placeholder="https://yourwebsite.com"
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

  if (fetchingProfile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Profile Completion Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Profile Completion
              </h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Complete your profile to increase visibility to recruiters
                </span>
                <span className="text-sm text-gray-500">
                  {profileCompletion}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${profileCompletion}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {renderTabContent()}

          <div className="mt-8 flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
