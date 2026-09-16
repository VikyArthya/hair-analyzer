export type CaptureAngle = 'front' | 'side' | 'back';

export interface ClientImages {
  front: string | null;
  side: string | null;
  back: string | null;
}

export interface FaceMetrics {
  face_length_to_width_ratio: number;
  forehead_width_px: number;
  cheekbone_width_px: number;
  jaw_width_px: number;
  jaw_angle_degrees: number;
}

export interface FeaturesDetected {
  jaw_type: string;
  forehead_type: string;
  chin_type: string;
}

export interface HaircutGuidance {
  goal: string;
  best_categories: string[];
  to_avoid: string[];
}

export interface ProfileAnalysis {
  profile_type: string;
  mandibular_angle_degrees?: number;
  jawline_definition: string;
  notes: string;
}

export interface BackAnalysis {
  crown_texture: string;
  nape_type: string;
  notes: string;
}

export interface FaceAnalysisData {
  face_shape: 'square' | 'oval' | 'round' | 'oblong' | 'heart' | 'diamond' | string;
  confidence_score: number;
  metrics: FaceMetrics;
  features_detected: FeaturesDetected;
  haircut_guidance: HaircutGuidance;
  profile_analysis?: ProfileAnalysis | null;
  back_analysis?: BackAnalysis | null;
}

export interface FaceAnalysisResponse {
  status: 'success' | 'error';
  data: FaceAnalysisData;
}

export interface HaircutModel {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  imageUrl: string;
  referenceImages?: string[];
  matchReason: string;
  fadeType: string;
  guardNumber: string;
  topLength: string;
  stylingDifficulty: 'Mudah' | 'Sedang' | 'Tinggi';
  stylingTips: string[];
  recommendedProducts: string[];
  barberNotes: string;
}

export interface ConsultationSession {
  id: string;
  timestamp: string;
  clientName?: string;
  images: ClientImages;
  analysis: FaceAnalysisData;
}

export interface TryOnResult {
  haircut_id?: string;
  haircut_name?: string;
  after_image_base64: string;
  barber_notes?: string;
  is_simulation?: boolean;
}

export interface TryOnResponse {
  status: 'success' | 'error';
  data: TryOnResult;
}

