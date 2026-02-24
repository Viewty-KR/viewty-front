// screens/auth/survey.index.tsx
import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useSurvey } from "./survey.utils";
import { surveyStyles } from "./survey.style";
import SurveyQuestions from "./components/SurveyQuestions";
import { ErrorModal } from "../../components/ErrorModal";

export default function SurveyScreen() {
  const {
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
    handleCancel,
    handleSave,
    isModalVisible,
    modalMessage,
    onModalConfirm,
  } = useSurvey();

  return (
    <ScrollView style={surveyStyles.container}>
      <Text style={surveyStyles.header}>피부 정보 설문</Text>

      <SurveyQuestions
        selectedConcerns={selectedConcerns}
        toggleConcern={toggleConcern}
        selectedSensitivity={selectedSensitivity}
        setSelectedSensitivity={setSelectedSensitivity}
        selectedSkinType={selectedSkinType}
        setSelectedSkinType={setSelectedSkinType}
        selectedFeelingAfterWash={selectedFeelingAfterWash}
        setSelectedFeelingAfterWash={setSelectedFeelingAfterWash}
        selectedAfternoonSkin={selectedAfternoonSkin}
        setSelectedAfternoonSkin={setSelectedAfternoonSkin}
        selectedPoreSize={selectedPoreSize}
        setSelectedPoreSize={setSelectedPoreSize}
      />

      <View style={surveyStyles.buttonContainer}>
        <TouchableOpacity
          style={[surveyStyles.button, surveyStyles.cancelButton]}
          onPress={handleCancel}
        >
          <Text style={surveyStyles.buttonText}>취소</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[surveyStyles.button, surveyStyles.saveButton]}
          onPress={handleSave}
        >
          <Text style={surveyStyles.buttonText}>저장</Text>
        </TouchableOpacity>
      </View>

      <ErrorModal
        visible={isModalVisible}
        type="alert"
        title="알림"
        message={modalMessage}
        onRetry={onModalConfirm}
      />
    </ScrollView>
  );
}
