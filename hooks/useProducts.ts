import { useCallback, useState } from "react";
import { Product, ProductApi } from "../libs/api";
import { LookItem, TrendingItem } from "../screens/home/index.types";
import {
  extractProducts,
  mapToLook,
  mapToTrending,
} from "../screens/home/index.utils";

interface UseProductsReturn {
  products: Product[];
  categories: any[];
  trendingItems: TrendingItem[];
  recommendedItems: LookItem[];
  curatedLooks: LookItem[];
  errorMessage: string | null;
  loading: boolean;
  recommendLoading: boolean;
  selectedCategory: number | null;
  recommendSkinType: string;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  setCategory: (categoryId: number | null) => void;
  setRecommendSkinType: (skinType: string) => Promise<void>;
  setPage: (page: number) => void;
  loadProducts: () => Promise<void>;
  loadRecommendations: (skinType: string) => Promise<void>;
  loadCategories: () => Promise<void>;
  handleRetry: () => void;
  handleCloseError: () => void;
}

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [recommendedItems, setRecommendedItems] = useState<LookItem[]>([]);
  const [curatedLooks, setCuratedLooks] = useState<LookItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [recommendSkinType, setRecommendSkinTypeState] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0); // 0부터 시작 (백엔드 기준)
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  /**
   * 카테고리 목록 로드
   */
  const loadCategories = useCallback(async () => {
    try {
      console.log("카테고리 로딩 시작...");
      const response = await ProductApi.getCategories();

      let categoryList: any[] = [];

      if (response && response.success && Array.isArray(response.data)) {
        categoryList = response.data;
      } else if (Array.isArray(response)) {
        categoryList = response as any[];
      } else if (response && response.data) {
        const dataAsAny = response.data as any;
        if (Array.isArray(dataAsAny.content)) {
          categoryList = dataAsAny.content;
        }
      }

      setCategories(categoryList);
    } catch (error) {
      console.error("카테고리 로딩 에러 상세:", error);
    }
  }, []);

  /**
   * 추천 상품 로드 (독립적으로 실행 가능하도록 수정)
   */
  const loadRecommendations = useCallback(async (skinType: string) => {
    try {
      const response = await ProductApi.getRecommend(0, 20, skinType);
      if (response?.success) {
        const rawRecommend = extractProducts(response.data);
        setRecommendedItems(rawRecommend.map(mapToLook));
      }
    } catch (error) {
      console.error("추천 상품 로딩 실패:", error);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const response = await ProductApi.getList(
        currentPage,
        20,
        selectedCategory,
      );

      // API 응답 실패 처리
      if (!response?.success) {
        setErrorMessage("상품 데이터를 불러오지 못했습니다.");
        return;
      }

      // 상품 데이터 추출 및 검증
      const rawList = extractProducts(response.data);
      setProducts(rawList);

      // 페이지네이션 정보 업데이트
      if (
        response.data &&
        typeof response.data === "object" &&
        "totalPages" in response.data
      ) {
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      }

      if (rawList.length === 0) {
        setTrendingItems([]);
        setCuratedLooks([]);
        return;
      }

      // 유효한 상품만 필터링
      const validProducts = rawList.filter((item) => item?.id != null);

      // 데이터 변환 및 상태 업데이트 (홈 화면용)
      const trending = validProducts.slice(0, 5).map(mapToTrending);
      const curated = validProducts.slice(0, 8).map(mapToLook);

      setTrendingItems(trending);
      setCuratedLooks(curated);
    } catch (error) {
      console.error("상품 목록 로딩 실패:", error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "상품 데이터를 불러오지 못했습니다.";
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory]);

  const setCategory = (id: number | null) => {
    setSelectedCategory(id);
    setCurrentPage(0); // 카테고리 변경 시 첫 페이지로 리셋
  };

  const setRecommendSkinType = async (skinType: string) => {
    setRecommendSkinTypeState(skinType);
    setRecommendLoading(true);
    try {
      await loadRecommendations(skinType);
    } finally {
      setRecommendLoading(false);
    }
  };

  const setPage = (page: number) => {
    setCurrentPage(page);
  };

  const handleRetry = () => {
    setErrorMessage(null);
    loadProducts();
  };

  const handleCloseError = () => {
    setErrorMessage(null);
  };

  return {
    products,
    categories,
    trendingItems,
    recommendedItems,
    curatedLooks,
    errorMessage,
    loading,
    recommendLoading,
    selectedCategory,
    currentPage,
    totalPages,
    totalElements,
    setCategory,
    setRecommendSkinType,
    setPage,
    loadProducts,
    loadRecommendations,
    loadCategories,
    handleRetry,
    handleCloseError,
    recommendSkinType,
  };
};
