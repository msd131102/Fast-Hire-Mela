import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, AlertCircle, CheckCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background text-text">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600/20 to-secondary-600/20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Terms of Service
            </h1>
            <p className="text-xl md:text-2xl text-muted max-w-3xl mx-auto">
              Please read these terms carefully before using Fast Hire Mela.
            </p>
          </div>
        </div>
      </div>

      {/* Terms Content */}
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

        {/* Agreement */}
        <Card className="p-8 mb-8 bg-surface border border-border shadow-adventure">
          <div className="flex items-center mb-6">
            <div className="bg-primary-500/20 rounded-full p-3 mr-4">
              <FileText className="h-6 w-6 text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-text">Agreement to Terms</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-muted">
              Welcome to Fast Hire Mela. By accessing or using our platform, you agree to be bound by 
              these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our service.
            </p>
            <p className="text-muted">
              These Terms govern your use of Fast Hire Mela, including job searching, applications, and any 
              other features or services offered.
            </p>
          </div>
        </Card>

        {/* User Responsibilities */}
        <Card className="p-8 mb-8 bg-surface border border-border shadow-adventure">
          <div className="flex items-center mb-6">
            <div className="bg-success-500/20 rounded-full p-3 mr-4">
              <Users className="h-6 w-6 text-success-400" />
            </div>
            <h2 className="text-2xl font-bold text-text">User Responsibilities</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-text mb-3">As a user, you agree to:</h3>
              <ul className="list-disc list-inside text-muted space-y-2">
                <li>Provide accurate and truthful information</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Use the platform for legitimate job-seeking purposes</li>
                <li>Respect the rights of other users and employers</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not engage in fraudulent or misleading activities</li>
                <li>Not post offensive, inappropriate, or harmful content</li>
                <li>Not attempt to harm or disrupt our platform's functionality</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Prohibited Activities */}
        <Card className="p-8 mb-8 bg-surface border border-border shadow-adventure">
          <div className="flex items-center mb-6">
            <div className="bg-danger-500/20 rounded-full p-3 mr-4">
              <AlertCircle className="h-6 w-6 text-danger-400" />
            </div>
            <h2 className="text-2xl font-bold text-text">Prohibited Activities</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-muted mb-4">You are strictly prohibited from:</p>
            
            <ul className="list-disc list-inside text-muted space-y-2">
              <li>Creating multiple accounts or false identities</li>
              <li>Using automated tools to access or scrape our platform</li>
              <li>Posting fake or misleading job opportunities</li>
              <li>Harassing, threatening, or abusing other users</li>
              <li>Violating intellectual property rights</li>
              <li>Engaging in spam or unsolicited communications</li>
              <li>Attempting to gain unauthorized access to our systems</li>
              <li>Using the platform for illegal activities</li>
            </ul>
          </div>
        </Card>

        {/* Job Applications */}
        <Card className="p-8 mb-8 bg-surface border border-border shadow-adventure">
          <h2 className="text-2xl font-bold text-text mb-6">Job Applications & Communications</h2>
          
          <div className="space-y-4">
            <p className="text-muted">
              When you apply for jobs through Fast Hire Mela:
            </p>
            
            <ul className="list-disc list-inside text-muted space-y-2">
              <li>You authorize us to share your profile with potential employers</li>
              <li>You represent that all information provided is accurate</li>
              <li>You understand that employers may contact you directly</li>
              <li>You agree to communicate professionally with employers</li>
              <li>You acknowledge that job postings are provided by third parties</li>
            </ul>
          </div>
        </Card>

        {/* Intellectual Property */}
        <Card className="p-8 mb-8 bg-surface border border-border shadow-adventure">
          <h2 className="text-2xl font-bold text-text mb-6">Intellectual Property</h2>
          
          <div className="space-y-4">
            <p className="text-muted">
              Fast Hire Mela and its original content, features, and functionality are owned by 
              Fast Hire Mela and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            
            <p className="text-muted">
              You may not modify, reproduce, distribute, create derivative works, or publicly display 
              any content from our platform without our express written permission.
            </p>
          </div>
        </Card>

        {/* Privacy */}
        <Card className="p-8 mb-8 bg-surface border border-border shadow-adventure">
          <h2 className="text-2xl font-bold text-text mb-6">Privacy & Data Protection</h2>
          
          <div className="space-y-4">
            <p className="text-muted">
              Your privacy is important to us. Please review our Privacy Policy to understand how we 
              collect, use, and protect your information.
            </p>
            
            <p className="text-muted">
              By using our platform, you consent to the collection and use of information as described 
              in our Privacy Policy.
            </p>
          </div>
        </Card>

        {/* Disclaimers */}
        <Card className="p-8 mb-8 bg-surface border border-border shadow-adventure">
          <h2 className="text-2xl font-bold text-text mb-6">Disclaimers</h2>
          
          <div className="space-y-4">
            <p className="text-muted">
              Fast Hire Mela is provided on an "as is" and "as available" basis. We make no warranties, 
              expressed or implied, regarding the accuracy, reliability, or completeness of job listings 
              or other content on our platform.
            </p>
            
            <p className="text-muted">
              We do not guarantee employment outcomes or the quality of job opportunities posted on our platform. 
              Users are responsible for conducting their own due diligence.
            </p>
          </div>
        </Card>

        {/* Limitation of Liability */}
        <Card className="p-8 mb-8 bg-surface border border-border shadow-adventure">
          <h2 className="text-2xl font-bold text-text mb-6">Limitation of Liability</h2>
          
          <div className="space-y-4">
            <p className="text-muted">
              To the maximum extent permitted by law, Fast Hire Mela shall not be liable for any indirect, 
              incidental, special, or consequential damages arising from your use of our platform.
            </p>
            
            <p className="text-muted">
              Our total liability for any claims arising from these Terms shall not exceed the amount 
              you paid for our services, if any, in the twelve months preceding the claim.
            </p>
          </div>
        </Card>

        {/* Termination */}
        <Card className="p-8 mb-8 bg-surface border border-border shadow-adventure">
          <div className="flex items-center mb-6">
            <div className="bg-secondary-500/20 rounded-full p-3 mr-4">
              <CheckCircle className="h-6 w-6 text-secondary-400" />
            </div>
            <h2 className="text-2xl font-bold text-text">Termination</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-muted">
              We may terminate or suspend your account at any time, with or without cause, 
              including if you violate these Terms.
            </p>
            
            <p className="text-muted">
              You may also terminate your account at any time by following the account deletion 
              process in your account settings.
            </p>
          </div>
        </Card>

        {/* Changes to Terms */}
        <Card className="p-8 mb-8 bg-surface border border-border shadow-adventure">
          <h2 className="text-2xl font-bold text-text mb-6">Changes to These Terms</h2>
          
          <div className="space-y-4">
            <p className="text-muted">
              We reserve the right to modify these Terms at any time. Changes will be effective 
              immediately upon posting on our platform.
            </p>
            
            <p className="text-muted">
              Your continued use of the platform after any changes constitutes acceptance of the updated Terms.
            </p>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-8 bg-primary-500/10 border border-primary-500/30 shadow-adventure">
          <h2 className="text-2xl font-bold text-text mb-6">Questions About Our Terms?</h2>
          <p className="text-muted mb-6">
            If you have any questions or concerns about these Terms of Service, 
            please don't hesitate to contact us.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/contact">
              <Button variant="primary">Contact Us</Button>
            </Link>
            <Link to="/privacy">
              <Button variant="outline">View Privacy Policy</Button>
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

export default Terms;
