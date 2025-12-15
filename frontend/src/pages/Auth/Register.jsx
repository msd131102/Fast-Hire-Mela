import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Timer
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

  // Timer for resend OTP
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
      // Set the registered user data and show the profile completion modal
      setRegisteredUser(data.user || { email: userEmail, name: userData.name });
      setShowProfileModal(true);
      
      // Auto-login the user after successful registration
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

  // Function to send OTP
  const sendOTP = async (email) => {
    setIsSendingOTP(true);
    try {
      const response = await otpAPI.sendOtp(email);
      if (response.success) {
        toast.success('OTP sent to your email address');
        setResendTimer(60); // Start 60-second countdown
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

  // Function to verify OTP
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

  // Handle step 1 submission (Basic Info)
  const handleStep1Submit = (data) => {
    setUserEmail(data.email);
    setUserData({ ...userData, ...data });
    nextStep();
  };

  // Handle step 2 submission (Professional Info)
  const handleStep2Submit = (data) => {
    setUserData({ ...userData, ...data });
    // Move to step 3 immediately and send OTP in background
    nextStep();
    setIsInitialSending(true);
    setOtpSentSuccess(false);
    sendOTP(userEmail).then((success) => {
      setIsInitialSending(false);
      if (success) {
        setOtpSentSuccess(true);
        toast.success(`OTP sent to ${userEmail}`);
      }
    });
  };

  // Handle step 3 submission (OTP Verification)
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

  // Handle final registration submission
  const onSubmit = (data) => {
    const { confirmPassword: _, terms: __, ...registerData } = data;
    const finalData = { ...userData, ...registerData };
    
    // Get the OTP from the form
    const otp = Object.keys(getValues())
      .filter(key => key.startsWith('otp'))
      .map(key => getValues(key))
      .join('');
    
    registerMutation.mutate({ userData: finalData, otp });
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  // Handle resend OTP
  const handleResendOTP = () => {
    if (resendTimer === 0) {
      sendOTP(userEmail);
    }
  };

  // Handle OTP input change
  const handleOTPChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      setValue(`otp${index}`, value);
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.querySelector(`input[name="otp${index + 1}"]`);
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  // Handle OTP key down
  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !getValues(`otp${index}`) && index > 0) {
      const prevInput = document.querySelector(`input[name="otp${index - 1}"]`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Create Account
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Join thousands of job seekers today
              </p>
            </motion.div>

            {/* Progress Steps */}
            <div className="flex justify-center items-center mt-6 space-x-2">
              {[1, 2, 3, 4].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step >= stepNumber
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                      }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <div
                      className={`w-8 h-1 transition-colors ${step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit(step === 1 ? handleStep1Submit : step === 2 ? handleStep2Submit : step === 3 ? handleStep3Submit : onSubmit)}>
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <Input
                    type="text"
                    placeholder="Full Name"
                    icon={<User className="w-5 h-5" />}
                    {...register('name', {
                      required: 'Full name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters',
                      },
                    })}
                    error={errors.name?.message}
                    className="h-12"
                  />

                  <Input
                    type="email"
                    placeholder="Email Address"
                    icon={<Mail className="w-5 h-5" />}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    error={errors.email?.message}
                    className="h-12"
                  />

                  <Input
                    type="tel"
                    placeholder="Phone Number"
                    icon={<Phone className="w-5 h-5" />}
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'Please enter a valid 10-digit phone number',
                      },
                    })}
                    error={errors.phone?.message}
                    className="h-12"
                  />

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 h-12"
                    >
                      Next Step
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Professional Information */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level
                    </label>
                    <select
                      {...register('experience_level', {
                        required: 'Experience level is required',
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select experience level</option>
                      <option value="Fresher">Fresher (0-1 years)</option>
                      <option value="Junior">Junior (1-3 years)</option>
                      <option value="Mid-level">Mid-level (3-5 years)</option>
                      <option value="Senior">Senior (5-8 years)</option>
                      <option value="Lead">Lead (8+ years)</option>
                    </select>
                    {errors.experience_level && (
                      <p className="mt-1 text-sm text-red-600">{errors.experience_level.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Role
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Software Engineer, Product Manager"
                      icon={<Briefcase className="w-5 h-5" />}
                      {...register('current_role', {
                        required: 'Current role is required',
                      })}
                      error={errors.current_role?.message}
                      className="h-12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Location
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Bangalore, Mumbai, Remote"
                      {...register('preferred_location', {
                        required: 'Preferred location is required',
                      })}
                      error={errors.preferred_location?.message}
                      className="h-12"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="flex-1 h-12"
                    >
                      Previous
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-12"
                    >
                      Next Step
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: OTP Verification */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Loading State */}
                  {isInitialSending && (
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Sending Verification Code
                      </h3>
                      <p className="text-sm text-gray-600">
                        Please wait while we send the OTP to your email...
                      </p>
                    </div>
                  )}

                  {/* Success State */}
                  {otpSentSuccess && !isInitialSending && (
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        OTP Sent Successfully
                      </h3>
                      <p className="text-sm text-gray-600">
                        We've sent a 6-digit OTP to <span className="font-medium text-blue-600">{userEmail}</span>
                      </p>
                    </div>
                  )}

                  {/* Normal State (after initial sending) */}
                  {!isInitialSending && (
                    <>
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Mail className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Verify Your Email
                        </h3>
                        <p className="text-sm text-gray-600">
                          Enter the 6-digit code sent to <span className="font-medium text-blue-600">{userEmail}</span>
                        </p>
                      </div>

                      <div className="flex justify-center gap-2 mb-6">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <input
                            key={index}
                            type="text"
                            maxLength="1"
                            className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                            {...register(`otp${index}`, {
                              required: true,
                              pattern: /^[0-9]$/
                            })}
                            onChange={(e) => handleOTPChange(index, e.target.value)}
                            onKeyDown={(e) => handleOTPKeyDown(index, e)}
                          />
                        ))}
                      </div>

                      <div className="text-center mb-6">
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          disabled={resendTimer > 0 || isSendingOTP}
                          className={`text-sm font-medium flex items-center justify-center gap-2 mx-auto ${resendTimer > 0 || isSendingOTP
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-blue-600 hover:text-blue-700'
                            }`}
                        >
                          {isSendingOTP ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Sending...
                            </>
                          ) : resendTimer > 0 ? (
                            <>
                              <Timer className="w-4 h-4" />
                              Resend in {resendTimer}s
                            </>
                          ) : (
                            'Resend OTP'
                          )}
                        </button>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          className="flex-1 h-12"
                        >
                          Previous
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 h-12"
                          disabled={isVerifyingOTP}
                          loading={isVerifyingOTP}
                        >
                          Verify OTP
                        </Button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* Step 4: Password Setup */}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create Password"
                      icon={<Lock className="w-5 h-5" />}
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters',
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                        },
                      })}
                      error={errors.password?.message}
                      className="h-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      icon={<Lock className="w-5 h-5" />}
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) => value === password || 'Passwords do not match',
                      })}
                      error={errors.confirmPassword?.message}
                      className="h-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Password Requirements:</h4>
                    <ul className="space-y-1 text-sm text-blue-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        At least 8 characters long
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Contains uppercase and lowercase letters
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Contains at least one number
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      {...register('terms', {
                        required: 'You must agree to the terms and conditions',
                      })}
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      I agree to the{' '}
                      <Link to="/terms" className="text-blue-600 hover:text-blue-700">
                        Terms and Conditions
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-blue-600 hover:text-blue-700">
                        Privacy Policy
                      </Link>
                    </span>
                  </div>
                  {errors.terms && (
                    <p className="text-sm text-red-600">{errors.terms.message}</p>
                  )}

                  {/* Error Message */}
                  {errors.root && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">{errors.root.message}</span>
                    </motion.div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="flex-1 h-12"
                    >
                      Previous
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-12"
                      disabled={registerMutation.isLoading}
                      loading={registerMutation.isLoading}
                    >
                      Create Account
                    </Button>
                  </div>
                </motion.div>
              )}
            </form>

            {/* Sign In Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-8 text-center"
            >
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  Sign in
                </Link>
              </p>
            </motion.div>
          </CardContent>
        </Card>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-8 text-center"
        >
          <div className="flex justify-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Free Account
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Job Alerts
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Resume Builder
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Profile Completion Modal */}
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
