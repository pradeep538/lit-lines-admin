// Base model interface
export interface BaseModel {
  id: string;
  created_at: string;
  updated_at: string;
}

// Content types
export interface Content extends BaseModel {
  content_group_id: string;
  text: string;
  author: string;
  source: string;
  language_id: string;
  type: string;
  background_image_url: string;
  shareable_image_url: string;
  tags: string[];
  status: string;
  popularity_score: number;
  is_visible: boolean;
  category?: CategoryInfo;
  subcategory?: SubcategoryInfo;
  language?: LanguageInfo;
  engagement?: EngagementStats;
}

export interface CategoryInfo {
  category_id: string;
  language_context: string;
  name: Record<string, string>;
  description: Record<string, string>;
  image_url: string;
}

export interface SubcategoryInfo {
  subcategory_id: string;
  name: Record<string, string>;
  image_url: string;
}

export interface LanguageInfo {
  language_id: string;
  name: string;
  flag_icon_url: string;
}

export interface EngagementStats {
  total_likes: number;
  total_saves: number;
  total_shares: number;
  view_count: number;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface CategoriesResponse {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface SubcategoriesResponse {
  subcategories: Subcategory[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface LanguagesResponse {
  languages: Language[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Form types
export interface ContentFormData {
  text: string;
  author: string;
  source: string;
  language_id: string;
  type: string;
  background_image_url: string;
  shareable_image_url: string;
  tags: string[];
  status: string;
  category_id?: string;
  subcategory_id?: string;
}

// Bulk operations
export interface BulkContentRequest {
  content: Content[];
  user_id: string;
}

export interface BulkOperationResult {
  id: string;
  status: 'success' | 'failed';
  error?: string;
}

// Analytics types
export interface AnalyticsData {
  total_content: number;
  total_users: number;
  total_likes: number;
  total_saves: number;
  content_by_type: Record<string, number>;
  content_by_language: Record<string, number>;
}

// Category types
export interface Category extends BaseModel {
  category_id: string;
  language_context: string;
  name: Record<string, string>;
  description: Record<string, string>;
  image_url: string;
  status: string;
  sort_order: number;
}

// Subcategory types
export interface Subcategory extends BaseModel {
  subcategory_id: string;
  category_id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  image_url: string;
  status: string;
  sort_order: number;
}

// Language types
export interface Language extends BaseModel {
  language_id: string;
  name: string;
  native_name: string;
  flag_icon_url: string;
  status: string;
  is_default: boolean;
  sort_order: number;
}

// Form types for CRUD operations
export interface CategoryFormData {
  language_context: string;
  name: Record<string, string>;
  description: Record<string, string>;
  image_url: string;
  status: string;
  sort_order: number;
}

export interface SubcategoryFormData {
  category_id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  image_url: string;
  status: string;
  sort_order: number;
}

export interface LanguageFormData {
  name: string;
  native_name: string;
  flag_icon_url: string;
  status: string;
  is_default: boolean;
  sort_order: number;
}

// Upload types
export interface UploadResponse {
  message: string;
  url: string;
}

export interface UploadError {
  error: string;
} 