# Local Testing Configuration

## Frontend Testing Setup

### 1. Create Environment File
Create a `.env.local` file in the `lit-lines-admin` directory:

```bash
# Firebase Configuration for Local Testing
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# API Configuration
VITE_API_BASE_URL=http://localhost:8080
```

### 2. Update Admin Email Whitelist
Edit `src/store/authStore.ts` and add your email to the whitelist:

```typescript
const ADMIN_EMAIL_WHITELIST = [
  'pradeepmr538@gmail.com',
  'your-email@gmail.com', // Add your email here
  // Add more admin emails here
];
```

## Backend Testing Setup

### 1. Create Environment File
Create a `.env` file in the `litlines` directory:

```bash
# Database Configuration
MONGODB_URI=mongodb+srv://litlines:tD6MpYwg8QtpiZqg@cluster0.wuachm6.mongodb.net/litlines?retryWrites=true&w=majority&appName=Cluster0

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CREDENTIALS_JSON={"type":"service_account","project_id":"your-project-id","private_key_id":"key-id","private_key":"-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk@your-project.iam.gserviceaccount.com","client_id":"client-id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk%40your-project.iam.gserviceaccount.com"}

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Admin Access Control
ADMIN_EMAIL_WHITELIST=pradeepmr538@gmail.com,your-email@gmail.com

# Application Configuration
PORT=8080
GIN_MODE=debug
```

## Testing Steps

### 1. Start Backend Server
```bash
cd litlines
go run main.go
```

### 2. Start Frontend (already running)
The frontend is already running on http://localhost:3008/

### 3. Test Authentication Flow
1. Open http://localhost:3008/
2. Click "Sign in with Google"
3. Use your Google account
4. If your email is in the whitelist, you'll see the admin panel
5. If not, you'll see an "Access Denied" message

### 4. Test Backend API
```bash
# Get Firebase ID token from browser console
# Then test admin endpoint
curl -X GET "http://localhost:8080/api/v1/admin/whitelist" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
``` 