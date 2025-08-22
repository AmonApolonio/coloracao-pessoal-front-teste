// Export all services for easy importing
export { ApiClient } from './apiClient';
export { N8nUploadService } from './n8nUploadService';
export { ColoracaoSimplificadoService } from './coloracaoSimplificadoService';
export { ApiDebugger } from './apiDebugger';

// Export configuration
export { API_CONFIG, validateApiConfiguration, getApiUrl } from './apiConfig';

// Re-export types for convenience
export type {
  ApiResponse,
  PollableResponse,
  PollStatus,
} from './apiClient';

export type {
  UploadResponse,
} from './n8nUploadService';

export type {
  ApiConfig,
  ApiEndpoint,
} from './apiConfig';
