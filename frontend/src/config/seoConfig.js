// SEO Configuration for Fast Hire Mela

export const SEO_CONFIG = {
  site: {
    name: 'Fast Hire Mela',
    url: 'https://www.fasthiremela.online',
    defaultTitle: 'Fast Hire Mela - AI-Powered Job Discovery Platform',
    defaultDescription: 'Find verified jobs in India with AI-powered daily updates. Completely free for freshers and experienced candidates.',
    defaultImage: '/favicon.png',
    twitterHandle: '@fasthiremela',
    keywords: 'jobs, fresher jobs, experienced jobs, India, AI job alerts, job portal, recruitment, career'
  },
  
  pages: {
    home: {
      title: 'Fast Hire Mela - AI-Powered Job Discovery Platform',
      description: 'Find verified jobs in India with AI-powered daily updates. Completely free for freshers and experienced candidates. Apply directly to company portals.',
      keywords: 'jobs, fresher jobs, experienced jobs, India, AI job alerts, job portal, recruitment, career',
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Fast Hire Mela',
          url: 'https://www.fasthiremela.online',
          description: 'Find verified jobs in India with AI-powered daily updates',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://www.fasthiremela.online/jobs?q={search_term_string}',
            'query-input': 'required name=search_term_string'
          }
        }
      ]
    },
    
    jobs: {
      title: 'Latest Jobs in India - Fast Hire Mela',
      description: 'Browse thousands of verified job openings across India. Find fresher and experienced jobs from top companies with AI-powered matching.',
      keywords: 'jobs in India, latest jobs, job openings, fresher jobs, experienced jobs, job search',
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Job Listings',
          description: 'Browse thousands of verified job openings across India'
        }
      ]
    },
    
    fresherJobs: {
      title: 'Fresher Jobs in India - Entry Level Opportunities | Fast Hire Mela',
      description: 'Find the best fresher jobs and entry-level opportunities in India. No experience required jobs for recent graduates and freshers.',
      keywords: 'fresher jobs, entry level jobs, jobs for freshers, no experience jobs, graduate jobs',
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Fresher Jobs',
          description: 'Entry-level job opportunities for fresh graduates'
        }
      ]
    },
    
    categories: {
      title: 'Job Categories - Browse Jobs by Industry | Fast Hire Mela',
      description: 'Explore job opportunities by category. Find jobs in IT, Banking, Healthcare, Engineering and more industries.',
      keywords: 'job categories, jobs by industry, IT jobs, banking jobs, healthcare jobs, engineering jobs',
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Job Categories',
          description: 'Browse jobs by industry and category'
        }
      ]
    },
    
    companies: {
      title: 'Top Companies Hiring - Company Profiles | Fast Hire Mela',
      description: 'Discover top companies hiring in India. View company profiles, job openings, and apply directly to your dream companies.',
      keywords: 'top companies, company profiles, hiring companies, best companies to work',
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Top Companies',
          description: 'Browse top companies currently hiring'
        }
      ]
    },
    
    about: {
      title: 'About Fast Hire Mela - Our Mission & Vision',
      description: 'Learn about Fast Hire Mela - India\'s leading AI-powered job discovery platform. Our mission is to connect job seekers with verified opportunities.',
      keywords: 'about fast hire mela, job portal mission, AI job discovery, company vision',
      noIndex: false
    },
    
    contact: {
      title: 'Contact Fast Hire Mela - Get in Touch',
      description: 'Contact Fast Hire Mela for support, partnerships, or inquiries. We\'re here to help with your job search journey.',
      keywords: 'contact fast hire mela, job portal support, customer service, partnerships',
      noIndex: false
    },
    
    login: {
      title: 'Login to Fast Hire Mela - Access Your Account',
      description: 'Login to your Fast Hire Mela account to access saved jobs, applications, and personalized job recommendations.',
      keywords: 'login fast hire mela, job portal login, account access',
      noIndex: true
    },
    
    register: {
      title: 'Sign Up for Fast Hire Mela - Create Free Account',
      description: 'Create your free Fast Hire Mela account to start your job search journey. Get personalized job alerts and AI-powered recommendations.',
      keywords: 'sign up fast hire mela, job portal registration, create account',
      noIndex: true
    },
    
    dashboard: {
      title: 'My Dashboard - Fast Hire Mela',
      description: 'Access your personalized job dashboard. Track applications, saved jobs, and get AI-powered job recommendations.',
      keywords: 'job dashboard, saved jobs, job applications',
      noIndex: true
    }
  },
  
  jobPost: {
    title: (jobTitle, company) => `${jobTitle} at ${company} - Fast Hire Mela`,
    description: (jobTitle, company, location, description) => 
      `Apply for ${jobTitle} position at ${company} in ${location}. ${description?.substring(0, 150) || 'Find detailed job information and requirements.'}`,
    keywords: (jobTitle, company, skills) => 
      `${jobTitle}, ${company}, ${skills?.join(', ') || 'job opening'}, career opportunity`,
    structuredData: (job) => ({
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.title,
      description: job.description,
      datePosted: job.postedDate || new Date().toISOString(),
      validThrough: job.validThrough || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      employmentType: job.employmentType || 'FULL_TIME',
      hiringOrganization: {
        '@type': 'Organization',
        name: job.company,
        sameAs: job.companyWebsite
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: job.location?.city || '',
          addressRegion: job.location?.state || '',
          addressCountry: 'IN'
        }
      },
      baseSalary: job.salary ? {
        '@type': 'MonetaryAmount',
        currency: 'INR',
        value: {
          '@type': 'QuantitativeValue',
          minValue: job.salary.min,
          maxValue: job.salary.max,
          unitText: 'YEAR'
        }
      } : undefined,
      skills: job.skills || [],
      educationRequirements: job.educationRequirements,
      experienceRequirements: job.experienceRequirements,
      responsibilities: job.responsibilities,
      benefits: job.benefits,
      workHours: job.workHours || 'Full-time'
    })
  },
  
  category: {
    title: (categoryName) => `${categoryName} Jobs in India - Fast Hire Mela`,
    description: (categoryName, jobCount) => 
      `Find ${jobCount || 'hundreds of'} ${categoryName.toLowerCase()} job opportunities across India. Apply to verified ${categoryName.toLowerCase()} positions from top companies.`,
    keywords: (categoryName) => 
      `${categoryName} jobs, ${categoryName.toLowerCase()} careers, ${categoryName.toLowerCase()} opportunities`,
    structuredData: (categoryName, jobs) => ({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${categoryName} Jobs`,
      description: `Browse ${categoryName} job opportunities`,
      numberOfItems: jobs?.length || 0
    })
  },
  
  company: {
    title: (companyName) => `${companyName} Jobs & Careers - Fast Hire Mela`,
    description: (companyName, jobCount, description) => 
      `Explore ${jobCount || 'latest'} job openings at ${companyName}. ${description?.substring(0, 150) || 'Join a great team and advance your career.'}`,
    keywords: (companyName) => 
      `${companyName} jobs, ${companyName.toLowerCase()} careers, work at ${companyName}`,
    structuredData: (company) => ({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: company.name,
      url: company.website,
      logo: company.logo,
      description: company.description,
      address: company.address ? {
        '@type': 'PostalAddress',
        addressLocality: company.address.city,
        addressRegion: company.address.state,
        addressCountry: 'IN'
      } : undefined,
      sameAs: company.socialMedia,
      numberOfEmployees: company.employees
    })
  }
};

export default SEO_CONFIG;
