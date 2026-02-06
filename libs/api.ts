import Constants from "expo-constants";

// API 기본 URL - Docker 외부 환경변수에서 주입 (원격 서버의 docker-compose.yml 참고)
const BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl || "http://localhost:8080/api";

// 공통 fetch 래퍼 함수 (에러 처리 및 JSON 변환)
const fetchClient = async (endpoint: string, options?: RequestInit) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        // 필요 시 토큰 추가: Authorization: `Bearer ${token}`
      },
      ...options,
    });

    const json = await response.json();

    return json;
  } catch (error) {
    console.error(`API Error (${BASE_URL}${endpoint}):`, error);
    throw error;
  }
};

// --- 도메인별 API 함수들 ---

export const ProductApi = {
  // 상품 상세 조회
  getDetail: (id: string | string[]) => fetchClient(`/products/${id}`),
  // 상품 목록 조회
  getList: (page = 0, size = 20) =>
    fetchClient(`/products?page=${page}&size=${size}`),
};

export const ReviewApi = {
  // 리뷰 목록 조회
  getList: (productId: string | string[], page = 0, size = 10) =>
    fetchClient(`/reviews?productId=${productId}&page=${page}&size=${size}`),

  // 리뷰 등록
  create: (
    productId: string | string[],
    data: { name: string; content: string; rating: number },
  ) =>
    fetchClient(`/reviews?productId=${productId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const BookmarkApi = {
  // 북마크 상태 확인
  getStatus: (userId: number, productId: string | string[]) =>
    fetchClient(`/bookmarks/status?userId=${userId}&productId=${productId}`),

  // 북마크 토글 (등록/해제)
  toggle: (userId: number, productId: string | string[]) =>
    fetchClient(`/bookmarks/toggle?userId=${userId}&productId=${productId}`, {
      method: "POST",
    }),
};
