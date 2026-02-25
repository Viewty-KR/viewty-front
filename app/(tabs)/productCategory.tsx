import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ListRenderItem,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useProducts } from "../../hooks/useProducts";
import { IMAGE_BASE_URL } from "../../libs/api";

interface ProductListItem {
  id: number;
  name: string;
  price?: number;
  manufacturer?: string;
  imgUrl?: string;
  arAvailable?: boolean;
}

export default function ProductCategoryScreen() {
  const router = useRouter();
  const { 
    products, 
    categories,
    loading, 
    errorMessage, 
    selectedCategory, 
    setCategory,
    currentPage,
    totalPages,
    totalElements,
    setPage,
    loadProducts,
    loadCategories,
  } = useProducts();

  // 화면이 포커스될 때만 데이터 로드
  useFocusEffect(
    React.useCallback(() => {
      loadCategories();
      loadProducts();
    }, [loadCategories, loadProducts])
  );

  // "전체" 카테고리를 포함한 목록을 메모이제이션하여 렌더링 최적화 및 데이터 유실 방지
  const allCategories = useMemo(() => {
    const list = [{ id: null, name: "전체" }, ...categories];
    console.log("렌더링할 카테고리 목록:", list.map(c => c.name));
    return list;
  }, [categories]);

  const getSafeImageUrl = (url?: string) => {
    if (!url) return "https://via.placeholder.com/150?text=No+Image";
    return url.startsWith("http") || url.startsWith("/")
      ? url.startsWith("/")
        ? `${IMAGE_BASE_URL}${url}`
        : url
      : `${IMAGE_BASE_URL}/${url}`;
  };

  const renderItem: ListRenderItem<ProductListItem> = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: getSafeImageUrl(item.imgUrl) }} 
          style={styles.productImage} 
          resizeMode="contain"
        />
        {item.arAvailable && (
          <TouchableOpacity 
            style={styles.arBadge}
            onPress={(e) => {
              e.stopPropagation();
              router.push(`/ar/${item.id}`);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.arBadgeText}>AR체험</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.manufacturer}>{item.manufacturer}</Text>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.price}>{item.price?.toLocaleString()}원</Text>
      </View>
    </TouchableOpacity>
  );

  // 페이지네이션 번호 생성
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    let pages = [];
    const maxVisible = 5;
    let startPage = Math.max(0, currentPage - 2);
    let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(0, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <TouchableOpacity
          key={i}
          style={[styles.pageButton, currentPage === i && styles.pageButtonActive]}
          onPress={() => {
            setPage(i);
            // 리스트 상단으로 스크롤 이동 로직 추가 가능
          }}
        >
          <Text style={[styles.pageText, currentPage === i && styles.pageTextActive]}>
            {i + 1}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity 
          onPress={() => setPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          style={styles.arrowButton}
        >
          <Ionicons name="chevron-back" size={20} color={currentPage === 0 ? "#ccc" : "#333"} />
        </TouchableOpacity>
        
        {pages}

        <TouchableOpacity 
          onPress={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage === totalPages - 1}
          style={styles.arrowButton}
        >
          <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages - 1 ? "#ccc" : "#333"} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "카테고리" }} />
      
      {/* 카테고리 탭 바 (DB 데이터를 통한 동적 생성) */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {allCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id === null ? "all" : String(cat.id)}
              style={[
                styles.categoryTab,
                selectedCategory === cat.id && styles.categoryTabActive,
              ]}
              onPress={() => setCategory(cat.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat.id && styles.categoryTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.totalCountContainer}>
        <Text style={styles.totalCountText}>전체 {totalElements.toLocaleString()}개</Text>
      </View>

      {loading && products.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color="#FF2D78" />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          numColumns={2} 
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={renderPagination}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ marginTop: 50, color: '#888' }}>해당 카테고리의 상품이 없습니다.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  categoryContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  categoryScroll: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginHorizontal: 4,
  },
  categoryTabActive: {
    backgroundColor: "#FF2D78",
  },
  categoryText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  totalCountContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  totalCountText: {
    fontSize: 13,
    color: "#888",
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 40,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  card: {
    width: "48%", // 2열 표시를 위해 약 절반 너비 설정
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
  },
  productImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    marginBottom: 8,
  },
  arBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FF2D78",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  arBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  cardContent: {
    paddingHorizontal: 4,
  },
  manufacturer: { fontSize: 11, color: "#aaa", marginBottom: 2 },
  name: { fontSize: 14, color: "#333", height: 40, lineHeight: 20, marginBottom: 4 },
  price: { fontSize: 15, fontWeight: "bold", color: "#333" },

  // 페이지네이션
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 10,
  },
  pageButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    borderRadius: 18,
  },
  pageButtonActive: {
    backgroundColor: "#333",
  },
  pageText: {
    fontSize: 14,
    color: "#888",
  },
  pageTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  arrowButton: {
    padding: 8,
    marginHorizontal: 10,
  },
});
