// AR 메이크업 유틸리티 함수

import {
  ARCategoryConfig,
  ARTargetRegion,
  DetectedFace,
  FaceLandmark,
  LipRegion,
} from "./ar.types";

/**
 * 카테고리별 AR 설정 맵핑
 */
export const AR_CATEGORY_CONFIG: Record<number, ARCategoryConfig> = {
  5: {
    categoryId: 5,
    categoryName: "립메이크업",
    targetRegion: "lips",
    blendMode: "multiply",
    defaultOpacity: 0.6,
  },
  // 추후 다른 카테고리 추가 가능
  // 6: { categoryId: 6, categoryName: '아이섀도우', targetRegion: 'eyes', ... },
  // 7: { categoryId: 7, categoryName: '블러셔', targetRegion: 'cheeks', ... },
};

/**
 * 카테고리 ID로 AR 설정 가져오기
 */
export const getARConfigByCategory = (
  categoryId: number
): ARCategoryConfig | null => {
  return AR_CATEGORY_CONFIG[categoryId] || null;
};

/**
 * 얼굴 랜드마크에서 입술 영역 계산
 */
export const calculateLipRegion = (face: DetectedFace): LipRegion | null => {
  const { leftMouthPosition, rightMouthPosition, bottomMouthPosition } = face;

  if (!leftMouthPosition || !rightMouthPosition || !bottomMouthPosition) {
    return null;
  }

  // 입술 중앙 상단 추정 (좌우 입꼬리의 중간, 약간 위로)
  const topCenterY =
    (leftMouthPosition.y + rightMouthPosition.y) / 2 -
    (bottomMouthPosition.y -
      (leftMouthPosition.y + rightMouthPosition.y) / 2) *
      0.3;

  const center: FaceLandmark = {
    x: (leftMouthPosition.x + rightMouthPosition.x) / 2,
    y: (topCenterY + bottomMouthPosition.y) / 2,
  };

  const width = Math.abs(rightMouthPosition.x - leftMouthPosition.x) * 1.15; // 약간 확장
  const height =
    Math.abs(
      bottomMouthPosition.y -
        (leftMouthPosition.y + rightMouthPosition.y) / 2
    ) * 2.2;

  return {
    topLeft: {
      x: leftMouthPosition.x - width * 0.05,
      y: topCenterY,
    },
    topRight: {
      x: rightMouthPosition.x + width * 0.05,
      y: topCenterY,
    },
    bottomCenter: bottomMouthPosition,
    center,
    width,
    height,
  };
};

/**
 * HEX 색상 코드를 RGBA로 변환
 */
export const hexToRgba = (hex: string, opacity: number): string => {
  // # 제거
  const cleanHex = hex.replace("#", "");

  // 3자리 HEX를 6자리로 변환
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split("")
          .map((c) => c + c)
          .join("")
      : cleanHex;

  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * 색상 코드 유효성 검사
 */
export const isValidColorCode = (colorCode: string | undefined): boolean => {
  if (!colorCode) return false;
  const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(colorCode);
};

/**
 * 기본 색상 (색상 코드가 없을 때)
 */
export const DEFAULT_COLORS: Record<ARTargetRegion, string> = {
  lips: "#E74C3C",
  eyes: "#8E44AD",
  cheeks: "#FFB6C1",
  eyebrows: "#5D4037",
  none: "#FFFFFF",
};

/**
 * 얼굴 회전 각도에 따른 보정 계수 계산
 */
export const calculateRotationAdjustment = (
  rollAngle?: number,
  yawAngle?: number
): { scaleX: number; scaleY: number; rotation: number } => {
  const roll = rollAngle || 0;
  const yaw = yawAngle || 0;

  // 고개를 기울인 정도에 따라 스케일 조정
  const scaleX = 1 - Math.abs(yaw) / 90 * 0.3;
  const scaleY = 1;
  const rotation = roll;

  return { scaleX, scaleY, rotation };
};

/**
 * 두 점 사이의 거리 계산
 */
export const distance = (p1: FaceLandmark, p2: FaceLandmark): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

/**
 * 입술 오버레이를 위한 SVG Path 생성 (베지어 곡선)
 */
export const generateLipPath = (lipRegion: LipRegion): string => {
  const { topLeft, topRight, bottomCenter, center } = lipRegion;

  // 상순 곡선
  const upperLipPath = `
    M ${topLeft.x} ${topLeft.y}
    Q ${center.x} ${topLeft.y - lipRegion.height * 0.15} ${topRight.x} ${topRight.y}
  `;

  // 하순 곡선
  const lowerLipPath = `
    Q ${topRight.x + lipRegion.width * 0.05} ${center.y + lipRegion.height * 0.2} ${bottomCenter.x} ${bottomCenter.y}
    Q ${topLeft.x - lipRegion.width * 0.05} ${center.y + lipRegion.height * 0.2} ${topLeft.x} ${topLeft.y}
  `;

  return upperLipPath + lowerLipPath + " Z";
};

/**
 * 카메라 미러링 좌표 변환
 */
export const mirrorCoordinate = (
  x: number,
  containerWidth: number
): number => {
  return containerWidth - x;
};

/**
 * 데모용 얼굴 이미지 목록 (Unsplash 무료 라이선스)
 * 출처: Unsplash - 저작권 표시 불필요, 무료 사용 가능
 */
export const DEMO_FACE_IMAGES = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=1000&fit=crop&crop=face", // 여성 1
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=1000&fit=crop&crop=face", // 여성 2
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1000&fit=crop&crop=face", // 여성 3
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=1000&fit=crop&crop=face", // 여성 4
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1000&fit=crop&crop=face", // 여성 5
];

