import express from 'express';
const router = express.Router();
import { authenticateToken as auth } from '../middleware/auth.js';
import SeoSettings from '../models/SeoSettings.js';
import SitemapConfig from '../models/SitemapConfig.js';
import Redirect from '../models/Redirect.js';
import MetaTag from '../models/MetaTag.js';

// SEO Settings Routes

// Get SEO settings
router.get('/settings', auth, async (req, res) => {
  try {
    const settings = await SeoSettings.getAll();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching SEO settings:', error);
    res.status(500).json({ error: 'Failed to fetch SEO settings' });
  }
});

// Update SEO settings
router.put('/settings/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const settings = await SeoSettings.update(id, req.body);
    res.json(settings);
  } catch (error) {
    console.error('Error updating SEO settings:', error);
    res.status(500).json({ error: 'Failed to update SEO settings' });
  }
});

// Create SEO settings
router.post('/settings', auth, async (req, res) => {
  try {
    const settings = await SeoSettings.create(req.body);
    res.status(201).json(settings);
  } catch (error) {
    console.error('Error creating SEO settings:', error);
    res.status(500).json({ error: 'Failed to create SEO settings' });
  }
});

// Sitemap Routes

// Get sitemap configurations
router.get('/sitemap', async (req, res) => {
  try {
    const configs = await SitemapConfig.getAll();
    res.json(configs);
  } catch (error) {
    console.error('Error fetching sitemap configs:', error);
    res.status(500).json({ error: 'Failed to fetch sitemap configs' });
  }
});

// Create sitemap configuration
router.post('/sitemap', auth, async (req, res) => {
  try {
    const config = await SitemapConfig.create(req.body);
    res.status(201).json(config);
  } catch (error) {
    console.error('Error creating sitemap config:', error);
    res.status(500).json({ error: 'Failed to create sitemap config' });
  }
});

// Update sitemap configuration
router.put('/sitemap/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const config = await SitemapConfig.update(id, req.body);
    res.json(config);
  } catch (error) {
    console.error('Error updating sitemap config:', error);
    res.status(500).json({ error: 'Failed to update sitemap config' });
  }
});

// Delete sitemap configuration
router.delete('/sitemap/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    await SitemapConfig.delete(id);
    res.json({ message: 'Sitemap configuration deleted successfully' });
  } catch (error) {
    console.error('Error deleting sitemap config:', error);
    res.status(500).json({ error: 'Failed to delete sitemap config' });
  }
});

// Generate sitemap XML
router.get('/sitemap.xml', async (req, res) => {
  try {
    const sitemapXml = await SitemapConfig.generateSitemap();
    res.header('Content-Type', 'application/xml');
    res.send(sitemapXml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
});

// Redirect Routes

// Get all redirects
router.get('/redirects', auth, async (req, res) => {
  try {
    const filters = req.query;
    const redirects = await Redirect.getAll(filters);
    res.json(redirects);
  } catch (error) {
    console.error('Error fetching redirects:', error);
    res.status(500).json({ error: 'Failed to fetch redirects' });
  }
});

// Get redirect by ID
router.get('/redirects/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const redirect = await Redirect.getById(id);
    if (!redirect) {
      return res.status(404).json({ error: 'Redirect not found' });
    }
    res.json(redirect);
  } catch (error) {
    console.error('Error fetching redirect:', error);
    res.status(500).json({ error: 'Failed to fetch redirect' });
  }
});

// Create redirect
router.post('/redirects', auth, async (req, res) => {
  try {
    const { from_path, to_url, status_code, is_active } = req.body;

    // Validate required fields
    if (!from_path || !to_url) {
      return res.status(400).json({ error: 'from_path and to_url are required' });
    }

    // Validate formats
    if (!Redirect.validateFromPath(from_path)) {
      return res.status(400).json({ error: 'Invalid from_path format' });
    }

    if (!Redirect.validateToUrl(to_url)) {
      return res.status(400).json({ error: 'Invalid to_url format' });
    }

    if (status_code && !Redirect.validateStatusCode(status_code)) {
      return res.status(400).json({ error: 'Invalid status code' });
    }

    // Check if from_path already exists
    const existing = await Redirect.fromPathExists(from_path);
    if (existing) {
      return res.status(400).json({ error: 'from_path already exists' });
    }

    const redirect = await Redirect.create({
      from_path,
      to_url,
      status_code: status_code || 301,
      is_active: is_active !== false
    });

    res.status(201).json(redirect);
  } catch (error) {
    console.error('Error creating redirect:', error);
    res.status(500).json({ error: 'Failed to create redirect' });
  }
});

