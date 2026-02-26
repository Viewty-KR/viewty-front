// AR 메이크업 화면 스타일

import { Dimensions, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  // 카메라 영역
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },

  // 로딩 상태
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
  },

  // 카메라 내부 로딩 오버레이
  cameraLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  cameraLoadingContent: {
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    paddingVertical: 30,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: "center",
  },
  cameraLoadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
    fontWeight: "500",
  },

  // 권한 요청 화면
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
  },
  permissionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  permissionText: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: "#FF2D78",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // 오버레이 (입술 등에 씌우는 색상)
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
  lipOverlay: {
    position: "absolute",
    borderRadius: 50,
  },

  // 상단 헤더
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  // 하단 컨트롤 패널
  controlPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  controlPanelFolded: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    backgroundColor: "transparent",
  },

  // 패널 토글 버튼 (컨트롤 패널 위에 독립적으로 배치)
  panelToggleButton: {
    position: "absolute",
    bottom: 380, // 컨트롤 패널 위쪽에 위치
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  // 제품 정보
  productInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#333",
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  productBrand: {
    color: "#aaa",
    fontSize: 12,
  },

  // 색상 선택기
  colorPickerContainer: {
    marginBottom: 20,
  },
  colorPickerLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  colorList: {
    paddingHorizontal: 8,
    flexGrow: 0,
    // 웹에서 가로 스크롤 지원
    ...(typeof window !== 'undefined' ? {
      overflowX: 'auto' as const,
      overflowY: 'hidden' as const,
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    } : {}),
  },
  colorListContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorOptionSelected: {
    borderColor: "#fff",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  colorOptionInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  checkIcon: {
    position: "absolute",
  },

  // 투명도 슬라이더
  opacityContainer: {
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  opacityLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
  },
  opacitySliderContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  opacitySlider: {
    flex: 1,
    height: 40,
  },
  opacityValue: {
    color: "#fff",
    fontSize: 14,
    width: 50,
    textAlign: "right",
  },

  // 얼굴 감지 안내
  faceGuide: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  faceGuideFrame: {
    width: 250,
    height: 320,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 125,
    justifyContent: "center",
    alignItems: "center",
  },
  faceGuideText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },

  // 에러 상태
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: "#FF2D78",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // 카메라 전환 버튼
  flipButton: {
    position: "absolute",
    bottom: 200,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  // AR 토글 버튼
  arToggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF2D78",
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  arToggleButtonInactive: {
    backgroundColor: "#444",
  },
  arToggleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },

  // 지원되지 않는 카테고리 안내
  unsupportedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
  },
  unsupportedTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  unsupportedText: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  goBackButton: {
    backgroundColor: "#FF2D78",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  goBackButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

// 웹 전용 스타일 (반응형 포함)
export const webStyles = StyleSheet.create({
  // 데모 모드 배지
  demoBadge: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  demoBadgeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  demoBadgeText: {
    color: "#FFD700",
    fontSize: 13,
    marginLeft: 8,
  },
  demoChangeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginLeft: 12,
  },
  demoChangeButtonText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
  desktopDemoBadge: {
    top: 20,
    left: 10,
    right: 10,
  },

  // PC 레이아웃
  desktopContainer: {
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  desktopLayout: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 32,
    maxWidth: 1000,
  },
  desktopCameraContainer: {
    position: "relative",
    backgroundColor: "#000",
  },
  desktopControlPanel: {
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: 360,
    minHeight: 500,
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  },
  desktopHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  desktopHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginLeft: 12,
  },
  desktopProductInfo: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  desktopProductImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 12,
  },
  desktopProductName: {
    color: "#333",
    fontSize: 16,
    textAlign: "center",
  },
  desktopProductBrand: {
    color: "#888",
    textAlign: "center",
  },
  desktopColorPicker: {
    marginBottom: 24,
  },
  desktopColorLabel: {
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 16,
  },
  desktopArToggle: {
    marginTop: "auto",
  },
  // 색상 선택기 컨테이너 (화살표 버튼 포함)
  colorScrollContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
  },
  // 색상 스크롤 화살표 버튼
  colorArrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  // PC용 색상 리스트 스타일
  desktopColorList: {
    flex: 1,
    flexGrow: 1,
    marginHorizontal: 8,
    minWidth: 0,
  },
  // PC용 색상 리스트 content 스타일
  desktopColorListContent: {
    flexGrow: 1,
    justifyContent: "center",
    gap: 8,
  },
  // PC용 색상 옵션 (더 큰 사이즈)
  desktopColorOption: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "transparent",
  },
  desktopColorOptionInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
});

export const SCREEN_DIMENSIONS = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
};
