import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { AuthApi } from "../../libs/api";
import { getToken, removeToken, setToken } from "../../hooks/useToken";

export default function LoginScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    id: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    setErrorMessage("");
    if (!formData.id) {
      setErrorMessage("아이디를 입력해주세요.");
      return;
    }
    if (!formData.password) {
      setErrorMessage("비밀번호를 입력해주세요.");
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
        setIsLoggedIn(false);
      }
    } catch (error: any) {
      console.error(error);
      const messageToShow = error.message || "네트워크 오류가 발생했습니다. 다시 시도해주세요.";
      setErrorMessage(messageToShow);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await removeToken();
      alert("로그아웃되었습니다.");
      setIsLoggedIn(false);
    } catch (error) {
      console.error("SecureStore에서 토큰을 제거하는 중 오류 발생:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <View style={styles.container}>
      {isLoggedIn ? (
        <>
          <Text style={styles.title}>로그아웃</Text>
          <Text style={{ textAlign: "center", marginBottom: 20 }}>
            이미 로그인되어 있습니다.
          </Text>
          <Button title="로그아웃" onPress={handleLogout} />
        </>
      ) : (
        <>
          <Text style={styles.title}>로그인</Text>
          <TextInput
            style={styles.input}
            placeholder="아이디"
            value={formData.id}
            onChangeText={(value) => handleChange("id", value)}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="비밀번호"
            value={formData.password}
            onChangeText={(value) => handleChange("password", value)}
            secureTextEntry
          />
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <Button title="로그인" onPress={handleLogin} />
          )}
          <TouchableOpacity onPress={() => router.push("/auth/signup")}>
            <Text style={styles.signupLink}>
              계정이 없으신가요?{" "}
              <Text style={{ fontWeight: "bold" }}>회원가입</Text>
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  signupLink: {
    marginTop: 20,
    textAlign: "center",
    color: "blue",
  },
});
