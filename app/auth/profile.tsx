import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
  TextInput,
  Button,
  TouchableOpacity,
} from "react-native";
import { AuthApi } from "../../libs/api";
import { getToken, removeToken } from "../../hooks/useToken";

if (Platform.OS === "web" && typeof atob === "undefined") {
  global.atob = (input) => Buffer.from(input, "base64").toString("binary");
}

const LogoutButton = () => {
  const handleLogout = async () => {
    await removeToken();
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
      <Text style={styles.logoutButtonText}>로그아웃</Text>
    </TouchableOpacity>
  );
};

export default function MyPageScreen() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [passwordUpdateMessage, setPasswordUpdateMessage] = useState("");
  const [passwordUpdateLoading, setPasswordUpdateLoading] = useState(false);

  const handlePasswordUpdate = async () => {
    setPasswordUpdateMessage("");
    if (!password) {
      setPasswordUpdateMessage("새 비밀번호를 입력해주세요.");
      return;
    }
    if (!passwordConfirm) {
      setPasswordUpdateMessage("비밀번호 확인을 입력해주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      setPasswordUpdateMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    setPasswordUpdateLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        return;
      }

      const responseData = await AuthApi.updatePassword({ password: password });

      if (responseData.success) {
        alert("비밀번호가 성공적으로 변경되었습니다.");
        setPassword("");
        setPasswordConfirm("");
      } else {
        setPasswordUpdateMessage(
          responseData.message || "비밀번호 변경에 실패했습니다.",
        );
      }
    } catch (err) {
      console.error("Error updating password:", err);
      setPasswordUpdateMessage("비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setPasswordUpdateLoading(false);
    }
  };

  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [selectedSensitivity, setSelectedSensitivity] = useState<string | null>(
    null,
  );
  const [selectedSkinType, setSelectedSkinType] = useState<string | null>(null);
  const [selectedFeelingAfterWash, setSelectedFeelingAfterWash] = useState<
    string | null
  >(null);
  const [selectedAfternoonSkin, setSelectedAfternoonSkin] = useState<
    string | null
  >(null);
  const [selectedPoreSize, setSelectedPoreSize] = useState<string | null>(null);

  useEffect(() => {
    if (userData) {
      console.log("userData.concerns:", userData.concerns);
      setSelectedConcerns(
        Array.isArray(userData.concerns)
          ? userData.concerns
          : typeof userData.concerns === "string" &&
              userData.concerns.length > 0
            ? userData.concerns.split(",").map((item: string) => item.trim())
            : [],
      );
      setSelectedSensitivity(userData.sensitivity || null);
      setSelectedSkinType(userData.skinType || null);
      setSelectedFeelingAfterWash(userData.feelingAfterWash || null);
      setSelectedAfternoonSkin(userData.afternoonSkin || null);
      setSelectedPoreSize(userData.poreSize || null);
    }
  }, [userData]);

  const toggleConcern = (concern: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(concern)
        ? prev.filter((item) => item !== concern)
        : [...prev, concern],
    );
  };

  const handleUpdate = async () => {
    if (!userData) {
      setUpdateMessage(
        "사용자 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.",
      );
      return;
    }
    setUpdateMessage("");

    if (selectedConcerns.length === 0) {
      alert("1번 질문을 완료해주세요.");
      return;
    }
    if (!selectedSensitivity) {
      alert("2번 질문을 완료해주세요.");
      return;
    }
    if (!selectedSkinType) {
      alert("3번 질문을 완료해주세요.");
      return;
    }

    if (selectedSkinType === "D") {
      if (
        !selectedFeelingAfterWash ||
        !selectedAfternoonSkin ||
        !selectedPoreSize
      ) {
        alert("3-1, 3-2, 3-3번 질문을 모두 완료해주세요.");
        return;
      }
    }

    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        return;
      }

      const updateData = {
        userId: userData.userId,
        concerns: selectedConcerns,
        sensitivity: selectedSensitivity as string,
        skinType: selectedSkinType as string,
        ...(selectedSkinType === "D" && {
          feelingAfterWash: selectedFeelingAfterWash as string,
          afternoonSkin: selectedAfternoonSkin as string,
          poreSize: selectedPoreSize as string,
        }),
      };

      const responseData = await AuthApi.createSurvey(updateData);

      if (responseData.success) {
        alert("정보가 성공적으로 수정되었습니다.");
        fetchUserData();
      } else {
        setUpdateMessage(responseData.message || "정보 수정에 실패했습니다.");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setUpdateMessage("업데이트 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        return;
      }

      const userProfile = await AuthApi.getProfile();
      if (userProfile.success) {
        setUserData(userProfile.data);
      } else {
        console.log("오류 - ", userProfile.message);
        setError(
          userProfile.message || "사용자 정보를 불러오는데 실패했습니다.",
        );
      }
    } catch (err) {
      console.log(err);
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (loading && !userData) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>데이터 로딩 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.customHeader}>
        <Text style={styles.customHeaderTitle}>마이 페이지</Text>
        <LogoutButton />
      </View>

      {userData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>회원 정보</Text>
          <Text>아이디: {userData.userId}</Text>
          <Text>이메일: {userData.email}</Text>
          <Text>이름: {userData.name}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>비밀번호 변경</Text>
        <TextInput
          style={styles.input}
          placeholder="새 비밀번호"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="새 비밀번호 확인"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          secureTextEntry
        />
        {passwordUpdateMessage ? (
          <Text style={styles.errorText}>{passwordUpdateMessage}</Text>
        ) : null}
        <Button
          title="비밀번호 변경"
          onPress={handlePasswordUpdate}
          disabled={passwordUpdateLoading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>피부 설문 수정</Text>

        {/* Question 1 */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>
            1. (중복 선택) 현재 가장 해결하고 싶은 피부 고민은?
          </Text>
          {[
            "좁쌀/화농성 여드름",
            "기미/주근깨/잡티 (미백)",
            "주름/탄력 처짐",
            "블랙헤드/모공",
            "홍조/피부 붉음",
          ].map((concern) => (
            <TouchableOpacity
              key={concern}
              style={styles.optionContainer}
              onPress={() => toggleConcern(concern)}
            >
              <View
                style={[
                  styles.checkbox,
                  selectedConcerns.includes(concern) && styles.checkboxSelected,
                ]}
              />
              <Text style={styles.optionText}>{concern}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Question 2 */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>
            2. 새로운 화장품을 썼을 때 피부 반응은? (민감도)
          </Text>
          {[
            { key: "A", text: "특별한 트러블 없이 대부분 잘 맞는다." },
            { key: "B", text: "가끔 안 맞는 제품이 있으면 따갑거나 붉어진다." },
            {
              key: "C",
              text: "자주 뒤집어지고 트러블이 올라와서 아무거나 못 쓴다.",
            },
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={styles.optionContainer}
              onPress={() => setSelectedSensitivity(option.key)}
            >
              <View
                style={[
                  styles.radio,
                  selectedSensitivity === option.key && styles.radioSelected,
                ]}
              />
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Question 3 */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>3. 당신의 피부타입은?</Text>
          {[
            { key: "A", text: "건성" },
            { key: "B", text: "복합성" },
            { key: "C", text: "지성" },
            { key: "D", text: "잘모르겠다." },
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={styles.optionContainer}
              onPress={() => setSelectedSkinType(option.key)}
            >
              <View
                style={[
                  styles.radio,
                  selectedSkinType === option.key && styles.radioSelected,
                ]}
              />
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedSkinType === "D" && (
          <>
            <View style={styles.questionContainer}>
              <Text style={styles.questionTitle}>
                3-1. 세안 직후, 스킨케어를 하지 않았을 때 피부 느낌은?
              </Text>
              {[
                { key: "A", text: "얼굴 전체가 심하게 당기고 건조하다." },
                {
                  key: "B",
                  text: "이마와 코(T존)는 번들거리고, 볼(U존)은 당긴다.",
                },
                {
                  key: "C",
                  text: "당김은 거의 없고, 시간이 지나면 유분이 올라온다.",
                },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.optionContainer}
                  onPress={() => setSelectedFeelingAfterWash(option.key)}
                >
                  <View
                    style={[
                      styles.radio,
                      selectedFeelingAfterWash === option.key &&
                        styles.radioSelected,
                    ]}
                  />
                  <Text style={styles.optionText}>{option.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.questionContainer}>
              <Text style={styles.questionTitle}>
                3-2. 평소 오후 3~4시쯤 내 피부 상태는 어떤가요?
              </Text>
              {[
                {
                  key: "A",
                  text: "여전히 건조하고 각질이 하얗게 뜰 때가 있다.",
                },
                { key: "B", text: "코 주변만 번들거리고 나머지는 괜찮다." },
                {
                  key: "C",
                  text: "얼굴 전체가 기름종이를 써야 할 정도로 번들거린다.",
                },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.optionContainer}
                  onPress={() => setSelectedAfternoonSkin(option.key)}
                >
                  <View
                    style={[
                      styles.radio,
                      selectedAfternoonSkin === option.key &&
                        styles.radioSelected,
                    ]}
                  />
                  <Text style={styles.optionText}>{option.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.questionContainer}>
              <Text style={styles.questionTitle}>
                3-3. 거울을 봤을 때 모공의 크기는 어떤가요?
              </Text>
              {[
                { key: "A", text: "모공이 거의 눈에 띄지 않는다." },
                { key: "B", text: "코와 코 주변의 모공만 조금 보인다." },
                { key: "C", text: "볼 안쪽까지 모공이 넓고 눈에 띄는 편이다." },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.optionContainer}
                  onPress={() => setSelectedPoreSize(option.key)}
                >
                  <View
                    style={[
                      styles.radio,
                      selectedPoreSize === option.key && styles.radioSelected,
                    ]}
                  />
                  <Text style={styles.optionText}>{option.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>

      <View style={styles.section}>
        {updateMessage ? (
          <Text style={styles.errorText}>{updateMessage}</Text>
        ) : null}
        <Button
          title="피부 설문 수정"
          onPress={handleUpdate}
          disabled={loading}
        />
      </View>

      {!userData && !loading && (
        <View style={styles.centered}>
          <Text>표시할 데이터가 없습니다.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  customHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  customHeaderTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  section: {
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    marginLeft: 5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "gray",
    marginRight: 10,
  },
  checkboxSelected: {
    backgroundColor: "blue",
    borderColor: "blue",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "gray",
    marginRight: 10,
  },
  radioSelected: {
    backgroundColor: "blue",
    borderColor: "blue",
  },
  optionText: {
    fontSize: 15,
    flex: 1,
  },
  logoutButton: {
    marginRight: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  logoutButtonText: {
    color: "#007AFF",
    fontSize: 16,
  },
});
