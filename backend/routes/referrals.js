import express from 'express';
import pkgPrisma from '@prisma/client';
const { PrismaClient } = pkgPrisma;
import crypto from 'crypto';

const router = express.Router();
const prisma = new PrismaClient();

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
    const existingReferral = await prisma.referrals.findUnique({
      where: { email }
    });

    if (existingReferral) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted referrals. Please contact support for assistance.'
      });
    }

    // Check if app_user exists to link user_id (optional, they may be a guest)
    const existingAppUser = await prisma.app_users.findUnique({
      where: { email }
    });

    // Generate unique referral code
    const baseCode = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'R');
    const randomHash = crypto.randomBytes(3).toString('hex').toUpperCase();
    const referral_code = `${baseCode}-${randomHash}`;

    // Insert referral into database
    const newReferral = await prisma.referrals.create({
      data: {
        name,
        email,
        mobile,
        referral_history: referredList,
        referral_count: referredList.length,
        premium_eligible: true,
        status: 'pending',
        referral_code,
        user_id: existingAppUser ? existingAppUser.id : null
      }
    });

    // Log the referral submission
    console.log(`New referral submitted: ${email} with ${referredList.length} referrals`);

    res.json({
      success: true,
      premiumEligible: true,
      referralId: newReferral.id,
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

    const referral = await prisma.referrals.findUnique({
      where: { email }
    });

    if (!referral) {
      return res.json({
        success: true,
        hasReferral: false,
        message: 'No referral found'
      });
    }

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
        referredUsers: referral.referral_history
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
    const updatedReferral = await prisma.referrals.update({
      where: { id: parseInt(id) },
      data: {
        status,
        admin_notes: admin_notes || null,
        updated_at: new Date()
      }
    });

    // If approved, log premium activation
    if (status === 'approved') {
      const userEmail = updatedReferral.email;
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

    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const [referrals, count] = await Promise.all([
      prisma.referrals.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: parseInt(offset),
        take: parseInt(limit),
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          referral_count: true,
          status: true,
          created_at: true,
          updated_at: true
        }
      }),
      prisma.referrals.count({ where })
    ]);
    
    res.json({
      success: true,
      data: referrals,
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