/**
 * 입술 영역 타입 (drawNaturalLips용)
 */
export interface LipRegionForDraw {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomCenter: { x: number; y: number };
  center: { x: number; y: number };
  width: number;
  height: number;
}

/**
 * 베지어 곡선으로 자연스러운 입술 형태 그리기
 */
export const drawNaturalLips = (
  ctx: CanvasRenderingContext2D,
  lipRegion: LipRegionForDraw,
  color: string,
  lipOpacity: number
): void => {
  const { topLeft, topRight, bottomCenter, center, width, height } = lipRegion;
  
  // 상순 큐피드 보우 (M자 형태)
  const cupidBowDip = height * 0.15; // 인중 아래 들어간 정도
  const cupidBowPeak = height * 0.1; // 양쪽 봉우리 높이
  
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = hexToRgba(color, lipOpacity);
  
  ctx.beginPath();
  
  // 왼쪽 입꼬리에서 시작
  ctx.moveTo(topLeft.x, topLeft.y);
  
  // 상순 왼쪽 부분 (왼쪽 입꼬리 → 왼쪽 봉우리)
  ctx.quadraticCurveTo(
    topLeft.x + width * 0.15, topLeft.y - cupidBowPeak,
    center.x - width * 0.12, center.y - height * 0.35 - cupidBowPeak
  );
  
  // 인중 아래 V자 (왼쪽 봉우리 → 중앙 → 오른쪽 봉우리)
  ctx.quadraticCurveTo(
    center.x - width * 0.05, center.y - height * 0.3 + cupidBowDip,
    center.x, center.y - height * 0.35 + cupidBowDip
  );
  ctx.quadraticCurveTo(
    center.x + width * 0.05, center.y - height * 0.3 + cupidBowDip,
    center.x + width * 0.12, center.y - height * 0.35 - cupidBowPeak
  );
  
  // 상순 오른쪽 부분 (오른쪽 봉우리 → 오른쪽 입꼬리)
  ctx.quadraticCurveTo(
    topRight.x - width * 0.15, topRight.y - cupidBowPeak,
    topRight.x, topRight.y
  );
  
  // 하순 (오른쪽 입꼬리 → 하단 중앙 → 왼쪽 입꼬리)
  ctx.quadraticCurveTo(
    topRight.x - width * 0.1, bottomCenter.y - height * 0.1,
    center.x, bottomCenter.y
  );
  ctx.quadraticCurveTo(
    topLeft.x + width * 0.1, bottomCenter.y - height * 0.1,
    topLeft.x, topLeft.y
  );
  
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  
  // 소프트 오버레이 추가 (더 자연스러운 색감)
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = hexToRgba(color, lipOpacity * 0.4);
  
  ctx.beginPath();
  ctx.moveTo(topLeft.x + width * 0.05, topLeft.y);
  ctx.quadraticCurveTo(
    center.x, center.y - height * 0.2,
    topRight.x - width * 0.05, topRight.y
  );
  ctx.quadraticCurveTo(
    center.x, bottomCenter.y - height * 0.15,
    topLeft.x + width * 0.05, topLeft.y
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};
