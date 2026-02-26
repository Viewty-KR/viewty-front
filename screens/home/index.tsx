import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
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
import {
  CuratedLooksSkeleton,
  RecommendedSkeleton,
  TrendingSkeleton,
} from "../../components/Skeletons";
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
    recommendedItems,
    curatedLooks,
    errorMessage,
    recommendSkinType,
    recommendLoading,
    setRecommendSkinType,
    handleRetry,
    handleCloseError,
    loadProducts,
    loadRecommendations,
    loadCategories,
  } = useProducts();

  // 화면이 포커스될 때만 데이터 로드
  useFocusEffect(
    React.useCallback(() => {
      loadCategories();
      loadProducts();
      loadRecommendations(recommendSkinType);
    }, [loadCategories, loadProducts, loadRecommendations]),
  );

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
          <Ionicons
            name="bag-handle-outline"
            size={ICON_SIZE.lg}
            color={COLORS.black}
          />
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
            {/* <Text style={styles.seeAll}>View All</Text> */}
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
                    <Ionicons
                      name="arrow-forward"
                      size={ICON_SIZE.md}
                      color={COLORS.white}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Recommended for You */}
        <View
          style={[styles.sectionHeader, { marginTop: 24, marginBottom: 8 }]}
        >
          <Text style={styles.sectionTitle}>Recommended for You</Text>
        </View>

        {/* Skin Type Tabs */}
        {/* <View
          style={[
            styles.tabContainer,
            { justifyContent: "flex-start", gap: 12, marginBottom: 16 },
          ]}
        >
          {[
            { id: "건성", label: "건성" },
            { id: "복합성", label: "복합성" },
            { id: "지성", label: "지성" },
            { id: "민감", label: "민감성" },
            { id: "여드름", label: "여드름" },
            { id: "보습", label: "보습" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabItem,
                recommendSkinType === tab.id && styles.activeTabItem,
                { paddingHorizontal: 12 },
              ]}
              onPress={() => setRecommendSkinType(tab.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  recommendSkinType === tab.id && styles.activeTabText,
                  { fontSize: 14 },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View> */}

        <View style={{ minHeight: 280, marginBottom: 32 }}>
          {recommendLoading ? (
            <RecommendedSkeleton />
          ) : recommendedItems.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={[styles.horizontalScroll, { marginBottom: 0 }]} // 중복 마진 제거
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {recommendedItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.lookCard, { width: 160, marginRight: 16 }]}
                  activeOpacity={0.9}
                  onPress={() => handleOpenProduct(item.id)}
                >
                  <View style={[styles.imageWrapper, { height: 160 }]}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.lookImage}
                    />
                  </View>
                  <Text
                    style={[styles.lookTitle, { fontSize: 14 }]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[styles.lookDesc, { fontSize: 12 }]}
                    numberOfLines={1}
                  >
                    {item.desc}
                  </Text>
                  <Text style={[styles.price, { fontSize: 14, marginTop: 4 }]}>
                    {formatPrice(item.price)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={{ paddingLeft: 20, paddingVertical: 20 }}>
              <Text style={{ color: COLORS.gray }}>추천 상품이 없습니다.</Text>
            </View>
          )}
        </View>

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
                  </View>

                  <Text style={styles.lookTitle}>{item.title}</Text>
                  <Text style={styles.lookDesc}>{item.desc}</Text>
                </TouchableOpacity>

                <View style={styles.priceRow}>
                  <Text style={styles.price}>{formatPrice(item.price)}</Text>
                  {/* <TouchableOpacity
                    style={styles.addBtn}
                    accessibilityRole="button"
                    accessibilityLabel="장바구니에 추가"
                    accessibilityHint={`${item.title}을 장바구니에 담습니다`}
                  >
                    <Ionicons
                      name="add"
                      size={ICON_SIZE.md}
                      color={COLORS.textSecondary}
                    />
                  </TouchableOpacity> */}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Bundle Banner */}
        {/* <TouchableOpacity
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
        </TouchableOpacity> */}
      </ScrollView>
    </SafeAreaView>
  );
}
