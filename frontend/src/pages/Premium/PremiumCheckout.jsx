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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Preparing your checkout...</p>
        </div>
      </div>
    );
  }

  const Icon = currentPlan.icon;

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-gray-950 py-8 md:py-12">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Navigation & Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate('/premium/plans')}
            className="group inline-flex items-center text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            BACK TO PLANS
          </button>

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
              Review & <span className="text-purple-600">Secure</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              You're one step away from the {currentPlan.name} experience
            </p>
          </div>
        </div>

        {/* Selected Plan Summary - Compact & Premium */}
        <div className={`mb-8 overflow-hidden rounded-[2rem] border-2 transition-all shadow-lg ${
          currentPlan.color === 'purple' ? 'border-purple-500/20 bg-purple-50/30 dark:bg-purple-900/10' :
          currentPlan.color === 'blue' ? 'border-blue-500/20 bg-blue-50/30 dark:bg-blue-900/10' : 
          'border-gray-200 bg-white dark:bg-gray-900'
        }`}>
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
              <div className={`p-4 rounded-2xl shadow-sm ${
                currentPlan.color === 'purple' ? 'bg-purple-600 text-white' :
                currentPlan.color === 'blue' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
              }`}>
                <Icon size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">{currentPlan.name} Plan</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{currentPlan.description}</p>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <div className="flex flex-col items-center md:items-end">
                {currentPlan.originalPrice && (
                  <span className="text-sm text-red-500 line-through font-bold">
                    ₹{currentPlan.originalPrice}
                  </span>
                )}
                <div className="text-3xl font-black text-gray-900 dark:text-white">
                  ₹{currentPlan.price}
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                    /{billing === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Section - Modern UI */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <Card className="relative border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-gray-900">
            <CardContent className="p-8 md:p-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-3xl mb-6 rotate-3">
                  <Clock className="w-10 h-10 text-amber-600 dark:text-amber-400 animate-pulse" />
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-4">
                  Payment Gateway <span className="text-amber-600 font-serif italic">Launching Soon</span>
                </h2>

                <p className="text-gray-500 dark:text-gray-400 font-medium mb-10 max-w-lg mx-auto leading-relaxed">
                  We are currently integrating a secure, industry-leading payment system to ensure your transactions are 100% safe.
                </p>

                {/* Payment Icons Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
                  {[
                    { icon: <CreditCard size={20}/>, label: "Cards", color: "text-blue-500" },
                    { icon: <span className="font-black text-[10px]">UPI</span>, label: "UPI", color: "text-purple-500" },
                    { icon: <Shield size={20}/>, label: "Secure", color: "text-green-500" },
                    { icon: <CheckCircle2 size={20}/>, label: "Verified", color: "text-blue-400" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <span className={item.color}>{item.icon}</span>
                      <span className="text-[10px] md:text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-tighter">{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Notification Form */}
                <form onSubmit={handleNotifyMe} className="max-w-md mx-auto space-y-4">
                  <div className="text-left">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Priority Notification Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-500 transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 rounded-2xl focus:border-purple-500 outline-none transition-all font-bold text-gray-900 dark:text-white shadow-inner"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-5 rounded-2xl bg-gray-900 dark:bg-purple-600 text-white font-black text-sm uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <Bell className="w-4 h-4 mr-2 fill-current" />
                    Notify Me on Launch
                  </Button>
                  <p className="text-[10px] text-gray-400 font-medium italic">Join 2,400+ job seekers on the waitlist</p>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions & Support */}
        <div className="flex flex-col gap-8 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Go to Dashboard
            </button>
            <button 
              onClick={() => navigate('/jobs')}
              className="px-8 py-3 text-xs font-black uppercase tracking-widest text-purple-600 hover:underline decoration-2 underline-offset-4"
            >
              Explore Jobs
            </button>
          </div>

          <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
            <p className="text-[11px] md:text-xs text-gray-400 font-bold uppercase tracking-widest leading-loose">
              Support Inquiry? <br />
              <a href="mailto:fasthiremela@gmail.com" className="text-purple-500 hover:underline decoration-1">
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