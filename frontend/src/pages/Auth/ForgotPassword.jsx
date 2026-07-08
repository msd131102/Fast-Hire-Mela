import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Mail } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { forgotPassword } from '../../services/api';

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [email, setEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const watchedEmail = watch('email');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await forgotPassword(data.email);
      
      if (response.success) {
        setEmail(data.email);
        setIsEmailSent(true);
        
        // In development, show the reset token and link
        if (response.resetToken) {
          console.log('Reset Token:', response.resetToken);
          console.log('Reset Link:', response.resetLink);
          toast.success(`Password reset link sent! Check console for development info.`);
        } else {
          toast.success('Password reset link sent to your email!');
        }
      } else {
        toast.error(response.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-success-500/20 flex items-center justify-center shadow-adventure">
              <Mail className="h-6 w-6 text-success-500" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-text">
              Check Your Email
            </h2>
            <p className="mt-2 text-sm text-muted">
              We've sent a password reset link to<br />
              <span className="font-bold text-text">{email}</span>
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="bg-primary-900/20 border border-primary-500/50 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Mail className="h-5 w-5 text-primary-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-bold text-primary-300">
                    Didn't receive the email?
                  </h3>
                  <div className="mt-2 text-sm text-primary-200">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Check your spam folder</li>
                      <li>Make sure the email address is correct</li>
                      <li>Wait a few minutes for delivery</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setIsEmailSent(false)}
                className="w-full flex justify-center py-2 px-4 border border-border rounded-md shadow-sm text-sm font-bold text-text bg-surface hover:bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
              >
                Try Another Email
              </button>
              
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-adventure text-sm font-black text-text bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link
            to="/login"
            className="inline-flex items-center text-sm font-bold text-muted hover:text-text mb-6 transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to login
          </Link>
          
          <div className="mx-auto h-12 w-12 rounded-full bg-primary-500/20 shadow-adventure flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary-400" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-black text-text">
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm font-medium text-muted">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              disabled={isLoading}
            />
          </div>

          <div>
            <Button
              type="submit"
              className="w-full h-12 bg-primary-600 hover:bg-primary-500 shadow-adventure text-text font-bold rounded-xl transition-all"
              disabled={isLoading || !watchedEmail}
              isLoading={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-muted">
              Remember your password?{' '}
              <Link
                to="/login"
                className="font-bold text-primary-500 hover:text-primary-400"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
