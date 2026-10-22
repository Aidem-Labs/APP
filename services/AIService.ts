import { Config } from '@/constants/Config';
import { api, apiService, APIService } from '@/services/APIService';

// Dedicated backend client for persona agent calls (120s timeout for slow LLM)
const personaClient = new APIService(Config.PERSONA_API_URL, 120000);

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
  user?: string;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface AIUserProfile {
  idol: string;
  personality: string;
  goals: string;
  challenges: string;
  communicationStyle: string;
  interests: string;
  values: string;
  supportNeeds: string;
}

interface BackendAIMessageRequest {
  message: string;
  sessionId?: string;
  conversationHistory: {
    role: 'user' | 'assistant';
    content: string;
  }[];
  userProfile?: AIUserProfile;
  temperature?: number;
  maxTokens?: number;
}

interface BackendAIMessageResponse {
  success?: boolean;
  message?: string;
  response?: string;
  data?: {
    sessionId?: string;
    sessionSummary?: string;
    message?: string;
    response?: string;
    role?: string;
    finishReason?: string;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
    model?: string;
    timestamp?: string;
    choices?: {
      message?: {
        content?: string;
      };
    }[];
  };
  choices?: {
    message?: {
      content?: string;
    };
  }[];
}

interface BackendCreateSessionResponse {
  success?: boolean;
  data?: {
    id?: string;
    sessionId?: string;
  };
  sessionId?: string;
  id?: string;
}

