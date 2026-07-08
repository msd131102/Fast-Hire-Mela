import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { userAPI, settingsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Bell,
  Shield,
  Save,
  Crown,
  Lock,
  ChevronRight,
  MapPin,
  Mail,
  Smartphone
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../components/ui/toastUtils';

const Settings = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: '',
    bio: '',
    profile_picture: '',
    email_notifications: true,
    job_alerts: true,
    newsletter_subscription: false,
    profile_visibility: 'public'
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadUserProfile();
  }, [isAuthenticated, navigate]);

  const loadUserProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      if (response.success && response.data.user) {
        setProfileData(prev => ({
          ...prev,
          ...response.data.user
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile data');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await userAPI.updateProfile(profileData);
      if (response.success) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async (settingType) => {
    setLoading(true);
    try {
      const response = await settingsAPI.updateSettings({
        [settingType]: profileData[settingType]
      });
      if (response.success) {
        toast.success(`${settingType.replace('_', ' ')} updated successfully!`);
      } else {
        toast.error(response.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      const response = await userAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      if (response.success) {
        toast.success('Password changed successfully!');
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      } else {
        toast.error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, desc: 'Personal info & Bio' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alerts & Emails' },
    { id: 'account', label: 'Account', icon: Shield, desc: 'Security & Billing' }
  ];

  const isPremium = user?.is_premium;

  return (
    <div className="min-h-screen bg-background text-text pb-12">
      {/* Top Background Gradient Accent */}
      <div className="h-48 w-full bg-gradient-to-r from-primary-600/20 to-secondary-600/20 border-b border-border absolute top-0 left-0 z-0" />

      <div className="container mx-auto px-4 pt-12 relative z-10 max-w-6xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-text"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Settings</h1>
          <p className="text-muted mt-2 opacity-90">Manage your account preferences and profile settings</p>
        </motion.div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-surface backdrop-blur-sm rounded-[2rem] shadow-adventure border border-border p-3 sticky top-6"
            >
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full group flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary-600 text-text shadow-adventure'
                        : 'text-muted hover:bg-secondary-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-white/20' : 'bg-background group-hover:bg-surface'}`}>
                        <tab.icon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-sm leading-none">{tab.label}</div>
                        <div className={`text-[11px] mt-1 ${activeTab === tab.id ? 'text-muted' : 'text-muted/70'}`}>
                          {tab.desc}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === tab.id ? 'translate-x-1 opacity-100' : 'opacity-0'}`} />
                  </button>
                ))}
              </div>

              {/* Quick Status Info */}
              <div className="mt-6 pt-6 border-t border-border px-4 pb-2">
                <div className="flex items-center gap-3">
                  <div className="relative">
                     <img 
                        src={profileData.profile_picture || "https://ui-avatars.com/api/?name=" + profileData.name} 
                        className="w-10 h-10 rounded-full border-2 border-surface shadow-sm" 
                        alt="User"
                     />
                     {isPremium && <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5 shadow-sm"><Crown className="w-3 h-3 text-white" /></div>}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-text truncate">{profileData.name || 'User'}</p>
                    <p className="text-xs text-muted truncate">{profileData.email}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-8 xl:col-span-9">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                  <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-surface rounded-[2rem] shadow-adventure border border-border overflow-hidden"
                >
                  <div className="px-8 py-6 border-b border-border bg-background">
                    <h2 className="text-xl font-bold text-text">Profile Information</h2>
                    <p className="text-sm text-muted">Update your public profile and contact details</p>
                  </div>
                  
                  <form onSubmit={handleProfileUpdate} className="p-8 space-y-8">
                    {/* Profile Picture Section */}
                    <div className="flex flex-col md:flex-row md:items-center gap-6 p-6 rounded-2xl bg-background border border-border">
                        <div className="relative group">
                          <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-surface shadow-md bg-background flex items-center justify-center">
                            {profileData.profile_picture ? (
                              <img src={profileData.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-10 h-10 text-muted" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <label className="text-sm font-bold text-text">Profile Image URL</label>
                          <Input
                            type="url"
                            placeholder="https://example.com/photo.jpg"
                            value={profileData.profile_picture || ''}
                            onChange={(e) => setProfileData(prev => ({ ...prev, profile_picture: e.target.value }))}
                            className="bg-surface border-border text-text focus:ring-primary-500/20"
                          />
                        </div>
                    </div>

                    {/* Grid Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-text flex items-center gap-2"><User className="w-4 h-4 opacity-50"/> Full Name</label>
                        <Input
                          value={profileData.name || ''}
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                          className="py-2.5 bg-surface border-border focus:ring-primary-500 text-text"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-text flex items-center gap-2"><Mail className="w-4 h-4 opacity-50"/> Email Address</label>
                        <Input
                          type="email"
                          value={profileData.email || ''}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          className="py-2.5 bg-surface border-border focus:ring-primary-500 text-text"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-text flex items-center gap-2"><Smartphone className="w-4 h-4 opacity-50"/> Phone Number</label>
                        <Input
                          type="tel"
                          value={profileData.phone || ''}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          className="py-2.5 bg-surface border-border focus:ring-primary-500 text-text"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-text flex items-center gap-2"><MapPin className="w-4 h-4 opacity-50"/> Current City</label>
                        <Input
                          value={profileData.city || ''}
                          onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                          className="py-2.5 bg-surface border-border focus:ring-primary-500 text-text"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-text">Professional Bio</label>
                      <textarea
                        value={profileData.bio || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-text placeholder-muted"
                        placeholder="Write a short summary about your professional background..."
                      />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-border">
                      <Button type="submit" disabled={loading} className="px-8 py-6 rounded-2xl bg-primary-600 shadow-adventure hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <div className="flex items-center gap-2 font-bold">
                          <Save className="w-5 h-5" />
                          {loading ? 'Saving...' : 'Save Changes'}
                        </div>
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-surface rounded-[2rem] shadow-adventure border border-border p-8"
                >
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-text">Communication Preferences</h2>
                    <p className="text-sm text-muted">Control how and when you want to be contacted</p>
                  </div>
                  
                  <div className="grid gap-4">
                    {[
                      { key: 'email_notifications', label: 'General Email Notifications', desc: 'Updates about your applications and profile views' },
                      { key: 'job_alerts', label: 'Smart Job Alerts', desc: 'Personalized notifications for matching opportunities' },
                      { key: 'newsletter_subscription', label: 'Industry Insights Newsletter', desc: 'Weekly digest of top trends and hiring news' }
                    ].map(setting => (
                      <label key={setting.key} className="group flex items-center justify-between p-6 border border-border rounded-2xl hover:border-primary-500 hover:bg-primary-500/10 transition-all cursor-pointer">
                        <div className="max-w-[80%]">
                          <div className="font-bold text-text group-hover:text-primary-400 transition-colors">{setting.label}</div>
                          <div className="text-sm text-muted mt-1">{setting.desc}</div>
                        </div>
                        <div className="relative inline-flex items-center cursor-pointer">
                            <input
                            type="checkbox"
                            checked={profileData[setting.key]}
                            onChange={(e) => {
                                setProfileData(prev => ({ ...prev, [setting.key]: e.target.checked }));
                                handleSettingsUpdate(setting.key);
                            }}
                            className="w-6 h-6 rounded-lg border-border text-primary-500 focus:ring-primary-500 transition-all"
                            />
                        </div>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'account' && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Security Card */}
                  <div className="bg-surface rounded-[2rem] shadow-adventure border border-border p-8">
                    <h2 className="text-xl font-bold text-text mb-6 flex items-center gap-3">
                      <div className="p-2 bg-danger-500/10 rounded-lg text-danger-400"><Lock className="w-5 h-5" /></div>
                      Security Settings
                    </h2>
                    
                    <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-text">Current Password</label>
                        <Input
                          type="password"
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                          placeholder="••••••••"
                          required
                          className="bg-surface border-border focus:ring-primary-500 text-text"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-text">New Password</label>
                        <Input
                          type="password"
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                          placeholder="••••••••"
                          required
                          className="bg-surface border-border focus:ring-primary-500 text-text"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-text">Confirm New Password</label>
                        <Input
                          type="password"
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                          placeholder="••••••••"
                          required
                          className="bg-surface border-border focus:ring-primary-500 text-text"
                        />
                      </div>
                      <Button type="submit" className="w-full py-4 bg-surface hover:bg-secondary-800 text-text border border-border rounded-xl shadow-md transition-all">
                        Update Password
                      </Button>
                    </form>
                  </div>

                  {/* Subscription Card */}
                  <div className="bg-surface rounded-[2rem] shadow-adventure border border-border overflow-hidden">
                    <div className="p-8">
                        <h3 className="text-xl font-bold text-text mb-6">Subscription Status</h3>
                        <div className={`rounded-[2rem] p-8 transition-all ${isPremium ? 'bg-gradient-to-br from-secondary-600 to-primary-600 text-text shadow-adventure' : 'bg-background border border-border'}`}>
                        {isPremium ? (
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4">
                                    <Crown className="w-8 h-8 text-yellow-300" />
                                </div>
                                <div>
                                    <span className="text-xs uppercase tracking-widest font-black opacity-80">Current Plan</span>
                                    <h4 className="text-2xl font-black">Premium Account</h4>
                                    <p className="text-muted text-sm mt-1">Unlimited applications & Priority support</p>
                                </div>
                            </div>
                            <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white px-6 rounded-xl backdrop-blur-sm">
                                Manage Billing
                            </Button>
                            </div>
                        ) : (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto shadow-adventure">
                                    <Shield className="w-8 h-8 text-muted" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-text tracking-tight">Standard Member</h4>
                                    <p className="text-muted text-sm mt-1 max-w-xs mx-auto">Upgrade to access premium job filters and direct recruitment tools.</p>
                                </div>
                                <Button 
                                    onClick={() => navigate('/premium')}
                                    className="px-10 py-4 bg-primary-600 hover:bg-primary-500 text-text font-bold rounded-2xl shadow-adventure transition-all hover:scale-105"
                                >
                                    Get Premium Access
                                </Button>
                            </div>
                        )}
                        </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Settings;