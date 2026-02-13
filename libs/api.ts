import Constants from "expo-constants";
import { Platform } from "react-native";
import { getToken } from "../hooks/useToken";

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
const fetchClient = async <T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> => {
  try {
    const token = await getToken();

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options?.headers || {}),
      },
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
      return parsedBody as T;
    }

    return { success: true, data: parsedBody } as T;
  } catch (error) {
    console.error(`API Error (${BASE_URL}${endpoint}):`, error);
    throw error;
  }
};

// --- API 응답 타입 정의 ---

interface LoginResponse {
  success: boolean;
  message?: string;
  data: {
    accessToken: string;
  };
}

interface SignUpResponse {
  success: boolean;
  message?: string;
  data: {
    userId: string;
  };
}

interface SurveyResponse {
  success: boolean;
  message?: string;
}

interface PasswordUpdateResponse {
  success: boolean;
  message?: string;
}

interface UserProfileResponse {
  success: boolean;
  message?: string;
  data: {
    userId: string;
    email: string;
    name: string;
    concerns: string[];
    sensitivity: string;
    skinType: string;
    feelingAfterWash?: string;
    afternoonSkin?: string;
    poreSize?: string;
  };
}

export interface Ingredient {
  name: string;
  isHarmful: boolean;
  isCaution: boolean;
  isAllergy: boolean;
  division?: string;
  effectiveness?: string;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  price?: number;
  imageUrl?: string;
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

interface ProductDetailResponse {
  success: boolean;
  message?: string;
  data: Product & {
    ingredients?: Ingredient[];
  };
}

interface ProductListResponse {
  success: boolean;
  message?: string;
  data: {
    content: Product[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

interface ReviewListResponse {
  success: boolean;
  message?: string;
  data: {
    content: {
      id: string;
      name: string;
      content: string;
      rating: number;
      createdAt?: string;
      [key: string]: unknown;
    }[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

interface ReviewCreateResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    [key: string]: unknown;
  };
}

interface BookmarkStatusResponse {
  success: boolean;
  message?: string;
  data: {
    isBookmarked: boolean;
    [key: string]: unknown;
  };
}

interface BookmarkToggleResponse {
  success: boolean;
  message?: string;
  data?: {
    isBookmarked: boolean;
    [key: string]: unknown;
  };
}

export interface Category {
  id: number;
  name: string;
  cateCode?: string;
}

interface CategoryListResponse {
  success: boolean;
  message?: string;
  data: Category[];
}

// --- 도메인별 API 함수들 ---

export const ProductApi = {
  // 상품 상세 조회
  getDetail: (id: string | string[]) => 
    fetchClient<ProductDetailResponse>(`/products/${id}`),
  // 상품 목록 조회 (카테고리 필터 추가)
  getList: (page = 0, size = 20, categoryId?: number | null) => {
    let url = `/products?page=${page}&size=${size}`;
    if (categoryId) {
      url += `&categoryId=${categoryId}`;
    }
    return fetchClient<ProductListResponse>(url);
  },
  // 카테고리 목록 조회
  getCategories: () => 
    fetchClient<CategoryListResponse>('/products/categories'),
};

export const ReviewApi = {
  // 리뷰 목록 조회
  getList: (productId: string | string[], page = 0, size = 10) =>
    fetchClient<ReviewListResponse>(
      `/reviews?productId=${productId}&page=${page}&size=${size}`
    ),

  // 리뷰 등록
  create: (
    productId: string | string[],
    data: { name: string; content: string; rating: number },
  ) =>
    fetchClient<ReviewCreateResponse>(`/reviews?productId=${productId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const BookmarkApi = {
  // 북마크 상태 확인
  getStatus: (userId: number, productId: string | string[]) =>
    fetchClient<BookmarkStatusResponse>(
      `/bookmarks/status?userId=${userId}&productId=${productId}`
    ),

  // 북마크 토글 (등록/해제)
  toggle: (userId: number, productId: string | string[]) =>
    fetchClient<BookmarkToggleResponse>(
      `/bookmarks/toggle?userId=${userId}&productId=${productId}`,
      {
        method: "POST",
      }
    ),
};

export const AuthApi = {
  // 로그인
  createLogin: (data: { userId: string; password: string }) =>
    fetchClient<LoginResponse>(`/auth/login`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // 회원가입
  createSign: (data: {
    userId: string;
    email: string;
    name: string;
    password: string;
  }) =>
    fetchClient<SignUpResponse>(`/auth/signup`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // 설문조사
  createSurvey: (data: {
    userId: string;
    concerns: string[];
    sensitivity: string;
    skinType: string;
    feelingAfterWash?: string;
    afternoonSkin?: string;
    poreSize?: string;
  }) =>
    fetchClient<SurveyResponse>("/auth/survey", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // 비밀번호 업데이트
  updatePassword: (data: { password: string }) =>
    fetchClient<PasswordUpdateResponse>("/auth/pwdUpdate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // 프로필
  getProfile: () =>
    fetchClient<UserProfileResponse>("/auth/profile", {
      method: "GET",
    }),
};