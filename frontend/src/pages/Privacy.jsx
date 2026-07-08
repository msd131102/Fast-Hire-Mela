import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Eye, Lock, UserCheck } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background text-text">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600/20 to-secondary-600/20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl md:text-2xl text-muted max-w-3xl mx-auto">
              Your privacy is our priority. Learn how we protect and use your data.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Last Updated */}
        <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4 mb-8">
          <p className="text-sm font-bold text-primary-300">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Introduction */}
        <Card className="p-8 mb-8 bg-surface border border-border shadow-adventure">
          <h2 className="text-2xl font-bold text-text mb-6">Our Commitment to Privacy</h2>
          <p className="text-muted mb-4">
            At Fast Hire Mela, we are committed to protecting your personal information and respecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>
          <p className="text-muted">
            By using Fast Hire Mela, you agree to the collection and use of information in accordance with this policy.
          </p>
        </Card>

        {/* Information We Collect */}
        <Card className="p-8 mb-8 bg-surface border border-border shadow-adventure">
          <div className="flex items-center mb-6">
            <div className="bg-primary-500/20 rounded-full p-3 mr-4">
              <Eye className="h-6 w-6 text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-text">Information We Collect</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-text mb-3">Personal Information</h3>
              <ul className="list-disc list-inside text-muted space-y-2">
                <li>Name, email address, phone number</li>
                <li>Resume/CV and career information</li>
                <li>Work history and education details</li>
                <li>Skills and preferences</li>
                <li>Profile picture and professional information</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-text mb-3">Usage Data</h3>
              <ul className="list-disc list-inside text-muted space-y-2">
                <li>Pages visited and time spent on our platform</li>
                <li>Job applications and searches performed</li>
                <li>Interaction with employers and job postings</li>
                <li>Device information and browser type</li>
                <li>IP address and location data</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-text mb-3">Communications</h3>
              <ul className="list-disc list-inside text-muted space-y-2">
                <li>Email communications and responses</li>
                <li>Customer support inquiries</li>
                <li>Feedback and survey responses</li>
                <li>Newsletter subscriptions</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* How We Use Your Information */}
        <Card className="p-8 mb-8 bg-surface border border-border shadow-adventure">
          <div className="flex items-center mb-6">
            <div className="bg-success-500/20 rounded-full p-3 mr-4">
              <Shield className="h-6 w-6 text-success-400" />
            </div>
            <h2 className="text-2xl font-bold text-text">How We Use Your Information</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-success-500/20 rounded-full p-2 mr-3 mt-1">
                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold text-text mb-1">Job Matching</h3>
                <p className="text-muted">To connect you with relevant job opportunities and employers</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-success-500/20 rounded-full p-2 mr-3 mt-1">
                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold text-text mb-1">Platform Improvement</h3>
                <p className="text-muted">To enhance and personalize your experience on our platform</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-success-500/20 rounded-full p-2 mr-3 mt-1">
                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold text-text mb-1">Communication</h3>
                <p className="text-muted">To send you important updates, job alerts, and platform news</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-success-500/20 rounded-full p-2 mr-3 mt-1">
                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold text-text mb-1">Safety & Security</h3>
                <p className="text-muted">To protect against fraud and ensure platform security</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Data Protection */}
        <Card className="p-8 mb-8 bg-surface border border-border shadow-adventure">
          <div className="flex items-center mb-6">
            <div className="bg-secondary-500/20 rounded-full p-3 mr-4">
              <Lock className="h-6 w-6 text-secondary-400" />
            </div>
            <h2 className="text-2xl font-bold text-text">Data Protection & Security</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-muted">
              We implement robust security measures to protect your personal information:
            </p>
            
            <ul className="list-disc list-inside text-muted space-y-2">
              <li>SSL encryption for all data transmissions</li>
              <li>Secure servers with limited access</li>
              <li>Regular security audits and updates</li>
              <li>Employee training on data protection</li>
              <li>Compliance with data protection regulations</li>
            </ul>
          </div>
        </Card>

        {/* Your Rights */}
        <Card className="p-8 mb-8 bg-surface border border-border shadow-adventure">
          <div className="flex items-center mb-6">
            <div className="bg-danger-500/20 rounded-full p-3 mr-4">
              <UserCheck className="h-6 w-6 text-danger-400" />
            </div>
            <h2 className="text-2xl font-bold text-text">Your Rights</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-text mb-2">You have the right to:</h3>
              <ul className="list-disc list-inside text-muted space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Export your data</li>
                <li>Restrict processing of your information</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-8 bg-primary-500/10 border border-primary-500/30 shadow-adventure">
          <h2 className="text-2xl font-bold text-text mb-6">Questions About Your Privacy?</h2>
          <p className="text-muted mb-6">
            If you have any questions or concerns about this Privacy Policy or how we handle your data, 
            please don't hesitate to contact us.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/contact">
              <Button variant="primary">Contact Us</Button>
            </Link>
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
