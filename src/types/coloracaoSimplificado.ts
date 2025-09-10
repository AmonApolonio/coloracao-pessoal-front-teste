export interface ColoracaoSimplificadoRequest {
  input: {
    type: 'extracao' | 'extracao-frontal' | 'extracao-olho';
    image_url: string;
  };
}

export interface ColorPalette {
  average: string;
  dark: string;
  light: string;
  median: string;
  result: string;
}

export interface UploadedImages {
  cropped_url: string;
  filtered_url: string;
}

export interface RegionError {
  error: string;
}

export interface RegionAnalysis {
  color_palette: ColorPalette;
  region?: number[][] | {
    inner: number[][];
    outer: number[][];
  };
  uploaded_images: UploadedImages;
}

// New simplified region detail structure (no uploaded_images, no errors per region)
export interface RegionDetail {
  color_palette: ColorPalette;
}

export type RegionResult = RegionAnalysis | RegionError;

export type ColoracaoSimplificadoLogs = {
  [region: string]: RegionResult;
};

export type ColoracaoSimplificadoResult = {
  [region: string]: string;
};

export type ColoracaoSimplificadoDetails = {
  [region: string]: RegionDetail;
};

export interface ColoracaoSimplificadoResponse {
  id: string;
  logs: {};
  output: {
    details: ColoracaoSimplificadoDetails;
    image_url: string;
    result: ColoracaoSimplificadoResult;
  };
  processing_time_seconds?: number;
  queue_time_seconds?: number;
  total_time_seconds?: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED' | 'IN_QUEUE';
}

export interface ColoracaoSimplificadoInitResponse {
  id: string;
  status: 'IN_QUEUE';
  tags: {
    barba: string;
  };
}

export interface ColoracaoClassificacaoRequest {
  input: {
    type: 'classificacao';
    colors: Record<string, string>;
  };
}

export interface CombinedAnalysisResult {
  frontalResult: ColoracaoSimplificadoResponse;
  eyeResult: ColoracaoSimplificadoResponse;
  combinedColors: Record<string, string>;
  barbaDetected: boolean;
}

export interface ColoracaoClassificacaoResponse {
  id: string;
  logs: Record<string, unknown>;
  output: {
    colors: Record<string, string>;
    details: {
      'brightness-details': {
        average_brightness: number;
        cheek_brightness: number;
        chin_brightness: number;
        eyebrows_brightness: number;
        forehead_brightness: number;
        hair_root_brightness: number;
        iris_brightness: number;
        mouth_brightness: number;
        mouth_contour_brightness: number;
        under_eye_skin_brightness: number;
      };
      'saturation-details': {
        average_saturation: number;
        cheek_saturation: number;
        chin_saturation: number;
        eyebrows_saturation: number;
        forehead_saturation: number;
        hair_root_saturation: number;
        iris_saturation: number;
        mouth_contour_saturation: number;
        mouth_saturation: number;
        under_eye_skin_saturation: number;
      };
    };
    result: {
      brightness: number;
      saturation: number;
      season: string;
    };
  };
  processing_time_seconds?: number;
  queue_time_seconds?: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED' | 'IN_QUEUE';
  total_time_seconds?: number;
}
