import React, { useState } from 'react';

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [expandedItems, setExpandedItems] = useState(new Set());

  const faqCategories = [
    {
      id: 'general',
      name: 'General',
      icon: '🌐',
      questions: [
        {
          id: 'what-is-fast-hire-mela',
          question: 'What is Fast Hire Mela?',
          answer: 'Fast Hire Mela is a comprehensive job search platform that connects job seekers with employers across various industries. We provide a user-friendly interface for searching jobs, managing applications, and tracking your career progress.'
        },
        {
          id: 'is-it-free',
          question: 'Is Fast Hire Mela free to use?',
          answer: 'Yes, Fast Hire Mela offers a free tier with basic job search and application features. We also offer premium plans with advanced features like unlimited job applications, resume analytics, and priority support.'
        },
        {
          id: 'how-does-it-work',
          question: 'How does Fast Hire Mela work?',
          answer: 'Simply create an account, browse through available jobs, and apply with a single click. You can also save jobs for later, track your applications, and receive updates on your application status.'
        }
      ]
    },
    {
      id: 'account',
      name: 'Account & Profile',
      icon: '👤',
      questions: [
        {
          id: 'create-account',
          question: 'How do I create an account?',
          answer: 'Click on the "Sign Up" button and fill in your details including name, email, and password. You\'ll receive a confirmation email to verify your account.'
        },
        {
          id: 'reset-password',
          question: 'How do I reset my password?',
          answer: 'Click on "Forgot Password" on the login page, enter your registered email address, and follow the instructions sent to your email to reset your password.'
        },
        {
          id: 'update-profile',
          question: 'Can I update my profile information?',
          answer: 'Yes, you can update your profile information anytime by going to your dashboard and clicking on the "Profile" section. You can update your personal details, work experience, education, and skills.'
        },
        {
          id: 'delete-account',
          question: 'How can I delete my account?',
          answer: 'You can delete your account from the profile settings. Please note that this action is permanent and will remove all your data including saved jobs and application history.'
        }
      ]
    },
    {
      id: 'jobs',
      name: 'Job Search & Applications',
      icon: '💼',
      questions: [
        {
          id: 'search-jobs',
          question: 'How do I search for jobs?',
          answer: 'Use the search bar on the jobs page to search by keywords, location, or company name. You can also filter results by category, salary range, experience level, and job type.'
        },
        {
          id: 'apply-jobs',
          question: 'How do I apply for a job?',
          answer: 'Click on any job listing to view details, then click the "Apply Now" button. Make sure your profile is complete and you have uploaded your resume before applying.'
        },
        {
          id: 'track-applications',
          question: 'Can I track my job applications?',
          answer: 'Yes, you can track all your job applications in the "Applications" section of your dashboard. You\'ll see the status of each application and receive updates when employers respond.'
        },
        {
          id: 'save-jobs',
          question: 'How do I save jobs for later?',
          answer: 'Click the bookmark icon on any job listing to save it. You can view all saved jobs in the "Saved Jobs" section of your dashboard.'
        },
        {
          id: 'job-alerts',
          question: 'Can I receive job alerts?',
          answer: 'Yes, premium members can set up job alerts based on their preferences. You\'ll receive email notifications when new jobs matching your criteria are posted.'
        }
      ]
    },
    {
      id: 'premium',
      name: 'Premium Features',
      icon: '⭐',
      questions: [
        {
          id: 'premium-benefits',
          question: 'What are the benefits of premium membership?',
          answer: 'Premium members enjoy unlimited job applications, advanced search filters, resume analytics, priority application visibility, detailed application insights, and priority customer support.'
        },
        {
          id: 'premium-cost',
          question: 'How much does premium membership cost?',
          answer: 'We offer flexible premium plans: Monthly at ₹299, Quarterly at ₹799 (save 11%), and Annual at ₹2,999 (save 17%). All plans include the same premium features.'
        },
        {
          id: 'upgrade-premium',
          question: 'How do I upgrade to premium?',
          answer: 'Go to the premium page from your dashboard, select your preferred plan, and complete the payment process. Your premium features will be activated immediately.'
        },
        {
          id: 'cancel-premium',
          question: 'Can I cancel my premium subscription?',
          answer: 'Yes, you can cancel your premium subscription anytime from your account settings. You\'ll continue to have access to premium features until the end of your current billing period.'
        }
      ]
    },
    {
      id: 'technical',
      name: 'Technical Support',
      icon: '🔧',
      questions: [
        {
          id: 'browser-support',
          question: 'Which browsers are supported?',
          answer: 'Fast Hire Mela works best on the latest versions of Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience.'
        },
        {
          id: 'mobile-app',
          question: 'Is there a mobile app available?',
          answer: 'Currently, Fast Hire Mela is optimized for mobile browsers. We\'re working on native mobile apps for iOS and Android, which will be available soon.'
        },
        {
          id: 'data-security',
          question: 'How is my data secured?',
          answer: 'We use industry-standard encryption to protect your personal information. All data transmissions are secured with SSL/TLS, and we follow strict data protection guidelines.'
        },
        {
          id: 'technical-issues',
          question: 'What should I do if I face technical issues?',
          answer: 'If you encounter any technical problems, please try clearing your browser cache, disabling browser extensions, or contacting our support team at support@fasthiremela.com.'
        }
      ]
    },
    {
      id: 'employers',
      name: 'For Employers',
      icon: '🏢',
      questions: [
        {
          id: 'post-jobs',
          question: 'How can employers post jobs?',
          answer: 'Employers can register for an employer account and post jobs through our employer portal. We offer various posting packages based on your hiring needs.'
        },
        {
          id: 'employer-benefits',
          question: 'What are the benefits for employers?',
          answer: 'Employers get access to a large talent pool, applicant tracking system, candidate filtering tools, and analytics to optimize their hiring process.'
        },
        {
          id: 'pricing-employers',
          question: 'What are the pricing plans for employers?',
          answer: 'We offer flexible pricing plans for employers including pay-per-job posting, monthly subscriptions, and enterprise solutions. Contact our sales team for customized pricing.'
        }
      ]
    }
  ];

  const toggleExpanded = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="min-h-screen bg-background text-text">

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 font-pixel">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted">
            Find answers to common questions about Fast Hire Mela
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search for answers..."
              className="w-full px-4 py-3 pl-12 rounded-lg border bg-surface border-border text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
            <svg
              className="absolute left-4 top-3.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {faqCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                activeCategory === category.id
                  ? 'bg-primary-600 text-text shadow-adventure'
                  : 'bg-surface text-muted hover:bg-secondary-800 border border-border'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqCategories
            .find(cat => cat.id === activeCategory)
            ?.questions.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border bg-surface border-border overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-secondary-800 transition-colors"
                >
                  <span className="font-medium pr-4">{item.question}</span>
                  <svg
                    className={`w-5 h-5 flex-shrink-0 transition-transform ${
                      expandedItems.has(item.id) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedItems.has(item.id) && (
                  <div className="px-6 py-4 border-t bg-background border-border text-muted">
                    <p className="leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* Contact Support */}
        <div className="mt-12 text-center p-8 rounded-3xl bg-surface border border-border shadow-adventure">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="mb-6 text-muted">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="px-6 py-3 bg-primary-600 text-text font-bold rounded-lg hover:bg-primary-500 shadow-adventure transition-all"
            >
              Contact Support
            </a>
            <a
              href="mailto:support@fasthiremela.com"
              className="px-6 py-3 rounded-lg border border-border text-text font-bold hover:bg-secondary-800 transition-colors"
            >
              Email Us
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/about"
            className="text-center p-4 rounded-2xl bg-surface border border-border hover:bg-secondary-800 shadow-adventure transition-colors"
          >
            <div className="text-2xl mb-2">ℹ️</div>
            <div className="font-bold text-text">About Us</div>
          </a>
          <a
            href="/contact"
            className="text-center p-4 rounded-2xl bg-surface border border-border hover:bg-secondary-800 shadow-adventure transition-colors"
          >
            <div className="text-2xl mb-2">📞</div>
            <div className="font-bold text-text">Contact</div>
          </a>
          <a
            href="/premium"
            className="text-center p-4 rounded-2xl bg-surface border border-border hover:bg-secondary-800 shadow-adventure transition-colors"
          >
            <div className="text-2xl mb-2">⭐</div>
            <div className="font-bold text-text">Premium</div>
          </a>
          <a
            href="/terms"
            className="text-center p-4 rounded-2xl bg-surface border border-border hover:bg-secondary-800 shadow-adventure transition-colors"
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="font-bold text-text">Terms</div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
