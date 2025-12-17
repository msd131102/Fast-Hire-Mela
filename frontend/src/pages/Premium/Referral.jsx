import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Gift, CheckCircle, AlertCircle, Loader2, 
  ArrowLeft, Sparkles, Zap, ShieldCheck, BarChart3, Infinity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { referralAPI } from '../../services/api';

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
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      const data = await referralAPI.submitReferral({
        ...formData,
        referred_users: formData.referred_users.split('\n').map(item => item.trim()).filter(item => item.length > 0)
      });

      if (data.success) {
        setSuccess(data.message || 'Referral submitted successfully! You are eligible for Free Premium Features.');
        setFormData(prev => ({ ...prev, mobile: '', referred_users: '' }));
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
    <div className="min-h-screen bg-[#fafafa]">
      {/* Dynamic Header Section */}
      <div className="bg-[#050505] pt-24 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-600/20 blur-[100px] rounded-full" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Link to="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8 group">
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">Back to Dashboard</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400">
                  <Gift size={24} />
                </div>
                <span className="text-purple-400 font-black tracking-widest uppercase text-xs">Premium Access</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
                Refer Friends, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Go Premium.</span>
              </h1>
              <p className="text-gray-400 text-lg font-medium">
                Unlock exclusive tools and priority visibility by sharing FastHireMela with 20 friends.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-[2rem] text-center min-w-[200px]">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Your Progress</p>
              <div className={`text-5xl font-black mb-1 ${isEligible ? 'text-green-400' : 'text-purple-400'}`}>
                {referralCount}<span className="text-2xl text-gray-600">/20</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-3">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((referralCount/20)*100, 100)}%` }}
                  className={`h-full ${isEligible ? 'bg-green-400' : 'bg-purple-400'}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 pb-20">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Side: Benefits (Col 5) */}
          <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
            <Card className="p-8 border-none shadow-xl shadow-purple-900/5 bg-white rounded-[2.5rem]">
              <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2">
                <Sparkles className="text-purple-500" size={20} />
                Premium Features
              </h2>
              
              <div className="space-y-6">
                {[
                  { icon: <Infinity />, title: "Unlimited Applications", desc: "No daily limits on job applies." },
                  { icon: <Zap />, title: "Priority Job Alerts", desc: "Get notified 2 hours before others." },
                  { icon: <ShieldCheck />, title: "Resume Highlighting", desc: "Priority visibility to recruiters." },
                  { icon: <BarChart3 />, title: "Advanced Analytics", desc: "See who viewed your profile." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 leading-none mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-500 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-gray-100">
                <h4 className="font-black text-xs uppercase tracking-[0.2em] text-gray-400 mb-4">How it works</h4>
                <div className="space-y-4">
                  {[
                    "List 20+ friend emails/names below",
                    "Our team verifies the referrals",
                    "Premium features unlock instantly"
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[10px]">
                        {i + 1}
                      </div>
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <div className="bg-blue-600 rounded-[2rem] p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-black mb-2">Need Help?</h3>
                <p className="text-blue-100 text-sm mb-4">Facing issues with referral tracking?</p>
                <a href="mailto:fasthiremela@gmail.com" className="inline-flex items-center gap-2 font-bold bg-white/10 px-4 py-2 rounded-xl hover:bg-white/20 transition-colors">
                  fasthiremela@gmail.com
                </a>
              </div>
              <div className="absolute -bottom-4 -right-4 opacity-20">
                <HelpCircle size={100} />
              </div>
            </div>
          </div>

          {/* Right Side: Form (Col 7) */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <Card className="p-8 md:p-10 border-none shadow-2xl shadow-gray-200/50 bg-white rounded-[2.5rem]">
              <div className="flex items-center gap-3 mb-8">
                <Users className="text-purple-600" />
                <h2 className="text-2xl font-black text-gray-900">Submission Form</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Mobile Number</label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                      placeholder="+91 00000 00000"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Referred Users List</label>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isEligible ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                      {referralCount} detected
                    </span>
                  </div>
                  <textarea
                    name="referred_users"
                    value={formData.referred_users}
                    onChange={handleInputChange}
                    rows="8"
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-[2rem] focus:ring-2 focus:ring-purple-500 transition-all font-medium resize-none"
                    placeholder="Enter one email/name per line..."
                    required
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100">
                      <AlertCircle size={18} />
                      <p className="text-sm font-bold">{error}</p>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-2xl border border-green-100">
                      <CheckCircle size={18} />
                      <p className="text-sm font-bold">{success}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-5 rounded-[2rem] font-black text-white uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${
                    isEligible 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/20' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-500/20'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" /> Verifying...
                    </span>
                  ) : (
                    isEligible ? '🚀 Unlock Premium Access' : 'Submit My Referrals'
                  )}
                </Button>
              </form>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Referral;