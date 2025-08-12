import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { message } from 'antd';
import { getAuth } from 'firebase/auth';
import { useAuthStore } from '@/store/authStore';
import type { 
  Content, 
  ApiResponse, 
  PaginatedResponse, 
  BulkContentRequest,
  AnalyticsData,
  CategoriesResponse,
  SubcategoriesResponse,
  LanguagesResponse,
  UploadResponse
} from '@/types';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || '') + '/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug: Log the base URL being used
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
console.log('Full API URL:', (import.meta.env.VITE_API_BASE_URL || '') + '/api/v1');

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Add Firebase ID token to all requests
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      console.log('Request interceptor - Current user:', user?.email || 'No user');
      console.log('Request interceptor - URL:', config.url);
      
      if (user) {
        const idToken = await user.getIdToken();
        config.headers.Authorization = `Bearer ${idToken}`;
        console.log('Added Authorization header for user:', user.email, 'Token length:', idToken.length);
      } else {
        // If no user is authenticated, don't add Authorization header
        // This will result in 401 errors, which is expected for unauthenticated requests
        console.log('No authenticated user found, skipping Authorization header for URL:', config.url);
      }
    } catch (error) {
      console.warn('Failed to get Firebase ID token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle timeout errors specifically
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('Request timeout:', error.config?.url);
      message.error('Request timed out. Please try again or contact support if the issue persists.');
      return Promise.reject(error);
    }
    
    // Handle CORS errors specifically
    if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
      console.warn('CORS error detected. This might be due to backend configuration.');
      message.warning('Connection issue detected. Please check if the backend server is running and configured for CORS.');
    }
    
    // Handle 504 Gateway Timeout
    if (error.response?.status === 504) {
      console.error('Gateway timeout error:', error.config?.url);
      message.error('Server is taking too long to respond. Please try again later or contact support.');
      return Promise.reject(error);
    }
    
    // Handle 401 errors (unauthorized) - trigger logout for admin endpoints
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || '';
      const isFirebaseAuthError = errorMessage.includes('Firebase token') || 
                                 errorMessage.includes('Invalid Firebase token') ||
                                 errorMessage.includes('expired');
      
      // Check if this is an admin endpoint (contains /admin/ or /appsmith/)
      const isAdminEndpoint = error.config?.url?.includes('/admin/') || error.config?.url?.includes('/appsmith/');
      
      if (isFirebaseAuthError || isAdminEndpoint) {
        console.log('Firebase authentication error or admin endpoint 401 - triggering logout');
        // Trigger logout for Firebase auth errors or admin endpoint 401s
        const { logout } = useAuthStore.getState();
        logout();
        message.warning('Your session has expired. Please log in again.');
      } else {
        console.log('Unauthorized request (non-Firebase, non-admin) - not logging out');
      }
      return Promise.reject(error);
    }
    
    // Only show error message for non-404 and non-401 errors to avoid spam
    if (error.response?.status !== 404) {
      const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
      message.error(errorMessage);
    }
    return Promise.reject(error);
  }
);

