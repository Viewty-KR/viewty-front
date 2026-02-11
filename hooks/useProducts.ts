import { useEffect, useState } from "react";
import { ProductApi } from "../libs/api";
import { LookItem, TrendingItem } from "../screens/home/index.types";
import { extractProducts, mapToLook, mapToTrending } from "../screens/home/index.utils";

interface UseProductsReturn {
  trendingItems: TrendingItem[];
  curatedLooks: LookItem[];
  errorMessage: string | null;
  loadProducts: () => Promise<void>;
  handleRetry: () => void;
  handleCloseError: () => void;
}

export const useProducts = (): UseProductsReturn => {
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [curatedLooks, setCuratedLooks] = useState<LookItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setErrorMessage(null);

      const response = await ProductApi.getList();

      // API 응답 실패 처리
      if (!response?.success) {
        setErrorMessage("상품 데이터를 불러오지 못했습니다.");
        return;
      }

      // 상품 데이터 추출 및 검증
      const rawList = extractProducts(response.data);
      if (rawList.length === 0) {
        setErrorMessage("상품 데이터를 찾을 수 없습니다.");
        return;
      }

      // 유효한 상품만 필터링
      const validProducts = rawList.filter((item) => item?.id != null);
      if (validProducts.length === 0) {
        setErrorMessage("상품 데이터를 찾을 수 없습니다.");
        return;
      }

      // 데이터 변환 및 상태 업데이트
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
    }
  };

  useEffect(() => {
    loadProducts();
     
  }, []);

  const handleRetry = () => {
    setErrorMessage(null);
    loadProducts();
  };

  const handleCloseError = () => {
    setErrorMessage(null);
  };

  return {
    trendingItems,
    curatedLooks,
    errorMessage,
    loadProducts,
    handleRetry,
    handleCloseError,
  };
};
