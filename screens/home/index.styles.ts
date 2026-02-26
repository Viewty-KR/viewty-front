import { StyleSheet } from "react-native";
import {
  BORDER_RADIUS,
  COLORS,
  FONT_SIZE,
  FONT_WEIGHT,
  modalShadowStyle,
  shadowStyle,
  SPACING,
} from "../../constants/theme";

// Theme 상수들 re-export (편의성을 위해)
export { COLORS, ICON_SIZE } from "../../constants/theme";

// 카드 너비 계산 유틸리티 함수
export const getCardWidth = (screenWidth: number) => (screenWidth - 48) / 2;

// 공통 스타일 패턴
const absolutePosition = {
  position: "absolute" as const,
};

// Layout Styles
const layoutStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.semibold,
  },
  seeAll: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.medium,
    fontSize: FONT_SIZE.md,
  },
  scrollContentContainer: {
    paddingBottom: 100,
  },
});

// Modal Styles
const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlayDark,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xxxl,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    ...modalShadowStyle,
  },
  modalIconContainer: {
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: SPACING.xxl,
    lineHeight: 22,
  },
  modalButtonContainer: {
    flexDirection: "row",
    gap: SPACING.md,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  modalButtonSecondary: {
    backgroundColor: COLORS.lightGray,
  },
  modalButtonTextPrimary: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
  },
  modalButtonTextSecondary: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.medium,
  },
});

// Tab Styles
const tabStyles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    justifyContent: "space-around",
  },
  tabItem: {
    paddingBottom: SPACING.sm,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabItem: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.gray,
    fontWeight: FONT_WEIGHT.medium,
  },
  activeTabText: {
    color: COLORS.text,
  },
});

// Trending Card Styles
const trendingStyles = StyleSheet.create({
  loadingBlock: {
    paddingVertical: SPACING.huge,
    alignItems: "center",
    justifyContent: "center",
  },
  horizontalScroll: {
    paddingLeft: SPACING.xl,
    height: 280,
  },
  trendCard: {
    width: 280,
    height: 180,
    marginRight: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
  },
  trendImage: {
    width: "100%",
    height: "100%",
  },
  trendOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    padding: SPACING.lg,
    justifyContent: "flex-end",
  },
  badge: {
    ...absolutePosition,
    top: SPACING.lg,
    left: SPACING.lg,
    backgroundColor: COLORS.whiteTransparent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.xs,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
  },
  trendTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.xs,
  },
  trendDesc: {
    color: COLORS.whiteAlpha,
    fontSize: FONT_SIZE.base,
  },
  arrowBtn: {
    ...absolutePosition,
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});

// Product Card Styles (Curated Looks)
const productCardStyles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: SPACING.lg,
    justifyContent: "space-between",
  },
  lookCard: {
    // width는 동적으로 설정됨
    marginBottom: SPACING.xxl,
  },
  imageWrapper: {
    position: "relative",
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    marginBottom: SPACING.md,
  },
  lookImage: {
    width: "100%",
    height: 200,
    backgroundColor: COLORS.imagePlaceholder,
  },
  heartIcon: {
    ...absolutePosition,
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.overlayLight,
    borderRadius: BORDER_RADIUS.xl,
    padding: 6,
  },
  tryOnBadge: {
    ...absolutePosition,
    bottom: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.xl,
  },
  tryOnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  lookTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: 2,
  },
  lookDesc: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
    marginBottom: SPACING.sm,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
});

// Banner & Floating Styles
const bannerStyles = StyleSheet.create({
  bundleBanner: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.md,
    backgroundColor: COLORS.paleRose,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.huge,
  },
  bundleSub: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    textTransform: "uppercase",
  },
  bundleTitle: {
    fontSize: 14,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  percentCircle: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.lightPink,
    justifyContent: "center",
    alignItems: "center",
  },
  percentText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
  },
  floatingContainer: {
    ...absolutePosition,
    bottom: SPACING.xl,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  checkoutBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: SPACING.xxxl,
    borderRadius: BORDER_RADIUS.xxxl,
    ...shadowStyle,
  },
  checkoutText: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.semibold,
    fontSize: FONT_SIZE.xl,
  },
  cartIconStyle: {
    marginRight: SPACING.sm,
  },
  primaryHighlight: {
    color: COLORS.primary,
  },
});

// 모든 스타일 병합 및 export
export const styles = {
  ...layoutStyles,
  ...modalStyles,
  ...tabStyles,
  ...trendingStyles,
  ...productCardStyles,
  ...bannerStyles,
};
