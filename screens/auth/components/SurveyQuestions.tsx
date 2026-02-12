import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { surveyStyles } from "../survey.style";

interface SurveyQuestionsProps {
  selectedConcerns: string[];
  toggleConcern: (concern: string) => void;
  selectedSensitivity: string | null;
  setSelectedSensitivity: (sensitivity: string | null) => void;
  selectedSkinType: string | null;
  setSelectedSkinType: (skinType: string | null) => void;
  selectedFeelingAfterWash: string | null;
  setSelectedFeelingAfterWash: (feeling: string | null) => void;
  selectedAfternoonSkin: string | null;
  setSelectedAfternoonSkin: (skin: string | null) => void;
  selectedPoreSize: string | null;
  setSelectedPoreSize: (poreSize: string | null) => void;
}

const SurveyQuestions: React.FC<SurveyQuestionsProps> = ({
  selectedConcerns,
  toggleConcern,
  selectedSensitivity,
  setSelectedSensitivity,
  selectedSkinType,
  setSelectedSkinType,
  selectedFeelingAfterWash,
  setSelectedFeelingAfterWash,
  selectedAfternoonSkin,
  setSelectedAfternoonSkin,
  selectedPoreSize,
  setSelectedPoreSize,
}) => {
  return (
    <>
      {/* Question 1 */}
      <View style={surveyStyles.questionContainer}>
        <Text style={surveyStyles.questionTitle}>
          1. (중복 선택) 현재 가장 해결하고 싶은 피부 고민은?
        </Text>
        <Text style={surveyStyles.questionDescription}>
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
            style={surveyStyles.optionContainer}
            onPress={() => toggleConcern(concern)}
          >
            <View
              style={[
                surveyStyles.checkbox,
                selectedConcerns.includes(concern) &&
                  surveyStyles.checkboxSelected,
              ]}
            />
            <Text style={surveyStyles.optionText}>{concern}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Question 2 */}
      <View style={surveyStyles.questionContainer}>
        <Text style={surveyStyles.questionTitle}>
          2. 새로운 화장품을 썼을 때 피부 반응은? (민감도)
        </Text>
        <Text style={surveyStyles.questionDescription}>
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
            style={surveyStyles.optionContainer}
            onPress={() => setSelectedSensitivity(option.key)}
          >
            <View
              style={[
                surveyStyles.radio,
                selectedSensitivity === option.key &&
                  surveyStyles.radioSelected,
              ]}
            />
            <Text style={surveyStyles.optionText}>
              <Text style={{ fontWeight: "bold" }}>{option.key}.</Text>{" "}
              {option.text}{" "}
              <Text style={surveyStyles.descText}>{option.desc}</Text>
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Question 3 */}
      <View style={surveyStyles.questionContainer}>
        <Text style={surveyStyles.questionTitle}>3. 당신의 피부타입은?</Text>
        {[
          { key: "A", text: "건성" },
          { key: "B", text: "복합성" },
          { key: "C", text: "지성" },
          { key: "D", text: "잘모르겠다." },
        ].map((option) => (
          <TouchableOpacity
            key={option.key}
            style={surveyStyles.optionContainer}
            onPress={() => setSelectedSkinType(option.key)}
          >
            <View
              style={[
                surveyStyles.radio,
                selectedSkinType === option.key && surveyStyles.radioSelected,
              ]}
            />
            <Text style={surveyStyles.optionText}>
              <Text style={{ fontWeight: "bold" }}>{option.key}.</Text>{" "}
              {option.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedSkinType === "D" && (
        <>
          {/* Question 3-1 */}
          <View style={surveyStyles.questionContainer}>
            <Text style={surveyStyles.questionTitle}>
              3-1. 세안 직후, 스킨케어를 하지 않았을 때 피부 느낌은? (유/수분
              기본)
            </Text>
            <Text style={surveyStyles.questionDescription}>
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
                style={surveyStyles.optionContainer}
                onPress={() => setSelectedFeelingAfterWash(option.key)}
              >
                <View
                  style={[
                    surveyStyles.radio,
                    selectedFeelingAfterWash === option.key &&
                      surveyStyles.radioSelected,
                  ]}
                />
                <Text style={surveyStyles.optionText}>
                  <Text style={{ fontWeight: "bold" }}>{option.key}.</Text>{" "}
                  {option.text}{" "}
                  <Text style={surveyStyles.descText}>{option.desc}</Text>
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Question 3-2 */}
          <View style={surveyStyles.questionContainer}>
            <Text style={surveyStyles.questionTitle}>
              3-2. 평소 오후 3~4시쯤 내 피부 상태는 어떤가요? (피지 분비량)
            </Text>
            <Text style={surveyStyles.questionDescription}>
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
                style={surveyStyles.optionContainer}
                onPress={() => setSelectedAfternoonSkin(option.key)}
              >
                <View
                  style={[
                    surveyStyles.radio,
                    selectedAfternoonSkin === option.key &&
                      surveyStyles.radioSelected,
                  ]}
                />
                <Text style={surveyStyles.optionText}>
                  <Text style={{ fontWeight: "bold" }}>{option.key}.</Text>{" "}
                  {option.text}{" "}
                  <Text style={surveyStyles.descText}>{option.desc}</Text>
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Question 3-3 */}
          <View style={surveyStyles.questionContainer}>
            <Text style={surveyStyles.questionTitle}>
              3-3. 거울을 봤을 때 모공의 크기는 어떤가요? (모공 상태)
            </Text>
            <Text style={surveyStyles.questionDescription}>
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
                style={surveyStyles.optionContainer}
                onPress={() => setSelectedPoreSize(option.key)}
              >
                <View
                  style={[
                    surveyStyles.radio,
                    selectedPoreSize === option.key &&
                      surveyStyles.radioSelected,
                  ]}
                />
                <Text style={surveyStyles.optionText}>
                  <Text style={{ fontWeight: "bold" }}>{option.key}.</Text>{" "}
                  {option.text}{" "}
                  <Text style={surveyStyles.descText}>{option.desc}</Text>
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </>
  );
};

export default SurveyQuestions;
