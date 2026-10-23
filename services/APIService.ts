import { Config } from '@/constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  success: boolean;
}

export interface APIRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export class APIService {
  static onUnauthorized: (() => void) | null = null;

  private baseURL: string;
  private backendURL: string;
  private defaultHeaders: Record<string, string>;
  private defaultTimeout: number;

  constructor(baseURL?: string, timeout?: number) {
    this.baseURL = baseURL || Config.API_BASE_URL;
    this.backendURL = Config.BACKEND_URL;
    this.defaultTimeout = timeout || 30000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Make an API request
   */
  async request<T = any>(
    endpoint: string,
    options: APIRequestOptions = {}
  ): Promise<APIResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
    } = options;

    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const resolvedBaseURL =
      normalizedEndpoint.startsWith('/api/backend') ? this.backendURL : this.baseURL;
    const url = `${resolvedBaseURL.replace(/\/+$/, '')}${normalizedEndpoint}`;
    
    const isFormData = body instanceof FormData;
    
    const requestHeaders = {
      ...(isFormData ? {} : this.defaultHeaders),
      ...headers,
    };
    
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      credentials: 'include',
    };

    if (body && method !== 'GET') {
      requestOptions.body = isFormData ? body : (typeof body === 'string' ? body : JSON.stringify(body));
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        if (!endpoint.includes('/login')) {
          APIService.onUnauthorized?.();
        }
        return {
          success: false,
          status: 401,
          data: {} as T,
        };
      }

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          error: responseData.message || responseData.error || `HTTP ${response.status}`,
          data: responseData,
        };
      }

      return {
        success: true,
        status: response.status,
        data: responseData,
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          status: 408,
          error: 'Request timeout',
        };
      }

      return {
        success: false,
        status: 0,
        error: error.message || 'Network error',
      };
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, headers?: Record<string, string>): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, headers });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, headers });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, headers?: Record<string, string>): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body, headers });
  }

  /**
   * Set default headers
   */
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  /**
   * Set authorization header
   */
  setAuthToken(token: string): void {
    this.setDefaultHeaders({ Authorization: `Bearer ${token}` });
  }

  /**
   * Clear authorization header
   */
  clearAuthToken(): void {
    const { Authorization, ...headers } = this.defaultHeaders;
    this.defaultHeaders = headers;
  }

  /**
   * Get current base URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Set new base URL
   */
  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }
}

// Create default API service instance
export const apiService = new APIService();

// Create AI API service instance with longer timeout
export const aiAPIService = new APIService(Config.AI_API_URL);

// Export commonly used methods for convenience
export const api = {
  get: apiService.get.bind(apiService),
  post: apiService.post.bind(apiService),
  put: apiService.put.bind(apiService),
  delete: apiService.delete.bind(apiService),
  patch: apiService.patch.bind(apiService),
  setAuthToken: apiService.setAuthToken.bind(apiService),
  clearAuthToken: apiService.clearAuthToken.bind(apiService),
};

export const aiAPI = {
  get: (endpoint: string, headers?: Record<string, string>) => 
    aiAPIService.request(endpoint, { method: 'GET', headers, timeout: 45000 }),
  post: (endpoint: string, body?: any, headers?: Record<string, string>) => 
    aiAPIService.request(endpoint, { method: 'POST', body, headers, timeout: 45000 }),
  put: (endpoint: string, body?: any, headers?: Record<string, string>) => 
    aiAPIService.request(endpoint, { method: 'PUT', body, headers, timeout: 45000 }),
  delete: (endpoint: string, headers?: Record<string, string>) => 
    aiAPIService.request(endpoint, { method: 'DELETE', headers, timeout: 45000 }),
  patch: (endpoint: string, body?: any, headers?: Record<string, string>) => 
    aiAPIService.request(endpoint, { method: 'PATCH', body, headers, timeout: 45000 }),
  setAuthToken: aiAPIService.setAuthToken.bind(aiAPIService),
  clearAuthToken: aiAPIService.clearAuthToken.bind(aiAPIService),
};

// Legacy Profile API interface (for backward compatibility)
export interface LegacyProfileData {
  idol: string;
  personality: string;
  goals: string;
  challenges: string;
  communicationStyle: string;
  interests: string;
  values: string;
  supportNeeds: string;
}

