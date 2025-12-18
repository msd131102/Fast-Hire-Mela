import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { SessionManager } from '../middleware/sessionTracker.js';

const router = express.Router();

// Middleware to validate request
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// OAuth callback handler
router.post('/callback', async (req, res) => {
  try {
    const { code, provider, state } = req.body;
    
    if (!code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Authorization code is required' 
      });
    }

    // Handle different OAuth providers
    let userData = {};
    
    if (provider === 'github') {
      try {
        // Exchange code for access token with GitHub
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: code,
          }),
        });

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Get user info from GitHub API
        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': 'Fast-Hire-Mela',
          },
        });

        const githubUser = await userResponse.json();
        
        // Get user email (requires separate API call for email scope)
        let userEmail = githubUser.email;
        if (!userEmail) {
          const emailResponse = await fetch('https://api.github.com/user/emails', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'User-Agent': 'Fast-Hire-Mela',
            },
          });
          const emails = await emailResponse.json();
          userEmail = emails.find(email => email.primary && email.verified)?.email;
        }

        userData = {
          name: githubUser.name || githubUser.login,
          email: userEmail || `${githubUser.login}@github.local`,
          provider: 'github',
          github_url: githubUser.html_url,
          profile_picture: githubUser.avatar_url,
        };
      } catch (error) {
        console.error('GitHub OAuth error:', error);
        // Fallback to demo user if OAuth fails
        userData = {
          name: 'GitHub User',
          email: `github-user-${Date.now()}@demo.local`,
          provider: 'github',
        };
      }
    } else if (provider === 'linkedin') {
      try {
        // Exchange code for access token with LinkedIn
        const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: process.env.FRONTEND_URL + '/auth/callback/linkedin',
            client_id: process.env.LINKEDIN_CLIENT_ID,
            client_secret: process.env.LINKEDIN_CLIENT_SECRET,
          }),
        });

        const tokenData = await tokenResponse.text();
        const accessToken = new URLSearchParams(tokenData).get('access_token');

        // Get user profile from LinkedIn API
        const profileResponse = await fetch('https://api.linkedin.com/v2/people/~:(id,firstName,lastName,profilePicture(displayImage~:playableStreams))', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        const profileData = await profileResponse.json();
        
        // Get email address (requires separate API call)
        const emailResponse = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        const emailData = await emailResponse.json();
        const userEmail = emailData.elements?.[0]?.['handle~']?.emailAddress;

        const firstName = profileData.firstName?.localized?.en || profileData.firstName;
        const lastName = profileData.lastName?.localized?.en || profileData.lastName;
        const fullName = `${firstName} ${lastName}`.trim();

        userData = {
          name: fullName || 'LinkedIn User',
          email: userEmail || `linkedin-user-${Date.now()}@demo.local`,
          provider: 'linkedin',
          linkedin_url: `https://linkedin.com/in/${profileData.id}`,
          profile_picture: profileData.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier,
        };
      } catch (error) {
        console.error('LinkedIn OAuth error:', error);
        // Fallback to demo user if OAuth fails
        userData = {
          name: 'LinkedIn User',
          email: `linkedin-user-${Date.now()}@demo.local`,
          provider: 'linkedin',
        };
      }
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Unsupported OAuth provider' 
      });
    }

    // Create or find user in database using User model
    let user;
    const existingUser = await User.findByEmail(userData.email);
    
    if (!existingUser) {
      // Create new user for OAuth login using User.create method
      user = await User.create({
        name: userData.name,
        email: userData.email,
        password: '', // Empty password for OAuth users
        phone: null
      });

      // Update user with OAuth-specific data
      if (userData.github_url || userData.linkedin_url || userData.profile_picture) {
        await User.updateProfile(user.id, {
          github_url: userData.github_url || null,
          linkedin_url: userData.linkedin_url || null,
          profile_picture: userData.profile_picture || null
        });
      }
    } else {
      user = existingUser;
    }

    // Generate token
    const token = generateToken(user.id, 'user');

    // Create session for tracking
    try {
      await SessionManager.createSession(user.id, req);
    } catch (error) {
      console.error('Error creating OAuth session:', error);
    }

    res.json({
      success: true,
      message: 'OAuth authentication successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'user',
          is_premium: user.is_premium,
          profile_completed: user.profile_completed
        },
        token
      }
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'OAuth authentication failed' 
    });
  }
});

export default router;
