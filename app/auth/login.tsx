import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { AuthApi } from "../../libs/api";
import { getToken, removeToken, setToken } from "../../hooks/useToken";
import { ErrorModal } from "../../components/ErrorModal";

export default function LoginScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    id: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userToken = await getToken();
        if (userToken) {
          console.log("Existing token found:", userToken);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("토큰을 가져오는 중 오류 발생:", error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const handleLogin = async () => {
    if (!formData.id) {
      setErrorMessage("아이디를 입력해주세요.");
      setModalVisible(true);
      return;
    }
    if (!formData.password) {
      setErrorMessage("비밀번호를 입력해주세요.");
      setModalVisible(true);
      return;
    }

    setLoading(true);

    try {
      const responseData = await AuthApi.createLogin({
        userId: formData.id,
        password: formData.password,
      });

      if (responseData.success) {
        const { accessToken } = responseData.data;
        await setToken(accessToken);
        setIsLoggedIn(true);
        router.push("/");
      } else {
        const messageToShow =
          responseData.message || "아이디 또는 비밀번호가 잘못되었습니다.";
        setErrorMessage(messageToShow);
        setModalVisible(true);
        setIsLoggedIn(false);
      }
    } catch (error: any) {
      console.error(error);
      const messageToShow =
        error.message || "네트워크 오류가 발생했습니다. 다시 시도해주세요.";
      setErrorMessage(messageToShow);
      setModalVisible(true);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await removeToken();
      setErrorMessage("로그아웃되었습니다.");
      setModalVisible(true);
      setIsLoggedIn(false);
    } catch (error) {
      console.error("SecureStore에서 토큰을 제거하는 중 오류 발생:", error);
      setErrorMessage("로그아웃 중 오류가 발생했습니다.");
      setModalVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      {isLoggedIn ? (
        <>
          <Text style={styles.title}>로그아웃</Text>
          <Text style={styles.subtitle}>이미 로그인되어 있습니다.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleLogout}>
            <Text style={styles.primaryButtonText}>로그아웃</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Viewty</Text>
          <Text style={styles.subtitle}>로그인하여 맞춤 추천을 받아보세요</Text>

          <TextInput
            style={styles.input}
            placeholder="아이디"
            value={formData.id}
            onChangeText={(value) => handleChange("id", value)}
            autoCapitalize="none"
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={styles.input}
            placeholder="비밀번호"
            value={formData.password}
            onChangeText={(value) => handleChange("password", value)}
            secureTextEntry
            placeholderTextColor="#aaa"
          />

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#FF2D78"
              style={{ marginTop: 10 }}
            />
          ) : (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleLogin}
            >
              <Text style={styles.primaryButtonText}>로그인</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => router.push("/auth/signup")}>
            <Text style={styles.signupLink}>
              계정이 없으신가요?{" "}
              <Text style={styles.signupTextBold}>회원가입</Text>
            </Text>
          </TouchableOpacity>
        </>
      )}
      <ErrorModal
        visible={modalVisible}
        type="alert"
        icon="alert-circle"
        title="알림"
        message={errorMessage}
        onRetry={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: "#FF2D78",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    height: 50,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#fafafa",
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: "#FF2D78",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupLink: {
    marginTop: 24,
    textAlign: "center",
    color: "#666",
    fontSize: 14,
  },
  signupTextBold: {
    fontWeight: "bold",
    color: "#FF2D78",
  },
});
