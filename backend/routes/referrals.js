import express from 'express';
import { query } from '../config/database.js';
import crypto from 'crypto';

const router = express.Router();

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
    const existingReferralRes = await query('SELECT id FROM referrals WHERE email = $1', [email]);
    if (existingReferralRes.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted referrals. Please contact support for assistance.'
      });
    }

    // Check if app_user exists to link user_id (optional, they may be a guest)
    const existingAppUserRes = await query('SELECT id FROM app_users WHERE email = $1', [email]);
    const existingAppUserId = existingAppUserRes.rows.length > 0 ? existingAppUserRes.rows[0].id : null;

    // Generate unique referral code
    const baseCode = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'R');
    const randomHash = crypto.randomBytes(3).toString('hex').toUpperCase();
    const referral_code = `${baseCode}-${randomHash}`;

    // Insert referral into database
    const newReferralRes = await query(
      `INSERT INTO referrals 
        (name, email, mobile, referral_history, referral_count, premium_eligible, status, referral_code, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [name, email, mobile, JSON.stringify(referredList), referredList.length, true, 'pending', referral_code, existingAppUserId]
    );

    const newReferralId = newReferralRes.rows[0].id;

    // Log the referral submission
    console.log(`New referral submitted: ${email} with ${referredList.length} referrals`);

    res.json({
      success: true,
      premiumEligible: true,
      referralId: newReferralId,
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

// GET /api/referral/status - Get user's referral status
router.get('/status', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const referralRes = await query('SELECT * FROM referrals WHERE email = $1', [email]);

    if (referralRes.rows.length === 0) {
      return res.json({
        success: true,
        hasReferral: false,
        message: 'No referral found'
      });
    }

    const referral = referralRes.rows[0];

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
        referredUsers: typeof referral.referral_history === 'string' ? JSON.parse(referral.referral_history) : referral.referral_history
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
    const updatedReferralRes = await query(
      `UPDATE referrals 
       SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 RETURNING email`,
      [status, admin_notes || null, parseInt(id)]
    );

    if (updatedReferralRes.rows.length === 0) {
       return res.status(404).json({ success: false, message: 'Referral not found' });
    }

    // If approved, log premium activation
    if (status === 'approved') {
      const userEmail = updatedReferralRes.rows[0].email;
      console.log(`Referral approved for ${userEmail}. They are now eligible for premium access.`);
    }

    res.json({
      success: true,
      message: `Referral successfully marked as ${status}`
    });

  } catch (error) {
    console.error('Update referral error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/referral/admin/list - Get all referrals (admin only)
router.get('/admin/list', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params = [];
    if (status && status !== 'all') {
      whereClause = 'WHERE status = $1';
      params.push(status);
    }

    params.push(parseInt(limit), parseInt(offset));
    
    const countParams = status && status !== 'all' ? [status] : [];

    const [referralsRes, countRes] = await Promise.all([
      query(`
        SELECT id, name, email, mobile, referral_count, status, created_at, updated_at
        FROM referrals
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${status && status !== 'all' ? '2' : '1'} OFFSET $${status && status !== 'all' ? '3' : '2'}
      `, params),
      query(`SELECT COUNT(*) as total FROM referrals ${whereClause}`, countParams)
    ]);
    
    const count = parseInt(countRes.rows[0].total);

    res.json({
      success: true,
      data: referralsRes.rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
