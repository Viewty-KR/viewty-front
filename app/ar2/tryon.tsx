// import React, { useRef, useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Platform,
  PermissionsAndroid,
  Alert,
  ActivityIndicator,
} from "react-native";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { WebView } from "react-native-webview";
// import * as FileSystem from "expo-file-system/legacy";

// const hexToRgb = (hex: string) => {
//   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
//   return result
//     ? {
//         r: parseInt(result[1], 16) / 255,
//         g: parseInt(result[2], 16) / 255,
//         b: parseInt(result[3], 16) / 255,
//         a: 0.8,
//       }
//     : { r: 1, g: 0, b: 0, a: 0.8 };
// };

// export default function TryOnScreen() {
//   const router = useRouter();
//   const params = useLocalSearchParams();
//   const webviewRef = useRef<WebView>(null);

//   const [hasPermission, setHasPermission] = useState(false);
//   const [htmlContent, setHtmlContent] = useState<string | null>(null);

//   const colorCode = Array.isArray(params.colorCode)
//     ? params.colorCode[0]
//     : params.colorCode;

//   // 🚨 [필수 확인] 발급받으신 WEB 전용 라이선스 키를 여기에 꼭 넣어주세요!!
//   const WEB_LICENSE_KEY = process.env.EXPO_PUBLIC_WEB_LICENSE_KEY || "";

//   useEffect(() => {
//     (async () => {
//       // 1. 카메라 권한 획득
//       if (Platform.OS === "android") {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.CAMERA,
//         );
//         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//           setHasPermission(true);
//         } else {
//           Alert.alert("알림", "카메라 권한이 필요합니다.");
//           return;
//         }
//       } else {
//         setHasPermission(true);
//       }

//       try {
//         // 2. 백엔드 보안 방어벽을 뚫기 위해 네이티브로 직접 다운로드! (아까 성공했던 그 방식)
//         const maskUrl = `${process.env.EXPO_PUBLIC_BASE_URL}/static/makeup2.deepar`;
//         const localUri = FileSystem.documentDirectory + "makeup2.deepar";

//         console.log("📥 1. 네이티브 다운로드 시작...", maskUrl);
//         const { uri } = await FileSystem.downloadAsync(maskUrl, localUri);

//         // 3. 💡 핵심: 다운받은 파일을 엄청나게 긴 글자(Base64)로 변환해버립니다!
//         console.log("🔄 2. 파일을 웹뷰용 텍스트로 변환 중...");
//         const base64String = await FileSystem.readAsStringAsync(uri, {
//           encoding: "base64",
//         });

//         // 4. 네트워크 요청 대신, 텍스트로 변환된 파일을 HTML 안에 직접 박아버립니다!
//         // 4. 네트워크 요청 대신, 텍스트로 변환된 파일을 HTML 안에 직접 박아버립니다!
//         const html = `
//           <!DOCTYPE html>
//           <html lang="ko">
//           <head>
//               <meta charset="UTF-8">
//               <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
//               <style>
//                   body, html { margin: 0; padding: 0; width: 100vw; height: 100vh; overflow: hidden; background-color: #000; }
//                   /* 카메라가 뷰포트를 꽉 채우도록 유지합니다 */
//                   #deepar-canvas { width: 100vw; height: 100vh; object-fit: cover; }
//               </style>
//               <script src="https://cdn.jsdelivr.net/npm/deepar/js/deepar.js"></script>
//           </head>
//           <body>
//               <canvas id="deepar-canvas"></canvas>
//               <script>
//                   const canvas = document.getElementById('deepar-canvas');

//                   // 💡 [화질 개선 1] 스마트폰 화면 배율(Retina)에 맞춰 캔버스 내부 해상도를 초고화질로 뻥튀기합니다!
//                   const dpr = window.devicePixelRatio || 1;
//                   canvas.width = window.innerWidth * dpr;
//                   canvas.height = window.innerHeight * dpr;

//                   let deepAR = null;
//                   (async function() {
//                       try {
//                           deepAR = await deepar.initialize({
//                               licenseKey: '${WEB_LICENSE_KEY}',
//                               canvas: canvas,
//                               deeparWasmPath: 'https://cdn.jsdelivr.net/npm/deepar/wasm/deepar.wasm',
//                               effect: 'data:application/octet-stream;base64,${base64String}',

