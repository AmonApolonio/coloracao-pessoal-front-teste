import { ApiClient } from './apiClient';
import { 
  ColoracaoSimplificadoRequest, 
  ColoracaoSimplificadoResponse, 
  ColoracaoSimplificadoInitResponse,
  ColoracaoClassificacaoRequest,
  ColoracaoClassificacaoResponse,
  CombinedAnalysisResult
} from '../types/coloracaoSimplificado';
import { API_CONFIG } from './apiConfig';

export class ColoracaoSimplificadoService {
  /**
   * Submit an image for simplified coloracao analysis
   */
  static async submitAnalysis(
    request: ColoracaoSimplificadoRequest,
    signal?: AbortSignal
  ): Promise<ColoracaoSimplificadoInitResponse> {
    const response = await ApiClient.post<any>(
      'VITE_COLORACAO_SIMPLIFICADO_URL',
      request,
      signal,
      false // isFormData
    );

    // If the response contains an error field, throw an error with the message
    if (response && response.error) {
      throw new Error(response.error);
    }

    return response as ColoracaoSimplificadoInitResponse;
  }

  /**
   * Poll for simplified coloracao analysis result using GET with query params
   */
  static async pollAnalysisResult(
    id: string,
    type: 'extracao' | 'extracao-frontal' | 'extracao-olho',
    controller: AbortController,
    onStatusUpdate?: (status: string) => void
  ): Promise<ColoracaoSimplificadoResponse> {
    let attempts = 0;
    let delay = API_CONFIG.polling.initialDelay;
    const maxAttempts = API_CONFIG.polling.maxAttempts;

    while (attempts < maxAttempts) {
      try {
        const data = await ApiClient.get<ColoracaoSimplificadoResponse>(
          'VITE_COLORACAO_SIMPLIFICADO_URL',
          { 
            id: id,
            type: type
          },
          controller.signal
        );

        console.log(`Polling attempt ${attempts + 1}:`, data);

        // Handle the response based on status
        switch (data.status) {
          case 'IN_QUEUE':
            onStatusUpdate?.('Na fila...');
            break;
          
          case 'IN_PROGRESS':
            onStatusUpdate?.('Processando...');
            break;
        
          case 'COMPLETED':
            onStatusUpdate?.('Extração concluída!');
            return data;
          
          case 'FAILED':
            throw new Error(`Processamento falhou: ${JSON.stringify(data)}`);
          
          default:
            throw new Error(`Status desconhecido: ${data.status}`);
        }

        // Wait before next attempt
        await new Promise(res => setTimeout(res, delay));
        
        // Increase delay after 6 attempts (30 seconds)
        if (attempts >= 6) {
          delay = Math.min(delay + API_CONFIG.polling.delayIncrement, API_CONFIG.polling.maxDelay);
        }
        attempts++;

      } catch (err: any) {
        if (err.name === 'AbortError') {
          throw new Error('Tempo limite atingido (3 minutos). Tente novamente mais tarde.');
        }
        
        console.error('Erro durante polling:', {
          error: err.message,
          attempt: attempts + 1,
          maxAttempts,
          id
        });
        
        throw err;
      }
    }

    throw new Error('Tempo limite atingido ao aguardar o processamento');
  }

