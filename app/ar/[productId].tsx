import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import ARMakeupScreen from "../../screens/ar/ARMakeupScreen";

/**
 * AR 메이크업 체험 라우트
 * URL: /ar/[productId]?categoryId=5
 */
export default function ARPage() {
  const { productId, categoryId } = useLocalSearchParams<{
    productId: string;
    categoryId?: string;
  }>();

  // productId가 없으면 로딩 표시 또는 에러 처리
  if (!productId) {
    return (
      <View style={styles.errorContainer}>
        <ActivityIndicator size="large" color="#FF2D78" />
        <Text style={styles.errorText}>제품 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ARMakeupScreen
      productId={productId}
      categoryId={categoryId ? Number(categoryId) : undefined}
    />
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  errorText: {
    color: "#fff",
    marginTop: 16,
    fontSize: 14,
  },
});
