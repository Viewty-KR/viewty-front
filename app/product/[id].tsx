import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { ProductApi, ReviewApi, BookmarkApi } from "../../libs/api";

// [중요] 사용 중인 백엔드 서버 주소
const BASE_URL = "http://localhost:8080";

interface Ingredient {
  name: string;
  ewgGrade?: string;
  isHarmful: boolean;
}

interface ProductDetail {
  id: number;
  name: string;
  price: string;
  manufacturer: string;
  ingredients: Ingredient[];
  harmfulIngredientCount: number;
  img_url?: string;
  imgUrl?: string;
}

interface Review {
  id: number;
  name: string;
  content: string;
  rating: number;
  createdAt: string;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const productId =
    typeof id === "string" ? id : Array.isArray(id) ? id[0] : undefined;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  // 리뷰 작성 모달 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [reviewContent, setReviewContent] = useState("");
  const [rating, setRating] = useState(5);

  const CURRENT_USER_ID = 1;
  const DEFAULT_USER_NAME = "익명";

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchData(productId);
  }, [productId]);

  const fetchData = async (targetId: string) => {
    try {
      const [prodRes, markRes, reviewRes] = await Promise.all([
        ProductApi.getDetail(targetId),
        BookmarkApi.getStatus(CURRENT_USER_ID, targetId),
        ReviewApi.getList(targetId),
      ]);

      if (prodRes.success) {
        const raw = (prodRes.data ?? {}) as Record<string, unknown>;

        // 🔥 [Debug 1] 서버가 실제로 보내준 데이터의 '이름표(Key)'들을 전부 출력합니다.
        // 로그창에서 "Available Keys: [...]" 부분을 꼭 확인해보세요!
        console.log("🔥 [Debug] Available Keys:", Object.keys(raw));

        const rawImage =
          (raw["imgUrl"] as string | undefined) ??
          (raw["img_url"] as string | undefined) ??
          (raw["imageUrl"] as string | undefined) ??
          (raw["image"] as string | undefined) ??
          (raw["thumbnailUrl"] as string | undefined);

        setProduct({
          ...(raw as ProductDetail),
          imgUrl: rawImage,
          img_url: rawImage,
        });
      }
      if (markRes.success) setIsBookmarked(markRes.data.bookmarked);
      if (reviewRes.success)
        setReviews(
          Array.isArray(reviewRes.data?.content) ? reviewRes.data.content : [],
        );
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
      Alert.alert("오류", "데이터를 불러오는 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const getSafeImageUrl = (url?: string) => {
    const FALLBACK_IMAGE = "https://via.placeholder.com/300?text=No+Image";

    if (!url) return FALLBACK_IMAGE;

    let targetUrl = url;

    if (url.startsWith("/")) {
      targetUrl = `${BASE_URL}${url}`;
    } else if (!url.startsWith("http")) {
      targetUrl = `${BASE_URL}/${url}`;
    }

    // [확인] encodeURI, decodeURI 없이 바로 리턴하는지 확인하세요.
    return targetUrl;
  };
  const refreshReviews = async () => {
    if (!productId) return;
    try {
      const res = await ReviewApi.getList(productId);
      if (res.success)
        setReviews(Array.isArray(res.data?.content) ? res.data.content : []);
    } catch (error) {
      console.error("리뷰 로딩 실패:", error);
    }
  };

  const toggleBookmark = async () => {
    if (!productId) return;
    try {
      const res = await BookmarkApi.toggle(CURRENT_USER_ID, productId);
      if (res.success) {
        setIsBookmarked(!isBookmarked);
      }
    } catch (error) {
      Alert.alert("오류", "북마크 변경에 실패했습니다.");
    }
  };

  const submitReview = async () => {
    if (!productId) return;
    if (!reviewContent.trim())
      return Alert.alert("알림", "리뷰 내용을 입력해주세요.");

    try {
      const res = await ReviewApi.create(productId, {
        name: DEFAULT_USER_NAME,
        content: reviewContent,
        rating: rating,
      });

      if (res.success) {
        Alert.alert("성공", "리뷰가 등록되었습니다.");
        setModalVisible(false);
        setReviewContent("");
        refreshReviews();
      } else {
        Alert.alert("실패", "리뷰 등록 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("오류", "리뷰 등록에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF2D78" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>상품 정보를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  // 최종 이미지 주소 생성 (인코딩 적용됨)
  const finalImageUrl = getSafeImageUrl(product.imgUrl || product.img_url);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen
        options={{ title: product.name, headerBackTitle: "Back" }}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* 상품 이미지 영역 */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: finalImageUrl }}
            style={styles.productImage}
            resizeMode="contain"
            onError={(e) =>
              console.log("🟥 [Error] 최종 로드 실패 주소:", finalImageUrl)
            }
          />
        </View>

        {/* 상품 기본 정보 */}
        <View style={styles.infoContainer}>
          <Text style={styles.brandName}>{product.manufacturer}</Text>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.price}>{product.price}원</Text>

          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={toggleBookmark}
          >
            <Ionicons
              name={isBookmarked ? "heart" : "heart-outline"}
              size={28}
              color={isBookmarked ? "#FF2D78" : "#888"}
            />
            <Text
              style={{ color: isBookmarked ? "#FF2D78" : "#888", marginTop: 4 }}
            >
              {isBookmarked ? "찜 취소" : "찜하기"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* 성분 분석 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>성분 분석</Text>
          <View style={styles.ingredientSummary}>
            <View style={styles.ingredientBadge}>
              <Text style={styles.badgeLabel}>주의 성분</Text>
              <Text
                style={[
                  styles.badgeValue,
                  {
                    color: product.harmfulIngredientCount > 0 ? "red" : "green",
                  },
                ]}
              >
                {product.harmfulIngredientCount}개
              </Text>
            </View>
            <Text style={styles.ingredientDesc}>
              {product.harmfulIngredientCount === 0
                ? "20가지 주의 성분이 포함되지 않았습니다."
                : "주의 성분이 포함되어 있으니 확인해보세요."}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* 리뷰 섹션 */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>리뷰 ({reviews.length})</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={styles.writeReviewText}>리뷰 쓰기</Text>
            </TouchableOpacity>
          </View>

          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{review.name}</Text>
                <View style={styles.starRow}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < review.rating ? "star" : "star-outline"}
                      size={14}
                      color="#FFD700"
                    />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewContent}>{review.content}</Text>
              <Text style={styles.reviewDate}>
                {new Date(review.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 리뷰 작성 모달 */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>리뷰 작성</Text>

            <View style={styles.starInputRow}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity key={value} onPress={() => setRating(value)}>
                  <Ionicons
                    name={value <= rating ? "star" : "star-outline"}
                    size={32}
                    color="#FFD700"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="이 제품에 대한 솔직한 리뷰를 남겨주세요."
              multiline
              value={reviewContent}
              onChangeText={setReviewContent}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnTextBlack}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={submitReview}>
                <Text style={styles.btnTextWhite}>등록</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  imageContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    minHeight: 200,
  },
  productImage: { width: 200, height: 200 },
  infoContainer: { padding: 20 },
  brandName: { color: "#888", fontSize: 14, marginBottom: 4 },
  productName: { fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  price: { fontSize: 20, fontWeight: "600", color: "#FF2D78" },
  bookmarkButton: {
    position: "absolute",
    right: 20,
    top: 20,
    alignItems: "center",
  },
  divider: { height: 8, backgroundColor: "#F4F4F4" },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  ingredientSummary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 8,
  },
  ingredientBadge: { alignItems: "center", marginRight: 15 },
  badgeLabel: { fontSize: 12, color: "#666" },
  badgeValue: { fontSize: 18, fontWeight: "bold" },
  ingredientDesc: { flex: 1, fontSize: 14, color: "#333" },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  writeReviewText: { color: "#FF2D78", fontWeight: "600" },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 15,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  reviewerName: { fontWeight: "bold", fontSize: 14 },
  starRow: { flexDirection: "row" },
  reviewContent: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 4,
  },
  reviewDate: { fontSize: 12, color: "#aaa" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: { backgroundColor: "#fff", borderRadius: 16, padding: 20 },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  starInputRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  textInput: {
    height: 100,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  cancelBtn: {
    flex: 1,
    padding: 15,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
  },
  submitBtn: {
    flex: 1,
    padding: 15,
    backgroundColor: "#FF2D78",
    borderRadius: 8,
    alignItems: "center",
  },
  btnTextBlack: { color: "#333", fontWeight: "bold" },
  btnTextWhite: { color: "#fff", fontWeight: "bold" },
});
