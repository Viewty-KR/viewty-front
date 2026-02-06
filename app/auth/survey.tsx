import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AuthApi } from "../../libs/api";

export default function SurveyScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams();
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
    if (!userId) {
      alert("사용자 정보가 없습니다. 로그인 페이지로 이동합니다.");
      router.replace("/auth/login");
    }
  }, [userId, router]);

  const toggleConcern = (concern: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(concern)
        ? prev.filter((item) => item !== concern)
        : [...prev, concern],
    );
  };

  const handleCancel = () => {
    setSelectedConcerns([]);
    setSelectedSensitivity(null);
    setSelectedSkinType(null);
    setSelectedFeelingAfterWash(null);
    setSelectedAfternoonSkin(null);
    setSelectedPoreSize(null);
  };

  const handleSave = async () => {
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

    if (!userId) {
      alert("사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
      router.replace("/auth/login");
      return;
    }

    const surveyData = {
      userId: userId as string,
      concerns: selectedConcerns,
      sensitivity: selectedSensitivity as string,
      skinType: selectedSkinType as string,
      ...(selectedSkinType === "D" && {
        feelingAfterWash: selectedFeelingAfterWash as string,
        afternoonSkin: selectedAfternoonSkin as string,
        poreSize: selectedPoreSize as string,
      }),
    };

    try {
      const responseData = await AuthApi.createSurvey(surveyData);

      if (responseData.success) {
        alert("회원가입이 완료되었습니다.");
        router.replace("/auth/login");
      } else {
        alert(responseData.message || "설문 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      console.log(error);
      alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>피부 정보 설문</Text>

      {/* Question 1 */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionTitle}>
          1. (중복 선택) 현재 가장 해결하고 싶은 피부 고민은?
        </Text>
        <Text style={styles.questionDescription}>
          {
            "추천 알고리즘에서 가중치를 줄 때 사용합니다. (예: '미백' 선택 시 비타민C 제품 추천)"
          }
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
        <Text style={styles.questionDescription}>
          {"추천 시 '순한 성분'을 우선순위에 둘지 결정합니다."}
        </Text>
        {[
          {
            key: "A",
            text: "특별한 트러블 없이 대부분 잘 맞는다.",
            desc: "(건강한 피부)",
          },
          {
            key: "B",
            text: "가끔 안 맞는 제품이 있으면 따갑거나 붉어진다.",
            desc: "(약민감성)",
          },
          {
            key: "C",
            text: "자주 뒤집어지고 트러블이 올라와서 아무거나 못 쓴다.",
            desc: "(극민감성)",
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
            <Text style={styles.optionText}>
              <Text style={{ fontWeight: "bold" }}>{option.key}.</Text>{" "}
              {option.text} <Text style={styles.descText}>{option.desc}</Text>
            </Text>
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
            <Text style={styles.optionText}>
              <Text style={{ fontWeight: "bold" }}>{option.key}.</Text>{" "}
              {option.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedSkinType === "D" && (
        <>
          {/* Question 3-1 */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionTitle}>
              3-1. 세안 직후, 스킨케어를 하지 않았을 때 피부 느낌은? (유/수분
              기본)
            </Text>
            <Text style={styles.questionDescription}>
              가장 기본적인 피부 장벽 상태를 확인합니다.
            </Text>
            {[
              {
                key: "A",
                text: "얼굴 전체가 심하게 당기고 건조하다.",
                desc: "(건강한 피부)",
              },
              {
                key: "B",
                text: "이마와 코(T존)는 번들거리고, 볼(U존)은 당긴다.",
                desc: "(복합성)",
              },
              {
                key: "C",
                text: "당김은 거의 없고, 시간이 지나면 유분이 올라온다.",
                desc: "(지성)",
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
                <Text style={styles.optionText}>
                  <Text style={{ fontWeight: "bold" }}>{option.key}.</Text>{" "}
                  {option.text}{" "}
                  <Text style={styles.descText}>{option.desc}</Text>
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Question 3-2 */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionTitle}>
              3-2. 평소 오후 3~4시쯤 내 피부 상태는 어떤가요? (피지 분비량)
            </Text>
            <Text style={styles.questionDescription}>
              시간이 지났을 때의 피지 분비량을 체크합니다.
            </Text>
            {[
              {
                key: "A",
                text: "여전히 건조하고 각질이 하얗게 뜰 때가 있다.",
                desc: "(건성)",
              },
              {
                key: "B",
                text: "코 주변만 번들거리고 나머지는 괜찮다.",
                desc: "(복합성)",
              },
              {
                key: "C",
                text: "얼굴 전체가 기름종이를 써야 할 정도로 번들거린다.",
                desc: "(지성)",
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
                <Text style={styles.optionText}>
                  <Text style={{ fontWeight: "bold" }}>{option.key}.</Text>{" "}
                  {option.text}{" "}
                  <Text style={styles.descText}>{option.desc}</Text>
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Question 3-3 */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionTitle}>
              3-3. 거울을 봤을 때 모공의 크기는 어떤가요? (모공 상태)
            </Text>
            <Text style={styles.questionDescription}>
              모공 크기는 피부 타입과 밀접한 관련이 있습니다.
            </Text>
            {[
              {
                key: "A",
                text: "모공이 거의 눈에 띄지 않는다.",
                desc: "(건성)",
              },
              {
                key: "B",
                text: "코와 코 주변의 모공만 조금 보인다.",
                desc: "(복합성)",
              },
              {
                key: "C",
                text: "볼 안쪽까지 모공이 넓고 눈에 띄는 편이다.",
                desc: "(지성)",
              },
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
                <Text style={styles.optionText}>
                  <Text style={{ fontWeight: "bold" }}>{option.key}.</Text>{" "}
                  {option.text}{" "}
                  <Text style={styles.descText}>{option.desc}</Text>
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
        >
          <Text style={styles.buttonText}>취소</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>저장</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  questionContainer: {
    marginBottom: 30,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  questionDescription: {
    fontSize: 14,
    color: "gray",
    marginBottom: 15,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
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
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "gray",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: "blue",
    backgroundColor: "blue",
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  descText: {
    color: "gray",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: "blue",
  },
  cancelButton: {
    backgroundColor: "gray",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
