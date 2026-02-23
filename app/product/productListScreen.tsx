import { useFocusEffect, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useProducts } from "../../hooks/useProducts";

interface ProductListItem {
  id: number;
  name: string;
  price?: number;
  manufacturer?: string;
}

const ProductListScreen = () => {
  const router = useRouter();
  const { products, categories, loading, errorMessage, selectedCategory, setCategory, loadProducts, loadCategories } = useProducts();

  // 화면이 포커스될 때만 데이터 로드
  useFocusEffect(
    React.useCallback(() => {
      loadCategories();
      loadProducts();
    }, [loadCategories, loadProducts])
  );

  // "전체" 카테고리 추가
  const allCategories = [{ id: null, name: "전체" }, ...categories];

  if (errorMessage)
    return (
      <View style={styles.center}>
        <Text>{errorMessage}</Text>
      </View>
    );

  const renderItem: ListRenderItem<ProductListItem> = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <View style={styles.cardContent}>
        <Text style={styles.manufacturer}>{item.manufacturer}</Text>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>{item.price?.toLocaleString()}원</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
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

      {loading && products.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color="#FF2D78" />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ marginTop: 50, color: '#888' }}>해당 카테고리의 상품이 없습니다.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

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
  listContent: { padding: 16 },
  card: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    overflow: "hidden",
  },
  cardContent: { padding: 16 },
  manufacturer: { fontSize: 12, color: "#888", marginBottom: 4 },
  name: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 8 },
  price: { fontSize: 15, fontWeight: "bold", color: "#FF2D78" },
});

export default ProductListScreen;
