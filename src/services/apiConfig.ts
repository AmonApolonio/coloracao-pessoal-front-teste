/**
 * API Configuration
 * 
 * This file centralizes all API endpoint configurations.
 * It can be used to easily switch between different environments
 * or to add additional configuration like timeouts, retry policies, etc.
 */

import EnvConfig from '../config/envConfig';

export interface ApiEndpoint {
  key: string;
  description: string;
  required: boolean;
}

export interface ApiConfig {
  endpoints: {
    fileUpload: {
      upload: ApiEndpoint;
    };
    coloracaoSimplificado: {
      submitAndPoll: ApiEndpoint;
    };
    auth: {
      username: ApiEndpoint;
      password: ApiEndpoint;
      token: ApiEndpoint;
    };
  };
  timeouts: {
    default: number;
    polling: number;
  };
  polling: {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    delayIncrement: number;
  };
}

export const API_CONFIG: ApiConfig = {
  endpoints: {
    fileUpload: {
      upload: {
        key: 'VITE_N8N_UPLOAD_URL',
        description: 'Upload files via n8n workflow',
        required: false,
      },
    },
    coloracaoSimplificado: {
      submitAndPoll: {
        key: 'VITE_COLORACAO_SIMPLIFICADO_URL',
        description: 'Submit image for simplified coloracao analysis and poll results',
        required: true,
      },
    },
    auth: {
      username: {
        key: 'VITE_USERNAME',
        description: 'Application username for login',
        required: true,
      },
      password: {
        key: 'VITE_PASSWORD',
        description: 'Application password for login',
        required: true,
      },
      token: {
        key: 'VITE_TOKEN',
        description: 'Bearer token for API authentication',
        required: true,
      },
    },
  },
  timeouts: {
    default: 180000, // 3 minutes
    polling: 300000, // 5 minutes for polling operations
  },
  polling: {
    maxAttempts: 60,
    initialDelay: 5000, // 5 seconds
    maxDelay: 15000, // 15 seconds
    delayIncrement: 5000, // Increase by 5 seconds after 6 attempts
  },
};

/**
 * Validates that all required environment variables are set
 */
export function validateApiConfiguration(): { valid: boolean; missingEndpoints: string[] } {
  const missingEndpoints: string[] = [];
  
  const checkEndpoint = (endpoint: ApiEndpoint) => {
    if (endpoint.required && !EnvConfig.getEnvVariable(endpoint.key)) {
      missingEndpoints.push(`${endpoint.key} - ${endpoint.description}`);
    }
  };

  // Check file upload endpoints
  checkEndpoint(API_CONFIG.endpoints.fileUpload.upload);

  // Check coloracao simplificado endpoints
  checkEndpoint(API_CONFIG.endpoints.coloracaoSimplificado.submitAndPoll);
  
  // Check auth endpoints
  checkEndpoint(API_CONFIG.endpoints.auth.username);
  checkEndpoint(API_CONFIG.endpoints.auth.password);
  checkEndpoint(API_CONFIG.endpoints.auth.token);

  return {
    valid: missingEndpoints.length === 0,
    missingEndpoints,
  };
}

/**
 * Gets an API URL from environment variables with validation
 */
export function getApiUrl(endpointKey: string): string {
  const url = EnvConfig.getEnvVariable(endpointKey);
  if (!url) {
    throw new Error(`API endpoint ${endpointKey} is not configured`);
  }
  return url;
}
