import express from 'express';

const router = express.Router();

// Log client-side errors (console only - no database)
router.post('/log', (req, res) => {
  try {
    const { error, stack, userAgent, url, timestamp, userId } = req.body;

    // Log to console instead of database
    console.error('Client Error:', {
      error: error || 'Unknown error',
      stack: stack,
      userAgent: userAgent,
      url: url,
      timestamp: timestamp || new Date().toISOString(),
      userId: userId
    });

    res.status(200).json({ 
      success: true, 
      message: 'Error logged successfully' 
    });
  } catch (error) {
    console.error('Error logging client error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to log error' 
    });
  }
});

// Simple health check for error endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Error logging endpoint is active'
  });
});

export default router;
