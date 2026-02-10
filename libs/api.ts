import { Platform } from "react-native";
import Constants from "expo-constants";

// API 기본 URL을 환경/플랫폼에 맞춰 결정한다.
const resolveBaseUrl = () => {
  const expoExtra =
    (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined) ??
    (Constants.manifest2?.extra as { apiBaseUrl?: string } | undefined);

  const configuredUrl =
    process.env.EXPO_PUBLIC_API_URL ?? expoExtra?.apiBaseUrl ?? null;

  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  if (Platform.OS === "android") return "http://10.0.2.2:8080/api";
  if (Platform.OS === "ios") return "http://localhost:8080/api";
  return "http://localhost:8080/api";
};

const BASE_URL = resolveBaseUrl();

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

    const rawBody = await response.text();
    let parsedBody: unknown = null;

    if (rawBody) {
      try {
        parsedBody = JSON.parse(rawBody);
      } catch {
        parsedBody = rawBody;
      }
    }

    if (!response.ok) {
      const errorMessage =
        (parsedBody as any)?.message || response.statusText || "Request failed";
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).data = parsedBody;
      throw error;
    }

    if (
      parsedBody &&
      typeof parsedBody === "object" &&
      "success" in (parsedBody as Record<string, unknown>)
    ) {
      return parsedBody;
    }

    return { success: true, data: parsedBody };
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
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
