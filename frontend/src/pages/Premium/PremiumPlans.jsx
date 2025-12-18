import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Check, Crown, Star, TrendingUp, X, Zap } from 'lucide-react';
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
      features: ['Browse all job listings', 'Basic search filters', 'Save up to 10 jobs', 'Basic profile'],
      excluded: ['Advanced filters', 'AI recommendations', 'Priority support', 'Resume builder', 'WhatsApp alerts'],
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
      features: ['Everything in Basic', 'Advanced search filters', 'Save up to 50 jobs', 'AI job recommendations', 'Resume builder', 'Application tracking', 'Email & SMS notifications', 'Priority customer support'],
      excluded: ['Early access to jobs', 'Ad-free experience', 'WhatsApp alerts', 'Direct company connections'],
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
      features: ['Everything in Professional', 'Early access to new jobs', 'Ad-free experience', 'Save unlimited jobs', 'WhatsApp job alerts', 'Direct company messaging', 'Resume optimization', 'Interview prep tools', 'Career counseling', 'VIP customer support'],
      excluded: [],
      color: 'purple',
      popular: false,
    },
  ];

  const handlePlanSelect = (plan) => {
    if (!user) return navigate('/login');
    setSelectedPlan(plan.id);
    plan.price === 0 ? navigate('/dashboard') : navigate(`/premium/checkout?plan=${plan.id}&billing=${billingCycle}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 md:py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header - Scaled for Mobile/Desktop */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold mb-4">
            <Zap size={14} className="fill-current" />
            <span>PRICING PLANS</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            Choose Your <span className="text-purple-600">Perfect Plan</span>
          </h1>
          <p className="text-sm md:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto px-4">
            Unlock premium features and accelerate your job search with our tailored plans.
          </p>
        </div>

        {/* Billing Switcher */}
        <div className="flex justify-center mb-10 md:mb-14">
          <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-xl">
            {['monthly', 'yearly'].map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className={`px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
                  billingCycle === cycle 
                    ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-white shadow-md' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                {cycle === 'yearly' && <span className="ml-1 text-[10px] text-green-500 font-black">SAVE 70%</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Plans Grid - Maintain same layout structure */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-20 items-stretch">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;
            
            return (
              <div key={plan.id} className={`flex flex-col rounded-3xl p-6 md:p-8 border-2 transition-all ${
                isPopular 
                  ? 'bg-gray-900 border-purple-500 shadow-2xl scale-100 md:scale-105 z-10' 
                  : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
              }`}>
                {isPopular && (
                  <div className="text-center mb-4">
                    <span className="bg-purple-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${isPopular ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-600'}`}>
                  <Icon size={24} />
                </div>

                <h3 className={`text-xl font-black mb-1 ${isPopular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{plan.name}</h3>
                <p className={`text-xs mb-6 ${isPopular ? 'text-gray-400' : 'text-gray-500'}`}>{plan.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black ${isPopular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>₹{plan.price}</span>
                    <span className={`text-xs ${isPopular ? 'text-gray-500' : 'text-gray-400'}`}>/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  {plan.originalPrice && (
                    <span className="text-xs line-through text-red-500 font-bold">₹{plan.originalPrice}</span>
                  )}
                </div>

                <div className="flex-grow space-y-3 mb-8">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span className={`text-xs font-medium ${isPopular ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'}`}>{feat}</span>
                    </div>
                  ))}
                  {plan.excluded.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 opacity-40">
                      <X size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className={`text-xs line-through ${isPopular ? 'text-gray-500' : 'text-gray-500'}`}>{feat}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handlePlanSelect(plan)}
                  className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest ${
                    isPopular ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200'
                  }`}
                >
                  {plan.price === 0 ? 'Start Free' : 'Select Plan'}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Responsive Table */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 md:p-10 mb-20 overflow-hidden">
          <h2 className="text-xl md:text-2xl font-black text-center mb-8 text-gray-900 dark:text-white">Feature Comparison</h2>
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b dark:border-gray-800 text-[10px] md:text-xs text-gray-400 uppercase font-black">
                  <th className="text-left py-4">Features</th>
                  <th className="text-center">Basic</th>
                  <th className="text-center">Pro</th>
                  <th className="text-center">Premium</th>
                </tr>
              </thead>
              <tbody className="text-xs md:text-sm">
                {[
                  ['Job Listings', true, true, true],
                  ['AI Recommendations', false, true, true],
                  ['Early Access', false, false, true],
                  ['WhatsApp Alerts', false, false, true],
                  ['Resume Builder', false, true, true]
                ].map(([label, f1, f2, f3], i) => (
                  <tr key={i} className="border-b dark:border-gray-800/50">
                    <td className="py-5 font-bold text-gray-700 dark:text-gray-300">{label}</td>
                    <td className="text-center">{f1 ? <Check size={16} className="mx-auto text-green-500" /> : '—'}</td>
                    <td className="text-center">{f2 ? <Check size={16} className="mx-auto text-blue-500" /> : '—'}</td>
                    <td className="text-center">{f3 ? <Check size={16} className="mx-auto text-purple-500" /> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Final Compact CTA */}
        <div className="bg-purple-600 rounded-[2rem] p-8 md:p-16 text-center text-white">
          <h2 className="text-2xl md:text-4xl font-black mb-4">Supercharge Your Career</h2>
          <p className="text-sm md:text-lg opacity-80 mb-8 max-w-xl mx-auto">Found your dream job today with Fast Hire Mela.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => handlePlanSelect(plans[1])} className="bg-white text-purple-600 font-black px-10 py-4 text-xs rounded-xl">Start Trial</Button>
            <Button onClick={() => navigate('/contact')} className="border border-white/40 text-white font-black px-10 py-4 text-xs rounded-xl hover:bg-white/10">Contact Support</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPlans;