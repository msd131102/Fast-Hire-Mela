import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { resetPassword } from '../../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError
  } = useForm();

  const watchedPassword = watch('password');
  const watchedConfirmPassword = watch('confirmPassword');

  useEffect(() => {
    if (!token) {
      setTokenError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const onSubmit = async (data) => {
    if (!token) {
      setError('root', { message: 'Invalid reset token' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await resetPassword(token, data.password);
      
      if (response.success) {
        setIsSuccess(true);
        toast.success('Password reset successfully!');
      } else {
        setError('root', { message: response.message || 'Failed to reset password' });
        toast.error(response.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
      setError('root', { message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-danger-500/20 shadow-adventure flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-danger-500" />
            </div>
            <h2 className="mt-6 text-3xl font-black text-text">
              Invalid Reset Link
            </h2>
            <p className="mt-2 text-sm font-medium text-muted">
              {tokenError}
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/forgot-password"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-adventure text-sm font-black text-text bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
            >
              Request New Reset Link
            </Link>
            
            <Link
              to="/login"
              className="w-full flex justify-center py-2 px-4 border border-border rounded-md shadow-sm text-sm font-bold text-text bg-surface hover:bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-success-500/20 shadow-adventure flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-success-500" />
            </div>
            <h2 className="mt-6 text-3xl font-black text-text">
              Password Reset Successful
            </h2>
            <p className="mt-2 text-sm font-medium text-muted">
              Your password has been successfully reset. You can now login with your new password.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-adventure text-sm font-black text-text bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
            >
              Go to Login
            </Link>
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
            <Lock className="h-6 w-6 text-primary-400" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-black text-text">
            Set New Password
          </h2>
          <p className="mt-2 text-center text-sm font-medium text-muted">
            Enter your new password below.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {errors.root && (
            <div className="bg-danger-500/10 border border-danger-500/50 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-danger-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-bold text-danger-500">{errors.root.message}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                  }
                })}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-muted hover:text-primary-400 transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-muted hover:text-primary-400 transition-colors" />
                )}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value => value === watchedPassword || 'Passwords do not match'
                })}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-muted hover:text-primary-400 transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-muted hover:text-primary-400 transition-colors" />
                )}
              </button>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full h-12 bg-primary-600 hover:bg-primary-500 shadow-adventure text-text font-bold rounded-xl transition-all"
              disabled={isLoading || !watchedPassword || !watchedConfirmPassword}
              isLoading={isLoading}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