// Update redirect
router.put('/redirects/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { from_path, to_url, status_code, is_active } = req.body;

    // Validate formats if provided
    if (from_path && !Redirect.validateFromPath(from_path)) {
      return res.status(400).json({ error: 'Invalid from_path format' });
    }

    if (to_url && !Redirect.validateToUrl(to_url)) {
      return res.status(400).json({ error: 'Invalid to_url format' });
    }

    if (status_code && !Redirect.validateStatusCode(status_code)) {
      return res.status(400).json({ error: 'Invalid status code' });
    }

    // Check if from_path already exists (excluding current redirect)
    if (from_path) {
      const existing = await Redirect.fromPathExists(from_path, id);
      if (existing) {
        return res.status(400).json({ error: 'from_path already exists' });
      }
    }

    const redirect = await Redirect.update(id, req.body);
    if (!redirect) {
      return res.status(404).json({ error: 'Redirect not found' });
    }

    res.json(redirect);
  } catch (error) {
    console.error('Error updating redirect:', error);
    res.status(500).json({ error: 'Failed to update redirect' });
  }
});

// Delete redirect
router.delete('/redirects/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const redirect = await Redirect.delete(id);
    if (!redirect) {
      return res.status(404).json({ error: 'Redirect not found' });
    }
    res.json({ message: 'Redirect deleted successfully' });
  } catch (error) {
    console.error('Error deleting redirect:', error);
    res.status(500).json({ error: 'Failed to delete redirect' });
  }
});

// Toggle redirect active status
router.patch('/redirects/:id/toggle', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const redirect = await Redirect.toggleActive(id);
    if (!redirect) {
      return res.status(404).json({ error: 'Redirect not found' });
    }
    res.json(redirect);
  } catch (error) {
    console.error('Error toggling redirect:', error);
    res.status(500).json({ error: 'Failed to toggle redirect' });
  }
});

// Test redirect
router.post('/redirects/test', auth, async (req, res) => {
  try {
    const { from_path } = req.body;
    if (!from_path) {
      return res.status(400).json({ error: 'from_path is required' });
    }

    const result = await Redirect.testRedirect(from_path);
    res.json(result);
  } catch (error) {
    console.error('Error testing redirect:', error);
    res.status(500).json({ error: 'Failed to test redirect' });
  }
});

// Bulk import redirects
router.post('/redirects/bulk', auth, async (req, res) => {
  try {
    const { redirects } = req.body;
    if (!Array.isArray(redirects)) {
      return res.status(400).json({ error: 'redirects must be an array' });
    }

    const results = await Redirect.bulkImport(redirects);
    res.json(results);
  } catch (error) {
    console.error('Error bulk importing redirects:', error);
    res.status(500).json({ error: 'Failed to bulk import redirects' });
  }
});

// Meta Tag Routes

// Get all meta tags
router.get('/meta-tags', auth, async (req, res) => {
  try {
    const filters = req.query;
    const metaTags = await MetaTag.getAll(filters);
    res.json(metaTags);
  } catch (error) {
    console.error('Error fetching meta tags:', error);
    res.status(500).json({ error: 'Failed to fetch meta tags' });
  }
});

// Get meta tag by ID
router.get('/meta-tags/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const metaTag = await MetaTag.getById(id);
    if (!metaTag) {
      return res.status(404).json({ error: 'Meta tag not found' });
    }
    res.json(metaTag);
  } catch (error) {
    console.error('Error fetching meta tag:', error);
    res.status(500).json({ error: 'Failed to fetch meta tag' });
  }
});

// Get global meta tags
router.get('/meta-tags/global', async (req, res) => {
  try {
    const metaTags = await MetaTag.getGlobal();
    res.json(metaTags);
  } catch (error) {
    console.error('Error fetching global meta tags:', error);
    res.status(500).json({ error: 'Failed to fetch global meta tags' });
  }
});

// Generate global meta tags HTML
router.get('/meta-tags/html', async (req, res) => {
  try {
    const html = await MetaTag.generateGlobalHtml();
    res.header('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error generating meta tags HTML:', error);
    res.status(500).json({ error: 'Failed to generate meta tags HTML' });
  }
});

// Get common meta tag suggestions
router.get('/meta-tags/suggestions', auth, async (req, res) => {
  try {
    const suggestions = MetaTag.getCommonMetaTags();
    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching meta tag suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch meta tag suggestions' });
  }
});

// Create meta tag
router.post('/meta-tags', auth, async (req, res) => {
  try {
    const { name, content, tag_type, is_global, is_active } = req.body;

    // Validate required fields
    if (!name || !content) {
      return res.status(400).json({ error: 'name and content are required' });
    }

    // Validate tag type
    if (tag_type && !MetaTag.validateTagType(tag_type)) {
      return res.status(400).json({ error: 'Invalid tag type' });
    }

    // Check if meta tag already exists
    const existing = await MetaTag.metaTagExists(name, tag_type || 'meta_name');
    if (existing) {
      return res.status(400).json({ error: 'Meta tag with this name and type already exists' });
    }

    const metaTag = await MetaTag.create({
      name,
      content,
      tag_type: tag_type || 'meta_name',
      is_global: is_global || false,
      is_active: is_active !== false
    });

    res.status(201).json(metaTag);
  } catch (error) {
    console.error('Error creating meta tag:', error);
    res.status(500).json({ error: 'Failed to create meta tag' });
  }
});

