import React, { useState, useRef, useCallback } from 'react';
import { N8nUploadService, UploadResponse } from '../../services/n8nUploadService';
import { getApiUrl } from '../../services/apiConfig';

interface FileUploadWithDragDropProps {
  onFileUploaded: (url: string) => void;
  disabled?: boolean;
  className?: string;
  uploadType?: 'extracao-frontal' | 'extracao-olho';
}

interface UploadProgress {
  uploading: boolean;
  progress: number;
  error?: string;
  fileName?: string;
}

const FileUploadWithDragDrop: React.FC<FileUploadWithDragDropProps> = ({
  onFileUploaded,
  disabled = false,
  className = '',
  uploadType = 'extracao-frontal'
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    uploading: false,
    progress: 0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [disabled]);

  // Handle file selection from input
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
    // Reset input value so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Upload file to n8n
  const handleFileUpload = async (file: File) => {
    // Check if n8n upload is configured
    try {
      getApiUrl('VITE_N8N_UPLOAD_URL');
    } catch (error) {
      setUploadProgress({
        uploading: false,
        progress: 0,
        error: 'Upload não está configurado. Configure VITE_N8N_UPLOAD_URL nas variáveis de ambiente.'
      });
      return;
    }

    // Validate file
    const validation = N8nUploadService.validateFile(file);
    if (!validation.valid) {
      setUploadProgress({
        uploading: false,
        progress: 0,
        error: validation.error
      });
      return;
    }

    setUploadProgress({
      uploading: true,
      progress: 0,
      fileName: file.name,
      error: undefined
    });

    try {
      const result: UploadResponse = await N8nUploadService.uploadFile(
        file,
        uploadType,
        (progress) => {
          setUploadProgress(prev => ({
            ...prev,
            progress
          }));
        }
      );

      if (result.success && result.url) {
        setUploadProgress({
          uploading: false,
          progress: 100
        });
        onFileUploaded(result.url);
      } else {
        throw new Error(result.message || 'Erro no upload');
      }
    } catch (error) {
      setUploadProgress({
        uploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Erro no upload'
      });
    }
  };

  // Open file picker
  const openFilePicker = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Drag and Drop Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
          ${isDragOver && !disabled
            ? 'border-[#947B62] bg-[#947B62]/5 scale-[1.02]'
            : 'border-gray-300 hover:border-[#947B62] hover:bg-gray-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${uploadProgress.uploading ? 'pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFilePicker}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        {/* Upload Icon */}
        <div className="flex flex-col items-center space-y-4">
          {uploadProgress.uploading ? (
            <>
              {/* Loading Spinner */}
              <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-[#947B62] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-[#947B62]">
                    {uploadProgress.progress}%
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Enviando {uploadProgress.fileName}...
                </p>
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#947B62] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.progress}%` }}
                  ></div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Upload Icon */}
              <div className="w-16 h-16 bg-[#947B62] rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>

              {/* Text */}
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-700">
                  Arraste uma imagem aqui
                </p>
                <p className="text-sm text-gray-500">
                  ou clique para selecionar do seu computador
                </p>
                <p className="text-xs text-gray-400">
                  Suporta JPEG, PNG, WebP (máx. 10MB)
                </p>
              </div>

              {/* Button */}
              <button
                type="button"
                disabled={disabled}
                className={`
                  px-6 py-2 rounded-lg font-semibold transition-colors
                  ${disabled
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#947B62] text-white hover:bg-[#7a624e]'
                  }
                `}
              >
                Selecionar Imagem
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {uploadProgress.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium">
            Erro no upload:
          </p>
          <p className="text-sm text-red-600">
            {uploadProgress.error}
          </p>
        </div>
      )}

      {/* Success Message */}
      {uploadProgress.progress === 100 && !uploadProgress.uploading && !uploadProgress.error && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium">
            ✅ Upload realizado com sucesso!
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUploadWithDragDrop;
