import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Check, Crown, Star, Zap, Shield, HeadphonesIcon, TrendingUp } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const PremiumPlans = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Perfect for job seekers starting out',
      icon: Star,
      price: billingCycle === 'monthly' ? 0 : 0,
      features: [
        'Browse all job listings',
        'Basic search filters',
        'Save up to 10 jobs',
        // 'Email notifications',
        'Basic profile',
      ],
      excluded: [
        'Advanced filters',
        'AI recommendations',
        'Priority support',
        'Resume builder',
        'WhatsApp alerts',
      ],
      color: 'gray',
      popular: false,
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'For serious job seekers',
      icon: TrendingUp,
      price: billingCycle === 'monthly' ? 99 : 499,
      originalPrice: billingCycle === 'monthly' ? 399 : 2999,
      features: [
        'Everything in Basic',
        'Advanced search filters',
        'Save up to 50 jobs',
        'AI job recommendations',
        'Resume builder',
        'Application tracking',
        'Email & SMS notifications',
        'Priority customer support',
      ],
      excluded: [
        'Early access to jobs',
        'Ad-free experience',
        'WhatsApp alerts',
        'Direct company connections',
      ],
      color: 'blue',
      popular: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Ultimate job hunting experience',
      icon: Crown,
      price: billingCycle === 'monthly' ? 199 : 999,
      originalPrice: billingCycle === 'monthly' ? 799 : 9999,
      features: [
        'Everything in Professional',
        'Early access to new jobs (24h before others)',
        'Ad-free experience',
        'Save unlimited jobs',
        'WhatsApp job alerts',
        'Direct company messaging',
        'Resume scoring & optimization',
        'Interview preparation tools',
        'Career counseling sessions',
        'VIP customer support',
      ],
      excluded: [],
      color: 'purple',
      popular: false,
    },
  ];

  const handlePlanSelect = (plan) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setSelectedPlan(plan.id);
    
    if (plan.price === 0) {
      navigate('/dashboard');
    } else {
      navigate(`/premium/checkout?plan=${plan.id}&billing=${billingCycle}`);
    }
  };

  // Common styles to fix text visibility inside cards
  const cardTextStyle = {
    color: '#fff',
    textShadow: '0 1px 2px rgba(0,0,0,0.4)',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-full">
              <Crown className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Unlock premium features and accelerate your job search with our tailored plans
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all relative ${
                  billingCycle === 'yearly'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save 70%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular
                    ? 'border-2 border-purple-500 shadow-xl transform scale-105 bg-gradient-to-tr from-purple-700 to-blue-700'
                    : 'border border-gray-200 dark:border-gray-700 bg-gray-800 dark:bg-gray-900'
                }`}
                style={cardTextStyle} // Apply the text color & shadow here
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div
                      className={`inline-flex p-3 rounded-full mb-4 ${
                        plan.color === 'purple'
                          ? 'bg-purple-100 dark:bg-purple-900'
                          : plan.color === 'blue'
                          ? 'bg-blue-100 dark:bg-blue-900'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      <Icon
                        className={`h-8 w-8 ${
                          plan.color === 'purple'
                            ? 'text-purple-600 dark:text-purple-400'
                            : plan.color === 'blue'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      />
                    </div>
                    <h3 className="text-2xl font-bold mb-2" style={cardTextStyle}>
                      {plan.name}
                    </h3>
                    <p className="mb-6" style={cardTextStyle}>
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div className="mb-6">
                      {plan.originalPrice && (
                        <span className="line-through text-lg opacity-70" style={{...cardTextStyle, color: '#d1d5db'}}>
                          ₹{plan.originalPrice}
                        </span>
                      )}
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold" style={cardTextStyle}>
                          ₹{plan.price}
                        </span>
                        <span className="ml-2 opacity-80" style={cardTextStyle}>
                          /{billingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}

                    {plan.excluded.map((feature, index) => (
                      <div key={index} className="flex items-start opacity-50">
                        <div className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5 flex items-center justify-center">
                          <div className="h-4 w-0.5 bg-gray-400"></div>
                        </div>
                        <span className="line-through opacity-60">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handlePlanSelect(plan)}
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                        : plan.color === 'purple'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : plan.color === 'blue'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                    disabled={selectedPlan === plan.id}
                  >
                    {plan.price === 0 ? 'Get Started Free' : 'Choose Plan'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Feature Comparison
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-6 text-gray-900 dark:text-white">Feature</th>
                  <th className="text-center py-4 px-6 text-gray-900 dark:text-white">Basic</th>
                  <th className="text-center py-4 px-6 text-gray-900 dark:text-white">Professional</th>
                  <th className="text-center py-4 px-6 text-gray-900 dark:text-white">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="py-4 px-6 text-gray-700 dark:text-gray-300">Job Listings</td>
                  <td className="py-4 px-6 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-700 dark:text-gray-300">Advanced Filters</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-gray-400">—</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-700 dark:text-gray-300">AI Recommendations</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-gray-400">—</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-700 dark:text-gray-300">Early Job Access</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-gray-400">—</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-gray-400">—</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-700 dark:text-gray-300">WhatsApp Alerts</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-gray-400">—</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-gray-400">—</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-700 dark:text-gray-300">Resume Builder</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-gray-400">—</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I change my plan later?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Professional and Premium plans come with a 7-day free trial. No credit card required.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We accept all major credit cards, debit cards, UPI, and net banking.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes, you can cancel your subscription anytime. You'll continue to have access until the end of your billing period.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Supercharge Your Job Search?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals who found their dream job with Fast Hire Mela
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => handlePlanSelect(plans[1])}
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              Start Free Trial
            </Button>
            <Button
              onClick={() => navigate('/contact')}
              className="border-2 border-white text-white hover:bg-white hover:text-purple-600"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPlans;