// Update meta tag
router.put('/meta-tags/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, content, tag_type, is_global, is_active } = req.body;

    // Validate tag type if provided
    if (tag_type && !MetaTag.validateTagType(tag_type)) {
      return res.status(400).json({ error: 'Invalid tag type' });
    }

    // Check if meta tag already exists (excluding current tag)
    if (name && tag_type) {
      const existing = await MetaTag.metaTagExists(name, tag_type, id);
      if (existing) {
        return res.status(400).json({ error: 'Meta tag with this name and type already exists' });
      }
    }

    const metaTag = await MetaTag.update(id, req.body);
    if (!metaTag) {
      return res.status(404).json({ error: 'Meta tag not found' });
    }

    res.json(metaTag);
  } catch (error) {
    console.error('Error updating meta tag:', error);
    res.status(500).json({ error: 'Failed to update meta tag' });
  }
});

// Delete meta tag
router.delete('/meta-tags/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const metaTag = await MetaTag.delete(id);
    if (!metaTag) {
      return res.status(404).json({ error: 'Meta tag not found' });
    }
    res.json({ message: 'Meta tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting meta tag:', error);
    res.status(500).json({ error: 'Failed to delete meta tag' });
  }
});

// Toggle meta tag active status
router.patch('/meta-tags/:id/toggle', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const metaTag = await MetaTag.toggleActive(id);
    if (!metaTag) {
      return res.status(404).json({ error: 'Meta tag not found' });
    }
    res.json(metaTag);
  } catch (error) {
    console.error('Error toggling meta tag:', error);
    res.status(500).json({ error: 'Failed to toggle meta tag' });
  }
});

// Toggle meta tag global status
router.patch('/meta-tags/:id/global', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const metaTag = await MetaTag.toggleGlobal(id);
    if (!metaTag) {
      return res.status(404).json({ error: 'Meta tag not found' });
    }
    res.json(metaTag);
  } catch (error) {
    console.error('Error toggling meta tag global status:', error);
    res.status(500).json({ error: 'Failed to toggle meta tag global status' });
  }
});

// Bulk import meta tags
router.post('/meta-tags/bulk', auth, async (req, res) => {
  try {
    const { metaTags } = req.body;
    if (!Array.isArray(metaTags)) {
      return res.status(400).json({ error: 'metaTags must be an array' });
    }

    const results = await MetaTag.bulkImport(metaTags);
    res.json(results);
  } catch (error) {
    console.error('Error bulk importing meta tags:', error);
    res.status(500).json({ error: 'Failed to bulk import meta tags' });
  }
});

// Legacy routes for backward compatibility

// Get SEO settings (legacy)
router.get('/', auth, async (req, res) => {
  try {
    const settings = await SeoSettings.getAll();
    // Return first settings object or default
    const seoSettings = settings[0] || {
      siteTitle: 'Fast Hire Mela - Find Your Dream Job',
      siteDescription: 'Find your dream job at Fast Hire Mela. Browse thousands of job listings from top companies.',
      siteKeywords: 'jobs, careers, employment, recruitment, hiring, fast hire mela',
      ogImage: '',
      twitterCard: 'summary_large_image',
      twitterSite: '@fasthiremela',
      googleAnalytics: '',
      googleVerification: '',
      bingVerification: '',
      robotsTxt: `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: https://fasthiremela.com/sitemap.xml`
    };

    res.json(seoSettings);
  } catch (error) {
    console.error('Error fetching SEO settings:', error);
    res.status(500).json({ error: 'Failed to fetch SEO settings' });
  }
});

// Update SEO settings (legacy)
router.put('/', auth, async (req, res) => {
  try {
    const settings = await SeoSettings.getAll();
    
    if (settings.length > 0) {
      const updatedSettings = await SeoSettings.update(settings[0].id, req.body);
      res.json(updatedSettings);
    } else {
      const newSettings = await SeoSettings.create(req.body);
      res.json(newSettings);
    }
  } catch (error) {
    console.error('Error updating SEO settings:', error);
    res.status(500).json({ error: 'Failed to update SEO settings' });
  }
});

// Generate robots.txt
router.get('/robots.txt', async (req, res) => {
  try {
    const settings = await SeoSettings.getAll();
    const robotsTxt = settings[0]?.robotsTxt || `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /login\nDisallow: /register\nDisallow: /dashboard/\n\nSitemap: ${process.env.FRONTEND_URL || 'https://fasthiremela.com'}/sitemap.xml`;

    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    res.status(500).json({ error: 'Failed to generate robots.txt' });
  }
});

export default router;
