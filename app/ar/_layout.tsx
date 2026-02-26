import { Stack } from "expo-router";

/**
 * AR 화면 레이아웃
 */
export default function ARLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  );
}
