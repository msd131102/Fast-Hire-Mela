import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, CreditCard, Shield, ArrowLeft, Crown, Star, TrendingUp, Bell, Mail, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';

const PremiumCheckout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [plan, setPlan] = useState(() => searchParams.get('plan') || 'professional');
  const [billing, setBilling] = useState(() => searchParams.get('billing') || 'monthly');
  const [email, setEmail] = useState(() => user?.email || '');

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }
  }, [user, navigate]);

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
    alert('Thank you! We will notify you when our payment system is ready.');
  };

  if (!user || !currentPlan) {
    return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text font-game">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-warning-500 mx-auto mb-4"></div>
          <p className="text-muted font-bold text-sm uppercase tracking-widest">Loading treasure map...</p>
        </div>
      </div>
    );
  }

  const Icon = currentPlan.icon;

  return (
    <div className="min-h-screen bg-background text-text py-8 md:py-12 font-game">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Navigation & Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate('/premium/plans')}
            className="group inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-muted hover:text-warning-400 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            BACK TO GUILD PLANS
          </button>

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-pixel text-text mb-4 tracking-widest drop-shadow-md">
              Secure <span className="text-warning-400">Treasure</span>
            </h1>
            <p className="text-muted font-game text-lg">
              You're one step away from the {currentPlan.name} experience
            </p>
          </div>
        </div>

        {/* Selected Plan Summary - Compact & Premium */}
        <div className={`mb-8 overflow-hidden rounded-[2rem] border transition-all shadow-adventure ${
          currentPlan.color === 'purple' ? 'border-warning-500 bg-warning-500/10' :
          currentPlan.color === 'blue' ? 'border-primary-500 bg-primary-500/10' : 
          'border-border bg-surface'
        }`}>
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
              <div className={`p-4 rounded-2xl border shadow-sm ${
                currentPlan.color === 'purple' ? 'bg-warning-500 border-warning-400 text-text' :
                currentPlan.color === 'blue' ? 'bg-primary-600 border-primary-500 text-text' : 'bg-surface border-border text-text'
              }`}>
                <Icon size={32} />
              </div>
              <div>
                <h3 className="text-xl font-pixel tracking-widest text-text mb-2">{currentPlan.name} Pass</h3>
                <p className="text-lg text-muted font-game">{currentPlan.description}</p>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <div className="flex flex-col items-center md:items-end">
                {currentPlan.originalPrice && (
                  <span className="text-sm text-danger-500 line-through font-bold">
                    ₹{currentPlan.originalPrice}
                  </span>
                )}
                <div className="text-3xl font-game text-text mt-1">
                  ₹{currentPlan.price}
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">
                    /{billing === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Section - Retro UI */}
        <div className="relative mb-8 group rounded-[2.5rem]">
          <div className="absolute inset-0 bg-warning-500 blur opacity-10 group-hover:opacity-20 transition-opacity rounded-[2.5rem]"></div>
          <div className="relative border border-border rounded-[2.5rem] shadow-adventure overflow-hidden bg-surface">
            <div className="p-8 md:p-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-background rounded-2xl border border-border shadow-adventure mb-6 rotate-3">
                  <Clock className="w-10 h-10 text-warning-500 animate-pulse" />
                </div>

                <h2 className="text-2xl md:text-3xl font-pixel text-text mb-6 tracking-widest">
                  Tavern Vault <span className="text-warning-500 block mt-2">Opening Soon</span>
                </h2>

                <p className="text-muted font-game text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                  The guild masters are currently securing the treasure vault. Leave your raven to be notified when the gates open.
                </p>

                {/* Payment Icons Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  {[
                    { icon: <CreditCard size={20}/>, label: "Gold", color: "text-primary-500" },
                    { icon: <span className="font-bold text-[10px]">UPI</span>, label: "Magic", color: "text-warning-500" },
                    { icon: <Shield size={20}/>, label: "Shielded", color: "text-success-500" },
                    { icon: <CheckCircle2 size={20}/>, label: "Verified", color: "text-primary-500" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-center gap-2 py-4 px-4 bg-background border rounded-2xl border-border shadow-inner">
                      <span className={item.color}>{item.icon}</span>
                      <span className="text-[10px] font-bold text-text uppercase tracking-widest">{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Notification Form */}
                <form onSubmit={handleNotifyMe} className="max-w-md mx-auto space-y-6">
                  <div className="text-left">
                    <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-2 ml-1">Raven Dispatch (Email)</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5 group-focus-within:text-warning-500 transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-background border border-border focus:border-warning-500 outline-none transition-all font-game text-lg text-text shadow-inner"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-5 border rounded-2xl border-border bg-warning-500 text-text font-bold text-sm uppercase tracking-widest shadow-adventure hover:bg-warning-400 hover:-translate-y-1 active:translate-y-1 transition-transform"
                  >
                    <Bell className="w-4 h-4 mr-2 fill-current" />
                    Send Raven
                  </Button>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest text-center">Join 2,400+ adventurers on waitlist</p>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions & Support */}
        <div className="flex flex-col gap-8 text-center mt-12">
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-muted hover:text-text transition-colors"
            >
              Go to Tavern
            </button>
            <button 
              onClick={() => navigate('/jobs')}
              className="px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-warning-500 hover:text-warning-400 transition-colors border-b-2 border-warning-500"
            >
              Explore Quests
            </button>
          </div>

          <div className="pt-8 border-t border-border">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest leading-loose">
              Support Inquiry? <br />
              <a href="mailto:fasthiremela@gmail.com" className="text-warning-500 hover:text-warning-400 transition-colors mt-2 inline-block">
                FASTHIREMELA@GMAIL.COM
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumCheckout;