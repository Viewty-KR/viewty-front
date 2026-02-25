// AR 메이크업 화면 타입 정의

/**
 * 얼굴 랜드마크 포인트
 */
export interface FaceLandmark {
  x: number;
  y: number;
}

/**
 * 감지된 얼굴 정보
 */
export interface DetectedFace {
  faceID?: number;
  bounds: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
  leftMouthPosition?: FaceLandmark;
  rightMouthPosition?: FaceLandmark;
  bottomMouthPosition?: FaceLandmark;
  leftEyePosition?: FaceLandmark;
  rightEyePosition?: FaceLandmark;
  leftCheekPosition?: FaceLandmark;
  rightCheekPosition?: FaceLandmark;
  noseBasePosition?: FaceLandmark;
  rollAngle?: number;
  yawAngle?: number;
  // MediaPipe Face Mesh 입술 랜드마크 (468개 중 입술 부분)
  lipLandmarks?: {
    upperOuter: FaceLandmark[];  // 상순 외곽선
    lowerOuter: FaceLandmark[];  // 하순 외곽선
    upperInner?: FaceLandmark[]; // 상순 내부 (치아 영역 경계)
    lowerInner?: FaceLandmark[]; // 하순 내부 (치아 영역 경계)
  };
}

/**
 * AR 적용 대상 부위
 */
export type ARTargetRegion = "lips" | "eyes" | "cheeks" | "eyebrows" | "none";

/**
 * 블렌딩 모드
 */
export type BlendMode = "multiply" | "overlay" | "softLight" | "normal";

/**
 * 카테고리별 AR 설정
 */
export interface ARCategoryConfig {
  categoryId: number;
  categoryName: string;
  targetRegion: ARTargetRegion;
  blendMode: BlendMode;
  defaultOpacity: number;
}

/**
 * 제품 옵션 (색상 포함)
 */
export interface ProductOptionWithColor {
  id: number;
  optionName: string;
  price: number;
  colorCode?: string; // 예: "#FF5733"
  isArAvailable: boolean; // AR 체험 가능 여부
}

/**
 * AR 화면에서 사용할 제품 정보
 */
export interface ARProductInfo {
  id: number;
  name: string;
  categoryId?: number;
  categoryName?: string;
  manufacturer?: string;
  imgUrl?: string;
  options: ProductOptionWithColor[];
}

/**
 * AR 오버레이 상태
 */
export interface AROverlayState {
  isActive: boolean;
  selectedColorCode: string;
  opacity: number;
  targetRegion: ARTargetRegion;
}

/**
 * 카메라 설정
 */
export interface CameraConfig {
  facing: "front" | "back";
  zoom: number;
  enableTorch: boolean;
}

/**
 * AR 화면 Props
 */
export interface ARMakeupScreenProps {
  productId: string;
}

/**
 * 입술 영역 좌표
 */
export interface LipRegion {
  topLeft: FaceLandmark;
  topRight: FaceLandmark;
  bottomCenter: FaceLandmark;
  center: FaceLandmark;
  width: number;
  height: number;
}

/**
 * 얼굴 감지 이벤트 핸들러 타입
 */
export type FaceDetectionHandler = (result: { faces: DetectedFace[] }) => void;
