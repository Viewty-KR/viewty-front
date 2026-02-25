// AR 메이크업 체험 화면

import { Ionicons } from "@expo/vector-icons";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SkeletonBox } from "../../components/Skeletons";
import { ProductApi } from "../../libs/api";
import { SCREEN_DIMENSIONS, styles } from "./ar.styles";
import {
  ARProductInfo,
  DetectedFace
} from "./ar.types";
import {
  calculateLipRegion,
  hexToRgba,
  isValidColorCode,
  mirrorCoordinate
} from "./ar.utils";

// 웹 전용 컴포넌트 동적 import
const WebARMakeupScreen = Platform.OS === "web"
  ? require("./WebARMakeupScreen").default
  : null;

// 얼굴 감지 간격 (ms)
const FACE_DETECTION_INTERVAL = 300;

interface ARMakeupScreenProps {
  productId: string;
  categoryId?: number;
}

// 웹 환경에서는 WebARMakeupScreen 사용
export default function ARMakeupScreen(props: ARMakeupScreenProps) {
  if (Platform.OS === "web" && WebARMakeupScreen) {
    return <WebARMakeupScreen {...props} />;
  }

  return <NativeARMakeupScreen {...props} />;
}

// 네이티브 전용 AR 화면
function NativeARMakeupScreen({
  productId,
  categoryId: initialCategoryId,
}: ARMakeupScreenProps) {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);

  // 카메라 권한 (네이티브)
  const [permission, requestPermission] = useCameraPermissions();

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<ARProductInfo | null>(null);
  const [isArAvailable, setIsArAvailable] = useState<boolean>(true);

  // 카메라 상태
  const [facing, setFacing] = useState<CameraType>("front");
  const [faces, setFaces] = useState<DetectedFace[]>([]);

  // AR 상태
  const [isARActive, setIsARActive] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const opacity = 0.6;

  // UI 상태
  const [isFolded, setIsFolded] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // 화면 크기
  const dimensions = SCREEN_DIMENSIONS;

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

      // 제품 정보 구성
      const productInfo: ARProductInfo = {
        id: Number(data.id),
        name: data.name,
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

      // 첫 번째 유효한 색상 선택
      const firstColorOption = productInfo.options.find((opt) =>
        isValidColorCode(opt.colorCode)
      );

      if (firstColorOption?.colorCode) {
        setSelectedColor(firstColorOption.colorCode);
      } 
      // else {
      //   // 기본 색상 사용
      //   const arConfig = getARConfigByCategory(catId);
      //   if (arConfig) {
      //     setSelectedColor(DEFAULT_COLORS[arConfig.targetRegion]);
      //     setOpacity(arConfig.defaultOpacity);
      //   }
      // }
    } catch (err) {
      console.error("제품 정보 로드 에러:", err);
      setError(
        err instanceof Error ? err.message : "제품 정보를 불러올 수 없습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProductInfo();
  }, [loadProductInfo]);

  /**
   * 주기적 얼굴 감지 (스냅샷 기반)
   */
  const isDetectingRef = useRef(false);
  
  const detectFaces = useCallback(async () => {
    if (!cameraRef.current || isDetectingRef.current || !isARActive) return;
    
    try {
      isDetectingRef.current = true;
      
      // 스냅샷 촬영
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.1,
        skipProcessing: true,
        base64: false,
      });
      
      if (!photo?.uri) return;
      
      // 얼굴 감지 실행
      const result = await FaceDetector.detectFacesAsync(photo.uri, {
        mode: FaceDetector.FaceDetectorMode.fast,
        detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
        runClassifications: FaceDetector.FaceDetectorClassifications.none,
      });
      
      if (result.faces && result.faces.length > 0) {
        // 이미지 크기와 화면 크기의 비율 계산
        const scaleX = dimensions.width / (photo.width || dimensions.width);
        const scaleY = dimensions.height / (photo.height || dimensions.height);
        
        // 좌표 스케일링 적용
        const scaledFaces = result.faces.map((face: any) => ({
          ...face,
          bounds: {
            origin: {
              x: face.bounds.origin.x * scaleX,
              y: face.bounds.origin.y * scaleY,
            },
            size: {
              width: face.bounds.size.width * scaleX,
              height: face.bounds.size.height * scaleY,
            },
          },
          leftMouthPosition: face.leftMouthPosition ? {
            x: face.leftMouthPosition.x * scaleX,
            y: face.leftMouthPosition.y * scaleY,
          } : undefined,
          rightMouthPosition: face.rightMouthPosition ? {
            x: face.rightMouthPosition.x * scaleX,
            y: face.rightMouthPosition.y * scaleY,
          } : undefined,
          bottomMouthPosition: face.bottomMouthPosition ? {
            x: face.bottomMouthPosition.x * scaleX,
            y: face.bottomMouthPosition.y * scaleY,
          } : undefined,
        }));
        
        setFaces(scaledFaces as DetectedFace[]);
      } else {
        setFaces([]);
      }
    } catch (err) {
      // 스냅샷 실패는 무시 (카메라가 준비되지 않았을 수 있음)
      console.log("얼굴 감지 스킵:", err);
    } finally {
      isDetectingRef.current = false;
    }
  }, [isARActive, dimensions]);

  // 주기적 얼굴 감지 실행
  useEffect(() => {
    if (!permission?.granted || isLoading || !isARActive) return;
    
    const interval = setInterval(detectFaces, FACE_DETECTION_INTERVAL);
    return () => clearInterval(interval);
  }, [permission?.granted, isLoading, isARActive, detectFaces]);

  /**
   * 카메라 전환
   */
  const toggleCameraFacing = useCallback(() => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }, []);

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

  // 애니메이션 효과
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isFolded ? 1 : 0,
      useNativeDriver: false,
      tension: 65,
      friction: 11,
    }).start();
  }, [isFolded, slideAnim]);

  /**
   * 색상 선택
   */
  const handleColorSelect = useCallback((colorCode: string) => {
    setSelectedColor(colorCode);
  }, []);

  /**
   * 뒤로가기
   */
  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  /**
   * 입술 오버레이 렌더링
   */
  const renderLipOverlay = useCallback(
    (face: DetectedFace, index: number) => {
      if (!isARActive || !selectedColor) return null;

      const lipRegion = calculateLipRegion(face);
      if (!lipRegion) return null;

      // 프론트 카메라는 미러링 적용
      const isFrontCamera = facing === "front";
      const adjustedCenterX = isFrontCamera
        ? mirrorCoordinate(lipRegion.center.x, dimensions.width)
        : lipRegion.center.x;

      const overlayStyle = {
        position: "absolute" as const,
        left: adjustedCenterX - lipRegion.width / 2,
        top: lipRegion.center.y - lipRegion.height / 2,
        width: lipRegion.width,
        height: lipRegion.height,
        backgroundColor: hexToRgba(selectedColor, opacity),
        borderRadius: lipRegion.width / 2,
        transform: [
          { scaleX: isFrontCamera ? -1 : 1 },
          { rotate: `${face.rollAngle || 0}deg` },
        ],
      };

      return <View key={`lip-${index}`} style={overlayStyle} />;
    },
    [isARActive, selectedColor, opacity, facing, dimensions]
  );

  /**
   * 얼굴 오버레이 렌더링 (카테고리에 따라 분기)
   */
  const renderFaceOverlays = useCallback(() => {
    if (!isARActive || faces.length === 0) return null;

    if (!isArAvailable) return null;
    // if (!arConfig) return null;

    return faces.map((face, index) => {
      switch (product?.categoryName?.toLowerCase()) {
        case "립메이크업":
          return renderLipOverlay(face, index);
        // 추후 다른 부위 추가
        // case 'eyes':
        //   return renderEyeOverlay(face, index);
        // case 'cheeks':
        //   return renderCheekOverlay(face, index);
        default:
          return null;
      }
    });
  }, [isARActive, faces, isArAvailable, renderLipOverlay, product?.categoryName]);

  /**
   * 색상 옵션 목록 렌더링
   */
  const renderColorOptions = useCallback(() => {
    if (!product) return null;

    // 제품 옵션에서 색상 추출 또는 기본 색상 목록 사용
    const colorOptions = product.options.filter((opt) =>
      isValidColorCode(opt.colorCode)
    );

    // 색상 옵션이 없으면 기본 색상 팔레트 표시
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.colorList}
      >
        {colors.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.colorOption,
              selectedColor === item.color && styles.colorOptionSelected,
            ]}
            onPress={() => handleColorSelect(item.color)}
          >
            <View
              style={[styles.colorOptionInner, { backgroundColor: item.color }]}
            />
            {selectedColor === item.color && (
              <Ionicons
                name="checkmark"
                size={20}
                color="#fff"
                style={styles.checkIcon}
              />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }, [product, selectedColor, handleColorSelect]);

  // 권한 로딩 중
  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF2D78" />
        <Text style={styles.loadingText}>카메라 권한 확인 중...</Text>
      </View>
    );
  }

  // 권한 없음
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color="#FF2D78" />
        <Text style={styles.permissionTitle}>카메라 권한 필요</Text>
        <Text style={styles.permissionText}>
          AR 메이크업 체험을 위해{"\n"}카메라 접근 권한이 필요합니다.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>권한 허용하기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 에러 상태 (전체 화면 교체)
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProductInfo}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // AR 미지원 카테고리 (전체 화면 교체)
  if (!isLoading && !isArAvailable) {
    return (
      <View style={styles.unsupportedContainer}>
        <Ionicons name="color-palette-outline" size={64} color="#aaa" />
        <Text style={styles.unsupportedTitle}>AR 미지원 제품</Text>
        <Text style={styles.unsupportedText}>
          이 제품 카테고리는 아직{"\n"}AR 체험을 지원하지 않습니다.
        </Text>
        <TouchableOpacity style={styles.goBackButton} onPress={handleGoBack}>
          <Text style={styles.goBackButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 카메라 뷰 */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        >
          {/* 얼굴 오버레이 */}
          <View style={styles.overlayContainer}>{renderFaceOverlays()}</View>

          {/* 얼굴 미감지시 가이드 */}
          {faces.length === 0 && !isLoading && (
            <View style={styles.faceGuide}>
              <View style={styles.faceGuideFrame} />
              <Text style={styles.faceGuideText}>
                얼굴을 프레임 안에 위치시켜 주세요
              </Text>
            </View>
          )}

          {/* 로딩 오버레이 (CameraView 내부) */}
          {isLoading && (
            <View style={styles.cameraLoadingOverlay}>
              <View style={styles.cameraLoadingContent}>
                <ActivityIndicator size="large" color="#FF2D78" />
                <Text style={styles.cameraLoadingText}>AR 모델 로딩 중...</Text>
              </View>
            </View>
          )}
        </CameraView>

        {/* 카메라 전환 버튼 */}
        <TouchableOpacity
          style={styles.flipButton}
          onPress={toggleCameraFacing}
        >
          <Ionicons name="camera-reverse-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleGoBack}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product?.name || "AR 메이크업"}
        </Text>
        <View style={styles.headerButton} />
      </View>

      {/* 하단 컨트롤 패널 */}
      <>
        {/* 토글 버튼 (패널 외부) */}
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

        <Animated.View style={[
          styles.controlPanel,
          {
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 380], // 접힐 때 아래로 이동하는 거리 (패널 높이보다 조금 적게)
              })
            }]
          }
        ]}>
          <>
        {/* 제품 정보 */}
        {isLoading ? (
          <View style={styles.productInfo}>
            <SkeletonBox width={50} height={50} style={{ borderRadius: 8 }} />
            <View style={styles.productDetails}>
              <SkeletonBox width="80%" height={16} style={{ marginBottom: 8 }} />
              <SkeletonBox width="50%" height={12} />
            </View>
          </View>
        ) : product ? (
          <View style={styles.productInfo}>
            {product.imgUrl && (
              <Image
                source={{ uri: product.imgUrl }}
                style={styles.productImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.productDetails}>
              <Text style={styles.productName} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={styles.productBrand}>
                {product.manufacturer || product.categoryName}
              </Text>
            </View>
          </View>
        ) : null}

        {/* 색상 선택기 */}
        <View style={styles.colorPickerContainer}>
          {isLoading ? (
            <>
              <SkeletonBox width={120} height={14} style={{ marginBottom: 12, marginLeft: 8 }} />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.colorList}
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SkeletonBox
                    key={i}
                    width={48}
                    height={48}
                    style={{ borderRadius: 24, marginRight: 12 }}
                  />
                ))}
              </ScrollView>
            </>
          ) : (
            <>
              <Text style={styles.colorPickerLabel}>
                색상 선택 ({product?.categoryName})
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
      </>
    </View>
  );
}