//                               // 💡 [화질 개선 2] 엔진에 스마트폰 "세로 방향(Portrait)"의 고해상도 카메라를 명시적으로 요구합니다!
//                               additionalOptions: {
//                                   cameraConfig: {
//                                       facingMode: 'user',
//                                       mediaStreamConstraints: {
//                                           video: {
//                                               facingMode: "user",
//                                               width: { ideal: 720 },   // 세로폭
//                                               height: { ideal: 1280 }  // 가로폭 (세로로 들었으므로 역전됨)
//                                           }
//                                       }
//                                   }
//                               }
//                           });
//                           window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'INITIALIZED' }));
//                       } catch (error) {
//                           window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', message: error.message }));
//                       }
//                   })();

//                   window.addEventListener('message', function(event) {
//                       try {
//                           const data = JSON.parse(event.data);
//                           if (data.type === 'CHANGE_COLOR' && deepAR) {
//                               deepAR.changeParameterVector('Lips', 'MeshRenderer', 'color', data.color.r, data.color.g, data.color.b, data.color.a);
//                           }
//                       } catch (e) {}
//                   });
//               </script>
//           </body>
//           </html>
//         `;
//         setHtmlContent(html);
//         console.log("✅ 3. 웹뷰 HTML 세팅 완료!");
//       } catch (error) {
//         console.error("❌ 처리 중 에러 발생:", error);
//       }
//     })();
//   }, []);

//   const applyLipColor = () => {
//     if (webviewRef.current && colorCode) {
//       const rgb = hexToRgb(colorCode);
//       console.log("🎨 발색 명령 쏘기!:", rgb);
//       webviewRef.current.postMessage(
//         JSON.stringify({ type: "CHANGE_COLOR", color: rgb }),
//       );
//     }
//   };

//   const onMessage = (event: any) => {
//     try {
//       const data = JSON.parse(event.nativeEvent.data);
//       if (data.type === "INITIALIZED") {
//         console.log("🎉 웹뷰 엔진: 딥AR 카메라 로딩 완벽 성공!");
//       } else if (data.type === "ERROR") {
//         console.error("🚨 웹뷰 엔진 내부 에러:", data.message);
//       }
//     } catch (e) {}
//   };

//   if (Platform.OS === "web") {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <Text>스마트폰에서만 지원됩니다.</Text>
//       </View>
//     );
//   }

//   if (!hasPermission) {
//     return <View style={{ flex: 1, backgroundColor: "black" }} />;
//   }

//   // 💡 파일 변환이 끝날 때까지 예쁜 로딩 화면을 띄워줍니다.
//   if (!htmlContent) {
//     return (
//       <View
//         style={{
//           flex: 1,
//           backgroundColor: "black",
//           justifyContent: "center",
//           alignItems: "center",
//         }}
//       >
//         <ActivityIndicator size="large" color="#FF2D78" />
//         <Text style={{ color: "white", marginTop: 15, fontWeight: "bold" }}>
//           AR 필터 마법을 준비 중입니다... 🪄
//         </Text>
//       </View>
//     );
//   }

//   return (
//     <View style={{ flex: 1, backgroundColor: "black" }}>
//       {/* 💡 상단에 카메라를 적당한 크기(4:3 비율)로 예쁘게 잘라서 배치합니다! */}
//       <View
//         style={{
//           width: "100%",
//           aspectRatio: 3 / 4,
//           marginTop: 50,
//           borderRadius: 20,
//           overflow: "hidden",
//         }}
//       >
//         <WebView
//           ref={webviewRef}
//           source={{ html: htmlContent, baseUrl: "https://localhost" }}
//           originWhitelist={["*"]}
//           style={{ flex: 1 }}
//           allowsInlineMediaPlayback={true}
//           mediaPlaybackRequiresUserAction={false}
//           javaScriptEnabled={true}
//           onMessage={onMessage}
//         />
//       </View>

//       {/* 닫기 버튼 */}
//       <TouchableOpacity
//         style={{
//           position: "absolute",
//           top: 10,
//           left: 20,
//           padding: 10,
//           backgroundColor: "rgba(255,255,255,0.8)",
//           borderRadius: 8,
//         }}
//         onPress={() => router.back()}
//       >
//         <Text style={{ fontWeight: "bold", color: "black" }}>닫기</Text>
//       </TouchableOpacity>

//       {/* 발색 적용 버튼 (하단 빈 공간에 배치) */}
//       <TouchableOpacity
//         style={{
//           position: "absolute",
//           bottom: 50,
//           alignSelf: "center",
//           paddingVertical: 15,
//           paddingHorizontal: 30,
//           backgroundColor: "#FF2D78",
//           borderRadius: 25,
//           elevation: 5,
//         }}
//         onPress={applyLipColor}
//       >
//         <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>
//           💄 발색 적용하기
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }
export default function TryOnScreen() {
  return <View></View>;
}
