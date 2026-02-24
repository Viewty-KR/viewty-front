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
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ProductApi, ReviewApi, BookmarkApi, BASE_URL } from "../../libs/api";
import {
  analyzeIngredients,
  IngredientAnalysisResult,
} from "./ingredientUtils";
import { getToken } from "../../hooks/useToken";
import { jwtDecode } from "jwt-decode";
import { ErrorModal } from "../../components/ErrorModal";

// 안드로이드 애니메이션 활성화
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- [타입 정의] ---
interface Ingredient {
  name: string;
  isHarmful: boolean;
  division?: string;
  isCaution?: boolean;
  isAllergy?: boolean;
}

interface ProductOption {
  id: number;
  optionName: string;
  price: number;
}

interface ProductDetail {
  id: number;
  name: string;
  price: number;
  manufacturer: string;
  ingredients: Ingredient[];
  harmfulIngredientCount: number;
  options?: ProductOption[]; // [추가] 옵션 목록
  img_url?: string;
  imgUrl?: string;
  // 상세 정보
  capacity?: string;
  specifications?: string;
  expiryDate?: string;
  usageMethod?: string;
  country?: string;
  isFunctional?: string;
  precautions?: string;
  qa?: string;
  csNumber?: string;
  deliveryFee?: string;
  deliveryJejuFee?: string;
  allIngredients?: string;
}

interface Review {
  id: number;
  userId?: string | number;
  name: string;
  content: string;
  rating: number;
  createdAt: string;
}

// --- [컴포넌트] 아코디언 섹션 ---
const ExpandableSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };
  return (
    <View style={styles.expandableContainer}>
      <TouchableOpacity
        style={styles.expandableHeader}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={styles.expandableTitle}>{title}</Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#888"
        />
      </TouchableOpacity>
      {expanded && <View style={styles.expandableContent}>{children}</View>}
    </View>
  );
};

// --- [컴포넌트] 정보 행 ---
const InfoRow = ({ label, value }: { label: string; value?: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || "-"}</Text>
  </View>
);

// --- [컴포넌트] 성분 그래프 (화해 스타일) ---
const CompositionBar = ({ result }: { result: IngredientAnalysisResult }) => {
  if (result.totalCount === 0) return null;
  const { safeCount, warningCount, dangerCount } = result;

  return (
    <View style={styles.compositionContainer}>
      <View style={styles.compositionLabels}>
        <Text style={styles.compLabel}>
          전체 성분 <Text style={styles.compValue}>{result.totalCount}</Text>
        </Text>

        {safeCount > 0 && (
          <View style={[styles.compBadge, { backgroundColor: "#E8F5E9" }]}>
            <Text style={[styles.compBadgeText, { color: "#2E7D32" }]}>
              안전 {safeCount}
            </Text>
          </View>
        )}
        {warningCount > 0 && (
          <View style={[styles.compBadge, { backgroundColor: "#FFF8E1" }]}>
            <Text style={[styles.compBadgeText, { color: "#FBC02D" }]}>
              주의 {warningCount}
            </Text>
          </View>
        )}
        {dangerCount > 0 && (
          <View style={[styles.compBadge, { backgroundColor: "#FFEBEE" }]}>
            <Text style={[styles.compBadgeText, { color: "#C62828" }]}>
              위험 {dangerCount}
            </Text>
          </View>
        )}
      </View>

      {/* 컬러 바 그래프 */}
      <View style={styles.graphBar}>
        {safeCount > 0 && (
          <View
            style={{
              flex: safeCount,
              backgroundColor: "#4CAF50",
              height: "100%",
            }}
          />
        )}
        {warningCount > 0 && (
          <View
            style={{
              flex: warningCount,
              backgroundColor: "#FFCA28",
              height: "100%",
            }}
          />
        )}
        {dangerCount > 0 && (
          <View
            style={{
              flex: dangerCount,
              backgroundColor: "#EF5350",
              height: "100%",
            }}
          />
        )}
      </View>
    </View>
  );
};

// --- [컴포넌트] 주의 성분 리스트 아이템 ---
const AlertRow = ({
  title,
  count,
  color,
}: {
  title: string;
  count: number;
  color: string;
}) => (
  <View style={styles.alertRow}>
    <View style={styles.alertLeft}>
      <Ionicons name="water" size={18} color={color} />
      <Text style={styles.alertTitle}>{title}</Text>
    </View>
    <Text style={[styles.alertCount, { color: count > 0 ? "#333" : "#ccc" }]}>
      {count}개
    </Text>
  </View>
);

