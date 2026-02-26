import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { AuthApi } from "../../libs/api";
import { ErrorModal } from "../../components/ErrorModal";

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
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const showModal = (message: string) => {
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.id) {
      showModal("아이디를 입력해주세요.");
      return;
    }
    if (!formData.email) {
      showModal("이메일을 입력해주세요.");
      return;
    }
    if (!isValidEmail(formData.email)) {
      showModal("유효한 이메일 주소를 입력해주세요.");
      return;
    }
    if (!formData.name) {
      showModal("이름을 입력해주세요.");
      return;
    }
    if (!formData.password) {
      showModal("비밀번호를 입력해주세요.");
      return;
    }
    if (!formData.passwordConfirm) {
      showModal("비밀번호 확인을 입력해주세요.");
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      showModal("비밀번호가 일치하지 않습니다.");
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
        setPendingUserId(userIdToSend);
        showModal("회원가입이 완료되었습니다.\n피부 진단을 시작하겠습니다.");
      } else {
        showModal(responseData.message || "회원가입에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        showModal(error.message);
      } else {
        showModal("오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleModalConfirm = () => {
    setModalVisible(false);
    if (pendingUserId) {
      router.replace({
        pathname: "/auth/survey",
        params: { userId: pendingUserId },
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>회원가입</Text>
          <Text style={styles.subtitle}>
            Viewty에서 나만의 화장품을 찾아보세요
          </Text>
        </View>

        {/* 폼 영역을 연한 테두리 박스로 감싸 마이페이지와 통일감 부여 */}
        <View style={styles.section}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>아이디</Text>
            <TextInput
              style={styles.input}
              placeholder="아이디를 입력해주세요"
              placeholderTextColor="#aaa"
              value={formData.id}
              onChangeText={(value) => handleChange("id", value)}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>이메일</Text>
            <TextInput
              style={styles.input}
              placeholder="example@viewty.com"
              placeholderTextColor="#aaa"
              value={formData.email}
              onChangeText={(value) => handleChange("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>이름</Text>
            <TextInput
              style={styles.input}
              placeholder="이름을 입력해주세요"
              placeholderTextColor="#aaa"
              value={formData.name}
              onChangeText={(value) => handleChange("name", value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="비밀번호를 입력해주세요"
              placeholderTextColor="#aaa"
              value={formData.password}
              onChangeText={(value) => handleChange("password", value)}
              secureTextEntry
            />
          </View>

          <View style={[styles.inputGroup, { marginBottom: 0 }]}>
            <Text style={styles.inputLabel}>비밀번호 확인</Text>
            <TextInput
              style={styles.input}
              placeholder="비밀번호를 다시 입력해주세요"
              placeholderTextColor="#aaa"
              value={formData.passwordConfirm}
              onChangeText={(value) => handleChange("passwordConfirm", value)}
              secureTextEntry
            />
          </View>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#FF2D78"
            style={{ marginTop: 10 }}
          />
        ) : (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>가입하기</Text>
          </TouchableOpacity>
        )}

        <View style={styles.footerTextContainer}>
          <Text style={styles.footerText}>이미 계정이 있으신가요?</Text>
          <TouchableOpacity onPress={() => router.push("/auth/login")}>
            <Text style={styles.loginLink}>로그인</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ErrorModal
        visible={modalVisible}
        type="alert"
        title="알림"
        message={modalMessage}
        onRetry={handleModalConfirm}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: "center",
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: "#555",
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    height: 48,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: "#fafafa",
    fontSize: 15,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#FF2D78",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerTextContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#666",
    fontSize: 14,
  },
  loginLink: {
    color: "#FF2D78",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 6,
  },
});
