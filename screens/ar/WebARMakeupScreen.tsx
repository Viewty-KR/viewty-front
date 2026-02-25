// 웹 전용 AR 메이크업 컴포넌트

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SkeletonBox } from "../../components/Skeletons";
import { ProductApi } from "../../libs/api";
import { styles, webStyles } from "./ar.styles";
import {
  ARProductInfo,
  DetectedFace,
} from "./ar.types";
import {
  calculateLipRegion,
  DEFAULT_COLORS,
  DEMO_FACE_IMAGES,
  drawNaturalLips,
  getARConfigByCategory,
  hexToRgba,
  isValidColorCode
} from "./ar.utils";
import {
  detectFacesFromImage,
  detectFacesWeb,
  disposeWebFaceDetector,
  initWebFaceDetector,
  isWebFaceDetectorReady,
} from "./webFaceDetector";

interface WebARScreenProps {
  productId: string;
  categoryId?: number;
}

export default function WebARMakeupScreen({
  productId,
  categoryId: initialCategoryId,
}: WebARScreenProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const demoImageRef = useRef<HTMLImageElement | null>(null); // 데모 모드 얼굴 이미지
  const colorScrollRef = useRef<ScrollView | null>(null); // 색상 선택기 스크롤 ref
  const [demoImageLoaded, setDemoImageLoaded] = useState(false);
  const [colorScrollPosition, setColorScrollPosition] = useState(0); // 색상 스크롤 위치

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<ARProductInfo | null>(null);
  const [categoryId, setCategoryId] = useState<number>(initialCategoryId || 0);

  // 카메라 상태
  const [cameraReady, setCameraReady] = useState(false);
  const [faces, setFaces] = useState<DetectedFace[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false); // 카메라 없을 때 데모 모드

  // 반응형 레이아웃용 window dimensions
  const windowDimensions = useWindowDimensions();
  const isDesktop = windowDimensions.width >= 1280;
  const isTablet = windowDimensions.width >= 768 && windowDimensions.width < 1280;

  // 화면 크기 (loadDemoImage에서 사용하므로 먼저 선언)
  const [dimensions, setDimensions] = useState({ width: 640, height: 480 });

  // AR 상태
  const [isARActive, setIsARActive] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [opacity, setOpacity] = useState(0.6);
  const [isArAvailable, setIsArAvailable] = useState<boolean>(true);
  
  // UI 상태
  const [isFolded, setIsFolded] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // 현재 데모 이미지 인덱스
  const [currentDemoImageIndex, setCurrentDemoImageIndex] = useState(() => 
    Math.floor(Math.random() * DEMO_FACE_IMAGES.length)
  );
  
  // 데모 이미지에서 자동 감지된 얼굴 정보
  const [demoDetectedFace, setDemoDetectedFace] = useState<DetectedFace | null>(null);

  /**
   * 데모 이미지 변경 (다음 이미지)
   */
  const changeDemoImage = useCallback(() => {
    setCurrentDemoImageIndex((prev) => (prev + 1) % DEMO_FACE_IMAGES.length);
    setDemoImageLoaded(false);
    setDemoDetectedFace(null);
    // 디버그 로그 리셋
    if (typeof window !== "undefined") {
      (window as any)._arDebugLogged = false;
    }
  }, []);

  /**
   * 데모 얼굴 이미지 로드 및 얼굴 자동 감지
   */
  const loadDemoImage = useCallback(async () => {
    if (typeof window === "undefined") return;
    
    const imageUrl = DEMO_FACE_IMAGES[currentDemoImageIndex];
    console.log("[Demo] 이미지 로드 시작:", currentDemoImageIndex + 1, "/", DEMO_FACE_IMAGES.length);
    
    const img = new window.Image();
    img.crossOrigin = "anonymous"; // CORS 허용
    
    img.onload = async () => {
      demoImageRef.current = img;
      setDemoImageLoaded(true);
      console.log("[Demo] 얼굴 이미지 로드 완료, 얼굴 감지 시작...");
      
      // 모델 준비 대기 후 얼굴 자동 감지
      if (isWebFaceDetectorReady()) {
        try {
          // 이미지 원본 크기 기준으로 얼굴 감지 (렌더링 시 변환)
          const detectedFaces = await detectFacesFromImage(img, img.naturalWidth, img.naturalHeight);
          
          if (detectedFaces.length > 0) {
            setDemoDetectedFace(detectedFaces[0]);
            console.log("[Demo] 얼굴 자동 감지 성공:", detectedFaces[0]);
          } else {
            console.log("[Demo] 얼굴 감지 실패, 폴백 위치 사용");
            setDemoDetectedFace(null);
          }
        } catch (err) {
          console.warn("[Demo] 얼굴 감지 오류:", err);
          setDemoDetectedFace(null);
        }
      }
    };
    
    img.onerror = (err) => {
      console.warn("[Demo] 얼굴 이미지 로드 실패, 도형 모드 사용:", err);
      setDemoImageLoaded(false);
    };
    
    img.src = imageUrl;
  }, [currentDemoImageIndex]);

  /**
   * 제품 정보 로드
   */
  const loadProductInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await ProductApi.getDetail(productId);

      if (!response.success || !response.data) {
        throw new Error("제품 정보를 불러올 수 없습니다.");
      }

      const data = response.data as any;
      const catId = data.categoryId || initialCategoryId || 0;
      setCategoryId(catId);

      const productInfo: ARProductInfo = {
        id: Number(data.id),
        name: data.name,
        categoryId: catId,
        categoryName: data.categoryName,
        manufacturer: data.manufacturer || data.brand,
        imgUrl: data.imgUrl || data.img_url || data.imageUrl,
        options: (data.options || []).map((opt: any) => ({
          id: opt.id,
          optionName: opt.optionName,
          price: opt.price,
          colorCode: opt.colorCode || opt.color_code,
          // API 응답 필드명 변형 모두 지원 (arAvailable, isArAvailable, is_ar_available)
          isArAvailable: opt.arAvailable ?? opt.isArAvailable ?? opt.is_ar_available ?? false,
        })),
      };

      setProduct(productInfo);

      // AR 지원 여부 확인 - 옵션 중 하나라도 isArAvailable이 true인지 확인
      const hasArAvailableOption = productInfo.options.some(opt => opt.isArAvailable);
      console.log("[AR] 제품 옵션:", productInfo.options);
      console.log("[AR] AR 지원 여부:", hasArAvailableOption);
      setIsArAvailable(hasArAvailableOption);

      const firstColorOption = productInfo.options.find((opt) =>
        isValidColorCode(opt.colorCode)
      );

      if (firstColorOption?.colorCode) {
        setSelectedColor(firstColorOption.colorCode);
      } else {
        const arConfig = getARConfigByCategory(catId);
        if (arConfig) {
          setSelectedColor(DEFAULT_COLORS[arConfig.targetRegion]);
          setOpacity(arConfig.defaultOpacity);
        }
      }
    } catch (err) {
      console.error("제품 정보 로드 에러:", err);
      setError(
        err instanceof Error ? err.message : "제품 정보를 불러올 수 없습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }, [productId, initialCategoryId]);

  /**
   * 카메라 시작
   */
  const startCamera = useCallback(async () => {
    try {
      // 카메라 사용 가능 여부 확인
      if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
        console.warn("MediaDevices API 지원되지 않음, 데모 모드로 전환");
        setIsDemoMode(true);
        setCameraReady(true);
        return;
      }

      // 사용 가능한 비디오 장치 확인
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === "videoinput");
      
      if (videoDevices.length === 0) {
        console.warn("카메라 장치 없음, 데모 모드로 전환");
        setIsDemoMode(true);
        setCameraReady(true);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // 비디오 크기 설정
        const videoWidth = videoRef.current.videoWidth || 640;
        const videoHeight = videoRef.current.videoHeight || 480;
        setDimensions({ width: videoWidth, height: videoHeight });

        setCameraReady(true);
      }
    } catch (err: any) {
      console.error("카메라 시작 실패:", err);
      
      // NotFoundError: 카메라 없음 → 데모 모드
      if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        console.warn("카메라 없음, 데모 모드로 전환");
        setIsDemoMode(true);
        setCameraReady(true);
        return;
      }
      
      // NotAllowedError: 권한 거부
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("카메라 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.");
        return;
      }
      
      // 기타 에러 → 데모 모드
      console.warn("카메라 에러, 데모 모드로 전환:", err.message);
      setIsDemoMode(true);
      setCameraReady(true);
    }
  }, []);

  /**
   * 카메라 정지
   */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setCameraReady(false);
  }, []);

  /**
   * AI 모델 초기화
   */
  const initModel = useCallback(async () => {
    setIsModelLoading(true);
    try {
      await initWebFaceDetector();
    } catch (err) {
      console.error("모델 초기화 실패:", err);
    } finally {
      setIsModelLoading(false);
    }
  }, []);

  /**
   * 얼굴 감지 및 오버레이 렌더링 루프
   */
  const detectAndRender = useCallback(async () => {
    if (!canvasRef.current || !cameraReady) {
      animationRef.current = requestAnimationFrame(detectAndRender);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      animationRef.current = requestAnimationFrame(detectAndRender);
      return;
    }

    // 데모 모드: 샘플 얼굴 이미지 표시
    if (isDemoMode) {
      // 배경 그리기
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // 실제 얼굴 이미지가 로드된 경우
      if (demoImageLoaded && demoImageRef.current) {
        const img = demoImageRef.current;
        
        // 이미지를 캔버스에 맞게 그리기 (cover 방식)
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const canvasAspect = canvas.width / canvas.height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgAspect > canvasAspect) {
          // 이미지가 더 넓음 - 높이에 맞춤
          drawHeight = canvas.height;
          drawWidth = drawHeight * imgAspect;
          drawX = (canvas.width - drawWidth) / 2;
          drawY = 0;
        } else {
          // 이미지가 더 높거나 같음 - 너비에 맞춤
          drawWidth = canvas.width;
          drawHeight = drawWidth / imgAspect;
          drawX = 0;
          drawY = (canvas.height - drawHeight) / 2;
        }
        
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        
        // AR 효과가 꺼져있으면 원본 이미지만 표시
        if (!isARActive) {
          animationRef.current = requestAnimationFrame(detectAndRender);
          return;
        }
        
        // 입술 오버레이 (자동 감지된 좌표 또는 폴백 사용)
        if (selectedColor) {
          // 좌표 변환 헬퍼: 이미지 원본 좌표 → 실제 캔버스 좌표
          const scaleX = drawWidth / img.naturalWidth;
          const scaleY = drawHeight / img.naturalHeight;
          
          const transformPoint = (p: { x: number; y: number }) => ({
            x: drawX + p.x * scaleX,
            y: drawY + p.y * scaleY,
          });
          
          // 자동 감지된 얼굴 정보가 있는 경우 - 정밀한 입술 렌더링
          if (demoDetectedFace && demoDetectedFace.lipLandmarks) {
            // MediaPipe로 감지된 입술 랜드마크로 정밀 렌더링
            const lipLandmarks = demoDetectedFace.lipLandmarks;
            
            // 좌표 변환 적용
            const upperOuter = lipLandmarks.upperOuter.map(transformPoint);
            const lowerOuter = lipLandmarks.lowerOuter.map(transformPoint);
            const upperInner = lipLandmarks.upperInner?.map(transformPoint) || [];
            const lowerInner = lipLandmarks.lowerInner?.map(transformPoint) || [];
            
            // 디버그: 콘솔에 좌표 출력 (최초 1회만)
            if (!(window as any)._arDebugLogged) {
              (window as any)._arDebugLogged = true;
              console.log("[AR Debug] Canvas:", canvas.width, "x", canvas.height);
              console.log("[AR Debug] Image natural:", img.naturalWidth, "x", img.naturalHeight);
              console.log("[AR Debug] Draw:", { drawX, drawY, drawWidth, drawHeight });
              console.log("[AR Debug] Scale:", { scaleX, scaleY });
              console.log("[AR Debug] Original lipLandmarks (first 3):", lipLandmarks.upperOuter.slice(0, 3));
              console.log("[AR Debug] Transformed (first 3):", upperOuter.slice(0, 3));
            }
            
            // 상순만 그리기 (외곽 - 내부)
            const drawUpperLip = () => {
              ctx.beginPath();
              // 외곽 (시계 방향)
              if (upperOuter.length > 0) {
                ctx.moveTo(upperOuter[0].x, upperOuter[0].y);
                upperOuter.forEach(p => ctx.lineTo(p.x, p.y));
                ctx.closePath();
              }
              // 내부 홀 (반시계 방향) - 치아 영역 제외
              if (upperInner.length > 0) {
                ctx.moveTo(upperInner[0].x, upperInner[0].y);
                for (let i = upperInner.length - 1; i >= 0; i--) {
                  ctx.lineTo(upperInner[i].x, upperInner[i].y);
                }
                ctx.closePath();
              }
            };
            
            // 하순만 그리기 (외곽 - 내부)
            const drawLowerLip = () => {
              ctx.beginPath();
              // 외곽 (시계 방향)
              if (lowerOuter.length > 0) {
                ctx.moveTo(lowerOuter[0].x, lowerOuter[0].y);
                lowerOuter.forEach(p => ctx.lineTo(p.x, p.y));
                ctx.closePath();
              }
              // 내부 홀 (반시계 방향) - 치아 영역 제외
              if (lowerInner.length > 0) {
                ctx.moveTo(lowerInner[0].x, lowerInner[0].y);
                for (let i = lowerInner.length - 1; i >= 0; i--) {
                  ctx.lineTo(lowerInner[i].x, lowerInner[i].y);
                }
                ctx.closePath();
              }
            };
            
            // Multiply 블렌딩
            ctx.save();
            ctx.globalCompositeOperation = "multiply";
            ctx.fillStyle = hexToRgba(selectedColor, opacity);
            drawUpperLip();
            ctx.fill("evenodd");
            drawLowerLip();
            ctx.fill("evenodd");
            ctx.restore();
            
            // 소프트 오버레이
            ctx.save();
            ctx.globalCompositeOperation = "overlay";
            ctx.fillStyle = hexToRgba(selectedColor, opacity * 0.4);
            drawUpperLip();
            ctx.fill("evenodd");
            drawLowerLip();
            ctx.fill("evenodd");
            ctx.restore();
            
          } else if (demoDetectedFace?.leftMouthPosition && demoDetectedFace?.rightMouthPosition) {
            // 입꼬리 좌표만 있는 경우 (Shape Detection API 폴백) - 베지어 곡선으로 자연스럽게
            const lipRegion = calculateLipRegion(demoDetectedFace);
            if (lipRegion) {
              drawNaturalLips(ctx, lipRegion, selectedColor, opacity);
            }
          } else {
            // 폴백: 이미지 비율 기준 고정 위치 - Unsplash 얼굴 이미지 기준
            // 이 이미지에서 입술은 대략 Y: 43%, X: 50% 위치
            const lipCenterX = drawX + drawWidth * 0.50;
            const lipCenterY = drawY + drawHeight * 0.43;  // 0.62 -> 0.43 수정
            const lipWidth = drawWidth * 0.08;  // 입술 너비 조정
            const lipHeight = drawHeight * 0.025;  // 입술 높이 조정
            
            // 폴백용 lipRegion 생성
            const fallbackLipRegion = {
              topLeft: { x: lipCenterX - lipWidth, y: lipCenterY - lipHeight * 0.3 },
              topRight: { x: lipCenterX + lipWidth, y: lipCenterY - lipHeight * 0.3 },
              bottomCenter: { x: lipCenterX, y: lipCenterY + lipHeight },
              center: { x: lipCenterX, y: lipCenterY },
              width: lipWidth * 2,
              height: lipHeight * 1.3,
            };
            
            drawNaturalLips(ctx, fallbackLipRegion, selectedColor, opacity);
            
            // 디버그: 모드 표시
            ctx.save();
            ctx.fillStyle = "orange";
            ctx.font = "14px Arial";
            ctx.fillText(`Mode: Fixed fallback (Y:${lipCenterY.toFixed(0)})`, 10, canvas.height - 10);
            ctx.fillText(`demoFace: ${demoDetectedFace ? 'exists' : 'null'}`, 10, canvas.height - 30);
            ctx.restore();
          }
        }
        
      } else {
        // 이미지 로드 실패 시 도형으로 폴백
        // 얼굴 (타원)
        ctx.fillStyle = "#f5d0c5";
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - 30, 100, 130, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 눈
        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.ellipse(centerX - 35, centerY - 50, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(centerX + 35, centerY - 50, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 코
        ctx.strokeStyle = "#d4b5a5";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 40);
        ctx.lineTo(centerX - 5, centerY - 5);
        ctx.lineTo(centerX + 5, centerY - 5);
        ctx.stroke();
        
        // 입술 (AR 색상 적용)
        if (selectedColor) {
          ctx.save();
          ctx.globalCompositeOperation = "multiply";
          ctx.fillStyle = hexToRgba(selectedColor, opacity);
          ctx.beginPath();
          ctx.moveTo(centerX - 30, centerY + 25);
          ctx.quadraticCurveTo(centerX, centerY + 15, centerX + 30, centerY + 25);
          ctx.quadraticCurveTo(centerX, centerY + 45, centerX - 30, centerY + 25);
          ctx.fill();
          ctx.restore();
        }
      }
      
      // 데모 모드 안내 (하단에 반투명하게)
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
      ctx.fillStyle = "#fff";
      ctx.font = "13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("📷 데모 모드 - 아래에서 색상을 선택해보세요", centerX, canvas.height - 15);

    } else {
      // 실제 카메라 모드
      const video = videoRef.current;
      if (!video) {
        animationRef.current = requestAnimationFrame(detectAndRender);
        return;
      }

      // 비디오 프레임을 캔버스에 그리기 (미러링)
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      // 얼굴 감지
      if (isWebFaceDetectorReady()) {
        const detectedFaces = await detectFacesWeb(
          video,
          canvas.width,
          canvas.height
        );
        setFaces(detectedFaces);

        // 입술 오버레이 그리기 (AR 효과가 켜져 있을 때만)
        if (detectedFaces.length > 0 && selectedColor && isARActive) {
          detectedFaces.forEach((face: DetectedFace) => {
            // 정밀한 입술 랜드마크가 있는 경우
            if (face.lipLandmarks) {
              const { upperOuter, lowerOuter, upperInner, lowerInner } = face.lipLandmarks;
              
              // 미러링된 좌표 변환
              const mirrorPoint = (p: { x: number; y: number }) => ({
                x: canvas.width - p.x,
                y: p.y,
              });
              
              const mirroredUpperOuter = upperOuter.map(mirrorPoint);
              const mirroredLowerOuter = lowerOuter.map(mirrorPoint);
              const mirroredUpperInner = upperInner?.map(mirrorPoint) || [];
              const mirroredLowerInner = lowerInner?.map(mirrorPoint) || [];
              
              // 상순 그리기
              const drawUpperLip = () => {
                ctx.beginPath();
                if (mirroredUpperOuter.length > 0) {
                  ctx.moveTo(mirroredUpperOuter[0].x, mirroredUpperOuter[0].y);
                  mirroredUpperOuter.forEach(p => ctx.lineTo(p.x, p.y));
                  ctx.closePath();
                }
                if (mirroredUpperInner.length > 0) {
                  ctx.moveTo(mirroredUpperInner[0].x, mirroredUpperInner[0].y);
                  for (let i = mirroredUpperInner.length - 1; i >= 0; i--) {
                    ctx.lineTo(mirroredUpperInner[i].x, mirroredUpperInner[i].y);
                  }
                  ctx.closePath();
                }
              };
              
              // 하순 그리기
              const drawLowerLip = () => {
                ctx.beginPath();
                if (mirroredLowerOuter.length > 0) {
                  ctx.moveTo(mirroredLowerOuter[0].x, mirroredLowerOuter[0].y);
                  mirroredLowerOuter.forEach(p => ctx.lineTo(p.x, p.y));
                  ctx.closePath();
                }
                if (mirroredLowerInner.length > 0) {
                  ctx.moveTo(mirroredLowerInner[0].x, mirroredLowerInner[0].y);
                  for (let i = mirroredLowerInner.length - 1; i >= 0; i--) {
                    ctx.lineTo(mirroredLowerInner[i].x, mirroredLowerInner[i].y);
                  }
                  ctx.closePath();
                }
              };
              
              // Multiply 블렌딩으로 자연스러운 색상 적용
              ctx.save();
              ctx.globalCompositeOperation = "multiply";
              ctx.fillStyle = hexToRgba(selectedColor, opacity);
              drawUpperLip();
              ctx.fill("evenodd");
              drawLowerLip();
              ctx.fill("evenodd");
              ctx.restore();
              
              // Overlay 블렌딩으로 광택 효과
              ctx.save();
              ctx.globalCompositeOperation = "overlay";
              ctx.fillStyle = hexToRgba(selectedColor, opacity * 0.4);
              drawUpperLip();
              ctx.fill("evenodd");
              drawLowerLip();
              ctx.fill("evenodd");
              ctx.restore();
              
            } else {
              // 폴백: 입술 랜드마크가 없으면 기존 타원 방식 사용
              const lipRegion = calculateLipRegion(face);
              if (lipRegion) {
                const mirroredCenterX = canvas.width - lipRegion.center.x;
                
                ctx.save();
                ctx.globalCompositeOperation = "multiply";
                ctx.fillStyle = hexToRgba(selectedColor, opacity);
                ctx.beginPath();
                ctx.ellipse(
                  mirroredCenterX,
                  lipRegion.center.y,
                  lipRegion.width / 2,
                  lipRegion.height / 2,
                  0,
                  0,
                  Math.PI * 2
                );
                ctx.fill();
                ctx.restore();
              }
            }
          });
        }
      }
    }

    // 다음 프레임
    animationRef.current = requestAnimationFrame(detectAndRender);
  }, [cameraReady, isARActive, selectedColor, opacity, isDemoMode, demoImageLoaded, demoDetectedFace]);

  // 초기화
  useEffect(() => {
    loadProductInfo();
    initModel();
    loadDemoImage(); // 데모 이미지 미리 로드

    return () => {
      stopCamera();
      disposeWebFaceDetector();
    };
  }, [loadProductInfo, initModel, stopCamera, loadDemoImage]);

  // 카메라 시작 (모델 로딩 완료 후)
  useEffect(() => {
    if (!isLoading && !isModelLoading && !error) {
      startCamera();
    }
  }, [isLoading, isModelLoading, error, startCamera]);

  // 모델 로딩 완료 후 데모 이미지에서 얼굴 재감지
  useEffect(() => {
    const detectDemoFace = async () => {
      if (!isModelLoading && demoImageLoaded && demoImageRef.current && !demoDetectedFace) {
        try {
          // 이미지 원본 크기 기준으로 얼굴 감지 (렌더링 시 변환)
          const img = demoImageRef.current;
          const detectedFaces = await detectFacesFromImage(
            img, 
            img.naturalWidth, 
            img.naturalHeight
          );
          
          if (detectedFaces.length > 0) {
            setDemoDetectedFace(detectedFaces[0]);
            console.log("[Demo] 모델 로딩 후 얼굴 감지 성공");
          }
        } catch (err) {
          console.warn("[Demo] 모델 로딩 후 얼굴 감지 실패:", err);
        }
      }
    };
    
    detectDemoFace();
  }, [isModelLoading, demoImageLoaded, demoDetectedFace, isDesktop, dimensions]);

  // 데모 이미지 인덱스 변경 시 새 이미지 로드
  useEffect(() => {
    if (isDemoMode) {
      loadDemoImage();
    }
  }, [currentDemoImageIndex, isDemoMode, loadDemoImage]);

  // 렌더 루프 시작
  useEffect(() => {
    if (cameraReady) {
      detectAndRender();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [cameraReady, detectAndRender]);

  /**
   * 뒤로가기
   */
  const handleGoBack = useCallback(() => {
    stopCamera();
    router.back();
  }, [router, stopCamera]);

  /**
   * AR 토글
   */
  const toggleAR = useCallback(() => {
    setIsARActive((prev) => !prev);
  }, []);

  /**
   * 컨트롤 패널 접기/펼치기
   */
  const toggleFold = useCallback(() => {
    setIsFolded((prev) => !prev);
  }, []);

  // 애니메이션 효과 (모바일만)
  useEffect(() => {
    if (!isDesktop) {
      Animated.spring(slideAnim, {
        toValue: isFolded ? 1 : 0,
        useNativeDriver: false,
        tension: 65,
        friction: 11,
      }).start();
    }
  }, [isFolded, slideAnim, isDesktop]);

  /**
   * 색상 선택
   */
  const handleColorSelect = useCallback((colorCode: string) => {
    setSelectedColor(colorCode);
  }, []);

  /**
   * 색상 스크롤 (좌우 버튼)
   */
  const scrollColors = useCallback((direction: 'left' | 'right') => {
    const scrollAmount = 200; // 한 번에 스크롤할 픽셀
    const newPosition = direction === 'left' 
      ? Math.max(0, colorScrollPosition - scrollAmount)
      : colorScrollPosition + scrollAmount;
    
    setColorScrollPosition(newPosition);
    colorScrollRef.current?.scrollTo({ x: newPosition, animated: true });
  }, [colorScrollPosition]);

  /**
   * 색상 옵션 렌더링
   */
  const renderColorOptions = useCallback(() => {
    if (!product) return null;

    const colorOptions = product.options.filter((opt) =>
      isValidColorCode(opt.colorCode)
    );

    const colors =
      colorOptions.length > 0
        ? colorOptions.map((opt) => ({
            id: opt.id,
            name: opt.optionName,
            color: opt.colorCode!,
          }))
        : [
            { id: 1, name: "레드", color: "#E74C3C" },
            { id: 2, name: "코랄", color: "#FF6B6B" },
            { id: 3, name: "핑크", color: "#FF69B4" },
            { id: 4, name: "로즈", color: "#E91E63" },
            { id: 5, name: "베리", color: "#9C27B0" },
            { id: 6, name: "누드", color: "#D4A574" },
          ];

    return (
      <View style={webStyles.colorScrollContainer}>
        {/* PC 환경에서 좌측 화살표 버튼 */}
        {isDesktop && (
          <TouchableOpacity
            style={webStyles.colorArrowButton}
            onPress={() => scrollColors('left')}
          >
            <Ionicons name="chevron-back" size={24} color="#666" />
          </TouchableOpacity>
        )}
        
        <ScrollView
          ref={colorScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.colorList, isDesktop && webStyles.desktopColorList]}
          contentContainerStyle={[
            styles.colorListContent, 
            isDesktop && webStyles.desktopColorListContent
          ]}
          onScroll={(e) => setColorScrollPosition(e.nativeEvent.contentOffset.x)}
          scrollEventThrottle={16}
        >
          {colors.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.colorOption,
                isDesktop && webStyles.desktopColorOption,
                selectedColor === item.color && styles.colorOptionSelected,
              ]}
              onPress={() => handleColorSelect(item.color)}
            >
              <View
                style={[
                  styles.colorOptionInner, 
                  isDesktop && webStyles.desktopColorOptionInner,
                  { backgroundColor: item.color }
                ]}
              />
              {selectedColor === item.color && (
                <Ionicons
                  name="checkmark"
                  size={isDesktop ? 24 : 20}
                  color="#fff"
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* PC 환경에서 우측 화살표 버튼 */}
        {isDesktop && (
          <TouchableOpacity
            style={webStyles.colorArrowButton}
            onPress={() => scrollColors('right')}
          >
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    );
  }, [product, selectedColor, handleColorSelect, isDesktop, scrollColors]);

  // 에러 상태 (전체 화면 교체)
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            loadProductInfo();
          }}
        >
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // AR 미지원 제품 (전체 화면 교체)
  if (!isLoading && !isModelLoading && !isArAvailable) {
    return (
      <View style={styles.unsupportedContainer}>
        <Ionicons name="color-palette-outline" size={64} color="#aaa" />
        <Text style={styles.unsupportedTitle}>AR 미지원 제품</Text>
        <Text style={styles.unsupportedText}>
          이 제품은 아직{"\n"}AR 체험을 지원하지 않습니다.
        </Text>
        <TouchableOpacity style={styles.goBackButton} onPress={handleGoBack}>
          <Text style={styles.goBackButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const arConfig = getARConfigByCategory(categoryId);

  // 반응형 캔버스 크기 계산
  const getCanvasContainerStyle = (): any => {
    if (isDesktop) {
      // PC: 고정 크기 캔버스 (4:5 비율, 최대 500px 너비)
      return {
        width: 500,
        height: 625,
        borderRadius: 16,
        overflow: "hidden",
      };
    }
    if (isTablet) {
      // 태블릿: 최대 640px 너비
      return {
        maxWidth: 640,
        width: "100%",
        flex: 1,
        alignSelf: "center",
      };
    }
    // 모바일: 전체 화면
    return {
      flex: 1,
    };
  };

  return (
    <View style={[
      styles.container, 
      isDesktop && webStyles.desktopContainer
    ]}>
      {/* PC 레이아웃: 좌측 캔버스 + 우측 컨트롤 */}
      <View style={isDesktop ? webStyles.desktopLayout : { flex: 1 }}>
        {/* 비디오 & 캔버스 영역 */}
        <View style={[
          styles.cameraContainer, 
          isDesktop && webStyles.desktopCameraContainer,
          getCanvasContainerStyle()
        ]}>
          {/* 숨겨진 비디오 요소 */}
          <video
            ref={videoRef as any}
            style={{ display: "none" }}
            playsInline
            muted
          />

          {/* 캔버스 (오버레이 포함 렌더링) */}
          <canvas
            ref={canvasRef as any}
            width={isDesktop ? 500 : dimensions.width}
            height={isDesktop ? 625 : dimensions.height}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scaleX(1)", // 이미 미러링됨
              borderRadius: isDesktop ? 16 : 0,
            }}
          />

          {/* 로딩 오버레이 (canvas 위에 표시) */}
          {(isLoading || isModelLoading) && (
            <View style={styles.cameraLoadingOverlay}>
              <View style={styles.cameraLoadingContent}>
                <ActivityIndicator size="large" color="#FF2D78" />
                <Text style={styles.cameraLoadingText}>
                  {isModelLoading ? "AI 모델 로딩 중..." : "제품 정보 로딩 중..."}
                </Text>
                {isModelLoading && (
                  <Text style={[styles.cameraLoadingText, { fontSize: 12, marginTop: 8 }]}>
                    첫 로딩 시 약간의 시간이 소요됩니다
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* 얼굴 미감지시 가이드 (데모 모드에서는 표시 안 함) */}
          {faces.length === 0 && cameraReady && !isDemoMode && !isLoading && !isModelLoading && (
            <View style={styles.faceGuide}>
              <View style={styles.faceGuideFrame} />
              <Text style={styles.faceGuideText}>
                얼굴을 프레임 안에 위치시켜 주세요
              </Text>
            </View>
          )}
          
          {/* 데모 모드 배지 */}
          {isDemoMode && !isLoading && !isModelLoading && (
            <View style={[
              webStyles.demoBadge,
              isDesktop && webStyles.desktopDemoBadge
            ]}>
              <View style={webStyles.demoBadgeContent}>
                <Ionicons name="information-circle" size={16} color="#FFD700" />
                <Text style={webStyles.demoBadgeText}>
                  데모 모드 ({currentDemoImageIndex + 1}/5)
                </Text>
              </View>
              <TouchableOpacity 
                style={webStyles.demoChangeButton}
                onPress={changeDemoImage}
              >
                <Ionicons name="refresh" size={16} color="#fff" />
                <Text style={webStyles.demoChangeButtonText}>다른 얼굴</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* PC: 우측 컨트롤 패널 / 모바일: 하단 컨트롤 패널 */}
        {!isDesktop && (
          <>
            {/* 토글 버튼 (모바일 패널 외부) */}
            <TouchableOpacity 
              style={styles.panelToggleButton}
              onPress={toggleFold}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isFolded ? "chevron-up" : "chevron-down"} 
                size={24} 
                color="#fff" 
              />
            </TouchableOpacity>
          </>
        )}

        <Animated.View style={[
          styles.controlPanel,
          isDesktop && webStyles.desktopControlPanel,
          !isDesktop && {
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 380],
              })
            }]
          }
        ]}>
          <>
          {/* 상단 헤더 (PC에서는 컨트롤 패널 안에 배치) */}
          {isDesktop && (
            <View style={webStyles.desktopHeader}>
              <TouchableOpacity style={styles.headerButton} onPress={handleGoBack}>
                <Ionicons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={webStyles.desktopHeaderTitle} numberOfLines={1}>
                {product?.name || "AR 메이크업"}
              </Text>
              <View style={styles.headerButton} />
            </View>
          )}

          {/* 제품 정보 */}
          {isLoading || isModelLoading ? (
            <View style={[
              styles.productInfo,
              isDesktop && webStyles.desktopProductInfo
            ]}>
              <SkeletonBox 
                width={isDesktop ? 100 : 50} 
                height={isDesktop ? 100 : 50} 
                style={{ borderRadius: isDesktop ? 12 : 8 }} 
              />
              <View style={styles.productDetails}>
                <SkeletonBox width="80%" height={16} style={{ marginBottom: 8 }} />
                <SkeletonBox width="50%" height={12} />
              </View>
            </View>
          ) : product ? (
            <View style={[
              styles.productInfo,
              isDesktop && webStyles.desktopProductInfo
            ]}>
              {product.imgUrl && (
                <Image
                  source={{ uri: product.imgUrl }}
                  style={[
                    styles.productImage,
                    isDesktop && webStyles.desktopProductImage
                  ]}
                  resizeMode="cover"
                />
              )}
              <View style={styles.productDetails}>
                <Text style={[
                  styles.productName,
                  isDesktop && webStyles.desktopProductName
                ]} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={[
                  styles.productBrand,
                  isDesktop && webStyles.desktopProductBrand
                ]}>
                  {product.manufacturer || product.categoryName}
                </Text>
              </View>
            </View>
          ) : null}

          {/* 색상 선택기 */}
          <View style={[
            styles.colorPickerContainer,
            isDesktop && webStyles.desktopColorPicker
          ]}>
            {isLoading || isModelLoading ? (
              <>
                <SkeletonBox width={120} height={14} style={{ marginBottom: 12 }} />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.colorList}
                >
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <SkeletonBox
                      key={i}
                      width={isDesktop ? 52 : 48}
                      height={isDesktop ? 52 : 48}
                      style={{ borderRadius: isDesktop ? 26 : 24, marginRight: 12 }}
                    />
                  ))}
                </ScrollView>
              </>
            ) : (
              <>
                <Text style={[
                  styles.colorPickerLabel,
                  isDesktop && webStyles.desktopColorLabel
                ]}>
                  색상 선택 ({arConfig?.categoryName || "립"})
                </Text>
                {renderColorOptions()}
              </>
            )}
          </View>

          {/* AR 토글 버튼 */}
          <TouchableOpacity
            style={[
              styles.arToggleButton,
              !isARActive && styles.arToggleButtonInactive,
              isDesktop && webStyles.desktopArToggle
            ]}
            onPress={toggleAR}
          >
            <Ionicons
              name={isARActive ? "eye" : "eye-off"}
              size={20}
              color="#fff"
            />
            <Text style={styles.arToggleButtonText}>
              {isARActive ? "AR 효과 켜짐" : "AR 효과 꺼짐"}
            </Text>
          </TouchableOpacity>
          </>
        </Animated.View>
      </View>

      {/* 모바일 상단 헤더 (PC에서는 컨트롤 패널 안에 배치) */}
      {!isDesktop && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleGoBack}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {product?.name || "AR 메이크업"}
          </Text>
          <View style={styles.headerButton} />
        </View>
      )}
    </View>
  );
}
