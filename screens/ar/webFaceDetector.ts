// 웹 환경 전용 얼굴 감지 유틸리티
// face-api.js CDN 동적 로드 (Metro bundler 우회)
// 입술: 48-59 (외곽), 60-67 (내부)

import type { DetectedFace, FaceLandmark } from "./ar.types";

// 상태 관리
let isInitialized = false;
let initPromise: Promise<boolean> | null = null;
let faceapi: any = null;

// face-api.js 입술 랜드마크 인덱스 (68개 중)
const LIP_INDICES = {
  outerTop: [48, 49, 50, 51, 52, 53, 54],
  outerBottom: [48, 59, 58, 57, 56, 55, 54],
  innerTop: [60, 61, 62, 63, 64],
  innerBottom: [60, 67, 66, 65, 64],
  leftCorner: 48,
  rightCorner: 54,
  topCenter: 51,
  bottomCenter: 57,
};

/**
 * CDN URL (TensorFlow.js 3.x - face-api.js 호환 버전)
 */
const TFJS_CDN = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.21.0/dist/tf.min.js";
const FACE_API_CDN = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/dist/face-api.min.js";
const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model";

/**
 * 스크립트 동적 로드 헬퍼
 */
const loadScript = (src: string, name: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.crossOrigin = "anonymous";

    script.onload = () => {
      console.log(`[WebFaceDetector] ${name} 로드 완료`);
      resolve(true);
    };

    script.onerror = (err) => {
      console.error(`[WebFaceDetector] ${name} 로드 실패:`, err);
      resolve(false);
    };

    document.head.appendChild(script);
  });
};

/**
 * TensorFlow.js 백엔드 초기화 (WebGL → CPU 순서로 시도)
 */
const initTfBackend = async (): Promise<boolean> => {
  if (typeof window === "undefined") return false;

  try {
    const tf = (window as any).tf;
    if (!tf) {
      console.error("[WebFaceDetector] TensorFlow.js가 로드되지 않음");
      return false;
    }

    // 이미 백엔드가 설정되어 있으면 스킵
    const currentBackend = tf.getBackend();
    if (currentBackend) {
      console.log("[WebFaceDetector] 이미 백엔드 설정됨:", currentBackend);
      return true;
    }

    // 1. WebGL 백엔드 먼저 시도 (가장 안정적)
    try {
      await tf.setBackend("webgl");
      await tf.ready();
      console.log("[WebFaceDetector] WebGL 백엔드 설정 완료");
      return true;
    } catch (webglErr) {
      console.warn("[WebFaceDetector] WebGL 실패:", webglErr);
    }

    // 2. CPU 백엔드로 폴백
    try {
      await tf.setBackend("cpu");
      await tf.ready();
      console.log("[WebFaceDetector] CPU 백엔드 설정 완료");
      return true;
    } catch (cpuErr) {
      console.error("[WebFaceDetector] CPU 백엔드도 실패:", cpuErr);
    }

    console.log("[WebFaceDetector] 최종 TensorFlow 백엔드:", tf.getBackend());
    return tf.getBackend() != null;
  } catch (err) {
    console.error("[WebFaceDetector] TensorFlow 초기화 실패:", err);
    return false;
  }
};

/**
 * face-api.js CDN 동적 로드
 */
const loadFaceApiScript = async (): Promise<boolean> => {
  if (typeof window === "undefined") return false;

  // 이미 로드됨
  if ((window as any).faceapi && faceapi) {
    return true;
  }

  // 1. TensorFlow.js 로드
  if (!(window as any).tf) {
    const tfjsLoaded = await loadScript(TFJS_CDN, "TensorFlow.js");
    if (!tfjsLoaded) return false;
  }

  // 2. WebGL/CPU 백엔드 초기화
  const backendReady = await initTfBackend();
  if (!backendReady) {
    console.warn("[WebFaceDetector] 백엔드 초기화 실패, 계속 시도...");
  }

  // 3. face-api.js 로드
  const faceApiLoaded = await loadScript(FACE_API_CDN, "face-api.js");
  if (!faceApiLoaded) return false;

  faceapi = (window as any).faceapi;
  return true;
};

/**
 * 얼굴 감지 초기화 (face-api.js CDN)
 */
export const initWebFaceDetector = async (): Promise<boolean> => {
  // 웹 환경이 아니면 스킵
  if (typeof window === "undefined") {
    console.log("[WebFaceDetector] 웹 환경이 아님");
    return false;
  }

  if (isInitialized && faceapi) {
    console.log("[WebFaceDetector] 이미 초기화됨");
    return true;
  }

  if (initPromise) {
    return initPromise;
  }

  console.log("[WebFaceDetector] face-api.js 초기화 시작...");

  initPromise = (async () => {
    try {
      // 1. CDN에서 face-api.js 스크립트 로드
      const scriptLoaded = await loadFaceApiScript();
      if (!scriptLoaded || !faceapi) {
        console.error("[WebFaceDetector] face-api.js 스크립트 로드 실패");
        return false;
      }

      // 2. 모델 로드 (SSD MobileNetV1 + 랜드마크)
      console.log("[WebFaceDetector] 모델 로드 중...");
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);
      
      isInitialized = true;
      console.log("[WebFaceDetector] face-api.js 초기화 완료");
      return true;
    } catch (err) {
      console.error("[WebFaceDetector] 초기화 실패:", err);
      return false;
    }
  })();

  return initPromise;
};