// --- [컴포넌트] 목적별 성분 행 ---
const PurposeRow = ({
  title,
  list,
  icon,
  color,
}: {
  title: string;
  list: string[];
  icon: any;
  color: string;
}) => {
  if (!list || list.length === 0) return null;
  return (
    <View style={styles.purposeRow}>
      <View
        style={[styles.purposeIconContainer, { backgroundColor: color + "15" }]}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.purposeTextContainer}>
        <Text style={[styles.purposeTitle, { color: color }]}>{title}</Text>
        <Text style={styles.purposeListText}>{list.join(", ")}</Text>
      </View>
    </View>
  );
};

// =========================================================================
// 메인 스크린
// =========================================================================
export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const productId =
    typeof id === "string" ? id : Array.isArray(id) ? id[0] : undefined;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<IngredientAnalysisResult | null>(
    null,
  );

  // 리뷰 모달
  const [modalVisible, setModalVisible] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [reviewContent, setReviewContent] = useState("");
  const [rating, setRating] = useState(5);

  const [currentUserId, setCurrentUserId] = useState<string | number | null>(
    null,
  );

  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title?: string;
    message: string;
    type: "confirm" | "alert" | "error";
    onConfirm: () => void;
  }>({
    visible: false,
    message: "",
    type: "alert",
    onConfirm: () => {},
  });

  const showAppModal = (
    message: string,
    type: "confirm" | "alert" | "error" = "alert",
    onConfirm: () => void = () =>
      setModalConfig((prev) => ({ ...prev, visible: false })),
    title?: string,
  ) => {
    setModalConfig({
      visible: true,
      message,
      type,
      onConfirm,
      title,
    });
  };

  const DEFAULT_USER_NAME = "익명";

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetchData(productId);
  }, [productId]);

  const fetchData = async (targetId: string) => {
    try {
      const token = await getToken();
      let userId: string | number | null = null;
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          userId = decoded.sub || decoded.userId || decoded.id;
          setCurrentUserId(userId);
        } catch (e) {
          console.error("Token decode error:", e);
        }
      }

      const requests: any[] = [
        ProductApi.getDetail(targetId),
        ReviewApi.getList(targetId),
      ];

      if (userId) {
        requests.push(BookmarkApi.getStatus(userId as any, targetId));
      }

      const results = await Promise.all(requests);
      const prodRes = results[0];
      const reviewRes = results[1];
      const markRes = userId ? results[2] : null;

      if (prodRes.success) {
        const raw = (prodRes.data ?? {}) as Record<string, unknown>;
        const rawImage =
          (raw["imgUrl"] as string | undefined) ??
          (raw["img_url"] as string | undefined) ??
          (raw["imageUrl"] as string | undefined) ??
          (raw["image"] as string | undefined) ??
          (raw["thumbnailUrl"] as string | undefined);

        const productData = raw as unknown as ProductDetail;

        setProduct({
          ...productData,
          imgUrl: rawImage,
          img_url: rawImage,
        });

        // [성분 분석 실행]
        if (productData.ingredients) {
          const analyzed = analyzeIngredients(productData.ingredients);
          setAnalysis(analyzed);
        }
      }

      if (markRes && markRes.success) {
        const bookmarkData = markRes.data as unknown as { bookmarked: boolean };
        setIsBookmarked(bookmarkData.bookmarked);
      }

      if (reviewRes.success) {
        const pageData = reviewRes.data as unknown as { content: any[] };
        if (pageData && Array.isArray(pageData.content)) {
          const mappedReviews: Review[] = pageData.content.map((item: any) => ({
            id: item.id,
            userId: item.userId,
            name: item.name,
            content: item.content,
            rating: item.rating,
            createdAt: item.createdAt,
          }));
          setReviews(mappedReviews);
        } else {
          setReviews([]);
        }
      }
    } catch (error) {
      console.error("로딩 실패:", error);
      showAppModal("데이터를 불러오는 중 문제가 발생했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getSafeImageUrl = (url?: string) => {
    if (!url) return "https://via.placeholder.com/300?text=No+Image";
    return url.startsWith("http") || url.startsWith("/")
      ? url.startsWith("/")
        ? `${BASE_URL}${url}`
        : url
      : `${BASE_URL}/${url}`;
  };

  const toggleBookmark = async () => {
    if (!productId || !currentUserId) {
      showAppModal("로그인이 필요한 서비스입니다.");
      return;
    }
    try {
      const res = await BookmarkApi.toggle(currentUserId as any, productId);
      if (res.success) setIsBookmarked(!isBookmarked);
    } catch (error) {
      showAppModal("북마크 변경 실패", "error");
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setReviewContent(review.content);
    setRating(review.rating);
    setModalVisible(true);
  };

  const handleDeleteReview = (reviewId: number) => {
    showAppModal(
      "리뷰를 삭제하시겠습니까?",
      "confirm",
      async () => {
        setModalConfig((prev) => ({ ...prev, visible: false }));
        try {
          const res = await ReviewApi.delete(reviewId);
          if (res.success) {
            showAppModal("리뷰가 삭제되었습니다.");
            if (productId) fetchData(productId);
          }
        } catch (error) {
          console.error("리뷰 삭제 에러:", error);
          showAppModal("리뷰 삭제가 실패했습니다.");
        }
      },
      "삭제 확인",
    );
  };

  const submitReview = async () => {
    if (!productId) return;
    const trimmedContent = reviewContent.trim();
    if (!trimmedContent) {
      return showAppModal("리뷰 내용을 입력해주세요.");
    }
    if (trimmedContent.length < 3) {
      return showAppModal("리뷰 내용을 3글자 이상 입력해주세요.");
    }
    try {
      let res;
      if (editingReviewId) {
        res = await ReviewApi.update(editingReviewId, {
          content: reviewContent,
          rating: rating,
        });
      } else {
        res = await ReviewApi.create(productId, {
          name: DEFAULT_USER_NAME,
          content: reviewContent,
          rating: rating,
        });
      }

      if (res.success) {
        showAppModal(
          editingReviewId
            ? "리뷰가 수정되었습니다."
            : "리뷰가 등록되었습니다.",
        );
        setModalVisible(false);
        setEditingReviewId(null);
        setReviewContent("");
        setRating(5);
        fetchData(productId); // 리뷰 목록 새로고침
      }
    } catch (error) {
      showAppModal(
        editingReviewId ? "리뷰 수정에 실패했습니다." : "리뷰 등록에 실패했습니다.",
        "error",
      );
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF2D78" />
      </View>
    );
  if (!product)
    return (
      <View style={styles.center}>
        <Text>정보를 찾을 수 없습니다.</Text>
      </View>
    );

  const finalImageUrl = getSafeImageUrl(product.imgUrl || product.img_url);
  const averageRating = getAverageRating();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen
        options={{ title: product.name, headerBackTitle: "Back" }}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: finalImageUrl }}
            style={styles.productImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.brandName}>{product.manufacturer}</Text>
          <Text style={styles.productName}>{product.name}</Text>

          {/* [추가] 화해 스타일 옵션 선택 바 */}
          {product.options && product.options.length > 1 && (
            <View style={styles.optionSelectorContainer}>
              <Text style={styles.optionLabel}>
                옵션 ({product.options.length}개)
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.optionScroll}
              >
                {product.options.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.optionChip,
                      product.id === opt.id && styles.optionChipActive,
                    ]}
                    onPress={() => router.push(`/product/${opt.id}`)}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        product.id === opt.id && styles.optionChipTextActive,
                      ]}
                    >
                      {opt.optionName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {product.price ? product.price.toLocaleString() : 0}원
            </Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>
                {averageRating} ({reviews.length})
              </Text>
            </View>
          </View>
          {currentUserId && (
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
                style={{
                  color: isBookmarked ? "#FF2D78" : "#888",
                  marginTop: 4,
                }}
              >
                {isBookmarked ? "찜 취소" : "찜하기"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.divider} />

        {/* 상세 정보 (아코디언) */}
        <View style={styles.infoSectionContainer}>
          <ExpandableSection title="상품정보 제공고시">
            <InfoRow label="용량/중량" value={product.capacity} />
            <InfoRow label="주요사양" value={product.specifications} />
            <InfoRow label="사용기한" value={product.expiryDate} />
            <InfoRow label="제조국" value={product.country} />
            <InfoRow label="제조업자" value={product.manufacturer} />
            <InfoRow label="기능성여부" value={product.isFunctional} />
            <View style={{ marginTop: 15 }}>
              <Text style={styles.infoLabel}>전성분</Text>
              <Text
                style={[styles.infoValue, { marginTop: 5, lineHeight: 20 }]}
              >
                {product.allIngredients || "전성분 정보가 없습니다."}
              </Text>
            </View>
          </ExpandableSection>

          <ExpandableSection title="사용법 및 주의사항">
            <View style={styles.longTextContainer}>
              <Text style={styles.longTextLabel}>[사용방법]</Text>
              <Text style={styles.longTextValue}>
                {product.usageMethod || "정보 없음"}
              </Text>
            </View>
            <View style={[styles.longTextContainer, { marginTop: 15 }]}>
              <Text style={[styles.longTextLabel, { color: "#D32F2F" }]}>
                [주의사항]
              </Text>
              <Text style={styles.longTextValue}>
                {product.precautions || "정보 없음"}
              </Text>
            </View>
          </ExpandableSection>

          <ExpandableSection title="배송/교환/반품 안내">
            <InfoRow label="배송비" value={product.deliveryFee} />
            <View style={{ paddingVertical: 10 }}>
              <Text style={styles.infoDesc}>
                단순 변심 반품 시 배송비는 고객 부담입니다.
              </Text>
            </View>
          </ExpandableSection>
        </View>

        <View style={styles.divider} />

        {/* 성분 분석 (개선됨) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>성분 구성</Text>

          {analysis ? (
            <>
              <CompositionBar result={analysis} />
              <View style={styles.dividerThin} />

              <Text
                style={[styles.sectionTitle, { fontSize: 16, marginTop: 20 }]}
              >
                주의 성분 분석
              </Text>

              <View style={styles.alertContainer}>
                {/* 20가지 주의 성분 */}
                <AlertRow
                  title="20가지 주의성분"
                  count={analysis.caution20List.length}
                  color={
                    analysis.caution20List.length > 0 ? "#FF5252" : "#E0E0E0"
                  }
                />
                {analysis.caution20List.length > 0 && (
                  <Text style={styles.alertDetailText}>
                    {analysis.caution20List.join(", ")}
                  </Text>
                )}

                {/* 알레르기 주의 성분 */}
                <AlertRow
                  title="알레르기 주의성분"
                  count={analysis.allergyList.length}
                  color={
                    analysis.allergyList.length > 0 ? "#FF5252" : "#E0E0E0"
                  }
                />
                {analysis.allergyList.length > 0 && (
                  <Text style={styles.alertDetailText}>
                    {analysis.allergyList.join(", ")}
                  </Text>
                )}

                {/* 식약처 규제 성분 */}
                {analysis.dangerCount > 0 && (
                  <>
                    <AlertRow
                      title="식약처 규제 성분 (배합금지/한도)"
                      count={analysis.dangerCount}
                      color="#D32F2F"
                    />
                    <View style={styles.harmfulListContainer}>
                      {product.ingredients
                        .filter((i) => i.isHarmful)
                        .map((ing, idx) => (
                          <View key={idx} style={styles.harmfulItem}>
                            <Text style={styles.harmfulName}>{ing.name}</Text>
                            <Text style={styles.harmfulReason}>
                              {ing.division || "규제"}
                            </Text>
                          </View>
                        ))}
                    </View>
                  </>
                )}

                <View style={styles.dividerThin} />
                <Text
                  style={[styles.sectionTitle, { fontSize: 16, marginTop: 10 }]}
                >
                  목적별 성분
                </Text>

                <PurposeRow
                  title="피부 보습"
                  list={analysis.moisturizingList}
                  icon="water"
                  color="#2196F3"
                />
                <PurposeRow
                  title="수렴 진정"
                  list={analysis.soothingList}
                  icon="leaf"
                  color="#4CAF50"
                />
                <PurposeRow
                  title="피부 보호"
                  list={analysis.protectionList}
                  icon="shield-checkmark"
                  color="#9C27B0"
                />
                <PurposeRow
                  title="피부 미백"
                  list={analysis.brighteningList}
                  icon="sunny"
                  color="#FF9800"
                />
              </View>
            </>
          ) : (
            <Text style={{ color: "#888", marginTop: 10 }}>분석 정보 없음</Text>
          )}
        </View>

        <View style={styles.divider} />

        {/* 리뷰 섹션 */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>리뷰 ({reviews.length})</Text>
            {currentUserId && (
              <TouchableOpacity
                onPress={() => {
                  setEditingReviewId(null);
                  setReviewContent("");
                  setRating(5);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.writeReviewText}>리뷰 쓰기</Text>
              </TouchableOpacity>
            )}
          </View>
          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                  <Text style={styles.reviewerName}>{review.name}</Text>
                  <Text style={styles.reviewerName}></Text>
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
                {review.userId === currentUserId && (
                  <View style={styles.reviewActions}>
                    <TouchableOpacity
                      onPress={() => handleEditReview(review)}
                      style={styles.actionBtn}
                    >
                      <Text style={styles.actionBtnText}>수정</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteReview(review.id)}
                      style={styles.actionBtn}
                    >
                      <Text
                        style={[styles.actionBtnText, { color: "#FF5252" }]}
                      >
                        삭제
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <Text style={styles.reviewContent}>{review.content}</Text>
              <Text style={styles.reviewDate}>
                {new Date(review.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 리뷰 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingReviewId ? "리뷰 수정" : "리뷰 작성"}
            </Text>
            <View style={styles.starInputRow}>
              {[1, 2, 3, 4, 5].map((val) => (
                <TouchableOpacity key={val} onPress={() => setRating(val)}>
                  <Ionicons
                    name={val <= rating ? "star" : "star-outline"}
                    size={32}
                    color="#FFD700"
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="내용 입력"
              multiline
              value={reviewContent}
              onChangeText={setReviewContent}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setModalVisible(false);
                  setEditingReviewId(null);
                }}
              >
                <Text>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={submitReview}>
                <Text style={{ color: "#fff" }}>
                  {editingReviewId ? "수정" : "등록"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

                  <ErrorModal
                    visible={modalConfig.visible}
                    title={modalConfig.title}
                    message={modalConfig.message}
                    type={modalConfig.type}
                    onRetry={modalConfig.onConfirm}
                    onClose={() =>
                      setModalConfig((prev) => ({ ...prev, visible: false }))
                    }
                  />    </SafeAreaView>
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

  // 옵션 선택기
  optionSelectorContainer: {
    marginVertical: 15,
    padding: 12,
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
  },
  optionLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    fontWeight: "600",
  },
  optionScroll: {
    flexDirection: "row",
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#DDD",
    marginRight: 8,
  },
  optionChipActive: {
    backgroundColor: "#FF2D78",
    borderColor: "#FF2D78",
  },
  optionChipText: {
    fontSize: 12,
    color: "#666",
  },
  optionChipTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },

  priceRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  price: { fontSize: 20, fontWeight: "600", color: "#FF2D78", marginRight: 10 },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: { fontWeight: "bold", marginLeft: 4, color: "#333" },
  bookmarkButton: {
    position: "absolute",
    right: 20,
    top: 20,
    alignItems: "center",
  },
  divider: { height: 8, backgroundColor: "#F4F4F4" },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },

  // 아코디언 등
  infoSectionContainer: { backgroundColor: "#fff" },
  expandableContainer: { borderBottomWidth: 1, borderBottomColor: "#eee" },
  expandableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  expandableTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  expandableContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#fdfdfd",
  },
  infoRow: { flexDirection: "row", marginBottom: 8 },
  infoLabel: { width: 100, fontSize: 14, color: "#888", fontWeight: "500" },
  infoValue: { flex: 1, fontSize: 14, color: "#333" },
  longTextContainer: { marginBottom: 10 },
  longTextLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  longTextValue: { fontSize: 14, color: "#555", lineHeight: 20 },
  infoDesc: { fontSize: 13, color: "#666", lineHeight: 18 },

  // 성분 분석 그래프
  compositionContainer: { marginTop: 10, marginBottom: 20 },
  compositionLabels: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    flexWrap: "wrap",
  },
  compLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 10,
    color: "#333",
  },
  compValue: { color: "#666", fontWeight: "normal" },
  compBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  compBadgeText: { fontSize: 11, fontWeight: "bold" },
  graphBar: {
    flexDirection: "row",
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    backgroundColor: "#F0F0F0",
    width: "100%",
  },

  dividerThin: { height: 1, backgroundColor: "#EEE", marginVertical: 10 },
  alertContainer: { marginTop: 10 },
  alertRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  alertLeft: { flexDirection: "row", alignItems: "center" },
  alertTitle: { fontSize: 14, color: "#555", marginLeft: 8 },
  alertCount: { fontSize: 14, fontWeight: "bold" },
  alertDetailText: {
    fontSize: 12,
    color: "#888",
    paddingLeft: 26,
    paddingBottom: 10,
    lineHeight: 18,
  },

  harmfulListContainer: {
    marginTop: 15,
    backgroundColor: "#FFF0F0",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  harmfulItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  harmfulName: { fontSize: 14, color: "#333" },
  harmfulReason: { fontSize: 14, color: "#D32F2F", fontWeight: "600" },

  // 목적별 성분
  purposeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
    paddingVertical: 5,
  },
  purposeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  purposeTextContainer: {
    flex: 1,
  },
  purposeTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  purposeListText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },

  // 리뷰 등
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
  reviewerInfo: { flex: 1 },
  reviewActions: { flexDirection: "row", alignItems: "center" },
  actionBtn: { marginLeft: 12, paddingVertical: 4 },
  actionBtnText: { fontSize: 13, color: "#888", fontWeight: "500" },
  starRow: { flexDirection: "row", marginTop: 2 },
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
});