// New Onboarding Data interfaces
export interface FullTrackOnboardingData {
  inspirationFigure: string;
  inspirationQuality: string;
  actorAuthorStyle: string;
  actorAuthorTone: string;
  spiritualPractices: string;
  spiritualReflection: string;
  lifeLandscape: string;
  safePlace: string;
  strengthSymbol: string;
  sensoryAnchor: string;
  chapterTitle: string;
  strengthMoment: string;
  primaryHope: string;
  copingPattern: string;
}

export interface FastTrackOnboardingData {
  inspirationFigure: string;
  inspirationQuality: string;
  actorAuthorStyle: string;
  actorAuthorTone: string;
  spiritualPractices: string;
  spiritualReflection: string;
  chapterTitle: string;
  primaryHope: string;
}

export interface OnboardingRequest {
  inspirationFigure: string;
  inspirationQuality: string;
  actorAuthorStyle: string;
  actorAuthorTone: string;
  spiritualPractices: string;
  spiritualReflection: string;
  chapterTitle: string;
  primaryHope: string;
  lifeLandscape?: string;
  safePlace?: string;
  strengthSymbol?: string;
  sensoryAnchor?: string;
  strengthMoment?: string;
  copingPattern?: string;
  onboardingType: 'full-track' | 'fast-track';
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  profile: {
    // Legacy fields
    idol: string;
    personality: string;
    goals: string;
    challenges: string;
    communicationStyle: string;
    interests: string;
    values: string;
    supportNeeds: string;
    
    // New onboarding fields
    inspirationFigure: string;
    inspirationQuality: string;
    actorAuthorStyle: string;
    actorAuthorTone: string;
    spiritualPractices: string;
    spiritualReflection: string;
    lifeLandscape?: string;
    safePlace?: string;
    strengthSymbol?: string;
    sensoryAnchor?: string;
    chapterTitle: string;
    strengthMoment?: string;
    primaryHope: string;
    copingPattern?: string;
    onboardingType: 'full-track' | 'fast-track';
    onboardingCompletedAt: string;
    updatedAt: string;
  };
}

// Profile API methods
export const profileAPI = {
  // Complete onboarding process (POST)
  completeOnboarding: async (onboardingData: OnboardingRequest): Promise<APIResponse<ProfileResponse>> => {
    console.log('🎯 Completing onboarding:', onboardingData);
    return api.post('/api/app-auth/profile', onboardingData);
  },
  
  // Update individual profile fields (PUT)
  updateProfile: async (profileData: Partial<OnboardingRequest>): Promise<APIResponse<ProfileResponse>> => {
    console.log('📝 Updating profile fields:', profileData);
    return api.put('/api/app-auth/profile', profileData);
  },
  
  // Get complete profile (GET)
  getProfile: async (): Promise<APIResponse<ProfileResponse>> => {
    console.log('📖 Fetching user profile');
    return api.get('/api/app-auth/profile');
  },
  
  // Legacy method for backward compatibility
  updateLegacyProfile: async (profileData: LegacyProfileData): Promise<APIResponse> => {
    console.log('📝 Updating legacy profile:', profileData);
    return api.put('/api/app-auth/profile', profileData);
  },
};

// Password Reset API methods
export interface PrivacyDataExport {
  exportedAt: string;
  accountType: 'patient' | 'student';
  profile: Record<string, unknown>;
  journalEntries: Array<Record<string, unknown>>;
  aiSummaries: Array<Record<string, unknown>>;
  aiConversations: Array<Record<string, unknown>>;
}

export const dataPrivacyAPI = {
  exportData: async (): Promise<APIResponse<{ success: boolean; data: PrivacyDataExport }>> =>
    api.post('/api/app-auth/data'),
  deleteAccount: async (): Promise<APIResponse<{ success: boolean; message: string }>> =>
    api.delete('/api/app-auth/data'),
};
export const passwordResetAPI = {
  // Request password reset (POST)
  requestPasswordReset: async (email: string): Promise<APIResponse> => {
    console.log('🔐 Requesting password reset for:', email);
    return api.post('/api/patient-auth/forgot-password', { email });
  },
  
  // Reset password with OTP (POST)
  resetPasswordWithOtp: async (email: string, otp: string, newPassword: string): Promise<APIResponse> => {
    console.log('🔑 Resetting password with OTP for email:', email);
    return api.post('/api/patient-auth/reset-password', { email, otp, newPassword });
  },
  
  // Deprecated token-based methods kept for compatibility
  validateResetToken: async (token: string): Promise<APIResponse> => {
    console.warn('validateResetToken is deprecated for app users. Use OTP flow.');
    return api.get(`/api/patient-auth/reset-password?token=${token}`);
  },
  
  resetPassword: async (token: string, newPassword: string): Promise<APIResponse> => {
    console.warn('resetPassword(token) is deprecated for app users. Use resetPasswordWithOtp.');
    return api.post('/api/patient-auth/reset-password', { token, newPassword });
  },
};

