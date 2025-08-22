export interface ParameterMatch {
  match: 'primary' | 'secondary' | 'none';
  expected: string;
  primary: string;
  secondary: string;
}

export interface SeasonData {
  score: number;
  contraste: ParameterMatch;
  temperatura: ParameterMatch;
  profundidade: ParameterMatch;
  intensidade: ParameterMatch;
}

export interface TopCandidate {
  season: string;
  confidence: number;
  match_score: number;
  exact_match: boolean;
  used_primary: string[];
  used_secondary: string[];
}

export interface FinalAnalysisResult {
  seasonal_classification: {
    season: string;
    confidence: number;
    explanation: string;
    top_candidates: TopCandidate[];
    decision_table: {
      seasons: Record<string, SeasonData>;
      season_scores: Record<string, number>;
    };
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
  approximation_flags: string[];
}

export interface TooltipData {
  visible: boolean;
  x: number;
  y: number;
  content: ParameterMatch | null;
  parameter: string;
}
