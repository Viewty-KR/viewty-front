import { Ionicons } from "@expo/vector-icons";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import "react-native-reanimated";

import { isProtectedRoute, isPublicRoute } from "@/constants/routes";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);
  const [loaded] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    // 폰트가 로드되지 않았다면 아무것도 하지 않음
    if (!loaded) return;

    // 공개 경로는 인증 체크 없이 바로 준비 완료
    if (isPublicRoute(segments)) {
      setIsReady(true);
      return;
    }

    // 보호된 경로이거나 auth 그룹에 접근 시 인증 체크
    performAuthCheck();
  }, [loaded, segments]);

  const performAuthCheck = async () => {
    try {
      let token = null;
      if (Platform.OS === "web") {
        token = localStorage.getItem("userToken");
      } else {
        token = await SecureStore.getItemAsync("userToken");
      }

      const currentPath = segments.join('/');

      // 토큰이 없고 보호된 경로에 접근하려는 경우
      if (!token && isProtectedRoute(segments)) {
        router.replace("/auth/login");
      } 
      // 토큰이 있는데 로그인/회원가입 페이지에 있는 경우
      else if (token && (currentPath === "auth/login" || currentPath === "auth/signup")) {
        router.replace("/auth/profile");
      }
    } catch (e) {
      console.error("Auth Check Failed:", e);
    } finally {
      // 체크가 한 번이라도 끝나면 준비 완료 상태로 변경
      setIsReady(true);
    }
  };

  useEffect(() => {
    // 모든 준비가 끝났을 때만 스플래시 스크린 숨김
    if (loaded && isReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isReady]);

  if (!loaded || !isReady) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth" />
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", title: "Modal" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <InitialLayout />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
