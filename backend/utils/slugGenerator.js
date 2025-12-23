/**
 * Utility functions for generating URL-friendly slugs
 */

/**
 * Convert a string to a URL-friendly slug
 * @param {string} text - The text to convert to slug
 * @returns {string} - URL-friendly slug
 */
export const generateSlug = (text) => {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces and special characters with hyphens
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
};

/**
 * Generate a unique slug by appending a number if needed
 * @param {string} baseSlug - The base slug to make unique
 * @param {Function} checkExists - Function to check if slug exists
 * @returns {Promise<string>} - Unique slug
 */
export const generateUniqueSlug = async (baseSlug, checkExists) => {
  let slug = baseSlug;
  let counter = 1;
  
  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

/**
 * Generate slug from job title and company name
 * @param {string} title - Job title
 * @param {string} companyName - Company name
 * @returns {string} - Combined slug
 */
export const generateJobSlug = (title, companyName = '') => {
  const titleSlug = generateSlug(title);
  const companySlug = companyName ? generateSlug(companyName) : '';
  
  if (companySlug && !titleSlug.includes(companySlug)) {
    return `${titleSlug}-at-${companySlug}`;
  }
  
  return titleSlug;
};

export default {
  generateSlug,
  generateUniqueSlug,
  generateJobSlug
};
