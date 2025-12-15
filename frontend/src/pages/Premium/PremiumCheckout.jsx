import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, CreditCard, Shield, ArrowLeft, Crown, Star, TrendingUp, Bell, Mail } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';

const PremiumCheckout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [billing, setBilling] = useState('monthly');
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }

    // Get plan and billing from URL params with defaults
    const planParam = searchParams.get('plan') || 'professional';
    const billingParam = searchParams.get('billing') || 'monthly';
    
    setPlan(planParam);
    setBilling(billingParam);

    // Set email from user data
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user, navigate, searchParams]);

  const planDetails = {
    basic: {
      name: 'Basic',
      price: 0,
      icon: Star,
      color: 'gray',
      description: 'Perfect for job seekers starting out'
    },
    professional: {
      name: 'Professional',
      price: billing === 'monthly' ? 99 : 499,
      originalPrice: billing === 'monthly' ? 399 : 2999,
      icon: TrendingUp,
      color: 'blue',
      description: 'For serious job seekers'
    },
    premium: {
      name: 'Premium',
      price: billing === 'monthly' ? 199 : 999,
      originalPrice: billing === 'monthly' ? 799 : 9999,
      icon: Crown,
      color: 'purple',
      description: 'Ultimate job hunting experience'
    }
  };

  const currentPlan = plan ? planDetails[plan] : null;

  const handleNotifyMe = (e) => {
    e.preventDefault();
    // Here you would typically send the email to your backend
    // For now, we'll just show a success message
    alert('Thank you! We will notify you when our payment system is ready.');
  };

  if (!user || !currentPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const Icon = currentPlan.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/premium/plans')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Plans
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Checkout
            </h1>
            <p className="text-xl text-gray-600">
              Complete your {currentPlan.name} plan subscription
            </p>
          </div>
        </div>

        {/* Coming Soon Card */}
        <Card className="mb-8 border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mb-6">
                <Clock className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Coming Soon! 🚀
              </h2>
              
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                We're working hard to bring you the best payment experience. Our secure checkout system will be available very soon with multiple payment options including:
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <CreditCard className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <span className="text-sm text-gray-700">Credit Cards</span>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-6 h-6 bg-purple-600 rounded mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">UPI</span>
                  </div>
                  <span className="text-sm text-gray-700">UPI</span>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-6 h-6 bg-green-600 rounded mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">NB</span>
                  </div>
                  <span className="text-sm text-gray-700">Net Banking</span>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <span className="text-sm text-gray-700">Secure</span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 mb-6 max-w-md mx-auto">
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">100% Secure Payments</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Plan Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Selected Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${
                  currentPlan.color === 'purple' ? 'bg-purple-100' :
                  currentPlan.color === 'blue' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    currentPlan.color === 'purple' ? 'text-purple-600' :
                    currentPlan.color === 'blue' ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{currentPlan.name}</h3>
                  <p className="text-gray-600">{currentPlan.description}</p>
                </div>
              </div>
              <div className="text-right">
                {currentPlan.originalPrice && (
                  <span className="text-lg text-gray-400 line-through block">
                    ₹{currentPlan.originalPrice}
                  </span>
                )}
                <div className="text-2xl font-bold text-gray-900">
                  ₹{currentPlan.price}
                  <span className="text-sm font-normal text-gray-600">
                    /{billing === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notify Me Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Get Notified When We Launch</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNotifyMe} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="updates"
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  defaultChecked
                />
                <label htmlFor="updates" className="text-sm text-gray-600">
                  Send me updates about the launch and exclusive offers
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notify Me When Available
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Alternative Actions */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            In the meantime, you can:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              Go to Dashboard
            </Button>
            <Button
              onClick={() => navigate('/jobs')}
              className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Browse Jobs
            </Button>
          </div>
        </div>

        {/* Support Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Have questions? Contact us at{' '}
            <a href="mailto:support@fasthiremela.com" className="text-purple-600 hover:text-purple-700">
              support@fasthiremela.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumCheckout;
