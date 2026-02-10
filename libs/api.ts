import { Platform } from "react-native";
import Constants from "expo-constants";
// [추가됨] 토큰 저장을 위한 라이브러리 import
import AsyncStorage from "@react-native-async-storage/async-storage";

// [추가됨] 토큰 저장소 키 이름 (오타 방지용 상수)
const TOKEN_KEY = "accessToken";

// [추가됨] 토큰 가져오기 함수 (이게 없어서 에러가 났던 것입니다)
const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("토큰 로드 실패:", error);
    return null;
  }
};

// [추가됨] 토큰 저장하기 함수 (로그인 성공 시 사용)
export const setToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error("토큰 저장 실패:", error);
  }
};

// [추가됨] 토큰 삭제하기 함수 (로그아웃 시 사용)
export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error("토큰 삭제 실패:", error);
  }
};

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
    // [수정됨] 위에서 정의한 getToken 함수를 사용하여 토큰을 가져옵니다.
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
      body: JSON.stringify(data),
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