/**
 * 초기화 여부 확인
 */
export const isWebFaceDetectorReady = (): boolean => {
  return isInitialized;
};

/**
 * 비디오 프레임에서 얼굴 감지
 */
export const detectFacesWeb = async (
  videoElement: HTMLVideoElement,
  canvasWidth: number,
  canvasHeight: number
): Promise<DetectedFace[]> => {
  if (!isInitialized) {
    console.warn("[WebFaceDetector] 초기화되지 않음");
    return [];
  }

  try {
    const detection = await faceapi
      .detectSingleFace(videoElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
      .withFaceLandmarks();

    if (!detection) {
      return [];
    }

    const scaleX = canvasWidth / videoElement.videoWidth;
    const scaleY = canvasHeight / videoElement.videoHeight;

    return [convertToDetectedFace(detection, scaleX, scaleY)];
  } catch (err) {
    console.error("[WebFaceDetector] 감지 오류:", err);
    return [];
  }
};

/**
 * 이미지에서 얼굴 감지 (데모 모드용)
 */
export const detectFacesFromImage = async (
  imageElement: HTMLImageElement,
  targetWidth: number,
  targetHeight: number
): Promise<DetectedFace[]> => {
  if (!isInitialized) {
    console.warn("[WebFaceDetector] 초기화되지 않음, 초기화 시도...");
    const success = await initWebFaceDetector();
    if (!success) {
      console.error("[WebFaceDetector] 초기화 실패");
      return [];
    }
  }

  try {
    console.log("[WebFaceDetector] 이미지에서 얼굴 감지 시작...");
    console.log("[WebFaceDetector] 이미지 크기:", imageElement.naturalWidth, "x", imageElement.naturalHeight);
    console.log("[WebFaceDetector] 타겟 크기:", targetWidth, "x", targetHeight);

    const detection = await faceapi
      .detectSingleFace(imageElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 }))
      .withFaceLandmarks();

    if (!detection) {
      console.warn("[WebFaceDetector] 얼굴 감지 실패");
      return [];
    }

    console.log("[WebFaceDetector] 얼굴 감지 성공!");
    
    // 이미지 원본 크기 기준 좌표 (스케일링 없이)
    // 렌더링 시 WebARMakeupScreen에서 스케일 적용
    const face = convertToDetectedFace(detection, 1, 1);
    console.log("[WebFaceDetector] 입술 랜드마크 (원본 좌표):", face.lipLandmarks?.upperOuter?.slice(0, 3));
    
    return [face];
  } catch (err) {
    console.error("[WebFaceDetector] 이미지 감지 오류:", err);
    return [];
  }
};

/**
 * face-api.js 감지 결과를 DetectedFace로 변환
 */
const convertToDetectedFace = (
  detection: any,
  scaleX: number = 1,
  scaleY: number = 1
): DetectedFace => {
  const landmarks = detection.landmarks;
  const positions = landmarks.positions;
  const box = detection.detection.box;

  // 입술 좌표 추출 및 스케일 적용
  const getPoint = (index: number): FaceLandmark => ({
    x: positions[index].x * scaleX,
    y: positions[index].y * scaleY,
  });

  // 상순 외곽 (왼쪽 → 오른쪽)
  const upperOuter = LIP_INDICES.outerTop.map(getPoint);
  
  // 하순 외곽 (왼쪽 → 오른쪽, 아래쪽 경로)
  const lowerOuter = LIP_INDICES.outerBottom.map(getPoint);

  // 내부 입술 (치아 영역 제외용)
  const upperInner = LIP_INDICES.innerTop.map(getPoint);
  const lowerInner = LIP_INDICES.innerBottom.map(getPoint);

  return {
    faceID: 0,
    bounds: {
      origin: { 
        x: box.x * scaleX, 
        y: box.y * scaleY 
      },
      size: { 
        width: box.width * scaleX, 
        height: box.height * scaleY 
      },
    },
    leftMouthPosition: getPoint(LIP_INDICES.leftCorner),
    rightMouthPosition: getPoint(LIP_INDICES.rightCorner),
    bottomMouthPosition: getPoint(LIP_INDICES.bottomCenter),
    leftEyePosition: getPoint(36), // 왼쪽 눈 왼쪽 모서리
    rightEyePosition: getPoint(45), // 오른쪽 눈 오른쪽 모서리
    lipLandmarks: {
      upperOuter,
      lowerOuter,
      upperInner,
      lowerInner,
    },
    rollAngle: 0,
    yawAngle: 0,
  };
};

/**
 * 모델 언로드 (메모리 정리)
 */
export const disposeWebFaceDetector = (): void => {
  // face-api.js는 명시적 dispose 불필요
  isInitialized = false;
  initPromise = null;
  console.log("[WebFaceDetector] 정리 완료");
};

/**
 * 얼굴 좌표를 캔버스 크기에 맞게 스케일링 (호환성 유지)
 */
export const scaleFaceToCanvas = (
  face: DetectedFace,
  canvasWidth: number,
  canvasHeight: number
): DetectedFace => {
  return face;
};
