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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warning-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text pb-12 font-game">
      {/* Pixel Art Header */}
      <div className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 mb-16 border-b border-border overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/src/assets/pixel_premium_bg.png" 
            alt="Premium Background" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = 'https://picsum.photos/1920/1080?random=3'; // Fallback
            }}
          />
          <div className="absolute inset-0 bg-background/70" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-warning-500/20 border border-warning-500 rounded-3xl flex items-center justify-center shadow-adventure">
              <Crown className="h-10 w-10 text-warning-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-pixel text-text mb-6 tracking-widest drop-shadow-md">
            Unlock Guild Premium
          </h1>
          <p className="text-xl text-muted max-w-3xl mx-auto font-game bg-surface/80 p-4 border border-border rounded-2xl shadow-adventure inline-block">
            Choose the perfect plan to accelerate your questing and stand out from the competition
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Current Subscription Status */}
        {subscriptionStatus?.isActive && (
          <Card className="mb-12 bg-surface border border-success-500 shadow-adventure rounded-[2rem]">
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-success-500 border border-border p-3 rounded-2xl shadow-adventure">
                    <Check className="h-8 w-8 text-text" />
                  </div>
                  <div>
                    <h3 className="text-xl font-pixel text-success-500">
                      Active {subscriptionStatus.plan} Status
                    </h3>
                    <p className="text-muted font-game mt-2">
                      Valid until {new Date(subscriptionStatus.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => premiumAPI.cancelSubscription()}
                  className="border-danger-500 text-danger-500 hover:bg-danger-500 hover:text-text border font-bold text-sm"
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
              className={`relative bg-surface border border-border rounded-[2rem] transition-all ${plan.popular ? 'border-warning-500 shadow-adventure transform md:-translate-y-4' : 'hover:border-primary-500 shadow-adventure hover:-translate-y-2'}`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                  <span className="bg-warning-500 text-text px-4 py-2 border border-border rounded-full font-bold text-[10px] uppercase tracking-widest shadow-adventure">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="p-8">
                <div className="text-center mb-8 border-b border-border pb-8">
                  <h3 className="text-2xl font-pixel text-text mb-4">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-game text-warning-500">₹{plan.price}</span>
                    <span className="text-muted ml-2 font-game text-xl">/{plan.duration}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8 font-game text-lg">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <Check className="h-6 w-6 text-success-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-text">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-start opacity-60">
                      <X className="h-6 w-6 text-danger-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-muted/70">{limitation}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full font-bold tracking-widest uppercase rounded-2xl transition-all border ${plan.popular ? 'bg-warning-500 hover:bg-warning-400 border-border text-text shadow-adventure' : 'bg-surface border-border hover:bg-primary-500 text-text'}`}
                  variant={plan.popular ? 'primary' : 'outline'}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={processing || (subscriptionStatus?.plan === plan.name && subscriptionStatus?.isActive)}
                >
                  {subscriptionStatus?.plan === plan.name && subscriptionStatus?.isActive
                    ? 'Current Plan'
                    : plan.price === 0
                    ? 'Start Quest'
                    : 'Subscribe'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="bg-surface border border-border rounded-[2rem] shadow-adventure p-8 mb-16 overflow-hidden">
          <h2 className="text-3xl font-pixel text-center mb-12 text-text tracking-widest">Compare Guild Plans</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-text font-bold text-[10px]">
                  <th className="text-left py-4 px-6 uppercase tracking-widest">Feature</th>
                  <th className="text-center py-4 px-6 uppercase tracking-widest">Basic</th>
                  <th className="text-center py-4 px-6 uppercase tracking-widest text-primary-500">Pro</th>
                  <th className="text-center py-4 px-6 uppercase tracking-widest text-warning-500">Master</th>
                </tr>
              </thead>
              <tbody className="text-lg font-game">
                <tr className="border-b border-border hover:bg-background text-text transition-colors">
                  <td className="py-4 px-6">Quest Applications</td>
                  <td className="text-center py-4 px-6 text-muted">Limited</td>
                  <td className="text-center py-4 px-6 text-primary-400">Unlimited</td>
                  <td className="text-center py-4 px-6 text-warning-400">Unlimited</td>
                </tr>
                <tr className="border-b border-border hover:bg-background text-text transition-colors">
                  <td className="py-4 px-6">Early Access</td>
                  <td className="text-center py-4 px-6 text-muted">-</td>
                  <td className="text-center py-4 px-6 text-primary-400">24 hours</td>
                  <td className="text-center py-4 px-6 text-warning-400">72 hours</td>
                </tr>
                <tr className="border-b border-border hover:bg-background text-text transition-colors">
                  <td className="py-4 px-6">Profile Insights</td>
                  <td className="text-center py-4 px-6 text-muted">-</td>
                  <td className="text-center py-4 px-6 text-primary-400">✓</td>
                  <td className="text-center py-4 px-6 text-warning-400">✓</td>
                </tr>
                <tr className="border-b border-border hover:bg-background text-text transition-colors">
                  <td className="py-4 px-6">Magic Recommendations</td>
                  <td className="text-center py-4 px-6 text-muted">-</td>
                  <td className="text-center py-4 px-6 text-primary-400">Basic</td>
                  <td className="text-center py-4 px-6 text-warning-400">Advanced</td>
                </tr>
                <tr className="border-b border-border hover:bg-background text-text transition-colors">
                  <td className="py-4 px-6">Instant Alerts</td>
                  <td className="text-center py-4 px-6 text-muted">-</td>
                  <td className="text-center py-4 px-6 text-muted">-</td>
                  <td className="text-center py-4 px-6 text-warning-400">✓</td>
                </tr>
                <tr className="hover:bg-background text-text transition-colors">
                  <td className="py-4 px-6">Priority Support</td>
                  <td className="text-center py-4 px-6 text-muted">-</td>
                  <td className="text-center py-4 px-6 text-primary-400">Guild Hours</td>
                  <td className="text-center py-4 px-6 text-warning-400">24/7</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center bg-surface border-4 border-border p-6 shadow-pixel hover:-translate-y-2 transition-transform">
            <div className="bg-background border-4 border-border p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-pixel-sm">
              <Zap className="h-10 w-10 text-primary-500" />
            </div>
            <h3 className="text-xl font-pixel mb-4 text-text">Swift Quests</h3>
            <p className="text-muted font-game text-lg">
              Get early access to quests and apply before others with our premium magic.
            </p>
          </div>
          <div className="text-center bg-surface border border-border rounded-3xl p-6 shadow-adventure hover:-translate-y-2 transition-transform">
            <div className="bg-background border border-border rounded-2xl p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-adventure">
              <TrendingUp className="h-10 w-10 text-success-500" />
            </div>
            <h3 className="text-xl font-pixel mb-4 text-text">Level Up</h3>
            <p className="text-muted font-game text-lg">
              Magic-powered recommendations and insights to help you make better decisions.
            </p>
          </div>
          <div className="text-center bg-surface border border-border rounded-3xl p-6 shadow-adventure hover:-translate-y-2 transition-transform">
            <div className="bg-background border border-border rounded-2xl p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-adventure">
              <Shield className="h-10 w-10 text-warning-500" />
            </div>
            <h3 className="text-xl font-pixel mb-4 text-text">Stand Out</h3>
            <p className="text-muted font-game text-lg">
              Premium badge and increased visibility to guild masters.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-surface border border-border rounded-[2rem] shadow-adventure p-8">
          <h2 className="text-3xl font-pixel text-center mb-12 text-text tracking-widest">Tavern Rumors (FAQ)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-background border border-border rounded-2xl p-6 shadow-adventure hover:border-primary-500 transition-all">
              <h3 className="text-lg font-pixel mb-4 text-text">Can I change my plan anytime?</h3>
              <p className="text-muted font-game text-lg">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div className="bg-background border border-border rounded-2xl p-6 shadow-adventure hover:border-primary-500 transition-all">
              <h3 className="text-lg font-pixel mb-4 text-text">What payment methods do you accept?</h3>
              <p className="text-muted font-game text-lg">
                We accept all major credit cards, debit cards, UPI, and net banking through our secure payment gateway.
              </p>
            </div>
            <div className="bg-background border border-border rounded-2xl p-6 shadow-adventure hover:border-primary-500 transition-all">
              <h3 className="text-lg font-pixel mb-4 text-text">Is there a money-back guarantee?</h3>
              <p className="text-muted font-game text-lg">
                Yes, we offer a 7-day money-back guarantee if you're not satisfied with our premium features.
              </p>
            </div>
            <div className="bg-background border border-border rounded-2xl p-6 shadow-adventure hover:border-primary-500 transition-all">
              <h3 className="text-lg font-pixel mb-4 text-text">Can I cancel my subscription anytime?</h3>
              <p className="text-muted font-game text-lg">
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
