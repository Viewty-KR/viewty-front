// app/product/[id].tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ErrorModal } from "../../components/ErrorModal";

// 💡 [추가] 분리된 파일들을 import
import { styles } from "../../screens/product/[id].style";
import { useProductDetail } from "../../screens/product/[id].utils";
import { IngredientAnalysisResult } from "./ingredientUtils";

// 안드로이드 애니메이션 활성화
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
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

// --- [컴포넌트] 성분 그래프 ---
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
  const { id } = useLocalSearchParams();
  const productId =
    typeof id === "string" ? id : Array.isArray(id) ? id[0] : undefined;

  // 💡 [핵심] 분리한 커스텀 훅에서 모든 상태와 함수를 가져옵니다.
  const {
    product,
    reviews,
    isBookmarked,
    loading,
    analysis,
    selectedOptionId,
    setSelectedOptionId,
    modalVisible,
    setModalVisible,
    editingReviewId,
    setEditingReviewId,
    reviewContent,
    setReviewContent,
    rating,
    setRating,
    currentUserId,
    modalConfig,
    setModalConfig,
    getSafeImageUrl,
    toggleBookmark,
    handleEditReview,
    handleDeleteReview,
    submitReview,
    getAverageRating,
  } = useProductDetail(productId);

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
        {/* 이미지 섹션 */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: finalImageUrl }}
            style={styles.productImage}
            resizeMode="contain"
          />
        </View>

        {/* 기본 정보 섹션 */}
        <View style={styles.infoContainer}>
          <Text style={styles.brandName}>{product.manufacturer}</Text>
          <Text style={styles.productName}>{product.name}</Text>

          {product?.options && product.options.length > 1 && (
            <View style={styles.optionSelectorContainer}>
              <Text style={styles.optionLabel}>
                옵션 ({product.options.length}개)
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.optionScroll}
              >
                {product.options.map((opt) => {
                  const isActive = (selectedOptionId || product?.id) === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        styles.optionChip,
                        isActive && styles.optionChipActive,
                      ]}
                      onPress={() => setSelectedOptionId(opt.id)}
                    >
                      <Text
                        style={[
                          styles.optionChipText,
                          isActive && styles.optionChipTextActive,
                        ]}
                      >
                        {opt.optionName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
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

        {/* 성분 분석 섹션 */}
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
        onClose={() => setModalConfig((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}
