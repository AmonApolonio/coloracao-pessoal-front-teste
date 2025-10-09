export interface ColoracaoSimplificadoRequest {
  input: {
    type: 'extracao' | 'extracao-frontal' | 'extracao-olho';
    image_url: string;
  };
}

export interface ColorPalette {
  average?: string;
  dark?: string;
  light?: string;
  median?: string;
  result: string;
  logs?: {
    avg_brightness?: number;
    avg_saturation?: number;
    clusters_used?: number;
    is_fallback?: boolean;
    median_brightness?: number;
    median_saturation?: number;
    pixel_count?: number;
    [key: string]: any;
  };
}

export interface UploadedImages {
  cropped_url: string;
  filtered_url: string;
}

export interface RegionError {
  error: string;
}

// Types for region coordinates
export interface PolygonCoordinates {
  type: 'polygon';
  coordinates: [number, number][];
}

export interface DonutCoordinates {
  type: 'donut';
  coordinates: {
    outer: [number, number][];
    inner: [number, number][];
  };
}

export interface CircleCoordinates {
  type: 'circle';
  coordinates: [number, number][];
  metadata: {
    center: [number, number];
    radius: number;
  };
}

export type LandmarkRegion = PolygonCoordinates | DonutCoordinates | CircleCoordinates;

// Processed region can be an array of polygons or a single polygon
export type ProcessedRegion = [number, number][] | [number, number][][];

export interface RegionCoordinates {
  landmark_region: LandmarkRegion;
  processed_region: ProcessedRegion;
}

export interface RegionAnalysis {
  color_palette: ColorPalette;
  region?: number[][] | {
    inner: number[][];
    outer: number[][];
  };
  uploaded_images: UploadedImages;
  region_coordinates?: RegionCoordinates;
}

// New simplified region detail structure (no uploaded_images, no errors per region)
export interface RegionDetail {
  color_palette: ColorPalette;
  region_coordinates?: RegionCoordinates;
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

export interface ManualColorInput {
  cheek: string;
  chin: string;
  forehead: string;
  hair_root: string;
  iris: string;
  mouth: string;
  mouth_contour: string;
  under_eye_skin: string;
}

export interface DualClassificationResult {
  aiResult: ColoracaoClassificacaoResponse;
  manualResult: ColoracaoClassificacaoResponse;
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
        forehead_brightness: number;
        hair_brightness: number;
        iris_brightness: number;
        mouth_brightness: number;
        mouth_contour_brightness: number;
        under_eye_skin_brightness: number;
      };
      'saturation-details': {
        average_saturation: number;
        cheek_saturation: number;
        chin_saturation: number;
        forehead_saturation: number;
        hair_saturation: number;
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
