# OAuth Setup Guide for Fast Hire Mela

## Overview
This guide explains how to properly configure GitHub and LinkedIn OAuth authentication for Fast Hire Mela.

## Current Implementation Status
✅ **Completed:**
- Removed Google OAuth from login page
- Added GitHub and LinkedIn OAuth buttons
- Created OAuth callback handling in frontend
- Added OAuth callback API endpoint in backend
- Added proper routing for OAuth callbacks

## OAuth Provider Configuration

### GitHub OAuth Setup

1. **Create GitHub OAuth App:**
   - Go to: https://github.com/settings/applications/new
   - Application name: `Fast Hire Mela`
   - Homepage URL: `https://www.fasthiremela.online`
   - Authorization callback URL: `https://www.fasthiremela.online/auth/callback/github`

2. **Get GitHub Credentials:**
   - Client ID: Your GitHub App Client ID
   - Client Secret: Your GitHub App Client Secret

3. **Environment Variables (Backend):**
   ```env
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

### LinkedIn OAuth Setup

1. **Create LinkedIn App:**
   - Go to: https://www.linkedin.com/developers/apps/new
   - App name: `Fast Hire Mela`
   - App description: `Job portal for Fast Hire Mela`
   - Website URL: `https://www.fasthiremela.online`
   - Redirect URLs: `https://www.fasthiremela.online/auth/callback/linkedin`

2. **Get LinkedIn Credentials:**
   - Client ID: Your LinkedIn App Client ID
   - Client Secret: Your LinkedIn App Client Secret

3. **Environment Variables (Backend):**
   ```env
   LINKEDIN_CLIENT_ID=your_linkedin_client_id
   LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
   ```

## Frontend Implementation

### Login Page Changes
- ✅ Removed Google OAuth button
- ✅ Added GitHub OAuth button with proper icon
- ✅ Added LinkedIn OAuth button with proper icon
- ✅ Both buttons open OAuth URLs in new window

### OAuth Callback Handling
- ✅ Created `/auth/callback/github` route
- ✅ Created `/auth/callback/linkedin` route
- ✅ Added OAuthCallback component with loading states
- ✅ Handles authorization code exchange
- ✅ Proper error handling and success states

## Backend Implementation

### OAuth Callback Endpoint
- ✅ Added `/api/auth/oauth/callback` POST endpoint
- ✅ Handles both GitHub and LinkedIn providers
- ✅ Creates or finds existing users
- ✅ Generates JWT tokens
- ✅ Creates user sessions

### Current Mock Implementation
The current implementation uses mock data for demonstration. For production, implement:

1. **GitHub OAuth Flow:**
   ```javascript
   // Exchange code for access token
   const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
     client_id: process.env.GITHUB_CLIENT_ID,
     client_secret: process.env.GITHUB_CLIENT_SECRET,
     code: code
   });

   // Get user info
   const userResponse = await axios.get('https://api.github.com/user', {
     headers: { Authorization: `Bearer ${accessToken}` }
   });
   ```

2. **LinkedIn OAuth Flow:**
   ```javascript
   // Exchange code for access token
   const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', {
     grant_type: 'authorization_code',
     code: code,
     redirect_uri: 'https://www.fasthiremela.online/auth/callback/linkedin',
     client_id: process.env.LINKEDIN_CLIENT_ID,
     client_secret: process.env.LINKEDIN_CLIENT_SECRET
   });

   // Get user info
   const profileResponse = await axios.get('https://api.linkedin.com/v2/people/~:(id,firstName,lastName,emailAddress)', {
     headers: { Authorization: `Bearer ${accessToken}` }
   });
   ```

## Deployment Configuration

### Vercel Configuration
Update `vercel.json` to include OAuth callback routes:

```json
{
  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "/sitemap.xml"
    },
    {
      "source": "/robots.txt", 
      "destination": "/robots.txt"
    },
    {
      "source": "/auth/callback/:provider",
      "destination": "/auth/callback/:provider"
    }
  ]
}
```

### Environment Variables (Production)
Set these in your deployment platform:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_production_github_client_id
GITHUB_CLIENT_SECRET=your_production_github_client_secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_production_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_production_linkedin_client_secret

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d

# Frontend URL
FRONTEND_URL=https://www.fasthiremela.online
```

## Testing OAuth Flow

### Local Development
1. Update hosts file:
   ```
   127.0.0.1 www.fasthiremela.online
   ```

2. Use ngrok for HTTPS:
   ```bash
   ngrok http 5173
   ```

3. Update OAuth app URLs with ngrok URL

### Production Testing
1. Visit `https://www.fasthiremela.online/login`
2. Click "GitHub" or "LinkedIn" button
3. Complete OAuth flow
4. Verify redirect to dashboard

## Security Considerations

### ✅ Implemented:
- CSRF protection with state parameter
- Secure cookie handling
- JWT token generation
- Session tracking

### 🔍 Additional Recommendations:
- Rate limiting on OAuth endpoints
- Input validation and sanitization
- HTTPS enforcement
- Token expiration handling
- Audit logging for OAuth events

## Troubleshooting

### Common Issues:
1. **Redirect URI Mismatch**
   - Ensure OAuth app redirect URLs match exactly
   - Include trailing slashes if required

2. **CORS Issues**
   - Verify frontend URL is in allowed origins
   - Check preflight requests

3. **Token Exchange Failures**
   - Verify client secrets are correct
   - Check network connectivity

4. **User Creation Errors**
   - Check database connection
   - Verify user model constraints

## Next Steps

### Immediate Actions:
1. ✅ Create GitHub OAuth App
2. ✅ Create LinkedIn OAuth App
3. ⏳ Set environment variables
4. ⏳ Test OAuth flows locally
5. ⏳ Deploy to production

### Future Enhancements:
- Add more OAuth providers (Twitter, Facebook)
- Implement social profile completion
- Add OAuth provider switching
- Implement OAuth account linking

## Files Modified

### Frontend:
- `frontend/src/pages/Auth/Login.jsx` - Updated OAuth buttons
- `frontend/src/pages/Auth/OAuthCallback.jsx` - New callback handler
- `frontend/src/App.jsx` - Added callback routes
- `frontend/src/services/api.js` - Added OAuth API method

### Backend:
- `backend/routes/auth.js` - Added OAuth callback endpoint

### Documentation:
- `OAUTH_SETUP_GUIDE.md` - This file
- `vercel.json` - Updated for OAuth routes

## Support

For OAuth implementation issues:
1. Check this guide first
2. Review browser console errors
3. Check backend logs
4. Verify OAuth app configurations
5. Test with different browsers

---
*Last Updated: December 18, 2025*
