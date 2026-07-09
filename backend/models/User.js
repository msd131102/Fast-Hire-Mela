import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';

/**
 * User Model - Handles all user-related database operations
 */
export class User {
  /**
   * Normalize education level to match database constraints
   * @param {string} educationLevel - Raw education level value
   * @returns {string} Normalized education level
   */
  static normalizeEducationLevel(educationLevel) {
    if (!educationLevel) return null;
    
    const levelMap = {
      'high school': 'high_school',
      'highschool': 'high_school',
      'diploma': 'diploma',
      'bachelor': 'bachelors',
      'bachelors': 'bachelors',
      "bachelor's": 'bachelors',
      'master': 'masters',
      'masters': 'masters',
      "master's": 'masters',
      'phd': 'phd',
      'ph.d': 'phd',
      'doctorate': 'phd',
      'other': 'other'
    };
    
    const normalized = levelMap[educationLevel.toLowerCase().trim()];
    return normalized || 'other';
  }

  /**
   * Normalize work type to match database constraints
   * @param {string} workType - Raw work type value
   * @returns {string} Normalized work type
   */
  static normalizeWorkType(workType) {
    if (!workType) return null;
    
    const typeMap = {
      'remote': 'remote',
      'onsite': 'onsite',
      'on-site': 'onsite',
      'hybrid': 'hybrid'
    };
    
    const normalized = typeMap[workType.toLowerCase().trim()];
    return normalized || 'remote';
  }

  /**
   * Normalize job type to match database constraints
   * @param {string} jobType - Raw job type value
   * @returns {string} Normalized job type
   */
  static normalizeJobType(jobType) {
    if (!jobType) return null;
    
    const typeMap = {
      'full time': 'full_time',
      'full-time': 'full_time',
      'fulltime': 'full_time',
      'part time': 'part_time',
      'part-time': 'part_time',
      'parttime': 'part_time',
      'contract': 'contract',
      'contractual': 'contract',
      'internship': 'internship',
      'intern': 'internship',
      'temporary': 'temporary',
      'temp': 'temporary'
    };
    
    const normalized = typeMap[jobType.toLowerCase().trim()];
    return normalized || 'full_time';
  }

