# Email Setup Guide for Gmail SMTP

## Current Issue
Emails are not being sent to suppliers because the Gmail SMTP configuration is missing environment variables.

## Required Environment Variables

You need to add these variables to your `.env` file in the root directory:

```env
# Gmail SMTP Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASSWORD=your-app-password-here
EMAIL_FROM=Your Company Name <your-gmail-address@gmail.com>
```

## Gmail App Password Setup

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Select "Security" from the left menu
3. Enable "2-Step Verification" if not already enabled

### Step 2: Generate App Password
1. In Google Account Security settings
2. Under "2-Step Verification", click "App passwords"
3. Select "Mail" and your device/computer
4. Google will generate a 16-character app password
5. Copy this password (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update .env File
```env
EMAIL_USER=youremail@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=Your Company <youremail@gmail.com>
```

## Testing Email Configuration

After setting up the environment variables:

1. Restart the backend server
2. Run the test: `node backend/test-email-config.js`
3. You should see "✅ SMTP Connection Successful!"

## Alternative: Using Hardcoded Configuration (Temporary)

If you want to test immediately, you can temporarily modify the config file:

```javascript
// In backend/config/config.js
email: {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  user: 'your-gmail@gmail.com',      // Replace with your email
  password: 'your-app-password',      // Replace with app password
  from: 'Your Company <your-gmail@gmail.com>'
}
```

⚠️ **Warning**: Don't commit hardcoded credentials to version control!

## Troubleshooting

### Common Issues:
1. **"Invalid login"** - Make sure you're using an App Password, not your regular Gmail password
2. **"Less secure app access"** - This is outdated; use App Passwords instead
3. **"Authentication failed"** - Double-check your email and app password

### Test Email Sending:
```bash
cd backend
node test-email-config.js
```

Should show:
- Host: smtp.gmail.com
- Port: 587
- User: [SET]
- Password: [SET]
- ✅ SMTP Connection Successful!
