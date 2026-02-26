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
    functionalProducts,
    arProducts,
    errorMessage,
    recommendSkinType,
    recommendLoading,
    setRecommendSkinType,
    handleRetry,
    handleCloseError,
    loadProducts,
    loadRecommendations,
    loadCategories,
    loadFunctionalProducts,
    loadArProducts,
  } = useProducts();

  const [selectedFunctionalType, setSelectedFunctionalType] =
    React.useState("주름개선");

  const FUNCTIONAL_TYPES = [
    "주름개선",
    "수렴진정",
    "피부보호",
    "피부보습",
    "피부미백",
  ];

  useFocusEffect(
    React.useCallback(() => {
      loadCategories();
      loadProducts();
      loadRecommendations(recommendSkinType);
      loadArProducts(); // AR 상품 로드 추가
    }, [loadCategories, loadProducts, loadRecommendations, recommendSkinType, loadArProducts]),
  );

  React.useEffect(() => {
    FUNCTIONAL_TYPES.forEach((type) => {
      loadFunctionalProducts(type);
    });
  }, [loadFunctionalProducts]);

  const handleOpenProduct = (productId: number | string) => {
    router.push({
      pathname: "/product/[id]",
      params: { id: String(productId) },
    });
  };

  const handleOpenAR = (productId: number | string) => {
    router.push({
      pathname: "/ar/[id]",
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

      {/* Header: 검색, 장바구니 제거 및 Viewty 정가운데 배치 */}
      <View style={[styles.header, { justifyContent: "center" }]}>
        <Text style={styles.headerTitle}>Viewty</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* AR Experience Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AR 가상 체험</Text>
        </View>

        {arProducts.length === 0 ? (
          <CuratedLooksSkeleton cardWidth={cardWidth} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {arProducts.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.lookCard,
                  { width: cardWidth * 1.1, marginRight: 12 },
                ]}
                activeOpacity={0.9}
                onPress={() => handleOpenProduct(item.id)}
              >
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.lookImage}
                  />
                  <TouchableOpacity 
                    style={styles.tryOnBadge}
                    onPress={() => handleOpenAR(item.id)}
                  >
                    <Ionicons name="camera" size={14} color={COLORS.primary} />
                    <Text style={styles.tryOnText}>Try On</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.lookTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.lookDesc} numberOfLines={1}>
                  {item.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Functional Tabs Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>효능별 추천</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 15, paddingLeft: 16 }}
        >
          {FUNCTIONAL_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setSelectedFunctionalType(type)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor:
                  selectedFunctionalType === type ? COLORS.primary : "#F3F4F6",
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  color:
                    selectedFunctionalType === type
                      ? COLORS.white
                      : COLORS.textSecondary,
                  fontWeight: selectedFunctionalType === type ? "700" : "500",
                }}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {!functionalProducts[selectedFunctionalType] ||
        functionalProducts[selectedFunctionalType].length === 0 ? (
          <CuratedLooksSkeleton cardWidth={cardWidth} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {functionalProducts[selectedFunctionalType].map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.lookCard,
                  { width: cardWidth * 0.8, marginRight: 12 },
                ]}
                activeOpacity={0.9}
                onPress={() => handleOpenProduct(item.id)}
              >
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.lookImage}
                  />
                </View>
                <Text style={styles.lookTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.price}>{formatPrice(item.price)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Now</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="인기 상품 전체 보기"
          ></TouchableOpacity>
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

        <View
          style={[styles.sectionHeader, { marginTop: 24, marginBottom: 8 }]}
        >
          <Text style={styles.sectionTitle}>Recommended for You</Text>
        </View>

        <View style={{ minHeight: 280, marginBottom: 32 }}>
          {recommendLoading ? (
            <RecommendedSkeleton />
          ) : recommendedItems.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={[styles.horizontalScroll, { marginBottom: 0 }]}
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
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