// Content API
export const contentApi = {
  // Get content list with pagination
  getContentList: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    language_id?: string;
    category_id?: string;
    subcategory_id?: string;
    type?: string;
    status?: string;
  }): Promise<PaginatedResponse<Content>> => {
    const response = await api.get('/appsmith/content/list', { params });
    return response.data;
  },

  // Upload content
  uploadContent: async (data: BulkContentRequest): Promise<ApiResponse<any>> => {
    const response = await api.post('/appsmith/content/upload', data);
    return response.data;
  },

  // Update content
  updateContent: async (data: BulkContentRequest): Promise<ApiResponse<any>> => {
    const response = await api.put('/appsmith/content/update', data);
    return response.data;
  },

  // Delete content
  deleteContent: async (data: { content_ids: string[]; user_id: string }): Promise<ApiResponse<any>> => {
    const response = await api.delete('/appsmith/content/delete', { data });
    return response.data;
  },

  // Export content
  exportContent: async (params: {
    format?: 'json' | 'csv';
    language_id?: string;
    type?: string;
  }): Promise<Blob> => {
    const response = await api.get('/admin/content/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },
};

// Upload API
export const uploadApi = {
  // Get presigned URL for direct upload
  getUploadURL: async (filename: string, contentType: string, categoryId: string, subcategoryId: string): Promise<{upload_url: string, file_url: string}> => {
    console.log('Getting presigned URL for:', { filename, contentType, categoryId, subcategoryId });
    
    const response = await api.get('/appsmith/upload/url', {
      params: {
        filename,
        content_type: contentType,
        category_id: categoryId,
        subcategory_id: subcategoryId,
      },
      timeout: 15000, // 15 seconds for URL generation
    });
    
    console.log('Presigned URL response:', response.data);
    return response.data;
  },

  // Upload image directly to DigitalOcean Spaces
  uploadImageDirect: async (file: File, categoryId: string, subcategoryId: string): Promise<UploadResponse> => {
    console.log('uploadImageDirect called with:', { 
      filename: file.name, 
      size: file.size,
      type: file.type,
      categoryId, 
      subcategoryId 
    });
    
    // Step 1: Get the presigned URL from backend
    console.log('Step 1: Getting presigned URL from backend...');
    const { upload_url, file_url } = await uploadApi.getUploadURL(
      file.name,
      file.type,
      categoryId,
      subcategoryId
    );

    console.log('Step 2: Uploading to DigitalOcean Spaces using presigned URL...');
    console.log('Upload URL:', upload_url);
    console.log('Expected file URL:', file_url);

    // Step 2: Upload directly to DigitalOcean Spaces using the presigned URL
    const response = await fetch(upload_url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      console.error('DigitalOcean Spaces upload failed:', {
        status: response.status,
        statusText: response.statusText,
        url: upload_url
      });
      throw new Error(`Failed to upload to DigitalOcean Spaces: ${response.status} ${response.statusText}`);
    }

    console.log('Step 3: Upload to DigitalOcean Spaces successful');
    console.log('Final file URL:', file_url);

    return {
      message: 'File uploaded successfully to DigitalOcean Spaces',
      url: file_url,
    };
  },

  // Legacy upload method (kept for backward compatibility)
  uploadImage: async (file: File, categoryId: string, subcategoryId: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/appsmith/upload/image', formData, {
      params: {
        category_id: categoryId,
        subcategory_id: subcategoryId,
      },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 seconds for image uploads (reduced to prevent DigitalOcean timeout)
    });
    return response.data;
  },

  // Delete image
  deleteImage: async (url: string): Promise<ApiResponse<any>> => {
    const response = await api.delete('/appsmith/upload/image', {
      data: { url },
    });
    return response.data;
  },

  // Notify backend of upload completion
  notifyUploadComplete: async (data: {
    file_url: string;
    category_id: string;
    subcategory_id: string;
    filename: string;
    content_type: string;
    file_size: number;
  }): Promise<ApiResponse<any>> => {
    console.log('Notifying backend of upload completion:', data);
    
    const response = await api.post('/appsmith/upload/complete', data);
    return response.data;
  },
};

