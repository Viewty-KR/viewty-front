import { getToken, removeToken } from "../hooks/useToken";
import { router } from "expo-router";

// API 기본 URL (환경에 따라 변경)
// 안드로이드 에뮬레이터: "http://10.0.2.2:8081/api"
// iOS 시뮬레이터 / 웹: "http://localhost:8081/api"
import Constants from "expo-constants";

// API 기본 URL - Docker 외부 환경변수에서 주입 (원격 서버의 docker-compose.yml 참고)
const BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl || "http://localhost:8080/api";
let isRedirectingToLogin = false;

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

    if (response.status === 401) {
      await removeToken();

      if (!isRedirectingToLogin) {
        isRedirectingToLogin = true;
        router.replace("/auth/login");
      }

      throw new Error("Unauthorized");
    }

    if (response.status === 204) return null as T;

    const json = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: json?.message || "API Error",
      };
    }

    return json as T;
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
