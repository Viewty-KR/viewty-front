// screens/product/[id].utils.ts
import { useState, useEffect } from "react";
import { ProductApi, ReviewApi, BookmarkApi, BASE_URL } from "../../libs/api";
// 경로 주의: ingredientUtils가 app/product/ 에 있다면 아래 경로를 사용합니다.
import {
  analyzeIngredients,
  IngredientAnalysisResult,
} from "../../app/product/ingredientUtils";
import { getToken } from "../../hooks/useToken";
import { jwtDecode } from "jwt-decode";
import { ProductDetail, Review } from "./[id].types";

export const useProductDetail = (productId: string | undefined) => {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<IngredientAnalysisResult | null>(
    null,
  );
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

  // 리뷰 모달 관련 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [reviewContent, setReviewContent] = useState("");
  const [rating, setRating] = useState(5);

  const [currentUserId, setCurrentUserId] = useState<string | number | null>(
    null,
  );

  // 공통 모달 관련 상태
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
    onConfirm?: () => void,
    title?: string,
  ) => {
    setModalConfig({
      visible: true,
      message,
      type,
      onConfirm: () => {
        setModalConfig((prev) => ({ ...prev, visible: false }));
        if (onConfirm) onConfirm();
      },
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
          editingReviewId ? "리뷰가 수정되었습니다." : "리뷰가 등록되었습니다.",
        );
        setModalVisible(false);
        setEditingReviewId(null);
        setReviewContent("");
        setRating(5);
        fetchData(productId);
      }
    } catch (error) {
      showAppModal(
        editingReviewId
          ? "리뷰 수정에 실패했습니다."
          : "리뷰 등록에 실패했습니다.",
        "error",
      );
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  return {
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
  };
};
