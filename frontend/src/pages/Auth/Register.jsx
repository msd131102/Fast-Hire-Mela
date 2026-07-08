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
import { otpAPI, authAPI } from '../../services/api';
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
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [emailValidationError, setEmailValidationError] = useState('');
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
  const email = watch('email');

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Email validation function
  const validateEmailAvailability = async (emailToValidate) => {
    if (!emailToValidate || !/^\S+@\S+\.\S+$/.test(emailToValidate)) {
      setEmailValidationError('');
      return;
    }

    setIsValidatingEmail(true);
    setEmailValidationError('');

    try {
      const response = await authAPI.validateEmail(emailToValidate);
      if (response.success) {
        setEmailValidationError('');
      }
    } catch (error) {
      if (error.response?.status === 400) {
        setEmailValidationError(error.response?.data?.message || 'This email is already registered');
      } else {
        // Don't show error for network issues, just clear validation
        setEmailValidationError('');
      }
    } finally {
      setIsValidatingEmail(false);
    }
  };

  // Debounced email validation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (email && email.length > 0) {
        validateEmailAvailability(email);
      }
    }, 800); // 800ms debounce

    return () => clearTimeout(timer);
  }, [email]);

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
      
      // Handle specific email already exists error
      if (error.response?.data?.code === 'EMAIL_ALREADY_EXISTS') {
        toast.error('This email is already registered. Please sign in instead.');
        // Go back to step 1 so user can change email
        setStep(1);
        return false;
      }
      
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

  const handleStep1Submit = async (data) => {
    // Validate email availability before proceeding
    if (emailValidationError) {
      toast.error('Please use a different email address');
      return;
    }

    // Final email validation check
    if (email) {
      setIsValidatingEmail(true);
      try {
        await validateEmailAvailability(email);
        if (emailValidationError) {
          toast.error('This email is already registered. Please sign in instead.');
          return;
        }
      } catch (error) {
        toast.error('Unable to validate email. Please try again.');
        return;
      } finally {
        setIsValidatingEmail(false);
      }
    }

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

  const handleResendOTP = async () => {
    if (resendTimer === 0) {
      const success = await sendOTP(userEmail);
      if (!success) {
        // If OTP sending failed due to email already exists, go back to step 1
        setStep(1);
      }
    }
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
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      {/* Pixel Art Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/src/assets/pixel_auth_bg.png" 
          alt="Register Background" 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = 'https://picsum.photos/1920/1080?random=2'; // Fallback
          }}
        />
        <div className="absolute inset-0 bg-background/80" />
      </div>

      <div className="w-full max-w-lg z-10 relative">
        <div className="border border-white/20 bg-surface/95 backdrop-blur-md rounded-[2.5rem] shadow-adventure p-8">
          <div className="text-center pt-2 pb-6">
            <div>
              <div className="w-16 h-16 bg-primary-50 border border-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <User className="w-8 h-8 text-primary-500" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-pixel font-bold tracking-wide text-text">
                New Adventurer
              </h1>
              <p className="text-muted text-sm sm:text-base font-medium mt-2">
                Join our guild and start your quest.
              </p>
            </div>

            {/* Progress Stepper */}
            <div className="flex justify-between items-center mt-10 relative pb-6 border-b border-border/50">
              <div className="absolute top-1/2 left-[15%] right-[15%] h-1 bg-border rounded-full -translate-y-1/2 z-0" />
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="relative z-10">
                  <div
                    className={`w-12 h-12 flex items-center justify-center text-sm font-bold transition-all rounded-2xl border ${
                      step >= stepNumber 
                        ? 'text-white shadow-sm bg-primary-500 border-primary-600' 
                        : 'text-muted bg-surface border-border shadow-sm'
                    }`}
                  >
                    {step > stepNumber ? <CheckCircle className="w-6 h-6" /> : stepNumber}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pb-4">
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
                      icon={<User className="w-5 h-5 text-muted" />}
                      {...register('name', { required: 'Full name is required', minLength: 2 })}
                      error={errors.name?.message}
                      className="h-12 bg-background border-border text-text placeholder-muted focus:ring-primary-500"
                    />
                    <div>
                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="john@example.com"
                        icon={
                          <div className="relative">
                            <Mail className="w-5 h-5 text-muted" />
                            {isValidatingEmail && (
                              <div className="absolute -right-6 -top-1">
                                <RefreshCw className="w-4 h-4 text-primary-500 animate-spin" />
                              </div>
                            )}
                          </div>
                        }
                        {...register('email', { 
                          required: 'Email is required', 
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: 'Please enter a valid email address'
                          },
                          validate: {
                            available: (value) => {
                              if (emailValidationError) {
                                return emailValidationError;
                              }
                              return true;
                            }
                          }
                        })}
                        error={errors.email?.message || emailValidationError}
                        className={`h-12 bg-background border-border text-text placeholder-muted focus:ring-primary-500 ${
                          emailValidationError ? 'border-danger-500 focus:border-danger-500' : ''
                        }`}
                      />
                      {emailValidationError && (
                        <div className="mt-2 p-3 bg-danger-500/10 border border-danger-500/50 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-danger-500 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <p className="text-danger-500 font-medium">{emailValidationError}</p>
                              <p className="text-danger-500 mt-1">
                                Already have an account?{' '}
                                <Link to="/login" className="font-bold underline hover:text-danger-400">
                                  Sign in here
                                </Link>
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="1234567890"
                      icon={<Phone className="w-5 h-5 text-muted" />}
                      {...register('phone', { required: 'Phone is required', pattern: /^[0-9]{10}$/ })}
                      error={errors.phone?.message}
                      className="h-12 bg-background border-border text-text placeholder-muted focus:ring-primary-500"
                    />
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-lg shadow-glow-primary bg-primary-600 text-text group"
                      disabled={!!emailValidationError || isValidatingEmail}
                    >
                      {isValidatingEmail ? 'Validating Email...' : 'Next Step'}
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
                      <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Experience Level</label>
                      <select
                        {...register('experience_level', { required: 'Required' })}
                        className="w-full h-14 px-4 border border-border bg-white text-text focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all rounded-2xl font-medium text-lg"
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
                      icon={<Briefcase className="w-5 h-5 text-muted" />}
                      {...register('current_role', { required: 'Required' })}
                      error={errors.current_role?.message}
                    />
                    <Input
                      label="Preferred Location"
                      placeholder="Bangalore, Remote"
                      {...register('preferred_location', { required: 'Required' })}
                      error={errors.preferred_location?.message}
                    />
                    <div className="flex gap-4 pt-4">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-14 border border-border rounded-2xl text-text hover:bg-surface"><ChevronLeft className="mr-2" /> Back</Button>
                      <Button type="submit" className="flex-1 h-14 rounded-2xl shadow-sm bg-primary-600 text-text">Next Step</Button>
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
                        <RefreshCw className="w-12 h-12 text-primary-500 animate-spin mx-auto" />
                        <h3 className="font-bold text-text text-xl">Sending Code...</h3>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-primary-50 border border-primary-100 p-4 rounded-3xl inline-block mb-2 shadow-sm">
                          <Mail className="w-8 h-8 text-primary-500" />
                        </div>
                        <h3 className="text-xl font-bold text-text">Verify Email</h3>
                        <p className="text-muted text-sm">Code sent to <span className="text-primary-400 font-bold">{userEmail}</span></p>
                        
                        <div className="flex justify-center gap-2 sm:gap-4">
                          {[0, 1, 2, 3, 4, 5].map((idx) => (
                            <input
                              key={idx}
                              type="text"
                              maxLength="1"
                              className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border border-border bg-white text-text focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 rounded-2xl shadow-sm outline-none transition-all"
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
                            className="text-sm font-bold text-primary-400 disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {isSendingOTP ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Timer className="w-4 h-4" />}
                            {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
                          </button>
                          <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-12 rounded-xl border-border text-text hover:bg-surface">Back</Button>
                            <Button type="submit" loading={isVerifyingOTP} className="flex-1 h-12 shadow-sm bg-primary-600 rounded-xl text-text">Verify</Button>
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
                        icon={<Lock className="w-5 h-5 text-muted" />}
                        {...register('password', { required: 'Required', minLength: 8 })}
                        error={errors.password?.message}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-muted hover:text-primary-400">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        icon={<Lock className="w-5 h-5 text-muted" />}
                        {...register('confirmPassword', { validate: (v) => v === password || 'No match' })}
                        error={errors.confirmPassword?.message}
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-9 text-muted hover:text-primary-400">
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>

                    <div className="p-4 bg-background rounded-xl border border-border space-y-2 shadow-sm">
                       <p className="text-xs font-bold text-muted uppercase tracking-wider">Security Requirements</p>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="flex items-center text-xs text-muted"><CheckCircle className="w-3 h-3 text-success-500 mr-1.5" /> 8+ Characters</div>
                          <div className="flex items-center text-xs text-muted"><CheckCircle className="w-3 h-3 text-success-500 mr-1.5" /> Uppercase & Lowercase</div>
                       </div>
                    </div>

                    <div className="flex items-start gap-3 p-1">
                      <input type="checkbox" {...register('terms', { required: true })} className="mt-1 w-4 h-4 rounded text-primary-600 bg-background border-border" />
                      <p className="text-xs text-muted leading-relaxed">
                        I agree to the <Link className="text-primary-500 font-bold underline">Terms</Link> and <Link className="text-primary-500 font-bold underline">Privacy Policy</Link>.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-12 rounded-xl border border-border text-text hover:bg-surface">Back</Button>
                      <Button type="submit" loading={registerMutation.isLoading} className="flex-1 h-12 rounded-xl shadow-sm bg-primary-600 text-text">Create Account</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <div className="mt-8 pt-6 border-t border-border/50 text-center">
              <p className="text-sm text-muted font-medium">
                Already in the guild? {' '}
                <Link to="/login" className="font-bold text-xs uppercase text-primary-500 hover:text-primary-600 ml-2">Sign in</Link>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center space-x-6">
            {['Free Account', 'Quest Alerts', 'Profile Builder'].map((text, i) => (
              <div key={i} className="flex items-center text-[10px] font-bold uppercase tracking-wider text-white/80">
                <span className={`w-2 h-2 mr-2 rounded-full shadow-sm ${i === 0 ? 'bg-success-500' : i === 1 ? 'bg-primary-500' : 'bg-secondary-500'}`} />
                {text}
              </div>
            ))}
        </div>
      </div>

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
