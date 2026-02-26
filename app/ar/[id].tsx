import React from "react";
import { useLocalSearchParams } from "expo-router";
import ARMakeupScreen from "../../screens/ar/ARMakeupScreen";

export default function ARScreen() {
  const { id } = useLocalSearchParams();
  
  // id가 없을 경우를 대비한 안전한 처리
  const productId = Array.isArray(id) ? id[0] : id;
  
  if (!productId) return null;

  return <ARMakeupScreen productId={productId} />;
}
