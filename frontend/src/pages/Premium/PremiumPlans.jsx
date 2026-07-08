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
      name: 'Basic Pass',
      description: 'Perfect for new adventurers',
      icon: Star,
      price: billingCycle === 'monthly' ? 0 : 0,
      features: ['Browse all quests', 'Basic search filters', 'Save up to 10 quests', 'Basic profile'],
      excluded: ['Advanced magic filters', 'AI recommendations', 'Priority raven support', 'Profile builder', 'Guild alerts'],
      color: 'gray',
      popular: false,
    },
    {
      id: 'professional',
      name: 'Pro Pass',
      description: 'For serious bounty hunters',
      icon: TrendingUp,
      price: billingCycle === 'monthly' ? 99 : 499,
      originalPrice: billingCycle === 'monthly' ? 399 : 2999,
      features: ['Everything in Basic', 'Advanced magic filters', 'Save up to 50 quests', 'AI recommendations', 'Profile builder', 'Quest tracking', 'Raven notifications', 'Priority support'],
      excluded: ['Early access to quests', 'Ad-free experience', 'Instant alerts', 'Direct guild connections'],
      color: 'blue',
      popular: true,
    },
    {
      id: 'premium',
      name: 'Master Pass',
      description: 'Ultimate treasure hunting experience',
      icon: Crown,
      price: billingCycle === 'monthly' ? 199 : 999,
      originalPrice: billingCycle === 'monthly' ? 799 : 9999,
      features: ['Everything in Pro', 'Early access to new quests', 'Ad-free experience', 'Save unlimited quests', 'Instant guild alerts', 'Direct guild messaging', 'Profile optimization', 'Tavern prep tools', 'Guild counseling', 'VIP raven support'],
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
    <div className="min-h-screen bg-background text-text py-8 md:py-16 font-game">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header - Scaled for Mobile/Desktop */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-background border rounded-full border-warning-500 shadow-adventure text-warning-500 font-bold text-[10px] uppercase mb-4">
            <Zap size={14} className="fill-current" />
            <span>TREASURE PASSES</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-pixel text-text mb-6 tracking-widest drop-shadow-md">
            Choose Your <span className="text-warning-500">Guild Pass</span>
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto px-4">
            Unlock magical features and accelerate your questing with our tailored passes.
          </p>
        </div>

        {/* Billing Switcher */}
        <div className="flex justify-center mb-10 md:mb-14">
          <div className="flex bg-surface border rounded-[2rem] border-border p-1 shadow-adventure">
            {['monthly', 'yearly'].map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className={`px-6 py-3 font-bold text-[10px] uppercase rounded-[2rem] tracking-widest transition-all border ${
                  billingCycle === cycle 
                    ? 'bg-warning-500 text-text shadow-sm border-border' 
                    : 'text-muted border-transparent hover:text-text hover:bg-background'
                }`}
              >
                {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                {cycle === 'yearly' && <span className="ml-2 text-[8px] text-success-500">SAVE 70%</span>}
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
              <div key={plan.id} className={`flex flex-col p-6 md:p-8 border rounded-[2.5rem] transition-transform hover:-translate-y-2 ${
                isPopular 
                  ? 'bg-surface border-warning-500 shadow-adventure z-10' 
                  : 'bg-surface border-border shadow-adventure'
              }`}>
                {isPopular && (
                  <div className="text-center mb-4">
                    <span className="bg-warning-500 border border-border text-text rounded-full text-[10px] font-bold px-4 py-2 uppercase tracking-widest shadow-adventure">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className={`w-16 h-16 border rounded-2xl flex items-center justify-center mb-6 shadow-adventure ${isPopular ? 'bg-warning-500 border-warning-400 text-text' : 'bg-background border-border text-primary-500'}`}>
                  <Icon size={32} />
                </div>

                <h3 className={`text-2xl font-pixel mb-3 text-text`}>{plan.name}</h3>
                <p className={`text-lg mb-6 text-muted font-game`}>{plan.description}</p>

                <div className="mb-6 font-game">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-game text-text`}>₹{plan.price}</span>
                    <span className={`text-lg text-muted`}>/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  {plan.originalPrice && (
                    <span className="text-sm line-through text-danger-500 font-bold mt-1 block">₹{plan.originalPrice}</span>
                  )}
                </div>

                <div className="flex-grow space-y-4 mb-8 font-game text-lg">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check size={18} className="text-success-500 mt-1 flex-shrink-0" />
                      <span className={`text-text`}>{feat}</span>
                    </div>
                  ))}
                  {plan.excluded.map((feat, i) => (
                    <div key={i} className="flex items-start gap-3 opacity-50">
                      <X size={18} className="text-danger-500 mt-1 flex-shrink-0" />
                      <span className={`text-muted`}>{feat}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handlePlanSelect(plan)}
                  className={`w-full py-4 border rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-adventure hover:-translate-y-1 active:translate-y-1 transition-transform ${
                    isPopular ? 'bg-warning-500 hover:bg-warning-400 border-border text-text' : 'bg-background border-border text-text hover:bg-primary-500'
                  }`}
                >
                  {plan.price === 0 ? 'Start Free' : 'Secure Pass'}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Responsive Table */}
        <div className="bg-surface shadow-adventure border rounded-[2.5rem] border-border p-4 md:p-10 mb-20 overflow-hidden">
          <h2 className="text-2xl md:text-3xl font-pixel text-center mb-8 text-text tracking-widest">Pass Comparison</h2>
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-border text-[10px] text-muted uppercase font-bold tracking-widest">
                  <th className="text-left py-4">Magic Features</th>
                  <th className="text-center">Basic</th>
                  <th className="text-center text-primary-500">Pro</th>
                  <th className="text-center text-warning-500">Master</th>
                </tr>
              </thead>
              <tbody className="text-sm md:text-lg font-game">
                {[
                  ['Quest Listings', true, true, true],
                  ['Magic Recommendations', false, true, true],
                  ['Early Access', false, false, true],
                  ['Instant Alerts', false, false, true],
                  ['Profile Builder', false, true, true]
                ].map(([label, f1, f2, f3], i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-background transition-colors">
                    <td className="py-5 text-text">{label}</td>
                    <td className="text-center">{f1 ? <Check size={20} className="mx-auto text-success-500" /> : <span className="text-muted">—</span>}</td>
                    <td className="text-center">{f2 ? <Check size={20} className="mx-auto text-primary-500" /> : <span className="text-muted">—</span>}</td>
                    <td className="text-center">{f3 ? <Check size={20} className="mx-auto text-warning-500" /> : <span className="text-muted">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Final Compact CTA */}
        <div className="bg-surface border rounded-[2.5rem] border-border shadow-adventure p-8 md:p-16 text-center text-text mb-10">
          <h2 className="text-2xl md:text-4xl font-pixel tracking-widest mb-6">Supercharge Your Guild</h2>
          <p className="text-lg md:text-xl text-muted mb-10 max-w-xl mx-auto font-game">Find your dream quest today with Fast Hire Mela.</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button onClick={() => handlePlanSelect(plans[1])} className="bg-warning-500 text-text rounded-2xl hover:bg-warning-400 shadow-adventure border border-border font-bold px-10 py-5 text-[10px] uppercase tracking-widest transition-transform hover:-translate-y-1 active:translate-y-1">Start Quest</Button>
            <Button onClick={() => navigate('/contact')} className="bg-background border rounded-2xl border-border text-text hover:bg-primary-500 shadow-adventure font-bold px-10 py-5 text-[10px] uppercase tracking-widest transition-transform hover:-translate-y-1 active:translate-y-1">Tavern Support</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPlans;