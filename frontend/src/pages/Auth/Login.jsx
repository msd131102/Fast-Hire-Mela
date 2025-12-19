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
                    onClick={async () => {
                      try {
                        // Request secure OAuth URL from backend
                        const response = await fetch('https://empirical-lucinda-shiva1311-40c75dd1.koyeb.app/api/oauth/auth-url', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            provider: 'github',
                            redirectUri: 'https://www.fasthiremela.online/auth/callback/github'
                          })
                        });
                        
                        const data = await response.json();
                        if (data.success) {
                          window.open(data.data.authUrl, '_blank');
                        } else {
                          console.error('Failed to generate GitHub OAuth URL:', data.message);
                        }
                      } catch (error) {
                        console.error('Error generating GitHub OAuth URL:', error);
                      }
                    }}
                  >
                    GitHub
                  </Button>
                </motion.div>
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="outline"
                    className="w-full h-11 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium"
                    onClick={async () => {
                      try {
                        // Request secure OAuth URL from backend
                        const response = await fetch('https://empirical-lucinda-shiva1311-40c75dd1.koyeb.app/api/oauth/auth-url', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            provider: 'linkedin',
                            redirectUri: 'https://www.fasthiremela.online/auth/callback/linkedin'
                          })
                        });
                        
                        const data = await response.json();
                        if (data.success) {
                          window.open(data.data.authUrl, '_blank');
                        } else {
                          console.error('Failed to generate LinkedIn OAuth URL:', data.message);
                        }
                      } catch (error) {
                        console.error('Error generating LinkedIn OAuth URL:', error);
                      }
                    }}
                  >
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
