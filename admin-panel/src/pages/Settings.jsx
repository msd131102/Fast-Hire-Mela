import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import {
  Settings as SettingsIcon,
  Bell,
  ShieldCheck,
  CreditCard,
  Globe,
  Check,
  X,
  Save,
  RefreshCw
} from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    site: {
      name: 'Fast Hire Mela',
      description: 'Find your dream job instantly',
      logo: '',
      favicon: '',
      contactEmail: 'admin@fasthiremela.com',
      supportPhone: '+1-555-0123',
      address: '123 Business St, City, State 12345'
    },
    features: {
      jobApplications: true,
      jobAlerts: true,
      premiumFeatures: true,
      socialLogin: true,
      whatsappNotifications: true,
      emailNotifications: true
    },
    limits: {
      freeJobPosts: 3,
      premiumJobPosts: 50,
      maxFileSize: 5,
      sessionTimeout: 24
    },
    payment: {
      currency: 'USD',
      monthlyPrice: 9.99,
      yearlyPrice: 99.99,
      trialDays: 7
    },
    seo: {
      metaTitle: 'Fast Hire Mela - Find Jobs Instantly',
      metaDescription: 'Discover thousands of job opportunities and advance your career',
      keywords: 'jobs, careers, employment, hiring, recruitment',
      ogImage: ''
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('site');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: 'site', label: 'Site Settings', icon: SettingsIcon },
    { id: 'features', label: 'Features', icon: Bell },
    { id: 'limits', label: 'Limits & Usage', icon: ShieldCheck },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'seo', label: 'SEO & Social', icon: Globe }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure platform settings and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchSettings}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <Check className="h-5 w-5" />
            ) : (
              <X className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Site Settings */}
        {activeTab === 'site' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Configure basic site information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Name
                  </label>
                  <Input
                    value={settings.site.name}
                    onChange={(e) => handleInputChange('site', 'name', e.target.value)}
                    placeholder="Fast Hire Mela"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Description
                  </label>
                  <textarea
                    value={settings.site.description}
                    onChange={(e) => handleInputChange('site', 'description', e.target.value)}
                    placeholder="Find your dream job instantly"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <Input
                    type="email"
                    value={settings.site.contactEmail}
                    onChange={(e) => handleInputChange('site', 'contactEmail', e.target.value)}
                    placeholder="admin@fasthiremela.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Support Phone
                  </label>
                  <Input
                    value={settings.site.supportPhone}
                    onChange={(e) => handleInputChange('site', 'supportPhone', e.target.value)}
                    placeholder="+1-555-0123"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assets</CardTitle>
                <CardDescription>Upload logos and favicons</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo URL
                  </label>
                  <Input
                    value={settings.site.logo}
                    onChange={(e) => handleInputChange('site', 'logo', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Favicon URL
                  </label>
                  <Input
                    value={settings.site.favicon}
                    onChange={(e) => handleInputChange('site', 'favicon', e.target.value)}
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={settings.site.address}
                    onChange={(e) => handleInputChange('site', 'address', e.target.value)}
                    placeholder="123 Business St, City, State 12345"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features */}
        {activeTab === 'features' && (
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(settings.features).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <p className="text-xs text-gray-500">
                        {key === 'jobApplications' && 'Allow users to apply for jobs directly'}
                        {key === 'jobAlerts' && 'Send job alert notifications to users'}
                        {key === 'premiumFeatures' && 'Enable premium subscription features'}
                        {key === 'socialLogin' && 'Allow login with Google, Facebook, etc.'}
                        {key === 'whatsappNotifications' && 'Send job alerts via WhatsApp'}
                        {key === 'emailNotifications' && 'Send email notifications to users'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleInputChange('features', key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Limits */}
        {activeTab === 'limits' && (
          <Card>
            <CardHeader>
              <CardTitle>Limits & Usage</CardTitle>
              <CardDescription>Configure platform limits and usage restrictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Free User Job Posts
                  </label>
                  <Input
                    type="number"
                    value={settings.limits.freeJobPosts}
                    onChange={(e) => handleInputChange('limits', 'freeJobPosts', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Premium User Job Posts
                  </label>
                  <Input
                    type="number"
                    value={settings.limits.premiumJobPosts}
                    onChange={(e) => handleInputChange('limits', 'premiumJobPosts', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max File Size (MB)
                  </label>
                  <Input
                    type="number"
                    value={settings.limits.maxFileSize}
                    onChange={(e) => handleInputChange('limits', 'maxFileSize', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Timeout (hours)
                  </label>
                  <Input
                    type="number"
                    value={settings.limits.sessionTimeout}
                    onChange={(e) => handleInputChange('limits', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment */}
        {activeTab === 'payment' && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure payment options and pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={settings.payment.currency}
                    onChange={(e) => handleInputChange('payment', 'currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Price
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.payment.monthlyPrice}
                    onChange={(e) => handleInputChange('payment', 'monthlyPrice', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yearly Price
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.payment.yearlyPrice}
                    onChange={(e) => handleInputChange('payment', 'yearlyPrice', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trial Days
                  </label>
                  <Input
                    type="number"
                    value={settings.payment.trialDays}
                    onChange={(e) => handleInputChange('payment', 'trialDays', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SEO */}
        {activeTab === 'seo' && (
          <Card>
            <CardHeader>
              <CardTitle>SEO & Social</CardTitle>
              <CardDescription>Configure SEO and social media settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title
                </label>
                <Input
                  value={settings.seo.metaTitle}
                  onChange={(e) => handleInputChange('seo', 'metaTitle', e.target.value)}
                  placeholder="Fast Hire Mela - Find Jobs Instantly"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  value={settings.seo.metaDescription}
                  onChange={(e) => handleInputChange('seo', 'metaDescription', e.target.value)}
                  placeholder="Discover thousands of job opportunities and advance your career"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keywords
                </label>
                <Input
                  value={settings.seo.keywords}
                  onChange={(e) => handleInputChange('seo', 'keywords', e.target.value)}
                  placeholder="jobs, careers, employment, hiring, recruitment"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OG Image URL
                </label>
                <Input
                  value={settings.seo.ogImage}
                  onChange={(e) => handleInputChange('seo', 'ogImage', e.target.value)}
                  placeholder="https://example.com/og-image.jpg"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Settings;
