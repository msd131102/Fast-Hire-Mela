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
import { X, Plus, Edit2, Trash2, User, Briefcase, GraduationCap, Settings, Link, Camera, MapPin, Phone, Globe } from 'lucide-react';

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
    { id: 'personal', label: 'Personal Info', icon: <User size={18} /> },
    { id: 'professional', label: 'Professional', icon: <Briefcase size={18} /> },
    { id: 'skills', label: 'Skills & Education', icon: <GraduationCap size={18} /> },
    { id: 'preferences', label: 'Job Preferences', icon: <Settings size={18} /> },
    { id: 'social', label: 'Social Links', icon: <Link size={18} /> }
  ];

  const renderPersonalInfo = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative group">
            <div className="w-28 h-28 rounded-2xl bg-white shadow-md flex items-center justify-center overflow-hidden border-2 border-white ring-1 ring-gray-100">
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
              <div className="text-4xl font-bold text-blue-200" style={{ display: profileData.profile_picture ? 'none' : 'flex' }}>
                {user?.name?.[0] || user?.email?.[0] || 'U'}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-lg shadow-lg">
              <Camera size={16} />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-1">
            <h3 className="text-xl font-bold text-gray-900">{user?.name || 'Your Name'}</h3>
            <p className="text-gray-500 font-medium">{user?.email}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Member since {getMemberSinceDate(profileData)}
                </span>
                {profileData.is_premium && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      Premium Member
                    </span>
                )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Picture URL</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={profileData.profile_picture}
              onChange={(e) => handleProfilePictureUrlChange(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-2 italic">Use a high-quality square image URL for best results</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <Input label="Full Name" name="name" value={profileData.name} onChange={handleInputChange} placeholder="Enter your full name" />
        <Input label="Phone Number" name="phone" type="tel" value={profileData.phone} onChange={handleInputChange} placeholder="+91 98765 43210" />
        <Input label="City" name="city" value={profileData.city} onChange={handleInputChange} placeholder="e.g., Bangalore" />
        <Input label="State" name="state" value={profileData.state} onChange={handleInputChange} placeholder="e.g., Karnataka" />
        <Input label="Country" name="country" value={profileData.country} onChange={handleInputChange} placeholder="e.g., India" />
        <Input label="Postal Code" name="postal_code" value={profileData.postal_code} onChange={handleInputChange} placeholder="e.g., 560001" />
        
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
          <textarea
            name="address"
            value={profileData.address}
            onChange={handleInputChange}
            rows={2}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            placeholder="Enter your full address"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
          <textarea
            name="bio"
            value={profileData.bio}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            placeholder="Tell us about your professional journey..."
          />
        </div>
      </div>
    </div>
  );

  const renderProfessional = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Current Job Title" name="current_job_title" value={profileData.current_job_title} onChange={handleInputChange} placeholder="e.g., Senior Software Engineer" />
        <Input label="Current Company" name="current_company" value={profileData.current_company} onChange={handleInputChange} placeholder="e.g., Google" />
        <Input label="Experience Years" name="experience_years" type="number" value={profileData.experience_years} onChange={handleInputChange} placeholder="e.g., 5" />
        <Input label="Industry" name="industry" value={profileData.industry} onChange={handleInputChange} placeholder="e.g., Information Technology" />
        
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Education Level</label>
          <select
            name="education_level"
            value={profileData.education_level}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
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
      </div>
    </div>
  );

  const renderSkillsEducation = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Skills</label>
        <textarea
          name="skills"
          value={profileData.skills}
          onChange={handleInputChange}
          rows={5}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          placeholder="e.g., JavaScript, React, Node.js, Python, AWS..."
        />
        <div className="flex items-center gap-2 mt-3 text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-lg">
            <Plus size={14} />
            <span className="text-xs font-medium uppercase tracking-wider">Separate skills with commas</span>
        </div>
      </div>
    </div>
  );

  const renderJobPreferences = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Job Types</label>
          <textarea
            name="preferred_job_types"
            value={profileData.preferred_job_types}
            onChange={handleInputChange}
            rows={2}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="e.g., Full-time, Remote, Contract"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Locations</label>
          <textarea
            name="preferred_locations"
            value={profileData.preferred_locations}
            onChange={handleInputChange}
            rows={2}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="e.g., Bangalore, Mumbai, Remote"
          />
        </div>
        <Input label="Min Expected Salary" name="preferred_salary_min" type="number" value={profileData.preferred_salary_min} onChange={handleInputChange} />
        <Input label="Max Expected Salary" name="preferred_salary_max" type="number" value={profileData.preferred_salary_max} onChange={handleInputChange} />
        
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Salary Currency</label>
          <select
            name="salary_currency"
            value={profileData.salary_currency}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="INR">INR - Indian Rupee</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
          </select>
        </div>

        <div className="md:col-span-2 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
          <label className="flex items-center cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                name="is_open_to_work"
                checked={profileData.is_open_to_work}
                onChange={handleInputChange}
                className="sr-only"
              />
              <div className={`w-11 h-6 rounded-full transition-colors ${profileData.is_open_to_work ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${profileData.is_open_to_work ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
            <span className="ml-3 text-sm font-bold text-gray-700">Open to work opportunities</span>
          </label>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Visibility</label>
          <select
            name="profile_visibility"
            value={profileData.profile_visibility}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="LinkedIn URL" name="linkedin_url" type="url" value={profileData.linkedin_url} onChange={handleInputChange} placeholder="https://linkedin.com/in/..." />
        <Input label="GitHub URL" name="github_url" type="url" value={profileData.github_url} onChange={handleInputChange} placeholder="https://github.com/..." />
        <Input label="Portfolio URL" name="portfolio_url" type="url" value={profileData.portfolio_url} onChange={handleInputChange} placeholder="https://portfolio.com" />
        <Input label="Website URL" name="website_url" type="url" value={profileData.website_url} onChange={handleInputChange} placeholder="https://website.com" />
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal': return renderPersonalInfo();
      case 'professional': return renderProfessional();
      case 'skills': return renderSkillsEducation();
      case 'preferences': return renderJobPreferences();
      case 'social': return renderSocialLinks();
      default: return renderPersonalInfo();
    }
  };

  if (fetchingProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
        <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-50 border-t-blue-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <User size={20} className="text-blue-600" />
            </div>
        </div>
        <p className="mt-4 text-gray-600 font-semibold animate-pulse tracking-wide">Synchronizing profile data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      <div className="max-w-6xl mx-auto px-4 pt-8 md:pt-12">
        
        {/* Profile Completion Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/60 mb-8 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1 flex-1">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Complete Your Identity</h2>
                <p className="text-gray-500 text-sm font-medium">A complete profile increases recruiter visibility by 75%.</p>
              </div>
              <div className="flex items-center gap-4 min-w-[200px]">
                <div className="flex-1">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="font-bold text-blue-600">{profileCompletion}%</span>
                        <span className="text-gray-400 font-semibold italic">Goal: 100%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3.5 p-1">
                        <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                        style={{ width: `${profileCompletion}%` }}
                        ></div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation Sidebar (Desktop) / Header (Mobile) */}
          <div className="lg:col-span-3 space-y-2 sticky top-8">
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-200/60 flex lg:flex-col overflow-x-auto no-scrollbar gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 py-3.5 px-5 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-200 group ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className={`${activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'}`}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200/60">
              <form onSubmit={handleSubmit} className="p-6 md:p-10">
                <div className="min-h-[400px]">
                    {renderTabContent()}
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-end items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="w-full md:w-auto border-gray-200 text-gray-600 font-bold px-8 h-12 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto min-w-[180px] bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-xl shadow-blue-100 transition-all hover:-translate-y-0.5"
                  >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            <span>Saving...</span>
                        </div>
                    ) : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default Profile;