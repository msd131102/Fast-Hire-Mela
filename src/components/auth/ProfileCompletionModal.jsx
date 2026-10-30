import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { useToast } from '../../components/ui/toastUtils';
import { calculateProfileCompletion } from '../../utils/profileUtils';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import {
  User,
  Briefcase,
  GraduationCap,
  Settings,
  Link as LinkIcon,
  CheckCircle
} from 'lucide-react';

const ProfileCompletionModal = ({ isOpen, onClose, onComplete }) => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    bio: '',
    city: '',
    state: '',
    country: '',
    current_job_title: '',
    current_company: '',
    experience_years: '',
    industry: '',
    education_level: '',
    skills: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    preferred_job_types: '',
    preferred_locations: '',
    preferred_salary_min: '',
    preferred_salary_max: '',
    salary_currency: 'INR',
    is_open_to_work: true
  });

  useEffect(() => {
    if (!user) return;
    setProfileData(prev => ({
      ...prev,
      ...user,
      salary_currency: user.salary_currency || 'INR',
      is_open_to_work: user.is_open_to_work ?? true
    }));
  }, [user]);

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setProfileData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const profileCompletion = calculateProfileCompletion({
    ...profileData,
    email: user?.email
  });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await userAPI.updateProfileForm(profileData);
      if (response.success) {
        updateUser(response.data.user);
        toast.success('Profile completed successfully!');
        onComplete?.();
        setTimeout(() => {
          onClose();
          navigate('/dashboard');
        }, 800);
      } else {
        toast.error(response.message || 'Update failed');
      }
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onComplete?.();
    onClose();
    navigate('/dashboard');
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'skills', label: 'Skills', icon: GraduationCap },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'social', label: 'Links', icon: LinkIcon }
  ];

  const Section = ({ children }) => (
    <div className="space-y-4">{children}</div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleSkip}
      size="lg"
      title="Complete Your Profile"
      closeOnBackdropClick={false}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
          <div className="flex gap-3">
            <CheckCircle className="text-blue-600 shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900">
                Welcome to Fast Hire Mela 🎉
              </h4>
              <p className="text-sm text-blue-700">
                Complete your profile for better job matches.
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Profile Completion</span>
            <span className="font-semibold text-blue-600">
              {profileCompletion}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-600 rounded-full transition-all"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
        </div>

        {/* Tabs (Mobile Optimized) */}
        <div className="sticky top-0 bg-white z-10 -mx-4 px-4 border-b mb-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {tabs.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                    activeTab === t.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600'
                  }`}
                >
                  <Icon size={16} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-1 pb-4">
          {activeTab === 'personal' && (
            <Section>
              <Input label="Full Name *" name="name" value={profileData.name} onChange={handleInputChange} />
              <Input label="Phone" name="phone" value={profileData.phone} onChange={handleInputChange} />
              <Input label="City *" name="city" value={profileData.city} onChange={handleInputChange} />
              <Input label="State" name="state" value={profileData.state} onChange={handleInputChange} />
              <Input label="Country *" name="country" value={profileData.country} onChange={handleInputChange} />
            </Section>
          )}

          {activeTab === 'professional' && (
            <Section>
              <Input label="Job Title *" name="current_job_title" value={profileData.current_job_title} onChange={handleInputChange} />
              <Input label="Company" name="current_company" value={profileData.current_company} onChange={handleInputChange} />
              <Input label="Experience (Years) *" type="number" name="experience_years" value={profileData.experience_years} onChange={handleInputChange} />
              <Input label="Industry *" name="industry" value={profileData.industry} onChange={handleInputChange} />
            </Section>
          )}

          {activeTab === 'skills' && (
            <Section>
              <textarea
                name="skills"
                value={profileData.skills}
                onChange={handleInputChange}
                rows={4}
                className="w-full border rounded-lg p-3"
                placeholder="Java, React, Node.js..."
              />
            </Section>
          )}

          {activeTab === 'preferences' && (
            <Section>
              <textarea
                name="preferred_job_types"
                value={profileData.preferred_job_types}
                onChange={handleInputChange}
                rows={3}
                className="w-full border rounded-lg p-3"
              />
            </Section>
          )}

          {activeTab === 'social' && (
            <Section>
              <Input label="LinkedIn" name="linkedin_url" value={profileData.linkedin_url} onChange={handleInputChange} />
              <Input label="GitHub" name="github_url" value={profileData.github_url} onChange={handleInputChange} />
              <Input label="Portfolio" name="portfolio_url" value={profileData.portfolio_url} onChange={handleInputChange} />
            </Section>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 border-t pt-4">
          <Button type="button" variant="outline" onClick={handleSkip}>
            Skip for Now
          </Button>
          <Button
            type="submit"
            disabled={loading || profileCompletion < 30}
            className="w-full"
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProfileCompletionModal;
