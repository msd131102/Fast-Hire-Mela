import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useToast } from '../../components/ui/toastUtils';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { oauthAPI } from '../../services/api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('root', { message: '' });

    try {
      const result = await authLogin(data.email, data.password);
      if (result.success) {
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 100);
      } else {
        setError('root', { message: result.message || 'Login failed' });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      setError('root', { message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Premium Background Mesh - Soft & Modern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] rounded-full bg-blue-50/60 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] rounded-full bg-indigo-50/60 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[450px] z-10"
      >
        <Card className="border border-white/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] bg-white/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
          <CardHeader className="text-center pt-10 pb-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                <User className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back
              </CardTitle>
              <p className="text-slate-500 mt-2 text-sm sm:text-base font-medium">
                Enter your details to access your account
              </p>
            </motion.div>
          </CardHeader>

          <CardContent className="px-6 sm:px-10 pb-12">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Email Address</label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  icon={<Mail className="w-5 h-5 text-slate-400" />}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  error={errors.email?.message}
                  className="h-13 bg-white/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all rounded-xl"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    icon={<Lock className="w-5 h-5 text-slate-400" />}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    error={errors.password?.message}
                    className="h-13 bg-white/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all pr-12 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[14px] text-slate-400 hover:text-blue-600 transition-colors p-1"
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Action Row */}
              <div className="flex items-center justify-between px-1">
                <label className="flex items-center group cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-500 transition-all cursor-pointer"
                    {...register('remember')}
                  />
                  <span className="ml-2 text-sm text-slate-600 font-medium group-hover:text-slate-900 transition-colors">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-all"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Error Message */}
              <AnimatePresence mode="wait">
                {errors.root?.message && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <span className="text-sm font-semibold text-red-700">{errors.root.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-13 text-base font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200 transition-all active:scale-[0.98] mt-2"
                disabled={isLoading}
                loading={isLoading}
              >
                {!isLoading && (
                  <span className="flex items-center justify-center gap-2">
                    Sign In <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Social Login Section */}
            <div className="mt-8">
              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-bold">
                  <span className="px-4 bg-white/0 text-slate-400 backdrop-blur-sm">Or Secure Login With</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all font-bold text-slate-700 text-sm"
                  onClick={async () => {
                    try {
                      const response = await fetch('https://empirical-lucinda-shiva1311-40c75dd1.koyeb.app/api/oauth/auth-url', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          provider: 'github',
                          redirectUri: 'https://www.fasthiremela.online/auth/callback/github'
                        })
                      });
                      const data = await response.json();
                      if (data.success) { window.open(data.data.authUrl, '_blank'); }
                    } catch (error) { console.error('Error:', error); }
                  }}
                >
                  GitHub
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all font-bold text-slate-700 text-sm"
                  onClick={async () => {
                    try {
                      const response = await fetch('https://empirical-lucinda-shiva1311-40c75dd1.koyeb.app/api/oauth/auth-url', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          provider: 'linkedin',
                          redirectUri: 'https://www.fasthiremela.online/auth/callback/linkedin'
                        })
                      });
                      const data = await response.json();
                      if (data.success) { 
                        window.open(data.data.authUrl, '_blank'); 
                      } else {
                        alert('LinkedIn connection failed: ' + (data.message || 'Unknown error'));
                      }
                    } catch (error) { 
                      console.error('LinkedIn OAuth Error:', error);
                      alert('Connection error. Please try again.');
                    }
                  }}
                >
                  LinkedIn
                </button>
              </div>

              {/* Footer Link */}
              <div className="mt-10 text-center">
                <p className="text-sm text-slate-500 font-medium">
                  New to the platform?{' '}
                  <Link
                    to="/register"
                    className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Create account
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex justify-center items-center gap-6"
        >
          <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            System Secure
          </div>
          <div className="w-px h-3 bg-slate-200" />
          <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            v2.4.0 Live
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
