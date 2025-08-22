import { getApiUrl, API_CONFIG } from './apiConfig';
import EnvConfig from '../config/envConfig';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PollableResponse {
  id: string;
}

export interface PollStatus {
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  output?: any;
  error?: string;
}

export class ApiClient {
  private static async handleStatusResponse<T>(
    status: string,
    output: any,
    error: any,
    onStatusUpdate?: (status: string) => void,
    fullData?: T
  ): Promise<T> {
    switch (status) {
      case 'IN_QUEUE':
        onStatusUpdate?.('Na fila..');
        throw new Error('CONTINUE_POLLING'); // Special error to continue polling

      case 'IN_PROGRESS':
        onStatusUpdate?.('Processando...');
        throw new Error('CONTINUE_POLLING'); // Special error to continue polling

      case 'COMPLETED':
        if (output?.result || output?.results || fullData) {
          onStatusUpdate?.('Completed');
          return (fullData || output) as T;
        }
        onStatusUpdate?.('Processando...');
        throw new Error('CONTINUE_POLLING'); // Special error to continue polling

      case 'FAILED':
        let details = '';
        if (output?.details && Array.isArray(output.details)) {
          details = output.details.join(' ');
        }
        throw new Error(`Processamento falhou: ${details || error || 'Erro desconhecido'}`);

      case 'CANCELLED':
        throw new Error('Processamento foi cancelado');

      default:
        throw new Error(`Status desconhecido: ${status}`);
    }
  }

