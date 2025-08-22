/**
 * N8N Upload Service
 * 
 * This service handles file uploads via n8n workflow.
 * It compresses images before uploading and returns the public URL.
 */

import { getApiUrl } from './apiConfig';
import EnvConfig from '../config/envConfig';

export interface UploadResponse {
  url: string;
  key: string;
  success: boolean;
  message?: string;
}

export class N8nUploadService {
  /**
   * Compress an image file
   */
  static async compressImage(
    file: File,
    maxSize = 1200,
    quality = 0.8
  ): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original file
            }
          },
          file.type,
          quality
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Upload a file to n8n and return the public URL
   */
  static async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    try {
      // Compress the image before upload
      const compressedFile = await this.compressImage(file, 1200, 0.8);
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', compressedFile);
      
      // Generate a unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const extension = compressedFile.name.split('.').pop() || 'jpg';
      const fileName = `coloracao-${timestamp}-${randomId}.${extension}`;
      formData.append('fileName', fileName);
      
      // Get upload endpoint from environment
      const uploadUrl = getApiUrl('VITE_N8N_UPLOAD_URL');
      
      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      return new Promise<UploadResponse>((resolve, reject) => {
        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });
        
        // Handle response
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve({
                url: response.image_url || response.url || response.fileUrl,
                key: response.key || fileName,
                success: true,
                message: 'Upload realizado com sucesso'
              });
            } catch (error) {
              reject(new Error('Erro ao processar resposta do servidor'));
            }
          } else {
            reject(new Error(`Erro no upload: ${xhr.status} ${xhr.statusText}`));
          }
        });
        
        // Handle errors
        xhr.addEventListener('error', () => {
          reject(new Error('Erro de rede durante o upload'));
        });
        
        xhr.addEventListener('timeout', () => {
          reject(new Error('Timeout no upload'));
        });
        
        // Configure request
        xhr.open('POST', uploadUrl);
        xhr.timeout = 60000; // 60 seconds timeout
        
        // Add Basic authentication headers (same as ApiClient)
        const username = EnvConfig.getEnvVariable('VITE_USERNAME');
        const password = EnvConfig.getEnvVariable('VITE_TOKEN');
        if (username && password) {
          const credentials = btoa(`${username}:${password}`);
          xhr.setRequestHeader('Authorization', `Basic ${credentials}`);
        }
        
        // Send request
        xhr.send(formData);
      });
    } catch (error) {
      throw new Error(`Erro na preparação do upload: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
  
  /**
   * Upload multiple files to n8n
   */
  static async uploadFiles(
    files: File[],
    onProgress?: (fileIndex: number, progress: number, totalProgress: number) => void
  ): Promise<UploadResponse[]> {
    const results: UploadResponse[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const result = await this.uploadFile(file, (progress) => {
          if (onProgress) {
            const totalProgress = Math.round(((i + progress / 100) / files.length) * 100);
            onProgress(i, progress, totalProgress);
          }
        });
        
        results.push(result);
      } catch (error) {
        results.push({
          url: '',
          key: '',
          success: false,
          message: error instanceof Error ? error.message : 'Erro no upload'
        });
      }
    }
    
    return results;
  }
  
  /**
   * Validate file before upload
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'Apenas arquivos de imagem são permitidos' };
    }
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: 'Arquivo muito grande. Máximo 10MB permitido' };
    }
    
    // Check supported formats
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!supportedTypes.includes(file.type)) {
      return { valid: false, error: 'Formato não suportado. Use JPEG, PNG ou WebP' };
    }
    
    return { valid: true };
  }
}
