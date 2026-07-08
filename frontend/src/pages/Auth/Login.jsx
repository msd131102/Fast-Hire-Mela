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
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Pixel Art Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/src/assets/pixel_auth_bg.png" 
          alt="Login Background" 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = 'https://picsum.photos/1920/1080?random=2'; // Fallback
          }}
        />
        <div className="absolute inset-0 bg-background/80" />
      </div>

      <div className="w-full max-w-[450px] z-10 relative">
        <div className="border border-white/20 bg-surface/95 backdrop-blur-md rounded-[2.5rem] p-8 shadow-adventure">
          <div className="text-center pt-2 pb-6">
            <div>
              <div className="w-16 h-16 bg-primary-50 border border-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <User className="w-8 h-8 text-primary-500" />
              </div>
              <h1 className="text-3xl font-pixel font-bold text-text tracking-wide">
                Welcome Back
              </h1>
              <p className="text-muted mt-4 text-sm sm:text-base font-medium">
                Equip your credentials to continue
              </p>
            </div>
          </div>

          <div className="pb-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Email Address</label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  icon={<Mail className="w-5 h-5 text-muted" />}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  error={errors.email?.message}
                  className="h-13 bg-background border-border text-text placeholder-muted focus:bg-surface focus:ring-4 focus:ring-primary-500/20 transition-all rounded-xl"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    icon={<Lock className="w-5 h-5 text-muted" />}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    error={errors.password?.message}
                    className="h-13 bg-background border-border text-text placeholder-muted focus:bg-surface focus:ring-4 focus:ring-primary-500/20 transition-all pr-12 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[14px] text-muted hover:text-primary-400 transition-colors p-1"
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Action Row */}
              <div className="flex items-center justify-between px-1 pt-2">
                <label className="flex items-center group cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary-500 border border-border bg-background cursor-pointer rounded"
                    {...register('remember')}
                  />
                  <span className="ml-3 text-sm text-muted font-medium group-hover:text-text transition-colors">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-primary-500 hover:text-primary-600 transition-all"
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
                    className="bg-danger-500/10 border border-danger-500/50 rounded-xl p-4 flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-danger-500 shrink-0" />
                    <span className="text-sm font-semibold text-danger-500">{errors.root.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-13 text-base font-bold rounded-xl bg-primary-600 hover:bg-primary-500 text-text shadow-glow-primary transition-all active:scale-[0.98] mt-2"
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
              <div className="relative mb-8 text-center border-t border-border/50 pt-6">
                <span className="px-4 bg-surface text-muted font-bold text-xs tracking-wider absolute -top-3 left-1/2 -translate-x-1/2">
                  Or continue with
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 h-12 rounded-xl border border-border bg-background hover:bg-secondary-800 hover:border-primary-500/50 transition-all font-bold text-text text-sm"
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
                  className="flex items-center justify-center gap-2 h-12 rounded-xl border border-border bg-background hover:bg-secondary-800 hover:border-primary-500/50 transition-all font-bold text-text text-sm"
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
                <p className="text-sm text-muted font-medium">
                  New to the realm?{' '}
                  <Link
                    to="/register"
                    className="font-bold text-primary-500 hover:text-primary-600 transition-colors ml-2"
                  >
                    Create account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Indicators */}
        <div className="mt-8 flex justify-center items-center gap-6">
          <div className="flex items-center text-[10px] text-white/80 font-bold uppercase tracking-wider">
            <div className="w-2 h-2 rounded-full bg-success-500 mr-2 shadow-sm" />
            Realm Secure
          </div>
          <div className="w-1 h-1 rounded-full bg-white/20" />
          <div className="flex items-center text-[10px] text-white/80 font-bold uppercase tracking-wider">
            <div className="w-2 h-2 rounded-full bg-primary-500 mr-2 shadow-sm" />
            v2.4.0 Live
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
