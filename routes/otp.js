import express from 'express';
import { sendOtpEmail, generateOtp, verifyConnection } from '../services/simpleOtpService.js';
import Otp from '../models/Otp.js';
import User from '../models/User.js';

const router = express.Router();

// Generate and send OTP
router.post('/send', async (req, res) => {
  try {
    const { email, type = 'registration' } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // For registration type, check if email already exists
    if (type === 'registration') {
      try {
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
          return res.status(400).json({ 
            success: false, 
            message: 'This email is already registered. Please sign in instead.',
            code: 'EMAIL_ALREADY_EXISTS'
          });
        }
      } catch (error) {
        console.error('Error checking existing user:', error);
        // Continue with OTP generation even if user check fails
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Store OTP in database
    await Otp.create({
      email,
      otp,
      type,
      expiresAt,
      ipAddress: req.ip
    });

    // Send OTP email
    await sendOtpEmail(email, otp);

    return res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      // Note: In production, don't return the OTP in response
      // This is only for testing purposes
      otp: process.env.NODE_ENV === 'development' ? otp : undefined 
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP',
      error: error.message 
    });
  }
});

// Verify OTP
router.post('/verify', async (req, res) => {
  try {
    const { email, otp, type = 'registration' } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required' 
      });
    }

    // Find the OTP record
    const otpRecord = await Otp.findByEmailAndOtp(email, otp, type);

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP' 
      });
    }

    // Check if OTP is expired
    if (Otp.isExpired(otpRecord)) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has expired' 
      });
    }

    // Check if OTP is already used
    if (otpRecord.is_used) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has already been used' 
      });
    }

    // Check maximum attempts
    if (otpRecord.attempts >= 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Maximum OTP attempts exceeded' 
      });
    }

    // Don't mark as used here - let registration handle that
    // Just increment attempts for tracking
    await Otp.incrementAttempts(otpRecord.id);

    return res.json({ 
      success: true, 
      message: 'OTP verified successfully' 
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to verify OTP',
      error: error.message 
    });
  }
});

// Resend OTP
router.post('/resend', async (req, res) => {
  try {
    const { email, type = 'registration' } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // For registration type, check if email already exists
    if (type === 'registration') {
      try {
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
          return res.status(400).json({ 
            success: false, 
            message: 'This email is already registered. Please sign in instead.',
            code: 'EMAIL_ALREADY_EXISTS'
          });
        }
      } catch (error) {
        console.error('Error checking existing user:', error);
        // Continue with OTP generation even if user check fails
      }
    }

    // Check if there's an existing unused OTP
    const existingOtp = await Otp.findActiveByEmail(email, type);
    
    if (existingOtp) {
      // Check if enough time has passed (resend cooldown: 60 seconds)
      const timeSinceLastOtp = Date.now() - new Date(existingOtp.created_at).getTime();
      if (timeSinceLastOtp < 60000) {
        return res.status(429).json({ 
          success: false, 
          message: 'Please wait before requesting another OTP',
          cooldownSeconds: Math.ceil((60000 - timeSinceLastOtp) / 1000)
        });
      }

      // Mark existing OTP as used
      await Otp.markAsUsed(existingOtp.id);
    }

    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Store new OTP
    await Otp.create({
      email,
      otp: newOtp,
      type,
      expiresAt,
      ipAddress: req.ip
    });

    // Send OTP email
    await sendOtpEmail(email, newOtp);

    return res.json({ 
      success: true, 
      message: 'OTP resent successfully',
      otp: process.env.NODE_ENV === 'development' ? newOtp : undefined 
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to resend OTP',
      error: error.message 
    });
  }
});

export default router;