  /**
   * Complete workflow: submit analysis and poll for result
   */
  static async analyzeImage(
    request: ColoracaoSimplificadoRequest,
    onStatusUpdate?: (status: string) => void
  ): Promise<{ result: ColoracaoSimplificadoResponse; barbaDetected: boolean }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeouts.default);

    try {
      // Step 1: Submit for analysis
      onStatusUpdate?.('Iniciando análise...');
      const initResponse = await this.submitAnalysis(request, controller.signal);
      
      // Extract barba tag
      const barbaDetected = initResponse.tags.barba === 'true';
      
      // Step 2: Poll for result
      const result = await this.pollAnalysisResult(initResponse.id, request.input.type, controller, onStatusUpdate);
      
      return { result, barbaDetected };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Submit colors for classification
   */
  static async submitClassification(
    request: ColoracaoClassificacaoRequest,
    signal?: AbortSignal
  ): Promise<ColoracaoSimplificadoInitResponse> {
    return ApiClient.post<ColoracaoSimplificadoInitResponse>(
      'VITE_COLORACAO_SIMPLIFICADO_URL',
      request,
      signal,
      false // isFormData
    );
  }

  /**
   * Poll for classification result using GET with query params
   */
  static async pollClassificationResult(
    id: string,
    controller: AbortController,
    onStatusUpdate?: (status: string) => void
  ): Promise<ColoracaoClassificacaoResponse> {
    let attempts = 0;
    let delay = API_CONFIG.polling.initialDelay;
    const maxAttempts = API_CONFIG.polling.maxAttempts;

    while (attempts < maxAttempts) {
      try {
        const data = await ApiClient.get<ColoracaoClassificacaoResponse>(
          'VITE_COLORACAO_SIMPLIFICADO_URL',
          { 
            id: id,
            type: 'classificacao'
          },
          controller.signal
        );

        console.log(`Polling classification attempt ${attempts + 1}:`, data);

        // Handle the response based on status
        switch (data.status) {
          case 'IN_QUEUE':
            onStatusUpdate?.('Na fila...');
            break;
          
          case 'IN_PROGRESS':
            onStatusUpdate?.('Processando classificação...');
            break;
          
          case 'COMPLETED':
            onStatusUpdate?.('Classificação concluída!');
            return data;
          
          case 'FAILED':
            throw new Error(`Classificação falhou: ${JSON.stringify(data)}`);
          
          default:
            throw new Error(`Status desconhecido: ${data.status}`);
        }

        // Wait before next attempt
        await new Promise(res => setTimeout(res, delay));
        
        // Increase delay after 6 attempts (30 seconds)
        if (attempts >= 6) {
          delay = Math.min(delay + API_CONFIG.polling.delayIncrement, API_CONFIG.polling.maxDelay);
        }
        attempts++;

      } catch (err: any) {
        if (err.name === 'AbortError') {
          throw new Error('Tempo limite atingido (3 minutos). Tente novamente mais tarde.');
        }
        
        console.error('Erro durante polling de classificação:', {
          error: err.message,
          attempt: attempts + 1,
          maxAttempts,
          id
        });
        
        throw err;
      }
    }

    throw new Error('Tempo limite atingido ao aguardar a classificação');
  }

  /**
   * Complete classification workflow: submit colors and poll for result
   */
  static async classifyColors(
    colors: Record<string, string>,
    onStatusUpdate?: (status: string) => void
  ): Promise<ColoracaoClassificacaoResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeouts.default);

    try {
      // Step 1: Submit for classification
      onStatusUpdate?.('Iniciando classificação...');
      const { id } = await this.submitClassification({
        input: {
          type: 'classificacao',
          colors
        }
      }, controller.signal);
      
      // Step 2: Poll for result
      const result = await this.pollClassificationResult(id, controller, onStatusUpdate);
      
      return result;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Analyze both frontal and eye images in parallel
   */
  static async analyzeBothImages(
    frontalImageUrl: string,
    eyeImageUrl: string,
    onStatusUpdate?: (status: string) => void
  ): Promise<CombinedAnalysisResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeouts.default);

    try {
      onStatusUpdate?.('Iniciando análises...');

      // Step 1: Submit both analyses in parallel
      const [frontalInitResponse, eyeInitResponse] = await Promise.all([
        this.submitAnalysis({
          input: {
            type: 'extracao-frontal',
            image_url: frontalImageUrl
          }
        }, controller.signal),
        this.submitAnalysis({
          input: {
            type: 'extracao-olho',
            image_url: eyeImageUrl
          }
        }, controller.signal)
      ]);

      // Extract barba tag from frontal analysis
      const barbaDetected = frontalInitResponse.tags.barba === 'true';

      // Step 2: Poll both results in parallel
      let frontalStatus = '';
      let eyeStatus = '';
      const updateCombinedStatus = () => {
        onStatusUpdate?.(`Frontal: ${frontalStatus}  |  Olho: ${eyeStatus}`);
      };

      const [frontalResult, eyeResult] = await Promise.all([
        this.pollAnalysisResult(frontalInitResponse.id, 'extracao-frontal', controller, (status) => {
          frontalStatus = status;
          updateCombinedStatus();
        }),
        this.pollAnalysisResult(eyeInitResponse.id, 'extracao-olho', controller, (status) => {
          eyeStatus = status;
          updateCombinedStatus();
        })
      ]);

      // Step 3: Combine results
      const combinedColors = { ...frontalResult.output.result };
      
      // Replace iris color from frontal with iris from eye analysis if available
      if (eyeResult.output.result.iris) {
        combinedColors.iris = eyeResult.output.result.iris;
      }

      return {
        frontalResult,
        eyeResult,
        combinedColors,
        barbaDetected
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
