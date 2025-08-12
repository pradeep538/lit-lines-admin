# Upload Functionality Testing Guide

## Prerequisites

### Backend Setup
1. **Backend is running** ✅
   - Backend server is running on `http://localhost:8080`
   - Health check endpoint is accessible
   - Upload endpoints are properly configured

2. **DigitalOcean Spaces Configuration**
   - Set up environment variables in backend:
     ```bash
     export SPACES_ACCESS_KEY="your_access_key"
     export SPACES_SECRET_KEY="your_secret_key"
     export SPACES_BUCKET="your_bucket_name"
     export SPACES_REGION="blr1"
     ```

3. **Firebase Configuration**
   - Set up Firebase credentials for authentication
   - Configure admin email whitelist

### Frontend Setup
1. **Frontend is running** ✅
   - Frontend is running on `http://localhost:3008`
   - API base URL is configured to point to local backend

## Manual Testing Steps

### Step 1: Access the Frontend
1. Open browser and navigate to `http://localhost:3008`
2. You should see the login page or dashboard

### Step 2: Authentication
1. Log in with Firebase authentication
2. Ensure you're using an email that's in the admin whitelist
3. Verify you can access the admin dashboard

### Step 3: Navigate to Content Management
1. Go to "Content Management" section
2. Click "Add New Content" or edit existing content
3. You should see the content form with upload fields

### Step 4: Test Upload Flow

#### 4.1: Test Category/Subcategory Validation
1. **Without selecting category/subcategory:**
   - Try to upload an image
   - Should see error: "Please select both category and subcategory before uploading"
   - Upload area should be disabled

2. **Select only category:**
   - Select a category from dropdown
   - Try to upload an image
   - Should see error: "Please select both category and subcategory before uploading"

3. **Select both category and subcategory:**
   - Select a category
   - Select a subcategory
   - Upload area should become enabled
   - Should see "Upload Flow" information alert

#### 4.2: Test File Validation
1. **Test invalid file type:**
   - Try to upload a text file (.txt)
   - Should see error: "You can only upload image files!"

2. **Test file size limit:**
   - Try to upload an image larger than 10MB
   - Should see error: "Image must be smaller than 10MB!"

3. **Test valid image:**
   - Upload a valid image file (JPEG, PNG, etc.) under 10MB
   - Should proceed with upload

#### 4.3: Test Upload Process
1. **Upload a valid image:**
   - Select category and subcategory
   - Upload a valid image file
   - Watch the progress indicators:
     - "Getting upload URL from backend..." (10%)
     - "Uploading to DigitalOcean Spaces..." (30-90%)
     - "Upload completed successfully!" (100%)

2. **Check console logs:**
   - Open browser developer tools (F12)
   - Go to Console tab
   - Look for detailed upload logs:
     ```
     handleUpload called with: {filename, size, type, categoryId, subcategoryId}
     Step 1: Getting presigned URL from backend...
     Getting presigned URL for: {filename, contentType, categoryId, subcategoryId}
     Presigned URL response: {upload_url, file_url}
     Step 2: Uploading to DigitalOcean Spaces using presigned URL...
     Step 3: Upload to DigitalOcean Spaces successful
     Step 4: Notifying backend of upload completion...
     Backend notification successful
     ```

3. **Verify upload result:**
   - Image should display with "✓ Uploaded to DigitalOcean Spaces" indicator
   - Image URL should be populated in the form field
   - Should be able to view the uploaded image

#### 4.4: Test Error Scenarios
1. **Network error:**
   - Disconnect internet during upload
   - Should see appropriate error message

2. **Backend error:**
   - Stop backend server during upload
   - Should see error message about connection issues

3. **DigitalOcean Spaces error:**
   - If Spaces credentials are invalid
   - Should see specific error message

### Step 5: Test Image Management
1. **View uploaded image:**
   - Click "View" button on uploaded image
   - Should open image in new tab

2. **Delete uploaded image:**
   - Click "Delete" button on uploaded image
   - Should remove image and clear form field
   - Should show success message

## Expected Console Output

### Successful Upload:
```
handleUpload called with: {filename: "test.jpg", size: 12345, type: "image/jpeg", categoryId: "cat-123", subcategoryId: "sub-456"}
Step 1: Getting presigned URL from backend...
Getting presigned URL for: {filename: "test.jpg", contentType: "image/jpeg", categoryId: "cat-123", subcategoryId: "sub-456"}
Presigned URL response: {upload_url: "https://...", file_url: "https://..."}
Step 2: Uploading to DigitalOcean Spaces using presigned URL...
Step 3: Upload to DigitalOcean Spaces successful
Step 4: Notifying backend of upload completion...
Backend notification successful
```

### Backend Logs (if accessible):
```
Upload URL generated successfully
Upload completion notification received
```

## Troubleshooting

### Common Issues:

1. **Authentication Errors:**
   - Ensure Firebase is properly configured
   - Check admin email whitelist
   - Verify Firebase credentials

2. **Upload URL Generation Fails:**
   - Check DigitalOcean Spaces configuration
   - Verify environment variables are set
   - Check backend logs for specific errors

3. **Direct Upload to Spaces Fails:**
   - Check Spaces credentials
   - Verify bucket permissions
   - Check network connectivity

4. **Frontend Not Connecting to Backend:**
   - Verify API base URL configuration
   - Check CORS settings on backend
   - Ensure backend is running on correct port

### Debug Commands:

1. **Test Backend Health:**
   ```bash
   curl http://localhost:8080/health
   ```

2. **Test Upload URL Endpoint (with auth):**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        "http://localhost:8080/api/v1/appsmith/upload/url?filename=test.jpg&content_type=image/jpeg&category_id=test&subcategory_id=test"
   ```

3. **Check Backend Logs:**
   ```bash
   # Look for upload-related logs in backend console
   ```

## Success Criteria

✅ Upload is disabled until category and subcategory are selected
✅ Upload shows step-by-step progress
✅ File is uploaded directly to DigitalOcean Spaces
✅ Backend is notified of upload completion
✅ Uploaded image displays correctly
✅ Error handling works for all scenarios
✅ Console shows detailed upload logs 