  /**
   * Normalize gender to match database constraints
   * @param {string} gender - Raw gender value
   * @returns {string} Normalized gender
   */
  static normalizeGender(gender) {
    if (!gender) return null;
    
    const genderMap = {
      'male': 'male',
      'female': 'female',
      'other': 'other',
      'prefer not to say': 'prefer_not_to_say',
      'prefer_not_to_say': 'prefer_not_to_say',
      'decline': 'prefer_not_to_say',
      'not specified': 'prefer_not_to_say'
    };
    
    const normalized = genderMap[gender.toLowerCase().trim()];
    return normalized || 'prefer_not_to_say';
  }
  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  static async findByEmail(email) {
    try {
      return await prisma.app_users.findUnique({
        where: { email }
      });
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Failed to find user by email');
    }
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  static async findById(id) {
    try {
      return await prisma.app_users.findUnique({
        where: { id: parseInt(id) }
      });
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw new Error('Failed to find user by ID');
    }
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user object
   */
  static async create(userData) {
    try {
      const { name, email, password, phone } = userData;
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      return await prisma.app_users.create({
        data: {
          name,
          email,
          password_hash: passwordHash,
          phone
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          is_active: true,
          email_verified: true,
          created_at: true
        }
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Validate password against hash
   * @param {string} plainPassword - Plain password
   * @param {string} hashedPassword - Hashed password
   * @returns {Promise<boolean>} Password validity
   */
  static async validatePassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error validating password:', error);
      throw new Error('Failed to validate password');
    }
  }

  /**
   * Update user profile
   * @param {number} id - User ID
   * @param {Object} userData - Profile data
   * @returns {Promise<Object>} Updated user object
   */
  static async updateProfile(id, userData) {
    try {
      const { 
        first_name, 
        last_name, 
        email, 
        phone, 
        city, 
        state, 
        country, 
        postal_code,
        address,
        bio, 
        website_url, 
        linkedin_url, 
        github_url, 
        experience_years, 
        current_job_title, 
        current_company, 
        industry,
        education_level, 
        skills, 
        resume_url, 
        portfolio_url,
        profile_url,
        profile_picture,
        preferred_job_types,
        preferred_locations,
        preferred_salary_min,
        preferred_salary_max,
        salary_currency,
        is_open_to_work, 
        profile_visibility,
        date_of_birth,
        gender,
        notice_period,
        expected_salary,
        work_type,
        job_type,
        is_profile_complete,
        profile_completion_percentage,
        is_active_job_seeker,
        visibility_settings,
        notification_preferences
      } = userData;

      // Normalize constrained fields to match database CHECK constraints
      const normalizedEducationLevel = this.normalizeEducationLevel(education_level);
      const normalizedWorkType = this.normalizeWorkType(work_type);
      const normalizedJobType = this.normalizeJobType(job_type);
      const normalizedGender = this.normalizeGender(gender);

      const result = await query(
        `UPDATE app_users 
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             email = COALESCE($3, email),
             phone = COALESCE($4, phone),
             city = COALESCE($5, city),
             state = COALESCE($6, state),
             country = COALESCE($7, country),
             postal_code = COALESCE($8, postal_code),
             address = COALESCE($9, address),
             bio = COALESCE($10, bio),
             website_url = COALESCE($11, website_url),
             linkedin_url = COALESCE($12, linkedin_url),
             github_url = COALESCE($13, github_url),
             experience_years = COALESCE($14, experience_years),
             current_job_title = COALESCE($15, current_job_title),
             current_company = COALESCE($16, current_company),
             industry = COALESCE($17, industry),
             education_level = COALESCE($18, education_level),
             skills = COALESCE($19, skills),
             resume_url = COALESCE($20, resume_url),
             portfolio_url = COALESCE($21, portfolio_url),
             profile_url = COALESCE($22, profile_url),
             profile_picture = COALESCE($23, profile_picture),
             preferred_job_types = COALESCE($24, preferred_job_types),
             preferred_locations = COALESCE($25, preferred_locations),
             preferred_salary_min = COALESCE($26, preferred_salary_min),
             preferred_salary_max = COALESCE($27, preferred_salary_max),
             salary_currency = COALESCE($28, salary_currency),
             is_open_to_work = COALESCE($29, is_open_to_work),
             profile_visibility = COALESCE($30, profile_visibility),
             date_of_birth = COALESCE($31, date_of_birth),
             gender = COALESCE($32, gender),
             notice_period = COALESCE($33, notice_period),
             expected_salary = COALESCE($34, expected_salary),
             work_type = COALESCE($35, work_type),
             job_type = COALESCE($36, job_type),
             is_profile_complete = COALESCE($37, is_profile_complete),
             profile_completion_percentage = COALESCE($38, profile_completion_percentage),
             is_active_job_seeker = COALESCE($39, is_active_job_seeker),
             visibility_settings = COALESCE($40, visibility_settings),
             notification_preferences = COALESCE($41, notification_preferences),
             last_profile_update = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $42 
         RETURNING *`,
        [
          first_name, last_name, email, phone, city, state, country, postal_code, address, bio, 
          website_url, linkedin_url, github_url, experience_years, current_job_title, 
          current_company, industry, normalizedEducationLevel, skills, resume_url, portfolio_url, 
          profile_url, profile_picture, preferred_job_types, preferred_locations, preferred_salary_min, preferred_salary_max,
          salary_currency, is_open_to_work, profile_visibility, date_of_birth, normalizedGender, notice_period,
          expected_salary, normalizedWorkType, normalizedJobType, is_profile_complete, profile_completion_percentage,
          is_active_job_seeker, visibility_settings, notification_preferences, id
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  /**
   * Update user password
   * @param {number} id - User ID
   * @param {string} newPassword - New plain password
   * @returns {Promise<Object>} Updated user object
   */
  static async updatePassword(id, newPassword) {
    try {
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);
      
      const result = await query(
        `UPDATE app_users 
         SET password_hash = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 
         RETURNING id, name, email`,
        [passwordHash, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating password:', error);
      throw new Error('Failed to update password');
    }
  }

  /**
   * Verify user email
   * @param {number} id - User ID
   * @returns {Promise<Object>} Updated user object
   */
  static async verifyEmail(id) {
    try {
      const result = await query(
        `UPDATE app_users 
         SET email_verified = true, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 
         RETURNING id, name, email, email_verified`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error verifying email:', error);
      throw new Error('Failed to verify email');
    }
  }

  /**
   * Upgrade user to premium
   * @param {number} id - User ID
   * @param {Date} expiryDate - Premium expiry date
   * @returns {Promise<Object>} Updated user object
   */
  static async upgradeToPremium(id, expiryDate) {
    try {
      const result = await query(
        `UPDATE app_users 
         SET is_premium = true, premium_expiry = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 
         RETURNING id, name, email`,
        [expiryDate, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error upgrading user to premium:', error);
      throw new Error('Failed to upgrade user to premium');
    }
  }

  /**
   * Soft delete user (set is_active to false)
   * @param {number} id - User ID
   * @returns {Promise<Object>} Updated user object
   */
  static async delete(id) {
    try {
      const result = await query(
        `UPDATE app_users 
         SET is_active = false, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 
         RETURNING id, name, email, is_active`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  /**
   * Get user statistics
   * @returns {Promise<Object>} User statistics
   */
  static async getStats() {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN is_premium = true THEN 1 END) as premium_users,
          COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_users,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_last_30_days
        FROM app_users 
        WHERE is_active = true
      `);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw new Error('Failed to get user statistics');
    }
  }

  /**
   * Get all users with pagination
   * @param {number} limit - Number of users to return
   * @param {number} offset - Number of users to skip
   * @returns {Promise<Array>} Array of user objects
   */
  static async getAll(limit = 50, offset = 0) {
    try {
      const result = await query(
        `SELECT id, name, email, phone,  is_active, email_verified, created_at 
         FROM app_users 
         ORDER BY created_at DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw new Error('Failed to get all users');
    }
  }

  /**
   * Search users by name or email
   * @param {string} searchTerm - Search term
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Array of matching users
   */
  static async search(searchTerm, limit = 20) {
    try {
      const result = await query(
        `SELECT id, name, email, phone,  is_active, created_at 
         FROM app_users 
         WHERE (name ILIKE $1 OR email ILIKE $1) AND is_active = true 
         ORDER BY name ASC 
         LIMIT $2`,
        [`%${searchTerm}%`, limit]
      );
      return result.rows;
    } catch (error) {
      console.error('Error searching users:', error);
      throw new Error('Failed to search users');
    }
  }

  /**
   * Get complete user profile
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} Complete user profile or null
   */
  static async getProfile(id) {
    try {
      const result = await query(
        `SELECT 
          id, name, email, phone,  is_active, email_verified, created_at, updated_at,
          first_name, last_name, city, state, country, postal_code, address, bio, website_url,
          linkedin_url, github_url, experience_years, current_job_title, current_company, industry,
          education_level, skills, resume_url, portfolio_url, profile_url, profile_picture, preferred_job_types,
          preferred_locations, preferred_salary_min, preferred_salary_max, salary_currency,
          is_open_to_work, profile_visibility,
          date_of_birth, gender, notice_period, expected_salary, work_type, job_type,
          is_profile_complete, profile_completion_percentage, is_active_job_seeker,
          visibility_settings, notification_preferences, last_profile_update
         FROM app_users 
         WHERE id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw new Error('Failed to get user profile');
    }
  }

  /**
   * Calculate profile completion percentage
   * @param {Object} userData - User data object
   * @returns {number} Profile completion percentage (0-100)
   */
  static calculateProfileCompletion(userData) {
    const fields = [
      'first_name', 'last_name', 'phone', 'address', 'bio', 'linkedin_url', 
      'github_url', 'experience_years', 'current_job_title', 'current_company',
      'education_level', 'skills', 'resume_url', 'portfolio_url', 'date_of_birth',
      'gender', 'notice_period', 'expected_salary', 'work_type', 'job_type'
    ];
    
    let completedFields = 0;
    const totalFields = fields.length;
    
    fields.forEach(field => {
      const value = userData[field];
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) completedFields++;
        } else {
          completedFields++;
        }
      }
    });
    
    return Math.round((completedFields / totalFields) * 100);
  }

  /**
   * Update profile completion status
   * @param {number} id - User ID
   * @param {number} completionPercentage - Profile completion percentage
   * @returns {Promise<Object>} Updated user object
   */
  static async updateProfileCompletion(id, completionPercentage) {
    try {
      const isComplete = completionPercentage >= 80;
      
      const result = await query(
        `UPDATE app_users 
         SET profile_completion_percentage = $1, 
             is_profile_complete = $2,
             last_profile_update = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $3 
         RETURNING id, name, email, profile_completion_percentage, is_profile_complete`,
        [completionPercentage, isComplete, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating profile completion:', error);
      throw new Error('Failed to update profile completion');
    }
  }

  /**
   * Get users by role/type
   * @param {string} userType - User type (job_seeker, employer, admin)
   * @param {number} limit - Number of users to return
   * @param {number} offset - Number of users to skip
   * @returns {Promise<Array>} Array of user objects
   */
  static async getByType(userType, limit = 50, offset = 0) {
    try {
      const result = await query(
        `SELECT id, name, email, phone,  is_active, email_verified, created_at 
         FROM app_users 
         WHERE user_type = $1 AND is_active = true 
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
        [userType, limit, offset]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting users by type:', error);
      throw new Error('Failed to get users by type');
    }
  }

  /**
   * Check if user is premium
   * @param {number} id - User ID
   * @returns {Promise<boolean>} Whether user is premium
   */
  static async isPremium(id) {
    try {
      const result = await query(
        `SELECT  
         FROM app_users 
         WHERE id = $1 AND is_active = true`,
        [id]
      );
      
      if (result.rows.length === 0) return false;
      
      const {  } = result.rows[0];
      
      if (!is_premium) return false;
      
      // Check if premium has expired
      if (premium_expiry && new Date(premium_expiry) < new Date()) {
        // Update premium status to false
        await query(
          `UPDATE app_users 
           SET is_premium = false 
           WHERE id = $1`,
          [id]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking premium status:', error);
      throw new Error('Failed to check premium status');
    }
  }

  /**
   * Get recently active users
   * @param {number} days - Number of days to look back
   * @param {number} limit - Number of users to return
   * @returns {Promise<Array>} Array of recently active users
   */
  static async getRecentlyActive(days = 7, limit = 20) {
    try {
      const result = await query(
        `SELECT id, name, email, last_login_at, created_at 
         FROM app_users 
         WHERE last_login_at >= CURRENT_DATE - INTERVAL '${days} days' 
           AND is_active = true 
         ORDER BY last_login_at DESC 
         LIMIT $1`,
        [limit]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting recently active users:', error);
      throw new Error('Failed to get recently active users');
    }
  }

  /**
   * Update last login timestamp
   * @param {number} id - User ID
   * @returns {Promise<Object>} Updated user object
   */
  static async updateLastLogin(id) {
    try {
      const result = await query(
        `UPDATE app_users 
         SET last_login_at = CURRENT_TIMESTAMP 
         WHERE id = $1 
         RETURNING id, name, email, last_login_at`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating last login:', error);
      throw new Error('Failed to update last login');
    }
  }

  /**
   * Get user with all related data
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} Complete user data with relations
   */
  static async getCompleteUserData(id) {
    try {
      const result = await query(
        `SELECT 
          u.*,
          COUNT(DISTINCT a.id) as application_count,
          COUNT(DISTINCT sj.id) as saved_jobs_count,
          COUNT(DISTINCT up.id) as active_plans_count
         FROM app_users u
         LEFT JOIN applications a ON u.id = a.user_id
         LEFT JOIN saved_jobs sj ON u.id = sj.user_id
         LEFT JOIN user_plans up ON u.id = up.user_id AND up.is_active = true
         WHERE u.id = $1
         GROUP BY u.id`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting complete user data:', error);
      throw new Error('Failed to get complete user data');
    }
  }
}

// Default export for compatibility with existing imports
export default User;