export interface AIResponsePayload {
  content: string;
  sessionId?: string;
  sessionSummary?: string;
  model?: string;
  timestamp?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export class AIService {
  async chatCompletion(
    message: string,
    conversationHistory: ChatMessage[] = [],
    options?: {
      sessionId?: string;
      userProfile?: AIUserProfile;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<AIResponsePayload> {
    const requestBody: BackendAIMessageRequest = {
      message,
      sessionId: options?.sessionId,
      conversationHistory: conversationHistory
        .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
        .map((msg) => ({ role: msg.role as 'user' | 'assistant', content: msg.content })),
      userProfile: options?.userProfile,
      temperature: options?.temperature ?? Config.DEFAULT_TEMPERATURE,
      maxTokens: options?.maxTokens ?? Config.DEFAULT_MAX_TOKENS,
    };

    try {
      console.log('🤖 Sending AI request with timeout:', 45000);
      const response = await api.post<BackendAIMessageResponse>('/api/backend/ai/message', requestBody, {
        'User-Agent': 'LMN8-App/1.0.0',
      });

      console.log('🤖 AI API Response received:', {
        success: response.success,
        status: response.status,
        hasData: !!response.data
      });

      if (!response.success) {
        throw new Error(response.error || `HTTP error! status: ${response.status}`);
      }

      // Support multiple backend response shapes while keeping the existing return contract.
      const content =
        response.data?.data?.message ||
        response.data?.data?.response ||
        response.data?.message ||
        response.data?.response ||
        response.data?.data?.choices?.[0]?.message?.content ||
        response.data?.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('No response content returned from AI endpoint.');
      }

      return {
        content,
        sessionId: response.data?.data?.sessionId,
        sessionSummary: response.data?.data?.sessionSummary,
        model: response.data?.data?.model || Config.AI_MODEL,
        timestamp: response.data?.data?.timestamp,
        usage: response.data?.data?.usage,
      };
    } catch (error) {
      console.error('AI API Error:', error);
      if (error instanceof Error && error.message.includes('timeout')) {
        throw new Error('AI request timed out. Please try again.');
      }
      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  async generateResponse(
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
    options?: {
      sessionId?: string;
      userProfile?: AIUserProfile;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<AIResponsePayload> {
    try {
      return await this.chatCompletion(userMessage, conversationHistory, options);
    } catch (error) {
      console.error('Generate response error:', error);
      throw error;
    }
  }

  async createSession(): Promise<string | null> {
    try {
      const response = await api.post<BackendCreateSessionResponse>('/api/backend/ai/sessions', {});
      if (!response.success) {
        return null;
      }
      return response.data?.data?.sessionId || response.data?.data?.id || response.data?.sessionId || response.data?.id || null;
    } catch (error) {
      console.error('Create session error:', error);
      return null;
    }
  }

  async personaChat(
    sessionId: string,
    message: string,
    onboardingData?: Record<string, any>
  ): Promise<{ response: string; sessionId: string; personas: string[] }> {
    try {
      console.log('Sending persona chat request...');
      let memoryContext = '';
      try {
        const memory = await apiService.request<{ memory_context: string }>(
          `/api/backend/ai/memory?session_id=${encodeURIComponent(sessionId)}`,
          { method: 'GET', timeout: 5000 }
        );
        if (memory.success && memory.data?.memory_context) {
          memoryContext = memory.data.memory_context;
        }
      } catch {
        memoryContext = '';
      }

      const response = await personaClient.post<{ response: string; session_id: string; personas: string[] }>(
        '/api/chat',
        {
          session_id: sessionId,
          message,
          onboarding_data: onboardingData || {},
          memory_context: memoryContext,
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to get persona response');
      }

      return {
        response: response.data.response,
        sessionId: response.data.session_id,
        personas: response.data.personas || [],
      };
    } catch (error) {
      throw error;
    }
  }

  async therapyChat(
    sessionId: string,
    message: string,
    options?: {
      onboardingData?: Record<string, any>;
      userContext?: Record<string, any>;
      journalConsent?: boolean;
      userType?: 'patient' | 'student';
      countryType?: 'US' | 'Pakistan';
    }
  ): Promise<{ response: string; sessionId: string; personas: string[]; sources: string[] }> {
    try {
      console.log('Sending therapy chat request...');
      let memoryContext = '';
      try {
        const memory = await apiService.request<{ memory_context: string }>(
          `/api/backend/ai/memory?session_id=${encodeURIComponent(sessionId)}`,
          { method: 'GET', timeout: 5000 }
        );
        if (memory.success && memory.data?.memory_context) {
          memoryContext = memory.data.memory_context;
        }
      } catch {
        memoryContext = '';
      }

      const response = await personaClient.post<{ response: string; session_id: string; personas: string[]; sources: string[] }>(
        '/api/therapy-chat',
        {
          session_id: sessionId,
          message,
          onboarding_data: options?.onboardingData || {},
          user_context: options?.userContext || {},
          journal_consent: options?.journalConsent ?? true,
          user_type: options?.userType || 'default',
          country_type: options?.countryType || 'US',
          memory_context: memoryContext,
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to get therapy response');
      }

      return {
        response: response.data.response,
        sessionId: response.data.session_id,
        personas: response.data.personas || [],
        sources: response.data.sources || [],
      };
    } catch (error) {
      throw error;
    }
  }

  async prefetchPersona(onboardingData: Record<string, any>): Promise<{ status: string; session_id: string | null; personas: string[] }> {
    try {
      console.log('Pre-fetching personas at onboarding...');
      const response = await personaClient.post<{ status: string; session_id: string | null; personas: string[] }>(
        '/api/prefetch-persona',
        { onboarding_data: onboardingData }
      );

      if (!response.success || !response.data) {
        console.warn('Prefetch persona returned error:', response.error);
        return { status: 'error', session_id: null, personas: [] };
      }

      return response.data;
    } catch (error) {
      console.error('Prefetch persona error:', error);
      return { status: 'error', session_id: null, personas: [] };
    }
  }
}

// Create a singleton instance
let aiServiceInstance: AIService | null = null;

export const initializeAIService = (_apiKey?: string) => {
  aiServiceInstance = new AIService();
  return aiServiceInstance;
};

export const getAIService = (): AIService => {
  if (!aiServiceInstance) {
    throw new Error('AI Service not initialized. Call initializeAIService first.');
  }
  return aiServiceInstance;
};
