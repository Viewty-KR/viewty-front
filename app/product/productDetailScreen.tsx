import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  ActivityIndicator,
  Image,
  StyleSheet,
} from "react-native";
import { ProductApi, ReviewApi, BookmarkApi } from "../../libs/api";

interface ProductDetail {
  id: number;
  name: string;
  price?: string;
  category?: string;
  manufacturer?: string;
  imgUrl?: string;
  img_url?: string;
}

interface ReviewItem {
  id: number;
  name: string;
  content: string;
  rating: number;
  createdAt?: string;
}

interface ProductDetailScreenProps {
  route: { params: { id?: string | number } };
}

const ProductDetailScreen = ({ route }: ProductDetailScreenProps) => {
  const productId = route.params?.id != null ? String(route.params.id) : null;
  const userId = 1; // 로그인 연동 시 실제 값으로 변경

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [bookmark, setBookmark] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!productId) {
      setProduct(null);
      setReviews([]);
      setBookmark(false);
      setErrorMessage("상품 ID가 지정되지 않았습니다.");
      return;
    }

    setErrorMessage(null);
    setLoading(true);
    try {
      const [detailRes, reviewRes, bookmarkRes] = await Promise.all([
        ProductApi.getDetail(productId),
        ReviewApi.getList(productId),
        BookmarkApi.getStatus(userId, productId),
      ]);

      if (detailRes?.success && detailRes.data) {
        const raw = detailRes.data as Record<string, unknown>;
        const resolvedImage =
          (raw["img_url"] as string | undefined) ??
          (raw["imgUrl"] as string | undefined) ??
          (raw["imageUrl"] as string | undefined) ??
          (raw["image"] as string | undefined) ??
          (raw["thumbnailUrl"] as string | undefined);

        const normalized: ProductDetail = {
          ...(raw as ProductDetail),
          img_url: (raw["img_url"] as string | undefined) ?? resolvedImage,
          imgUrl: resolvedImage,
        };
        setProduct(normalized);
      } else {
        setProduct(null);
        setErrorMessage("상품 정보를 불러오지 못했습니다.");
      }

      if (reviewRes?.success) {
        const reviewList = (reviewRes.data?.content ?? []) as ReviewItem[];
        setReviews(Array.isArray(reviewList) ? reviewList : []);
      }

      if (bookmarkRes?.success)
        setBookmark(Boolean(bookmarkRes.data?.bookmarked));
    } catch (error) {
      console.error("상품 상세 조회 실패:", error);
      setProduct(null);
      setReviews([]);
      setBookmark(false);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "상품 정보를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, [productId, userId]);

  const toggleBookmark = async () => {
    if (!productId) return;
    try {
      await BookmarkApi.toggle(userId, productId);
      const bookmarkRes = await BookmarkApi.getStatus(userId, productId);
      if (bookmarkRes?.success)
        setBookmark(Boolean(bookmarkRes.data?.bookmarked));
    } catch (error) {
      console.error("북마크 토글 실패:", error);
    }
  };

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

  if (!product)
    return (
      <View style={{ padding: 12 }}>
        <Text>상품 정보를 찾을 수 없습니다.</Text>
      </View>
    );

  return (
    <View style={{ padding: 12 }}>
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: product.img_url || "https://via.placeholder.com/300",
          }}
          style={styles.productImage}
          resizeMode="contain"
        />
      </View>
      <Text style={{ fontSize: 20 }}>{product.name}</Text>
      <Text>{product.price}</Text>
      <Text>{product.category}</Text>

      <Button
        title={bookmark ? "북마크 해제" : "북마크"}
        onPress={toggleBookmark}
      />

      <Text style={{ marginTop: 16, fontSize: 16 }}>리뷰</Text>
      <FlatList
        data={reviews}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8 }}>
            <Text>{item.name}</Text>
            <Text>{item.content}</Text>
            <Text>⭐ {item.rating}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  imageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  productImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
  },
});
