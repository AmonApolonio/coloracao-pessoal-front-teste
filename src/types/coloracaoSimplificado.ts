
import { ParameterMatch } from './coloracaoResults';

export interface ColoracaoSimplificadoRequest {
  input: {
    type: 'extracao';
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
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED' | 'IN_QUEUE';
}

export interface ColoracaoSimplificadoInitResponse {
  id: string;
  status: 'IN_QUEUE';
}

export interface ColoracaoClassificacaoRequest {
  input: {
    type: 'classificacao';
    colors: Record<string, string>;
  };
}

export interface ColoracaoClassificacaoResponse {
  delayTime?: number;
  executionTime?: number;
  id: string;
  logs: {};
  output: {
    colors: Record<string, string>;
    details: {
      approximation_flags: string[];
      decision_table: {
        season_scores: Record<string, number>;
        seasons: Record<string, {
          score: number;
          contraste: ParameterMatch;
          temperatura: ParameterMatch;
          profundidade: ParameterMatch;
          intensidade: ParameterMatch;
        }>;
      };
      dimensional_analysis: {
        contraste: {
          primaryClassification: string;
          secondClassification: string;
          skin_L: number;
          hair_L: number;
          eye_L: number;
          delta_l: number;
        };
        temperatura: {
          primaryClassification: string;
          secondClassification: string;
          hue: number;
          approximate: boolean;
          skin_temperatura: string;
          hair_temperatura: string;
          eye_temperatura: string;
          skin_hue: number;
          hair_hue: number;
          eye_hue: number;
        };
        profundidade: {
          primaryClassification: string;
          secondClassification: string;
          approximate: boolean;
          skin_reference_l: number;
          under_eye_l: number;
          mouth_contour_l: number;
          delta_under_eye: number;
          delta_mouth_contour: number;
          under_eye_classification: string;
          mouth_contour_classification: string;
        };
        intensidade: {
          primaryClassification: string;
          secondClassification: string;
          C_value: number;
          approximate: boolean;
          skin_intensidade: string;
          skin_c_value: number;
          hair_intensidade: string;
          hair_c_value: number;
          eye_intensidade: string;
          eye_c_value: number;
        };
      };
      top_candidates: Array<{
        confidence: number;
        exact_match: boolean;
        match_score: number;
        season: string;
        used_primary: string[];
        used_secondary: string[];
      }>;
    };
    result: {
      confidence: number;
      explanation: string;
      season: string;
    };
  };
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED' | 'IN_QUEUE';
  workerId?: string;
}
