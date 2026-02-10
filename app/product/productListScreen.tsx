import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ListRenderItem,
} from "react-native";
import { ProductApi } from "../../libs/api";

interface ProductListItem {
  id: number;
  name: string;
  price?: string;
}

interface ProductListScreenProps {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
}

const ProductListScreen = ({ navigation }: ProductListScreenProps) => {
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await ProductApi.getList();
      if (response?.success) {
        const list = (response.data?.content ?? response.data) as
          | ProductListItem[]
          | undefined;
        if (Array.isArray(list)) setItems(list);
        else setItems([]);
      }
    } catch (error) {
      console.error("상품 목록 조회 실패:", error);
      setItems([]);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "상품 목록을 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <ActivityIndicator />;

  if (errorMessage)
    return (
      <View style={{ padding: 12 }}>
        <Text>{errorMessage}</Text>
      </View>
    );

  const renderItem: ListRenderItem<ProductListItem> = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("ProductDetail", { id: item.id })}
    >
      <View style={{ padding: 12 }}>
        <Text>{item.name}</Text>
        <Text>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
    />
  );
};

export default ProductListScreen;
