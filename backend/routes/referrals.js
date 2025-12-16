import express from 'express';
const router = express.Router();
import db from '../config/database.js';

// POST /api/referral - Submit referral
router.post('/', async (req, res) => {
  try {
    const { name, email, mobile, referred_users } = req.body;

    // Validation
    if (!name || !email || !mobile || !referred_users) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    // Convert textarea input into array
    const referredList = Array.isArray(referred_users) 
      ? referred_users 
      : referred_users
          .split('\n')
          .map(item => item.trim())
          .filter(item => item.length > 0);

    if (referredList.length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Minimum 20 referred users required to unlock Premium Features'
      });
    }

    // Check if user already submitted referrals
    const existingReferral = await db.query(
      'SELECT id FROM referrals WHERE email = $1',
      [email]
    );

    if (existingReferral.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted referrals. Please contact support for assistance.'
      });
    }

    // Insert referral into database
    const result = await db.query(
      `INSERT INTO referrals (name, email, mobile, referred_users, referral_count, premium_eligible, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', CURRENT_TIMESTAMP) RETURNING id`,
      [name, email, mobile, JSON.stringify(referredList), referredList.length, true]
    );

    // Log the referral submission
    console.log(`New referral submitted: ${email} with ${referredList.length} referrals`);

    res.json({
      success: true,
      premiumEligible: true,
      referralId: result.rows[0].id,
      message: 'Referral submitted successfully! Your referrals are now pending verification. You will receive an email once approved.',
      referralCount: referredList.length
    });

  } catch (error) {
    console.error('Referral submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.'
    });
  }
});

// GET /api/referral - Get user's referral status
router.get('/status', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const result = await db.query(
      'SELECT * FROM referrals WHERE email = $1 ORDER BY created_at DESC',
      [email]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        hasReferral: false,
        message: 'No referral found'
      });
    }

    const referral = result.rows[0];
    res.json({
      success: true,
      hasReferral: true,
      referral: {
        id: referral.id,
        name: referral.name,
        email: referral.email,
        referralCount: referral.referral_count,
        premiumEligible: referral.premium_eligible,
        status: referral.status,
        createdAt: referral.created_at,
        referredUsers: JSON.parse(referral.referred_users || '[]')
      }
    });

  } catch (error) {
    console.error('Referral status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/referral/:id - Update referral status (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status (approved/rejected) is required'
      });
    }

    // Update referral status
    await db.query(
      'UPDATE referrals SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [status, admin_notes || null, id]
    );

    // If approved, log premium activation (without trying to update users table)
    if (status === 'approved') {
      const referralResult = await db.query(
        'SELECT email FROM referrals WHERE id = $1',
        [id]
      );

      if (referralResult.rows.length > 0) {
        const userEmail = referralResult.rows[0].email;
        
        // Log premium activation (users table update would be handled separately if table exists)
        console.log(`Premium activation approved for user: ${userEmail}`);
      }
    }

    res.json({
      success: true,
      message: `Referral ${status} successfully`
    });

  } catch (error) {
    console.error('Referral update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/referral/admin - Get all referrals (admin only)
router.get('/admin', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM referrals ORDER BY created_at DESC`
    );

    // Parse and fix the referred_users data properly
    const referrals = result.rows.map(referral => {
      let referredUsers = [];
      
      if (referral.referred_users && typeof referral.referred_users === 'string') {
        const raw = referral.referred_users;
        // Extract names from malformed format
        const names = raw.match(/"([^"]+)"/g) || raw.match(/'([^']+)'/g);
        if (names) {
          referredUsers = names.map(match => match.replace(/['"]/g, '')).filter(item => item.trim());
        } else {
          // Fallback: extract words from array-like string
          const fallbackNames = raw.match(/[a-zA-Z0-9\s\.\;]+/g);
          if (fallbackNames) {
            referredUsers = fallbackNames.map(name => name.trim()).filter(item => item.length > 0 && item !== '[' && item !== ']');
          }
        }
      } else if (Array.isArray(referral.referred_users)) {
        referredUsers = referral.referred_users;
      }
      
      return {
        ...referral,
        referred_users: referredUsers
      };
    });

    res.json({
      success: true,
      referrals: referrals
    });

  } catch (error) {
    console.error('Admin referral list error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
