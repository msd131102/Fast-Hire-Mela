import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Briefcase,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Timer,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { useMutation } from '@tanstack/react-query';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { otpAPI } from '../../services/api';
import ProfileCompletionModal from '../../components/auth/ProfileCompletionModal';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [userEmail, setUserEmail] = useState('');
  const [userData, setUserData] = useState({});
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [isInitialSending, setIsInitialSending] = useState(false);
  const [otpSentSuccess, setOtpSentSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    setValue,
    getValues,
  } = useForm();

  const password = watch('password');

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const registerMutation = useMutation({
    mutationFn: ({ userData, otp }) => otpAPI.registerWithOtp(userData, otp),
    onSuccess: (data) => {
      toast.success('Registration successful! Please complete your profile.');
      setRegisteredUser(data.user || { email: userEmail, name: userData.name });
      setShowProfileModal(true);
      if (data.token) {
        login(data.user, data.token);
      }
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Registration failed';
      setError('root', { message });
      toast.error(message);
    },
  });

  const sendOTP = async (email) => {
    setIsSendingOTP(true);
    try {
      const response = await otpAPI.sendOtp(email);
      if (response.success) {
        toast.success('OTP sent to your email address');
        setResendTimer(60);
        return true;
      } else {
        toast.error(response.message || 'Failed to send OTP');
        return false;
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to send OTP';
      toast.error(message);
      return false;
    } finally {
      setIsSendingOTP(false);
    }
  };

  const verifyOTP = async (email, otp) => {
    setIsVerifyingOTP(true);
    try {
      const response = await otpAPI.verifyOtp(email, otp);
      if (response.success) {
        toast.success('Email verified successfully');
        return true;
      } else {
        toast.error(response.message || 'Invalid OTP');
        return false;
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'OTP verification failed';
      toast.error(message);
      return false;
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleStep1Submit = (data) => {
    setUserEmail(data.email);
    setUserData({ ...userData, ...data });
    nextStep();
  };

  const handleStep2Submit = (data) => {
    setUserData({ ...userData, ...data });
    nextStep();
    setIsInitialSending(true);
    setOtpSentSuccess(false);
    sendOTP(userEmail).then((success) => {
      setIsInitialSending(false);
      if (success) {
        setOtpSentSuccess(true);
      }
    });
  };

  const handleStep3Submit = async (data) => {
    const otp = Object.keys(data)
      .filter(key => key.startsWith('otp'))
      .map(key => data[key])
      .join('');

    if (otp.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    const isVerified = await verifyOTP(userEmail, otp);
    if (isVerified) {
      nextStep();
    }
  };

  const onSubmit = (data) => {
    const { confirmPassword: _, terms: __, ...registerData } = data;
    const finalData = { ...userData, ...registerData };
    const otp = Object.keys(getValues())
      .filter(key => key.startsWith('otp'))
      .map(key => getValues(key))
      .join('');
    registerMutation.mutate({ userData: finalData, otp });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleResendOTP = () => {
    if (resendTimer === 0) sendOTP(userEmail);
  };

  const handleOTPChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      setValue(`otp${index}`, value);
      if (value && index < 5) {
        const nextInput = document.querySelector(`input[name="otp${index + 1}"]`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !getValues(`otp${index}`) && index > 0) {
      const prevInput = document.querySelector(`input[name="otp${index - 1}"]`);
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      {/* Background decorative elements - Desktop only */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-10 hidden md:block">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-400 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-400 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg z-10"
      >
        <Card className="shadow-2xl border-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
          <CardHeader className="text-center pt-8 pb-4">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="space-y-2"
            >
              <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center mx-auto mb-4 rotate-3">
                <User className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Create Account
              </CardTitle>
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base px-4">
                Join our community of professionals and start your journey.
              </p>
            </motion.div>

            {/* Premium Progress Stepper */}
            <div className="flex justify-between items-center mt-10 px-4 sm:px-10 relative">
              <div className="absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="relative z-10">
                  <motion.div
                    animate={{
                      scale: step >= stepNumber ? 1.1 : 1,
                      backgroundColor: step >= stepNumber ? '#2563eb' : 'var(--stepper-bg)',
                    }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all shadow-md ${
                      step >= stepNumber 
                        ? 'text-white shadow-blue-500/30' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {step > stepNumber ? <CheckCircle className="w-5 h-5" /> : stepNumber}
                  </motion.div>
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent className="px-6 sm:px-10 pb-10">
            <form onSubmit={handleSubmit(step === 1 ? handleStep1Submit : step === 2 ? handleStep2Submit : step === 3 ? handleStep3Submit : onSubmit)}>
              <AnimatePresence mode="wait">
                {/* Step 1: Basic Info */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="space-y-5"
                  >
                    <Input
                      label="Full Name"
                      placeholder="John Doe"
                      icon={<User className="w-5 h-5 text-slate-400" />}
                      {...register('name', { required: 'Full name is required', minLength: 2 })}
                      error={errors.name?.message}
                      className="h-12 bg-white dark:bg-slate-800"
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="john@example.com"
                      icon={<Mail className="w-5 h-5 text-slate-400" />}
                      {...register('email', { required: 'Email is required', pattern: /^\S+@\S+$/i })}
                      error={errors.email?.message}
                      className="h-12 bg-white dark:bg-slate-800"
                    />
                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="1234567890"
                      icon={<Phone className="w-5 h-5 text-slate-400" />}
                      {...register('phone', { required: 'Phone is required', pattern: /^[0-9]{10}$/ })}
                      error={errors.phone?.message}
                      className="h-12 bg-white dark:bg-slate-800"
                    />
                    <Button type="submit" className="w-full h-12 text-lg shadow-lg shadow-blue-600/20 group">
                      Next Step <ChevronRight className="ml-2 w-2 h-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                )}

                {/* Step 2: Professional Info */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Experience Level</label>
                      <select
                        {...register('experience_level', { required: 'Required' })}
                        className="w-full h-12 px-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      >
                        <option value="">Select Level</option>
                        <option value="Fresher">Fresher (0-1 years)</option>
                        <option value="Junior">Junior (1-3 years)</option>
                        <option value="Mid-level">Mid-level (3-5 years)</option>
                        <option value="Senior">Senior (5-8 years)</option>
                        <option value="Lead">Lead (8+ years)</option>
                      </select>
                    </div>
                    <Input
                      label="Current Role"
                      placeholder="Software Engineer"
                      icon={<Briefcase className="w-5 h-5 text-slate-400" />}
                      {...register('current_role', { required: 'Required' })}
                      error={errors.current_role?.message}
                    />
                    <Input
                      label="Preferred Location"
                      placeholder="Bangalore, Remote"
                      {...register('preferred_location', { required: 'Required' })}
                      error={errors.preferred_location?.message}
                    />
                    <div className="flex gap-3 pt-2">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-12"><ChevronLeft className="mr-2" /> Back</Button>
                      <Button type="submit" className="flex-1 h-12 group">Next <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" /></Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: OTP Verification */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="text-center"
                  >
                    {isInitialSending ? (
                      <div className="py-10 space-y-4">
                        <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                        <h3 className="font-bold dark:text-white text-xl">Sending Code...</h3>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl inline-block mb-2">
                          <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold dark:text-white">Verify Email</h3>
                        <p className="text-slate-500 text-sm">Code sent to <span className="text-blue-600 font-medium">{userEmail}</span></p>
                        
                        <div className="flex justify-center gap-2 sm:gap-3">
                          {[0, 1, 2, 3, 4, 5].map((idx) => (
                            <input
                              key={idx}
                              type="text"
                              maxLength="1"
                              className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:border-blue-500 dark:text-white transition-all shadow-sm"
                              {...register(`otp${idx}`, { required: true })}
                              onChange={(e) => handleOTPChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOTPKeyDown(idx, e)}
                            />
                          ))}
                        </div>

                        <div className="flex flex-col gap-4">
                          <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={resendTimer > 0 || isSendingOTP}
                            className="text-sm font-semibold text-blue-600 dark:text-blue-400 disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {isSendingOTP ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Timer className="w-4 h-4" />}
                            {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
                          </button>
                          <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-12">Back</Button>
                            <Button type="submit" loading={isVerifyingOTP} className="flex-1 h-12 shadow-lg shadow-blue-600/20">Verify</Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 4: Password Setup */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="space-y-5"
                  >
                    <div className="relative">
                      <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        icon={<Lock className="w-5 h-5 text-slate-400" />}
                        {...register('password', { required: 'Required', minLength: 8 })}
                        error={errors.password?.message}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-slate-400">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        icon={<Lock className="w-5 h-5 text-slate-400" />}
                        {...register('confirmPassword', { validate: (v) => v === password || 'No match' })}
                        error={errors.confirmPassword?.message}
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-9 text-slate-400">
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 space-y-2">
                       <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Security Requirements</p>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="flex items-center text-xs text-slate-600 dark:text-slate-400"><CheckCircle className="w-3 h-3 text-green-500 mr-1.5" /> 8+ Characters</div>
                          <div className="flex items-center text-xs text-slate-600 dark:text-slate-400"><CheckCircle className="w-3 h-3 text-green-500 mr-1.5" /> Uppercase & Lowercase</div>
                       </div>
                    </div>

                    <div className="flex items-start gap-3 p-1">
                      <input type="checkbox" {...register('terms', { required: true })} className="mt-1 w-4 h-4 rounded text-blue-600" />
                      <p className="text-xs text-slate-500 leading-relaxed">
                        I agree to the <Link className="text-blue-600 font-semibold underline">Terms</Link> and <Link className="text-blue-600 font-semibold underline">Privacy Policy</Link>.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-12">Back</Button>
                      <Button type="submit" loading={registerMutation.isLoading} className="flex-1 h-12 shadow-xl shadow-blue-600/30">Create Account</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-sm text-slate-500">
                Already have an account? {' '}
                <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">Sign in</Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-center space-x-6">
            {['Free Account', 'Job Alerts', 'Resume Builder'].map((text, i) => (
              <div key={i} className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${i === 0 ? 'bg-green-500' : i === 1 ? 'bg-blue-500' : 'bg-purple-500'}`} />
                {text}
              </div>
            ))}
        </div>
      </motion.div>

      {showProfileModal && (
        <ProfileCompletionModal
          isOpen={showProfileModal}
          onClose={() => {
            setShowProfileModal(false);
            navigate('/dashboard');
          }}
          user={registeredUser}
        />
      )}
    </div>
  );
};

export default Register;