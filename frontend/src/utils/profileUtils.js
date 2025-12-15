/**
 * Profile completion calculation utility
 * Provides consistent profile completion percentage calculation across all components
 */

/**
 * Calculate profile completion percentage based on user data
 * Uses weighted system where essential fields have higher weight
 * 
 * @param {Object} userData - User profile data
 * @returns {number} Profile completion percentage (0-100)
 */
export const calculateProfileCompletion = (userData) => {
  if (!userData) return 0;
  
  console.log('🔍 ProfileUtils: Calculating completion for:', userData);
  
  // Define essential and optional fields with their weights
  const fieldWeights = {
    // Essential fields (higher weight)
    'name': 3,
    'phone': 2,
    'email': 2, // Always present for registered users
    'city': 2,
    'country': 2,
    'current_job_title': 3,
    'experience_years': 2,
    'industry': 2,
    'education_level': 2,
    'skills': 3,
    
    // Important fields (medium weight)
    'state': 1,
    'bio': 1,
    'current_company': 1,
    
    // Optional fields (lower weight)
    'linkedin_url': 1,
    'github_url': 1,
    'portfolio_url': 1,
    'website_url': 1,
    'profile_picture': 1,
    'preferred_job_types': 1,
    'preferred_locations': 1,
    'preferred_salary_min': 1,
    'preferred_salary_max': 1
  };
  
  let totalWeight = 0;
  let completedWeight = 0;
  
  Object.entries(fieldWeights).forEach(([field, weight]) => {
    totalWeight += weight;
    
    const value = userData[field];
    let isCompleted = false;
    
    // Check if value exists and is not empty
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value === 'string') {
        isCompleted = value.trim() !== '';
      } else if (Array.isArray(value)) {
        isCompleted = value.length > 0;
      } else {
        // For numbers, booleans, or other non-string types
        isCompleted = true;
      }
    }
    
    if (isCompleted) {
      completedWeight += weight;
    }
  });
  
  const completionPercentage = Math.round((completedWeight / totalWeight) * 100);
  console.log('📊 ProfileUtils: Completion calculated:', completionPercentage, '%');
  
  return completionPercentage;
};

/**
 * Get profile completion status text based on percentage
 * 
 * @param {number} percentage - Profile completion percentage
 * @returns {Object} Status object with text and color
 */
export const getProfileCompletionStatus = (percentage) => {
  if (percentage >= 80) {
    return {
      text: 'Excellent! Your profile is almost complete.',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    };
  } else if (percentage >= 60) {
    return {
      text: 'Good! Your profile is looking great.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    };
  } else if (percentage >= 40) {
    return {
      text: 'Getting there! Add more details to improve your profile.',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    };
  } else {
    return {
      text: 'Just getting started! Complete your profile to get better matches.',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    };
  }
};

/**
 * Get missing essential fields for profile completion
 * 
 * @param {Object} userData - User profile data
 * @returns {Array} Array of missing essential field names
 */
export const getMissingEssentialFields = (userData) => {
  if (!userData) return [];
  
  const essentialFields = [
    { name: 'name', label: 'Full Name' },
    { name: 'phone', label: 'Phone Number' },
    { name: 'city', label: 'City' },
    { name: 'country', label: 'Country' },
    { name: 'current_job_title', label: 'Job Title' },
    { name: 'experience_years', label: 'Experience Years' },
    { name: 'industry', label: 'Industry' },
    { name: 'education_level', label: 'Education Level' },
    { name: 'skills', label: 'Skills' }
  ];
  
  return essentialFields.filter(field => {
    const value = userData[field.name];
    return !value || (typeof value === 'string' && value.trim() === '');
  });
};