// Categories API
export const categoriesApi = {
  getCategories: async (page?: number, limit?: number): Promise<CategoriesResponse> => {
    const params: any = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;
    const response = await api.get('/appsmith/categories', { params });
    return response.data;
  },

  createCategories: async (data: { categories: any[]; user_id: string }): Promise<ApiResponse<any>> => {
    const response = await api.post('/admin/categories/bulk', data);
    return response.data;
  },

  // For now, we'll use bulk create for individual items until backend supports individual CRUD
  createCategory: async (data: { category: any; user_id: string }): Promise<ApiResponse<any>> => {
    const response = await api.post('/admin/categories', data);
    return response.data;
  },

  // Simplified category creation (single language)
  createCategorySimple: async (data: { category: any; user_id: string }): Promise<ApiResponse<any>> => {
    const response = await api.post('/admin/categories/simple', data);
    return response.data;
  },

  // Add translation to existing category
  addCategoryTranslation: async (categoryId: string, data: { translation: any; user_id: string }): Promise<ApiResponse<any>> => {
    const response = await api.post(`/admin/categories/${categoryId}/translations`, data);
    return response.data;
  },

  // Get specific translation for category
  getCategoryTranslation: async (categoryId: string, languageId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/admin/categories/${categoryId}/translations/${languageId}`);
    return response.data;
  },

  updateCategory: async (id: string, data: { category: any; user_id: string }): Promise<ApiResponse<any>> => {
    const response = await api.put(`/admin/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string, data: { user_id: string }): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/admin/categories/${id}`, { data });
    return response.data;
  },
};

// Languages API
export const languagesApi = {
  getLanguages: async (page?: number, limit?: number): Promise<LanguagesResponse> => {
    const params: any = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;
    const response = await api.get('/languages', { params });
    return response.data;
  },

  createLanguages: async (data: { languages: any[]; user_id: string }): Promise<ApiResponse<any>> => {
    const response = await api.post('/admin/languages/bulk', data);
    return response.data;
  },

  // For now, we'll use bulk create for individual items until backend supports individual CRUD
  createLanguage: async (data: { language: any; user_id: string }): Promise<ApiResponse<any>> => {
    const response = await api.post('/admin/languages', data);
    return response.data;
  },

  updateLanguage: async (id: string, data: { language: any; user_id: string }): Promise<ApiResponse<any>> => {
    const response = await api.put(`/admin/languages/${id}`, data);
    return response.data;
  },

  deleteLanguage: async (id: string, data: { user_id: string }): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/admin/languages/${id}`, { data });
    return response.data;
  },
};

// Subcategories API
export const subcategoriesApi = {
  getSubcategories: async (categoryId?: string, page?: number, limit?: number): Promise<SubcategoriesResponse> => {
    const params: any = {};
    if (categoryId) params.category_id = categoryId;
    if (page) params.page = page;
    if (limit) params.limit = limit;
    const response = await api.get('/admin/subcategories', { params });
    return response.data;
  },

  getSubcategoriesForAppsmith: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/appsmith/subcategories');
    return response.data;
  },

  createSubcategory: async (data: { subcategory: any; user_id: string }): Promise<ApiResponse<any>> => {
    const response = await api.post('/admin/subcategories', data);
    return response.data;
  },

  // Simplified subcategory creation (single language)
  createSubcategorySimple: async (data: { subcategory: any; user_id: string }): Promise<ApiResponse<any>> => {
    const response = await api.post('/admin/subcategories/simple', data);
    return response.data;
  },

  // Add translation to existing subcategory
  addSubcategoryTranslation: async (subcategoryId: string, data: { translation: any; user_id: string }): Promise<ApiResponse<any>> => {
    const response = await api.post(`/admin/subcategories/${subcategoryId}/translations`, data);
    return response.data;
  },

  // Get specific translation for subcategory
  getSubcategoryTranslation: async (subcategoryId: string, languageId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/admin/subcategories/${subcategoryId}/translations/${languageId}`);
    return response.data;
  },

  updateSubcategory: async (id: string, data: { subcategory: any; user_id: string }): Promise<ApiResponse<any>> => {
    const response = await api.put(`/admin/subcategories/${id}`, data);
    return response.data;
  },

  deleteSubcategory: async (id: string, data: { user_id: string }): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/admin/subcategories/${id}`, { data });
    return response.data;
  },
};

// Analytics API
export const analyticsApi = {
  getAnalytics: async (): Promise<ApiResponse<AnalyticsData>> => {
    const response = await api.get('/appsmith/analytics');
    return response.data;
  },

  getUserAnalytics: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/admin/users/analytics');
    return response.data;
  },
};

// Health check API
export const healthApi = {
  checkHealth: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/appsmith/health');
    return response.data;
  },
};

// Admin validation API
export const adminApi = {
  validateAccess: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/admin/validate-access');
    return response.data;
  },
};

export default api; 