// Google Analytics 4 tracking utility for Fast Hire Mela

// Track page views
export const trackPageView = (path, title, additionalParams = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-7H717RHZGG', {
      page_title: title || document.title,
      page_location: window.location.href,
      page_path: path || window.location.pathname,
      ...additionalParams
    });
  }
};

// Track custom events
export const trackEvent = (eventName, eventParameters = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      custom_map: { custom_parameter_1: 'job_category' },
      ...eventParameters
    });
  }
};

// Job search tracking
export const trackJobSearch = (searchQuery, filters = {}) => {
  trackEvent('job_search', {
    search_term: searchQuery,
    job_category: filters.category || 'all',
    job_location: filters.location || 'all',
    job_type: filters.type || 'all',
    experience_level: filters.experience || 'all'
  });
};

// Job application tracking
export const trackJobApplication = (jobId, jobTitle, company, applicationMethod = 'external') => {
  trackEvent('job_application', {
    job_id: jobId,
    job_title: jobTitle,
    company_name: company,
    application_method: applicationMethod,
    content_type: 'job'
  });
};

// Job save tracking
export const trackJobSave = (jobId, jobTitle, company) => {
  trackEvent('save_job', {
    job_id: jobId,
    job_title: jobTitle,
    company_name: company,
    content_type: 'job'
  });
};

// User registration tracking
export const trackUserRegistration = (registrationMethod = 'email') => {
  trackEvent('sign_up', {
    method: registrationMethod,
    content_type: 'user'
  });
};

// User login tracking
export const trackUserLogin = (loginMethod = 'email') => {
  trackEvent('login', {
    method: loginMethod,
    content_type: 'user'
  });
};

// Premium subscription tracking
export const trackPremiumSubscription = (planType, price) => {
  trackEvent('purchase', {
    transaction_id: `premium_${Date.now()}`,
    value: price,
    currency: 'INR',
    items: [{
      item_id: planType,
      item_name: `${planType} Premium Plan`,
      category: 'subscription',
      quantity: 1
    }]
  });
};

// Contact form submission tracking
export const trackContactSubmission = (contactType = 'general') => {
  trackEvent('contact_form_submission', {
    contact_type: contactType,
    content_type: 'contact'
  });
};

// Newsletter subscription tracking
export const trackNewsletterSubscription = () => {
  trackEvent('newsletter_subscription', {
    content_type: 'newsletter'
  });
};

// Job category view tracking
export const trackCategoryView = (categoryName, jobCount) => {
  trackEvent('category_view', {
    category_name: categoryName,
    job_count: jobCount,
    content_type: 'category'
  });
};

// Company page view tracking
export const trackCompanyView = (companyName, jobCount) => {
  trackEvent('company_view', {
    company_name: companyName,
    job_count: jobCount,
    content_type: 'company'
  });
};

// Error tracking
export const trackError = (errorType, errorMessage, errorContext = {}) => {
  trackEvent('error', {
    error_type: errorType,
    error_message: errorMessage,
    ...errorContext
  });
};

// Performance tracking
export const trackPerformance = (metricName, value, metricType = 'timing') => {
  trackEvent('performance_metric', {
    metric_name: metricName,
    metric_value: value,
    metric_type: metricType
  });
};

// User engagement tracking
export const trackUserEngagement = (engagementType, duration = null) => {
  const params = {
    engagement_type: engagementType
  };
  
  if (duration) {
    params.engagement_duration = duration;
  }
  
  trackEvent('user_engagement', params);
};

// Social media share tracking
export const trackSocialShare = (platform, contentType, contentId) => {
  trackEvent('share', {
    method: platform,
    content_type: contentType,
    content_id: contentId
  });
};

// Download tracking (for resumes, guides, etc.)
export const trackDownload = (fileName, fileType) => {
  trackEvent('download', {
    file_name: fileName,
    file_type: fileType,
    content_type: 'file'
  });
};

// Search filters usage tracking
export const trackFilterUsage = (filterType, filterValue) => {
  trackEvent('filter_usage', {
    filter_type: filterType,
    filter_value: filterValue
  });
};

// Job alert creation tracking
export const trackJobAlertCreation = (alertFrequency, alertCriteria) => {
  trackEvent('job_alert_creation', {
    alert_frequency: alertFrequency,
    alert_criteria: JSON.stringify(alertCriteria)
  });
};

// Referral tracking
export const trackReferral = (referralType, referralCode) => {
  trackEvent('referral', {
    referral_type: referralType,
    referral_code: referralCode
  });
};

export default {
  trackPageView,
  trackEvent,
  trackJobSearch,
  trackJobApplication,
  trackJobSave,
  trackUserRegistration,
  trackUserLogin,
  trackPremiumSubscription,
  trackContactSubmission,
  trackNewsletterSubscription,
  trackCategoryView,
  trackCompanyView,
  trackError,
  trackPerformance,
  trackUserEngagement,
  trackSocialShare,
  trackDownload,
  trackFilterUsage,
  trackJobAlertCreation,
  trackReferral
};
