import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Button,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router"; // useRouter 추가
import { useProfile, useLogout } from "./profile.utils";
import { profileStyles } from "./profile.style";
import SurveyQuestions from "./components/SurveyQuestions"; // SurveyQuestions 컴포넌트 import

const LogoutButton = () => {
  const { handleLogout } = useLogout();
  const router = useRouter();

  const handlePress = () => {
    if (confirm("정말 로그아웃 하시겠습니까?")) {
      handleLogout();
      router.replace("/auth/login"); // 로그인 화면으로 리다이렉트
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={profileStyles.logoutButton}>
      <Text style={profileStyles.logoutButtonText}>로그아웃</Text>
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const {
    loading,
    userData,
    error,
    passwordUpdateMessage,
    passwordUpdateLoading,
    updateMessage,
    password,
    setPassword,
    passwordConfirm,
    setPasswordConfirm,
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
    handlePasswordUpdate,
    handleUpdate,
  } = useProfile();

  if (loading && !userData) {
    return (
      <View style={profileStyles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>데이터 로딩 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={profileStyles.centered}>
        <Text style={profileStyles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={profileStyles.container}>
      <View style={profileStyles.customHeader}>
        <Text style={profileStyles.customHeaderTitle}>마이 페이지</Text>
        <LogoutButton />
      </View>

      {userData && (
        <View style={profileStyles.section}>
          <Text style={profileStyles.sectionTitle}>회원 정보</Text>
          <Text>아이디: {userData.userId}</Text>
          <Text>이메일: {userData.email}</Text>
          <Text>이름: {userData.name}</Text>
        </View>
      )}

      <View style={profileStyles.section}>
        <Text style={profileStyles.sectionTitle}>비밀번호 변경</Text>
        <TextInput
          style={profileStyles.input}
          placeholder="새 비밀번호"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={profileStyles.input}
          placeholder="새 비밀번호 확인"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          secureTextEntry
        />
        {passwordUpdateMessage ? (
          <Text style={profileStyles.errorText}>{passwordUpdateMessage}</Text>
        ) : null}
        <Button
          title="비밀번호 변경"
          onPress={handlePasswordUpdate}
          disabled={passwordUpdateLoading}
        />
      </View>

      <View style={profileStyles.section}>
        <Text style={profileStyles.sectionTitle}>피부 설문 수정</Text>

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
      </View>

      <View style={profileStyles.section}>
        {updateMessage ? (
          <Text style={profileStyles.errorText}>{updateMessage}</Text>
        ) : null}
        <Button
          title="피부 설문 수정"
          onPress={handleUpdate}
          disabled={loading}
        />
      </View>

      {!userData && !loading && (
        <View style={profileStyles.centered}>
          <Text>표시할 데이터가 없습니다.</Text>
        </View>
      )}
    </ScrollView>
  );
}
