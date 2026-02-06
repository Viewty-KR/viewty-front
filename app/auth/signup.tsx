import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { AuthApi } from "../../libs/api";

const isValidEmail = (email: string) => {
  return /^[^@]+@[^@]+\.[^@]+$/.test(email);
};

export default function SignupScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    id: "",
    email: "",
    password: "",
    passwordConfirm: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const handleSubmit = async () => {
    setErrorMessage("");
    if (!formData.id) {
      setErrorMessage("아이디를 입력해주세요.");
      return;
    }
    if (!formData.email) {
      setErrorMessage("이메일을 입력해주세요.");
      return;
    }
    if (!isValidEmail(formData.email)) {
      setErrorMessage("유효한 이메일 주소를 입력해주세요.");
      return;
    }
    if (!formData.name) {
      setErrorMessage("이름을 입력해주세요.");
      return;
    }
    if (!formData.password) {
      setErrorMessage("비밀번호를 입력해주세요.");
      return;
    }
    if (!formData.passwordConfirm) {
      setErrorMessage("비밀번호 확인을 입력해주세요.");
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);

    try {
      const responseData = await AuthApi.createSign({
        userId: formData.id,
        email: formData.email,
        name: formData.name,
        password: formData.password,
      });

      if (responseData.success) {
        const userIdToSend = responseData.data?.userId || formData.id;

        alert("피부 진단을 시작하겠습니다.");
        router.replace({
          pathname: "/auth/survey",
          params: { userId: userIdToSend },
        });
      } else {
        const messageToShow =
          responseData.message || "회원가입에 실패했습니다.";
        setErrorMessage(messageToShow);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원가입</Text>
      <View style={styles.inputWithButtonContainer}>
        <TextInput
          style={[styles.input, styles.idInput]}
          placeholder="아이디"
          value={formData.id}
          onChangeText={(value) => handleChange("id", value)}
          autoCapitalize="none"
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={formData.email}
        onChangeText={(value) => handleChange("email", value)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="이름"
        value={formData.name}
        onChangeText={(value) => handleChange("name", value)}
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={formData.password}
        onChangeText={(value) => handleChange("password", value)}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호 확인"
        value={formData.passwordConfirm}
        onChangeText={(value) => handleChange("passwordConfirm", value)}
        secureTextEntry
      />
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="가입" onPress={handleSubmit} />
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
  inputWithButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  idInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 10,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  successText: {
    color: "green",
  },
});
