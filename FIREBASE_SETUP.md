# Firebase Setup Guide for LitLines Admin Panel

This guide will help you set up Firebase Google OAuth authentication for the LitLines admin panel.

## Prerequisites

- A Google account
- Access to Firebase Console
- Basic knowledge of web development

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select an existing project
3. Enter a project name (e.g., "litlines-admin")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Google Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click on the **Sign-in method** tab
3. Click on **Google** in the list of providers
4. Click **Enable**
5. Add your project support email
6. Click **Save**

## Step 3: Add Your Web App

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to the **Your apps** section
3. Click the **Add app** button
4. Select the **Web** icon (</>)
5. Enter a nickname for your app (e.g., "LitLines Admin")
6. Click **Register app**

## Step 4: Get Firebase Configuration

After registering your web app, Firebase will show you a configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

**Copy this configuration** - you'll need it for the next step.

## Step 5: Configure Environment Variables

1. In your `lit-lines-admin` directory, copy the environment template:
   ```bash
   cp env.example .env
   ```

2. Edit the `.env` file and replace the placeholder values with your Firebase configuration:

   ```bash
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=AIzaSyC...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123

   # API Configuration
   VITE_API_BASE_URL=https://squid-app-b3fzb.ondigitalocean.app
   ```

## Step 6: Configure Authorized Domains

1. In Firebase Console, go to **Authentication** > **Settings**
2. Scroll down to **Authorized domains**
3. Add your development domain: `localhost`
4. Add your production domain (when you deploy)
5. Click **Save**

## Step 7: Configure Admin Email Whitelist

1. Open `src/store/authStore.ts`
2. Find the `ADMIN_EMAIL_WHITELIST` array
3. Add the email addresses that should have admin access:

   ```typescript
   const ADMIN_EMAIL_WHITELIST = [
     'pradeepmr538@gmail.com',
     'admin@yourcompany.com',
     // Add more admin emails here
   ];
   ```

## Step 8: Test the Authentication

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to the admin panel
3. You should see the login screen
4. Click "Sign in with Google"
5. Select your Google account
6. If your email is in the whitelist, you'll be redirected to the admin panel
7. If not, you'll see an "Access Denied" message

## Troubleshooting

### Common Issues

1. **"Firebase: Error (auth/popup-closed-by-user)"**
   - This happens when the user closes the popup before completing authentication
   - Solution: Try again and don't close the popup

2. **"Firebase: Error (auth/unauthorized-domain)"**
   - Your domain is not in the authorized domains list
   - Solution: Add your domain to Firebase Console > Authentication > Settings > Authorized domains

3. **"Access Denied" after successful Google login**
   - Your email is not in the admin whitelist
   - Solution: Add your email to `ADMIN_EMAIL_WHITELIST` in `src/store/authStore.ts`

4. **Environment variables not loading**
   - Make sure your `.env` file is in the root directory
   - Restart the development server after changing environment variables

### Security Best Practices

1. **Never commit `.env` files to version control**
   - Add `.env` to your `.gitignore` file
   - Use `.env.example` for templates

2. **Use environment-specific configurations**
   - Different Firebase projects for development and production
   - Different API endpoints for different environments

3. **Regularly review admin access**
   - Remove admin access for users who no longer need it
   - Use the Admin Management interface in Settings

4. **Monitor Firebase usage**
   - Check Firebase Console for authentication logs
   - Monitor for suspicious activity

## Production Deployment

When deploying to production:

1. **Create a production Firebase project** (recommended)
2. **Update environment variables** with production Firebase config
3. **Add your production domain** to authorized domains
4. **Configure proper security rules** in Firebase
5. **Set up monitoring and alerts**

## Support

If you encounter issues:

1. Check the Firebase Console for error logs
2. Verify your configuration matches the examples above
3. Ensure all environment variables are set correctly
4. Check that your email is in the admin whitelist

For additional help, refer to:
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Console Help](https://firebase.google.com/support) 