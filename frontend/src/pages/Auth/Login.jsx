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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Decorative Elements - Hidden on small mobile */}
      <div className="hidden sm:block absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/30 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[440px]"
      >
        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-md overflow-hidden">
          <CardHeader className="text-center pt-8 pb-4">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200 rotate-3">
                <User className="w-8 h-8 text-white -rotate-3" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Welcome Back
              </CardTitle>
              <p className="text-gray-500 mt-2 text-sm sm:text-base">
                Please enter your details to sign in
              </p>
            </motion.div>
          </CardHeader>

          <CardContent className="px-6 sm:px-10 pb-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-1">
                <Input
                  type="email"
                  placeholder="name@company.com"
                  icon={<Mail className="w-5 h-5 text-gray-400" />}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  error={errors.email?.message}
                  className="h-12 bg-white/50 border-gray-200 focus:bg-white transition-all text-base"
                />
              </div>

              {/* Password Field */}
              <div className="relative space-y-1">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  icon={<Lock className="w-5 h-5 text-gray-400" />}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  error={errors.password?.message}
                  className="h-12 bg-white/50 border-gray-200 focus:bg-white transition-all pr-12 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[14px] text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-md outline-none focus:ring-2 focus:ring-blue-100"
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center group cursor-pointer">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      className="peer w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-all cursor-pointer"
                      {...register('remember')}
                    />
                  </div>
                  <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-all"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Error Message */}
              <AnimatePresence mode="wait">
                {errors.root?.message && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <span className="text-sm font-medium text-red-700">{errors.root.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
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

            {/* Social Login */}
            <div className="mt-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest font-semibold">
                  <span className="px-3 bg-white/0 text-gray-400 backdrop-blur-sm">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="outline"
                    className="w-full h-11 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium"
                    onClick={() => {
                      const githubUrl = new URL('https://github.com/login/oauth/authorize');
                      githubUrl.searchParams.set('client_id', 'Ov23li8q5hA7KKjTE3pV');
                      githubUrl.searchParams.set('redirect_uri', 'https://www.fasthiremela.online/auth/callback/github');
                      githubUrl.searchParams.set('scope', 'user:email');
                      window.open(githubUrl.toString(), '_blank');
                    }}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#333">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387v-8.027c-3.438-1.587-6.905-6.085-6.905-11.387 0-6.627 5.373-12 12-12z"/>
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387v-8.027c-3.438-1.587-6.905-6.085-6.905-11.387 0-6.627 5.373-12 12-12z"/>
                    </svg>
                    GitHub
                  </Button>
                </motion.div>
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="outline"
                    className="w-full h-11 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium"
                    onClick={() => {
                      const linkedinUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
                      linkedinUrl.searchParams.set('response_type', 'code');
                      linkedinUrl.searchParams.set('client_id', '86i375i6isfvvv');
                      linkedinUrl.searchParams.set('redirect_uri', 'https://www.fasthiremela.online/auth/callback/linkedin');
                      linkedinUrl.searchParams.set('scope', 'r_liteprofile r_emailaddress');
                      linkedinUrl.searchParams.set('state', '1234567890');
                      window.open(linkedinUrl.toString(), '_blank');
                    }}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#0077B5">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </Button>
                </motion.div>
              </div>

              {/* Sign Up Link */}
              <div className="mt-10 text-center">
                <p className="text-sm text-gray-500">
                  New to the platform?{' '}
                  <Link
                    to="/register"
                    className="font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features / Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 px-4"
        >
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {[
              { label: 'Secure SSL', color: 'bg-emerald-500' },
              { label: 'Cloud Hosted', color: 'bg-blue-500' },
              { label: 'Priority Support', color: 'bg-purple-500' }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                <span className={`w-1.5 h-1.5 ${feature.color} rounded-full mr-2 shadow-sm`}></span>
                {feature.label}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
