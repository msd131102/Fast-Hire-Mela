import React, { useState, useEffect } from 'react';
import { Check, X, Star, Crown, Zap, Shield, Headphones, Briefcase, TrendingUp } from 'lucide-react';
import { premiumAPI, paymentAPI } from '../../services/api.js';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const Premium = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPlans();
    fetchSubscriptionStatus();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await premiumAPI.getPlans();
      setPlans(response.data || []);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await premiumAPI.getSubscriptionStatus();
      setSubscriptionStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
    }
  };

  const handleSubscribe = async (planId) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    setProcessing(true);
    try {
      const plan = plans.find(p => p.id === planId);
      
      if (plan.price === 0) {
        // Free plan - just update subscription
        await premiumAPI.createSubscription(planId);
        fetchSubscriptionStatus();
        return;
      }

      // Create payment order
      const orderResponse = await paymentAPI.createOrder(plan.price * 100, 'INR');
      
      // Initialize Razorpay (you'll need to add Razorpay script to your index.html)
      const options = {
        key: 'rzp_test_YOUR_KEY_HERE', // Replace with your Razorpay key
        amount: plan.price * 100,
        currency: 'INR',
        name: 'Fast Hire Mela',
        description: `${plan.name} Plan Subscription`,
        order_id: orderResponse.data.id,
        handler: async (response) => {
          // Verify payment
          await paymentAPI.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
          
          // Create subscription
          await premiumAPI.createSubscription(planId);
          fetchSubscriptionStatus();
          setProcessing(false);
        },
        prefill: {
          name: user?.name,
          email: user?.email
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Subscription failed:', error);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Crown className="h-16 w-16 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Unlock Your Career Potential
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan to accelerate your job search and stand out from the competition
          </p>
        </div>

        {/* Current Subscription Status */}
        {subscriptionStatus?.isActive && (
          <Card className="mb-8 bg-green-50 border-green-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">
                      Active {subscriptionStatus.plan} Subscription
                    </h3>
                    <p className="text-green-700">
                      Valid until {new Date(subscriptionStatus.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => premiumAPI.cancelSubscription()}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${plan.popular ? 'ring-2 ring-blue-500 transform scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                    <span className="text-gray-600 ml-2">/{plan.duration}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-start opacity-60">
                      <X className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-500">{limitation}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  variant={plan.popular ? 'primary' : 'outline'}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={processing || (subscriptionStatus?.plan === plan.name && subscriptionStatus?.isActive)}
                >
                  {subscriptionStatus?.plan === plan.name && subscriptionStatus?.isActive
                    ? 'Current Plan'
                    : plan.price === 0
                    ? 'Get Started'
                    : 'Subscribe Now'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Compare Features</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-6">Feature</th>
                  <th className="text-center py-4 px-6">Basic</th>
                  <th className="text-center py-4 px-6">Professional</th>
                  <th className="text-center py-4 px-6">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6">Job Applications</td>
                  <td className="text-center py-4 px-6">Limited</td>
                  <td className="text-center py-4 px-6">Unlimited</td>
                  <td className="text-center py-4 px-6">Unlimited</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6">Early Job Access</td>
                  <td className="text-center py-4 px-6">-</td>
                  <td className="text-center py-4 px-6">24 hours</td>
                  <td className="text-center py-4 px-6">72 hours</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6">Resume Insights</td>
                  <td className="text-center py-4 px-6">-</td>
                  <td className="text-center py-4 px-6">✓</td>
                  <td className="text-center py-4 px-6">✓</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6">AI Recommendations</td>
                  <td className="text-center py-4 px-6">-</td>
                  <td className="text-center py-4 px-6">Basic</td>
                  <td className="text-center py-4 px-6">Advanced</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6">WhatsApp Alerts</td>
                  <td className="text-center py-4 px-6">-</td>
                  <td className="text-center py-4 px-6">-</td>
                  <td className="text-center py-4 px-6">✓</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6">Priority Support</td>
                  <td className="text-center py-4 px-6">-</td>
                  <td className="text-center py-4 px-6">Business hours</td>
                  <td className="text-center py-4 px-6">24/7</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Faster Job Search</h3>
            <p className="text-gray-600">
              Get early access to jobs and apply before others with our premium features
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Career Growth</h3>
            <p className="text-gray-600">
              AI-powered recommendations and insights to help you make better career decisions
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Stand Out</h3>
            <p className="text-gray-600">
              Premium profile badge and increased visibility to recruiters
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I change my plan anytime?</h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards, debit cards, UPI, and net banking through our secure payment gateway.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Is there a money-back guarantee?</h3>
              <p className="text-gray-600">
                Yes, we offer a 7-day money-back guarantee if you're not satisfied with our premium features.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-gray-600">
                Absolutely! You can cancel your subscription anytime, and you'll continue to have access until the end of your billing period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Premium;
