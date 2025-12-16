import React from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  User,
  Search,
  Bot,
  Send,
  Star,
  Shield,
  Lightbulb,
  HelpCircle,
  Gift,
  Clock,
  Mail,
  CheckCircle2
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const UserGuidance = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <Globe className="h-12 w-12 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            FastHireMela – Complete User Guidance
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-blue-100">
            A 100% FREE, AI-powered job discovery platform for Freshers & Experienced candidates in India.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          
          {/* Step 1 */}
          <Card className="bg-white p-6">
            <div className="flex items-center mb-4">
              <Globe className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Step 1: Visit FastHireMela</h2>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                Open FastHireMela website
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                Register & Login using Email or Google
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                Best experience on Desktop / Laptop
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                Mobile users should enable Desktop Mode
              </li>
            </ul>
          </Card>

          {/* Step 2 */}
          <Card className="bg-white p-6">
            <div className="flex items-center mb-4">
              <User className="h-6 w-6 text-green-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Step 2: Complete Your Profile (Mandatory)</h2>
            </div>
            <ul className="space-y-2 text-gray-700 mb-4">
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                Education, Skills, Experience
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                Preferred job location
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                Upload resume (recommended)
              </li>
            </ul>
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
              <p className="text-red-700 font-medium text-sm">
                ⚠️ Profile not updated for 4–5 hours → AI job updates will stop temporarily
              </p>
            </div>
          </Card>

          {/* Step 3 */}
          <Card className="bg-white p-6">
            <div className="flex items-center mb-4">
              <Search className="h-6 w-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Step 3: Browse Jobs</h2>
            </div>
            <ul className="space-y-2 text-gray-700 mb-4">
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                Category: IT, Govt, Private, Internship, Walk-in
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                Location-based search
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                Experience Level
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                Job Type: Full-time, Part-time, Remote
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                Latest / Today's Jobs
              </li>
            </ul>
            <p className="text-green-700 font-medium text-sm">
              ✅ All jobs are verified, active, and expiry-checked automatically.
            </p>
          </Card>

          {/* Step 4 */}
          <Card className="bg-white p-6">
            <div className="flex items-center mb-4">
              <Bot className="h-6 w-6 text-indigo-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Step 4: AI Daily Job Updates (8:00 PM)</h2>
            </div>
            <ul className="space-y-2 text-gray-700 mb-4">
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                AI scans company career pages & portals
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                Jobs are matched based on your profile
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                New jobs are added automatically
              </li>
            </ul>
            <p className="text-blue-700 font-medium text-sm">
              📬 You'll see fresh jobs daily without searching.
            </p>
          </Card>

          {/* Step 5 */}
          <Card className="bg-white p-6">
            <div className="flex items-center mb-4">
              <Send className="h-6 w-6 text-emerald-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Step 5: Apply for Jobs</h2>
            </div>
            <ul className="space-y-2 text-gray-700 mb-4">
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                Click "Apply Now"
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                Redirects to company website or direct application page
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                No fake or misleading redirects
              </li>
            </ul>
            <p className="text-yellow-700 font-medium text-sm">
              💡 Tip: Apply early for better response.
            </p>
          </Card>

          {/* Step 6 */}
          <Card className="bg-white p-6">
            <div className="flex items-center mb-4">
              <Star className="h-6 w-6 text-yellow-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Step 6: Benefits for Users</h2>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                ✔ Completely FREE forever
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                ✔ No recruiter spam
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                ✔ AI-powered daily updates
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                ✔ Freshers-friendly jobs
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                ✔ Simple & clean UI
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                ✔ Works even with low internet speed
              </li>
            </ul>
          </Card>
        </div>

        {/* Privacy Section */}
        <Card className="bg-white p-6 mb-8">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-green-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">🔒 Privacy & Safety</h2>
          </div>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
              Your data is secure
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
              Resume visible only when you apply
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
              No selling or sharing of user data
            </li>
          </ul>
        </Card>

        {/* Tips Section */}
        <Card className="bg-white p-6 mb-8">
          <div className="flex items-center mb-4">
            <Lightbulb className="h-6 w-6 text-orange-500 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">🧠 Best Tips to Get Hired Faster</h2>
          </div>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
              Complete profile to 100%
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
              Upload a clean, updated resume
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
              Check jobs daily after 8:00 PM
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
              Apply to multiple matching roles
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
              Keep skills updated regularly
            </li>
          </ul>
        </Card>

        {/* Help Section */}
        <Card className="bg-white p-6 mb-8">
          <div className="flex items-center mb-4">
            <HelpCircle className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">❓ Need Help?</h2>
          </div>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
              Use Contact / Support page
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
              Check FAQs inside the website
            </li>
            <li className="flex items-center">
              <Mail className="h-4 w-4 text-blue-500 mr-2" />
              Direct support email: fasthiremela@gmail.com
            </li>
          </ul>
        </Card>

        {/* Offer Section */}
        <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center mb-4">
              <Gift className="h-10 w-10" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Special Referral Offer 🎁</h2>
            <p className="text-lg mb-6 text-green-100">
              Share & refer FastHireMela. Users with <span className="font-bold text-white">20+ referrals</span> get <span className="font-bold text-white">FREE Premium Features</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/premium/referral">
                <Button className="bg-white text-green-600 font-bold px-6 py-3 rounded-lg">
                  Start Referring
                </Button>
              </Link>
              <Link to="/premium">
                <Button className="bg-transparent border-white text-white font-bold px-6 py-3 rounded-lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Footer Note */}
        <div className="text-center mt-12 text-gray-600">
          <p className="text-xl font-bold mb-4">All the best for your job search! 🚀</p>
          <p className="text-base">Thank you for choosing <span className="font-bold text-gray-900">FastHireMela</span> ❤️</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link to="/register">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold">
                Get Started Now
              </Button>
            </Link>
            <Link to="/jobs">
              <Button className="border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold">
                Browse Jobs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGuidance;
