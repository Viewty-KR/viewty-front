import { useEffect, useState, useCallback } from "react";
import { ProductApi, Product } from "../libs/api";
import { LookItem, TrendingItem } from "../screens/home/index.types";
import { extractProducts, mapToLook, mapToTrending } from "../screens/home/index.utils";

interface UseProductsReturn {
  products: Product[];
  categories: any[];
  trendingItems: TrendingItem[];
  curatedLooks: LookItem[];
  errorMessage: string | null;
  loading: boolean;
  selectedCategory: number | null;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  setCategory: (categoryId: number | null) => void;
  setPage: (page: number) => void;
  loadProducts: () => Promise<void>;
  loadCategories: () => Promise<void>;
  handleRetry: () => void;
  handleCloseError: () => void;
}

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [curatedLooks, setCuratedLooks] = useState<LookItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
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
      console.log("카테고리 응답 원본:", JSON.stringify(response));
      
      let categoryList = [];
      
      if (response && response.success && Array.isArray(response.data)) {
        categoryList = response.data;
      } else if (Array.isArray(response)) {
        categoryList = response;
      } else if (response && response.data && Array.isArray(response.data.content)) {
        // 혹시 페이징 처리가 되어 있을 경우 대비
        categoryList = response.data.content;
      }

      console.log("가공된 카테고리 목록 (개수):", categoryList.length);
      setCategories(categoryList);
    } catch (error) {
      console.error("카테고리 로딩 에러 상세:", error);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const response = await ProductApi.getList(currentPage, 20, selectedCategory);

      // API 응답 실패 처리
      if (!response?.success) {
        setErrorMessage("상품 데이터를 불러오지 못했습니다.");
        return;
      }

      // 상품 데이터 추출 및 검증
      const rawList = extractProducts(response.data);
      setProducts(rawList);

      // 페이지네이션 정보 업데이트
      if (response.data && typeof response.data === 'object' && 'totalPages' in response.data) {
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
  }, [currentPage, selectedCategory]); // 의존성 배열에 currentPage와 selectedCategory 추가

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]); // 메모이제이션된 loadProducts를 의존성으로 사용

  const setCategory = (id: number | null) => {
    setSelectedCategory(id);
    setCurrentPage(0); // 카테고리 변경 시 첫 페이지로 리셋
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
    curatedLooks,
    errorMessage,
    loading,
    selectedCategory,
    currentPage,
    totalPages,
    totalElements,
    setCategory,
    setPage,
    loadProducts,
    loadCategories,
    handleRetry,
    handleCloseError,
  };
};
