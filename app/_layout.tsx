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

    performAuthCheck();
  }, [loaded, segments[0]]); // segments 전체가 아닌 segments[0]만 감지

  const performAuthCheck = async () => {
    try {
      let token = null;
      if (Platform.OS === "web") {
        token = localStorage.getItem("userToken");
      } else {
        token = await SecureStore.getItemAsync("userToken");
      }

      const inAuthGroup = segments[0] === "auth";

      if (!token && inAuthGroup) {
        // 토큰이 없고, 인증 페이지가 아니라면 -> 로그인으로
        router.replace("/auth/login");
      } else if (token && inAuthGroup) {
        // 토큰이 있고, 로그인 페이지에 있다면 -> 프로필(메인)로
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