// Journal Entry interfaces
export type MediaType = 'text' | 'photo' | 'handwritten' | 'voice';

export interface JournalEntry {
  id?: string;
  title: string;
  content: string;
  mediaType: MediaType;
  mood?: number;
  mediaUrl?: string;
  transcribedText?: string;
  timestamp?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JournalEntryCreateRequest {
  title: string;
  content: string;
  mediaType: MediaType;
  mood?: number;
  mediaUrl?: string;
  transcribedText?: string;
}

export interface JournalEntryUpdateRequest {
  title?: string;
  content?: string;
  mood?: number;
  mediaUrl?: string;
  transcribedText?: string;
}

export interface JournalEntriesListResponse {
  success: boolean;
  data: JournalEntry[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface JournalEntryResponse {
  success: boolean;
  data: JournalEntry;
  message?: string;
}

export interface ClinicianSharingPreferences {
  shareAIConversationSummary: boolean;
  shareJournalEntrySummary: boolean;
  share_ai_conversation_summary?: boolean;
  share_journal_entry_summary?: boolean;
}

export interface ClinicianSharingPreferencesResponse {
  success?: boolean;
  data?: ClinicianSharingPreferences;
  shareAIConversationSummary?: boolean;
  shareJournalEntrySummary?: boolean;
  share_ai_conversation_summary?: boolean;
  share_journal_entry_summary?: boolean;
  message?: string;
}

export type ClinicianSummaryType = 'ai_conversation' | 'journal_entry';

export interface ClinicianSummary {
  id: string;
  userId: string;
  summaryType: ClinicianSummaryType;
  summaryText: string;
  sourceId?: string;
  createdAt: string;
}

export interface ClinicianSummariesResponse {
  success: boolean;
  data: ClinicianSummary[];
  pagination?: {
    limit: number;
    offset: number;
    count: number;
  };
}

// Journal API methods
export const journalAPI = {
  // Create new journal entry (POST) — supports both JSON and multipart
  createEntry: async (entryData: JournalEntryCreateRequest): Promise<APIResponse<JournalEntryResponse>> => {
    console.log('📝 Creating journal entry:', entryData);

    // Voice entries: always send as JSON, skip multipart entirely
    if (entryData.mediaType === 'voice') {
      console.log('📝 Voice entry sending as JSON (client-side transcription)');
      return api.post('/api/backend/journal/entries', {
        title: entryData.title,
        content: entryData.content,
        media_type: entryData.mediaType,
        mood: entryData.mood,
        transcribed_text: entryData.transcribedText || null,
      });
    }

    // Photo/handwritten entries: use multipart upload for image files
    if (entryData.mediaType === 'photo' || entryData.mediaType === 'handwritten' || entryData.mediaUrl?.startsWith('file://')) {
      const formData = new FormData();
      formData.append('title', entryData.title);
      formData.append('content', entryData.content);
      formData.append('media_type', entryData.mediaType);
      if (entryData.mood !== undefined) formData.append('mood', String(entryData.mood));
      if (entryData.transcribedText) formData.append('transcribed_text', entryData.transcribedText);

      // Append image file if photo/handwritten
      if ((entryData.mediaType === 'photo' || entryData.mediaType === 'handwritten') && entryData.mediaUrl) {
        const filename = entryData.mediaUrl.split('/').pop() || 'image.jpg';
        formData.append('image', {
          uri: entryData.mediaUrl,
          type: 'image/jpeg',
          name: filename,
        } as any);
      }

      // Determine the backend URL (same routing as api.post)
      const endpoint = '/api/backend/journal/entries';
      const resolvedBaseURL = endpoint.startsWith('/api/backend')
        ? (apiService as any).backendURL || Config.BACKEND_URL
        : (apiService as any).baseURL || Config.API_BASE_URL;
      const url = `${resolvedBaseURL}${endpoint}`;

      try {
        const storedToken = await AsyncStorage.getItem('auth_token');
        const existingAuth = (apiService as any).defaultHeaders?.Authorization;
        const token = existingAuth?.replace('Bearer ', '') || storedToken || '';
        const response = await fetch(url, {
          method: 'POST',
          body: formData,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const responseData = await response.json();
        return {
          success: response.ok,
          status: response.status,
          data: responseData,
          error: response.ok ? undefined : responseData.error || `HTTP ${response.status}`,
        };
      } catch (err: any) {
        return { success: false, status: 0, error: err.message || 'Network error' };
      }
    }

    // Default: JSON post
    return api.post('/api/backend/journal/entries', entryData);
  },
  
  // Get all journal entries (GET) - with optional pagination
  getEntries: async (page?: number, limit?: number): Promise<APIResponse<JournalEntriesListResponse>> => {
    console.log('📖 Fetching journal entries');
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    const query = queryParams.toString();
    return api.get(`/api/backend/journal/entries${query ? `?${query}` : ''}`);
  },
  
  // Get single journal entry by ID (GET)
  getEntry: async (id: string): Promise<APIResponse<JournalEntryResponse>> => {
    console.log('📖 Fetching journal entry:', id);
    return api.get(`/api/backend/journal/entries/${id}`);
  },
  
  // Update journal entry (PUT)
  updateEntry: async (id: string, entryData: JournalEntryUpdateRequest): Promise<APIResponse<JournalEntryResponse>> => {
    console.log('✏️ Updating journal entry:', id, entryData);
    return api.put(`/api/backend/journal/entries/${id}`, entryData);
  },
  
  // Delete journal entry (DELETE)
  deleteEntry: async (id: string): Promise<APIResponse> => {
    console.log('🗑️ Deleting journal entry:', id);
    return api.delete(`/api/backend/journal/entries/${id}`);
  },
};

export interface CommunityPost {
  id: number;
  patientUserId: number;
  authorName: string;
  content: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface CommunityComment {
  id: number;
  postId: number;
  patientUserId: number;
  authorName: string;
  content: string;
  createdAt: string;
}

// Community API methods
export const communityAPI = {
  getPosts: async (page = 1, limit = 20): Promise<APIResponse<{ data: CommunityPost[]; pagination: any }>> => {
    return api.get(`/api/backend/community/posts?page=${page}&limit=${limit}`);
  },

  createPost: async (content: string): Promise<APIResponse<{ data: CommunityPost }>> => {
    return api.post('/api/backend/community/posts', { content });
  },

  deletePost: async (id: number): Promise<APIResponse> => {
    return api.delete(`/api/backend/community/posts/${id}`);
  },

  toggleLike: async (postId: number): Promise<APIResponse<{ data: { liked: boolean; likeCount: number } }>> => {
    return api.post(`/api/backend/community/posts/${postId}/like`, {});
  },

  getComments: async (postId: number): Promise<APIResponse<{ data: CommunityComment[] }>> => {
    return api.get(`/api/backend/community/posts/${postId}/comments`);
  },

  addComment: async (postId: number, content: string): Promise<APIResponse<{ data: CommunityComment }>> => {
    return api.post(`/api/backend/community/posts/${postId}/comments`, { content });
  },
};

// Clinician sharing preferences API methods
export const clinicianSharingAPI = {
  // Get clinician-sharing preferences (GET)
  getPreferences: async (): Promise<APIResponse<ClinicianSharingPreferencesResponse>> => {
    console.log('📖 Fetching clinician-sharing preferences');
    return api.get('/api/backend/clinician-sharing/preferences');
  },

  // Update clinician-sharing preferences (PUT)
  updatePreferences: async (
    preferences: ClinicianSharingPreferences
  ): Promise<APIResponse<ClinicianSharingPreferencesResponse>> => {
    console.log('📝 Updating clinician-sharing preferences:', preferences);
    return api.put('/api/backend/clinician-sharing/preferences', preferences);
  },

  // Get shared clinician summaries (GET)
  getSummaries: async (
    summaryType: ClinicianSummaryType = 'ai_conversation',
    limit = 20,
    offset = 0
  ): Promise<APIResponse<ClinicianSummariesResponse>> => {
    console.log('📖 Fetching clinician-sharing summaries:', { summaryType, limit, offset });
    const queryParams = new URLSearchParams();
    queryParams.append('summaryType', summaryType);
    queryParams.append('limit', limit.toString());
    queryParams.append('offset', offset.toString());
    return api.get(`/api/backend/clinician-sharing/summaries?${queryParams.toString()}`);
  },
};