  private static async makeRequest<T>(
    url: string,
    options: RequestInit = {},
    signal?: AbortSignal
  ): Promise<T> {
    const response = await fetch(url, {
      ...options,
      signal,
    });

    if (!response.ok) {
      // Try to parse error response as JSON to get detailed error message
      try {
        const errorData = await response.json();
        if (errorData.error) {
          throw new Error(errorData.error);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      } catch (jsonError) {
        // If JSON parsing fails, fall back to generic HTTP error
        if (jsonError instanceof Error && jsonError.message !== `HTTP ${response.status}: ${response.statusText}`) {
          throw jsonError; // Re-throw the parsed error message
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    // Check if response is an image
    const contentType = response.headers.get('content-type');
    if (contentType?.startsWith('image/')) {
      const blob = await response.blob();
      return { image: URL.createObjectURL(blob) } as T;
    }

    // Try to parse as JSON
    try {
      const jsonData = await response.json();
      console.log('API Response received:', {
        url: response.url,
        status: response.status,
        contentType,
        data: jsonData
      });
      return jsonData;
    } catch (err) {
      console.error('Failed to parse response as JSON:', {
        url: response.url,
        status: response.status,
        contentType,
        error: err
      });
      throw new Error('Failed to parse response as JSON');
    }
  }

  static async post<T>(
    envKey: string,
    body: any,
    signal?: AbortSignal,
    isFormData = false,
  ): Promise<T> {
    const url = getApiUrl(envKey);

    const options: RequestInit = {
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
    };

    const headers: Record<string, string> = {};

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    // Always use Basic authentication
    const username = EnvConfig.getEnvVariable('VITE_USERNAME');
    const password = EnvConfig.getEnvVariable('VITE_TOKEN');
    if (username && password) {
      const credentials = btoa(`${username}:${password}`);
      headers['Authorization'] = `Basic ${credentials}`;
    }

    options.headers = headers;

    console.log('FormData request details:', {
      url,
      authType: 'Basic',
      hasAuth: !!(username && password),
      username: username ? `${username.substring(0, 3)}***` : 'missing',
      token: password ? `${password.substring(0, 3)}***` : 'missing',
      headers: Object.keys(headers)
    });

    return this.makeRequest<T>(url, options, signal);
  }

  static async get<T>(
    envKey: string,
    params?: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<T> {
    let url = getApiUrl(envKey);

    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const options: RequestInit = {
      method: 'GET',
    };

    const headers: Record<string, string> = {};

    // Always use Basic authentication
    const username = EnvConfig.getEnvVariable('VITE_USERNAME');
    const password = EnvConfig.getEnvVariable('VITE_TOKEN');
    if (username && password) {
      const credentials = btoa(`${username}:${password}`);
      headers['Authorization'] = `Basic ${credentials}`;
    }

    options.headers = headers;

    return this.makeRequest<T>(url, options, signal);
  }

  static async pollForResult<T>(
    envKey: string,
    id: string,
    controller: AbortController,
    onStatusUpdate?: (status: string) => void
  ): Promise<T> {
    let attempts = 0;
    let delay = API_CONFIG.polling.initialDelay;
    const maxAttempts = API_CONFIG.polling.maxAttempts;

    while (attempts < maxAttempts) {
      try {
        const data = await this.post<PollStatus>(
          envKey,
          { id },
          controller.signal
        );

        console.log(`Polling attempt ${attempts + 1}:`, {
          envKey,
          id,
          data,
          dataType: typeof data,
          isArray: Array.isArray(data)
        });

        // Handle image response
        if ('image' in data) {
          onStatusUpdate?.('Completed');
          return data as T;
        }

        // Handle array responses (some APIs return arrays)
        if (Array.isArray(data) && data.length > 0) {
          const firstItem = data[0];
          if (firstItem && typeof firstItem === 'object' && 'status' in firstItem) {
            // Use the first item if it's an array with status objects
            const { status, output, error } = firstItem;
            try {
              return await this.handleStatusResponse(status, output, error, onStatusUpdate, data as T);
            } catch (err: any) {
              if (err.message === 'CONTINUE_POLLING') {
                // Wait before next attempt
                await new Promise(res => setTimeout(res, delay));
                // Increase delay after 6 attempts (30 seconds)
                if (attempts >= 6) {
                  delay = Math.min(delay + API_CONFIG.polling.delayIncrement, API_CONFIG.polling.maxDelay);
                }
                attempts++;
                continue;
              }
              throw err;
            }
          }

          // If array doesn't have status, it might be the final result
          console.log('Received array result, treating as completed:', data);
          onStatusUpdate?.('Completed');
          return data as T;
        }

        // Handle direct result responses (APIs that return results directly)
        if (data && typeof data === 'object') {
          // Check if it has a status field
          if ('status' in data) {
            const { status, output, error } = data;
            try {
              return await this.handleStatusResponse(status, output, error, onStatusUpdate, data as T);
            } catch (err: any) {
              if (err.message === 'CONTINUE_POLLING') {
                // Wait before next attempt
                await new Promise(res => setTimeout(res, delay));
                // Increase delay after 6 attempts (30 seconds)
                if (attempts >= 6) {
                  delay = Math.min(delay + API_CONFIG.polling.delayIncrement, API_CONFIG.polling.maxDelay);
                }
                attempts++;
                continue;
              }
              throw err;
            }
          }

          // Check if it looks like a final result (has expected result fields)
          if ('output' in data || 'result' in data || 'estilo' in data) {
            console.log('Received direct result, treating as completed:', data);
            onStatusUpdate?.('Completed');
            return data as T;
          }
        }

        // Log the unexpected response for debugging
        console.error('Resposta inesperada do servidor:', {
          data,
          dataType: typeof data,
          hasStatus: data && typeof data === 'object' && 'status' in data,
          hasImage: data && typeof data === 'object' && 'image' in data,
          keys: data && typeof data === 'object' ? Object.keys(data) : null,
          attempt: attempts + 1,
          maxAttempts
        });

        throw new Error(`Resposta inesperada do servidor. Dados recebidos: ${JSON.stringify(data)}`);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          throw new Error('Tempo limite atingido (3 minutos). Tente novamente mais tarde.');
        }

        // If it's not a continue polling error, rethrow it
        if (err.message !== 'CONTINUE_POLLING') {
          // Log the error for debugging
          console.error('Erro durante polling:', {
            error: err.message,
            attempt: attempts + 1,
            maxAttempts,
            envKey,
            id
          });

          throw err;
        }
      }
    }

    throw new Error('Tempo limite atingido ao aguardar o processamento');
  }
}
