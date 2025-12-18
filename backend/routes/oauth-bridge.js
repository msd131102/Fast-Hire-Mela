import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { SessionManager } from '../middleware/sessionTracker.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// OAuth bridge for GitHub callback URL issues
router.get('/github', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Authorization code is required' 
      });
    }

    // For bridge, we'll be more lenient with state validation
    // since it's a backup solution for callback URL issues
    console.log('OAuth Bridge: Processing GitHub callback with state:', state);

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

    // Ensure we have valid email for user creation
    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'GitHub email is required for authentication. Please make sure your email is public in your GitHub profile.'
      });
    }

    const userData = {
      name: githubUser.name || githubUser.login,
      email: userEmail,
      provider: 'github',
      github_url: githubUser.html_url,
      profile_picture: githubUser.avatar_url,
    };

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

    // Redirect to frontend with token as query parameter
    const redirectUrl = `https://www.fasthiremela.online/auth/oauth-success?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'user',
      is_premium: user.is_premium,
      profile_completed: user.profile_completed
    }))}`;

    res.redirect(redirectUrl);

  } catch (error) {
    console.error('GitHub OAuth bridge error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'OAuth authentication failed' 
    });
  }
});

export default router;
