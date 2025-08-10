# 🎛️ **LitLines Admin Panel**

## 📋 **Overview**
This directory contains the LitLines admin panel - a React-based web application for managing content, users, and analytics with Firebase Google OAuth authentication and admin access control.

## 🏗️ **Technology Stack**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Ant Design
- **State Management**: React Query (@tanstack/react-query) + Zustand
- **Authentication**: Firebase Google OAuth
- **HTTP Client**: Axios
- **Package Manager**: npm

## 📁 **Directory Structure**
```
admin-panel/
├── 📄 package.json                           # Dependencies and scripts
├── 📄 package-lock.json                      # Locked dependencies
├── 📄 vite.config.ts                         # Vite configuration
├── 📄 tsconfig.json                          # TypeScript configuration
├── 📄 tsconfig.node.json                     # Node TypeScript config
├── 📄 tailwind.config.js                     # Tailwind CSS configuration
├── 📄 postcss.config.js                      # PostCSS configuration
├── 📄 index.html                             # Main HTML file
├── 📄 README.md                              # This file
├── 📄 env.example                            # Environment variables template
├── 📁 src/                                   # Source code
│   ├── 📄 main.tsx                          # Application entry point
│   ├── 📄 App.tsx                           # Main application component
│   ├── 📄 index.css                         # Global styles
│   ├── 📁 components/                       # Reusable components
│   │   ├── 📄 Login.tsx                     # Authentication component
│   │   ├── 📄 ProtectedRoute.tsx            # Route protection component
│   │   └── ...                              # Other components
│   ├── 📁 pages/                            # Page components
│   ├── 📁 services/                         # API services
│   ├── 📁 types/                            # TypeScript type definitions
│   ├── 📁 hooks/                            # Custom React hooks
│   ├── 📁 store/                            # State management
│   │   └── 📄 authStore.ts                  # Authentication store
│   ├── 📁 config/                           # Configuration files
│   │   └── 📄 firebase.ts                   # Firebase configuration
│   └── 📁 utils/                            # Utility functions
├── 📁 public/                               # Static assets
├── 📁 node_modules/                         # Dependencies (generated)
└── 📁 .vite/                                # Vite cache (generated)
```

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18 or higher
- npm or yarn package manager
- Firebase project with Google OAuth enabled
- Backend server running (see backend/README.md)

### **Firebase Setup**

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select an existing one
   - Enable Google Authentication in Authentication > Sign-in method

2. **Configure Google OAuth**
   - In Firebase Console, go to Authentication > Sign-in method
   - Enable Google provider
   - Add your domain to authorized domains

3. **Get Firebase Configuration**
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click "Add app" and select Web
   - Copy the configuration object

### **Installation**
```bash
# Navigate to admin-panel directory
cd admin-panel

# Install dependencies
npm install

# Or using yarn
yarn install
```

### **Environment Configuration**

1. **Copy Environment Template**
```bash
cp env.example .env
```

2. **Configure Environment Variables**
Edit `.env` file with your Firebase configuration:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# API Configuration
VITE_API_BASE_URL=https://squid-app-b3fzb.ondigitalocean.app
```

### **Admin Access Configuration**

To configure which email addresses can access the admin panel, edit the `ADMIN_EMAIL_WHITELIST` in `src/store/authStore.ts`:

```typescript
const ADMIN_EMAIL_WHITELIST = [
  'pradeepmr538@gmail.com',
  'admin@yourcompany.com',
  // Add more admin emails here
];
```

### **Running the Admin Panel**

#### **Development Mode**
```bash
# Start development server
npm run dev

# Or using yarn
yarn dev
```

The admin panel will be available at `http://localhost:3008` (or the next available port).

#### **Production Build**
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔐 **Authentication Flow**

1. **Access Control**: All routes are protected and require authentication
2. **Google OAuth**: Users must sign in with Google
3. **Email Whitelist**: Only emails in the whitelist can access the admin panel
4. **Session Persistence**: Authentication state is persisted across browser sessions
5. **Automatic Logout**: Users are logged out when their session expires

## 🔧 **Configuration**

