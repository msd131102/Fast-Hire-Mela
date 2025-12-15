import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Target, Award, Heart } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-6 sm:px-12 lg:px-16 py-28 text-center">
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight leading-none mb-3">
            About Us
          </h1>
          <h2 className="text-5xl md:text-6xl font-bold tracking-wide mb-6 text-purple-300">
            Fast Hire Mela
          </h2>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto text-blue-200 font-light italic">
           AI-powered job discovery platform focused on freshers and entry-level jobs across India. 
           Updated daily at 8 PM.
          </p>
        </div>
      </div>
      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-6">
              Fast Hire Mela is dedicated to revolutionizing the job search experience in India.
              We bridge the gap between talented professionals and top companies, making the
              hiring process faster, more efficient, and more transparent.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              Our platform leverages cutting-edge technology and AI-powered matching to ensure
              that every job seeker finds their perfect role and every employer discovers their
              ideal candidate.
            </p>
            <div className="flex space-x-4">
              <Link to="/jobs">
                <Button variant="primary">Browse Jobs</Button>
              </Link>
              <Link to="/premium">
                <Button variant="outline">Learn More</Button>
              </Link>
            </div>
          </div>
          <div className="bg-blue-100 rounded-lg p-8 text-center">
            <Target className="h-24 w-24 text-blue-600 mx-auto mb-4" />
            <p className="text-2xl font-semibold text-blue-900">Growing Daily</p>
            <p className="text-blue-700">Jobs Across India</p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Values</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="text-center p-6">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community First</h3>
              <p className="text-gray-600">
                We believe in building a supportive community where job seekers and employers can connect and grow together.
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Matches</h3>
              <p className="text-gray-600">
                Our AI-powered matching ensures that every connection is meaningful and leads to successful outcomes.
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Excellence</h3>
              <p className="text-gray-600">
                We strive for excellence in everything we do, from user experience to customer support.
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Passion</h3>
              <p className="text-gray-600">
                We're passionate about helping people find careers they love and companies build great teams.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-blue-400 mb-2">Growing</p>
              <p className="text-gray-300">Job Seeker Community</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-400 mb-2">Trusted</p>
              <p className="text-gray-300">Partner Companies</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-400 mb-2">Quality</p>
              <p className="text-gray-300">Matching Algorithm</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-yellow-400 mb-2">24/7</p>
              <p className="text-gray-300">Support Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section - ONLY 1 CARD REMAINING */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Meet Our Team</h2>
        <div className="grid md:grid-cols-1 gap-8 max-w-xs mx-auto">
          <Card className="text-center p-6">
            <img
              // src="https://avatars.githubusercontent.com/u/96329889?v=4"
              // // alt="Mr. Shiva"
              // className="rounded-full w-24 h-24 mx-auto mb-4 object-cover"
            />

            <h3 className="text-xl font-semibold mb-1">Mr. Shiva</h3>
            <p className="text-gray-600 mb-1">Founder</p>

            <span className="inline-block px-3 py-1 text-xs font-bold text-blue-700 bg-blue-100 rounded-full mb-2">
              2+ Years Experience
            </span>

            <p className="text-sm text-gray-500 mt-2">
              Full-stack engineer crafting smart, modern job discovery and hiring solutions.
            </p>

          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Career?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of professionals who found their dream jobs through Fast Hire Mela
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                Get Started Free
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="bg-white text-blue-600 hover:bg-gray-100">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div >
  );
};

export default About;
