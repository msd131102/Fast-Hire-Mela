import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Gift, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const Referral = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: '',
    referred_users: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [isEligible, setIsEligible] = useState(false);

  useEffect(() => {
    const referredList = formData.referred_users
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    setReferralCount(referredList.length);
    setIsEligible(referredList.length >= 20);
  }, [formData.referred_users]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email || !formData.mobile || !formData.referred_users) {
      setError('All fields are required');
      return;
    }

    if (referralCount < 20) {
      setError('Minimum 20 referred users required to unlock Premium Features');
      return;
    }

    setLoading(true);

    try {
      const { referralAPI } = await import('../../services/api.js');
      const data = await referralAPI.submitReferral({
        ...formData,
        referred_users: formData.referred_users
          .split('\n')
          .map(item => item.trim())
          .filter(item => item.length > 0)
      });

      if (data.success) {
        setSuccess(data.message || 'Referral submitted successfully! You are eligible for Free Premium Features.');
        // Clear form
        setFormData(prev => ({
          ...prev,
          mobile: '',
          referred_users: ''
        }));
      } else {
        setError(data.message || 'Failed to submit referral');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Gift className="h-12 w-12 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎉 Refer 20+ Users & Unlock FREE Premium Features
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share FastHireMela with your friends and help them find their dream jobs while you enjoy Premium features absolutely FREE!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Referral Form */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-600" />
              Submit Your Referrals
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your mobile number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referred Users (Names or Emails)
                </label>
                <textarea
                  name="referred_users"
                  value={formData.referred_users}
                  onChange={handleInputChange}
                  rows="8"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter referred user names or emails (one per line)&#10;Example:&#10;user1@gmail.com&#10;user2@gmail.com&#10;user3@gmail.com"
                  required
                />
              </div>

              {/* Referral Status */}
              <div className={`p-4 rounded-lg ${isEligible ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center">
                  {isEligible ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  )}
                  <span className={`font-medium ${isEligible ? 'text-green-700' : 'text-yellow-700'}`}>
                    {referralCount}/20 referrals submitted
                    {isEligible ? ' - Eligible for Premium!' : ' - Need 20 referrals'}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-red-700">{error}</span>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-700">{success}</span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className={`w-full ${isEligible ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'} text-white font-semibold py-3 rounded-lg transition-colors`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  isEligible ? '🎉 Submit & Unlock Premium' : 'Submit Referrals'
                )}
              </Button>
            </form>
          </Card>

          {/* Benefits Card */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              🎁 Premium Benefits You'll Unlock
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Unlimited Job Applications</h3>
                  <p className="text-gray-600">Apply to unlimited jobs without restrictions</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Priority Job Alerts</h3>
                  <p className="text-gray-600">Get instant notifications for matching jobs</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Resume Highlighting</h3>
                  <p className="text-gray-600">Your profile gets priority visibility</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Advanced Analytics</h3>
                  <p className="text-gray-600">Track your job search progress</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">No Ads Experience</h3>
                  <p className="text-gray-600">Clean, ad-free interface</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">How It Works:</h3>
              <ol className="space-y-2 text-sm text-purple-700">
                <li>1. Refer 20+ friends using their names or emails</li>
                <li>2. Submit the referral form with all details</li>
                <li>3. Admin team verifies your referrals</li>
                <li>4. Get instant Premium access once approved</li>
              </ol>
            </div>
          </Card>
        </div>

        {/* Support Section */}
        <Card className="mt-8 p-6 bg-blue-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="text-gray-700">
            <p className="mb-2">If you face any issues with referrals, contact our support team:</p>
            <p className="font-medium">📧 fasthiremela@gmail.com</p>
            <p className="text-sm text-gray-600 mt-2">We typically respond within 24 hours.</p>
          </div>
        </Card>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <Link to="/dashboard">
            <Button variant="outline" className="border-gray-300 text-gray-700 px-6 py-3 rounded-lg">
              ← Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Referral;