### **Environment Variables**
Create a `.env` file in the admin-panel directory:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# API Configuration
VITE_API_BASE_URL=https://squid-app-b3fzb.ondigitalocean.app
```

### **Adding New Admin Users**

To add new admin users:

1. Edit `src/store/authStore.ts`
2. Add the email address to `ADMIN_EMAIL_WHITELIST`
3. The user will be able to access the admin panel after signing in with Google

### **Security Considerations**

- **Email Whitelist**: Only pre-approved email addresses can access the admin panel
- **Firebase Security**: Ensure Firebase project has proper security rules
- **Environment Variables**: Never commit `.env` files to version control
- **HTTPS**: Always use HTTPS in production
- **Session Management**: Implement proper session timeout and refresh mechanisms

## 📊 **Features**

### **Content Management**
- **Content List**: View, filter, and search all content
- **Content Creation**: Add new quotes, memes, and dialogues
- **Content Editing**: Update existing content
- **Content Deletion**: Remove content from the system
- **Bulk Operations**: Perform operations on multiple items

### **Category Management**
- **Category List**: View all categories
- **Category Creation**: Add new categories
- **Category Editing**: Update category information
- **Multilingual Support**: Manage category names in multiple languages

### **Subcategory Management**
- **Subcategory List**: View all subcategories
- **Subcategory Creation**: Add new subcategories
- **Category Association**: Link subcategories to parent categories
- **Translation Support**: Manage subcategory names in multiple languages

### **Language Management**
- **Language List**: View supported languages
- **Language Addition**: Add new languages to the system
- **Language Configuration**: Set default language and metadata

### **User Analytics**
- **User Engagement**: Track user interactions
- **Content Performance**: Monitor content popularity
- **Usage Statistics**: Platform usage analytics
- **Export Capabilities**: Export analytics data

### **System Administration**
- **Health Monitoring**: Check system health
- **API Management**: Manage API keys and access
- **Configuration**: System configuration management

## 🎨 **UI Components**

### **Built with Ant Design**
- **Data Tables**: Sortable and filterable data display
- **Forms**: Comprehensive form components with validation
- **Navigation**: Sidebar navigation and breadcrumbs
- **Modals**: Confirmation dialogs and forms
- **Notifications**: Success, error, and info messages
- **Charts**: Analytics and data visualization

### **Custom Components**
- **ContentForm**: Specialized form for content creation/editing
- **CategoryForm**: Form for category management
- **LanguageSelector**: Language selection component
- **StatusBadge**: Status indicator component
- **Pagination**: Custom pagination component

## 🔌 **API Integration**

### **API Services**
The admin panel uses the following API endpoints:

#### **Content Management**
- `GET /api/v1/appsmith/content/list` - List content with filters
- `POST /api/v1/appsmith/content/upload` - Upload new content
- `PUT /api/v1/appsmith/content/update` - Update existing content
- `DELETE /api/v1/appsmith/content/delete` - Delete content

#### **Category Management**
- `GET /api/v1/appsmith/categories` - Get all categories
- `POST /api/v1/admin/categories` - Create new category
- `PUT /api/v1/admin/categories/:id` - Update category
- `DELETE /api/v1/admin/categories/:id` - Delete category

#### **Language Management**
- `GET /api/v1/appsmith/languages` - Get all languages
- `POST /api/v1/admin/languages` - Create new language
- `PUT /api/v1/admin/languages/:id` - Update language
- `DELETE /api/v1/admin/languages/:id` - Delete language

#### **Analytics**
- `GET /api/v1/appsmith/analytics` - Get analytics data
- `GET /api/v1/admin/users/analytics` - Get user analytics

### **Authentication**
The admin panel uses API key authentication for all requests:
```typescript
// Example API call
const response = await axios.get('/api/v1/appsmith/content/list', {
  headers: {
    'X-API-Key': process.env.VITE_API_KEY
  }
});
```

## 🧪 **Development**

### **Available Scripts**
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

### **Code Structure**
- **Components**: Reusable UI components
- **Pages**: Main application pages
- **Services**: API integration and data fetching
- **Types**: TypeScript type definitions
- **Hooks**: Custom React hooks
- **Utils**: Utility functions and helpers

### **Adding New Features**
1. **Create Component**: Add new UI components in `src/components/`
2. **Create Page**: Add new pages in `src/pages/`
3. **Add API Service**: Create API integration in `src/services/`
4. **Add Types**: Define TypeScript types in `src/types/`
5. **Add Routes**: Update routing in `App.tsx`
6. **Add Tests**: Create tests for new functionality

## 🚀 **Deployment**

### **Build for Production**
```bash
# Build the application
npm run build

# The built files will be in the `dist/` directory
```

### **Deploy to Web Server**
1. Build the application: `npm run build`
2. Copy the contents of `dist/` to your web server
3. Configure your web server to serve the static files
4. Ensure API endpoints are accessible

### **Docker Deployment**
```dockerfile
# Example Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📚 **Documentation**

### **Component Documentation**
- **ContentForm**: Form for creating and editing content
- **CategoryForm**: Form for category management
- **LanguageSelector**: Language selection component
- **StatusBadge**: Status indicator component

### **API Documentation**
See the backend documentation for complete API reference:
- **`../backend/LITLINES_BACKEND_COMPREHENSIVE_GUIDE.md`**

## 🎯 **Status**

**Current Status**: Fully functional admin panel with all core features
**Features**: Content management, category management, language management, analytics
**UI**: Modern, responsive interface built with Ant Design
**Integration**: Complete integration with LitLines backend API

The admin panel is **production-ready** and provides a comprehensive interface for managing the LitLines content platform. 