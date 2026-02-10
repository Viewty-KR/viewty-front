import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ErrorModal } from "../../components/ErrorModal";
import { CuratedLooksSkeleton, TrendingSkeleton } from "../../components/Skeletons";
import { COLORS, ICON_SIZE } from "../../constants/theme";
import { useProducts } from "../../hooks/useProducts";
import { getCardWidth, styles } from "./index.styles";
import { formatPrice } from "./index.utils";

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cardWidth = getCardWidth(width);

  const {
    trendingItems,
    curatedLooks,
    errorMessage,
    handleRetry,
    handleCloseError,
  } = useProducts();

  const handleOpenProduct = (productId: number | string) => {
    router.push({
      pathname: "/product/[id]",
      params: { id: String(productId) },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Error Modal */}
      <ErrorModal
        visible={!!errorMessage}
        message={errorMessage}
        onClose={handleCloseError}
        onRetry={handleRetry}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="검색"
          accessibilityHint="상품을 검색합니다"
        >
          <Ionicons name="search" size={ICON_SIZE.lg} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>viewty</Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="장바구니"
          accessibilityHint="장바구니로 이동합니다"
        >
          <Ionicons name="bag-handle-outline" size={ICON_SIZE.lg} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Trending Now */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Now</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="인기 상품 전체 보기"
          >
            <Text style={styles.seeAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {trendingItems.length === 0 ? (
          <TrendingSkeleton />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {trendingItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.trendCard}
                activeOpacity={0.9}
                onPress={() => handleOpenProduct(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`${item.title} 상품 보기`}
                accessibilityHint={item.desc}
              >
                <Image source={{ uri: item.image }} style={styles.trendImage} />
                <View style={styles.trendOverlay}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.tag}</Text>
                  </View>
                  <Text style={styles.trendTitle}>{item.title}</Text>
                  <Text style={styles.trendDesc}>{item.desc}</Text>
                  <View style={styles.arrowBtn}>
                    <Ionicons name="arrow-forward" size={ICON_SIZE.md} color={COLORS.white} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Curated Looks */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Curated Looks</Text>
        </View>

        {curatedLooks.length === 0 ? (
          <CuratedLooksSkeleton cardWidth={cardWidth} />
        ) : (
          <View style={styles.gridContainer}>
            {curatedLooks.map((item) => (
              <View
                key={item.id}
                style={[styles.lookCard, { width: cardWidth }]}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => handleOpenProduct(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.title} 상품 보기`}
                  accessibilityHint={`${formatPrice(item.price)} ${item.desc}`}
                >
                  <View style={styles.imageWrapper}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.lookImage}
                    />
                    <TouchableOpacity
                      style={styles.heartIcon}
                      accessibilityRole="button"
                      accessibilityLabel="찜하기"
                      accessibilityHint="관심 상품에 추가합니다"
                    >
                      <Ionicons name="heart-outline" size={ICON_SIZE.md} color={COLORS.white} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.tryOnBadge}
                      accessibilityRole="button"
                      accessibilityLabel="가상 착용"
                      accessibilityHint="AI로 상품을 미리 착용해볼 수 있습니다"
                    >
                      <MaterialCommunityIcons
                        name="face-recognition"
                        size={ICON_SIZE.sm}
                        color={COLORS.primary}
                      />
                      <Text style={styles.tryOnText}>Try On</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.lookTitle}>{item.title}</Text>
                  <Text style={styles.lookDesc}>{item.desc}</Text>
                </TouchableOpacity>

                <View style={styles.priceRow}>
                  <Text style={styles.price}>{formatPrice(item.price)}</Text>
                  <TouchableOpacity
                    style={styles.addBtn}
                    accessibilityRole="button"
                    accessibilityLabel="장바구니에 추가"
                    accessibilityHint={`${item.title}을 장바구니에 담습니다`}
                  >
                    <Ionicons name="add" size={ICON_SIZE.md} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Bundle Banner */}
        <TouchableOpacity
          style={styles.bundleBanner}
          accessibilityRole="button"
          accessibilityLabel="번들 할인 이벤트"
          accessibilityHint="3개 이상 구매 시 20% 할인"
        >
          <View>
            <Text style={styles.bundleSub}>BUNDLE & SAVE</Text>
            <Text style={styles.bundleTitle}>
              Buy any 3 looks, get{" "}
              <Text style={styles.primaryHighlight}>20% OFF</Text>
              {"\n"}your total kit.
            </Text>
          </View>
          <View style={styles.percentCircle}>
            <Text style={styles.percentText}>%</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.floatingContainer}>
        <TouchableOpacity
          style={styles.checkoutBtn}
          accessibilityRole="button"
          accessibilityLabel="결제하기"
          accessibilityHint="장바구니에 담긴 3개 상품을 결제합니다"
        >
          <Ionicons
            name="cart-outline"
            size={ICON_SIZE.md}
            color={COLORS.white}
            style={styles.cartIconStyle}
          />
          <Text style={styles.checkoutText}>Checkout (3)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
