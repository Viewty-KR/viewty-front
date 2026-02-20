import React, { useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useProfile, useLogout } from "./profile.utils";
import { profileStyles } from "./profile.style";
import SurveyQuestions from "./components/SurveyQuestions";
import { ProfileHookResult } from "./profile.types";
import BookmarkList from "./components/BookmarkList";

const LogoutButton = () => {
  const { handleLogout } = useLogout();
  const router = useRouter();

  const handlePress = () => {
    if (confirm("정말 로그아웃 하시겠습니까?")) {
      handleLogout();
      router.replace("/auth/login");
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={profileStyles.logoutButton}>
      <Text style={profileStyles.logoutButtonText}>로그아웃</Text>
    </TouchableOpacity>
  );
};

const MemberInfo = ({ profileData }: { profileData: ProfileHookResult }) => {
  const {
    userData,
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
    loading,
  } = profileData;

  return (
    <>
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
    </>
  );
};

import MyReviews from "./components/MyReviews";

const ProfileHeader = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}) => (
  <>
    <View style={profileStyles.customHeader}>
      <Text style={profileStyles.customHeaderTitle}>마이 페이지</Text>
      <LogoutButton />
    </View>

    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "info" && styles.activeTab]}
        onPress={() => setActiveTab("info")}
      >
        <Text style={styles.tabText}>회원정보</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "bookmarklist" && styles.activeTab]}
        onPress={() => setActiveTab("bookmarklist")}
      >
        <Text style={styles.tabText}>내가찜한목록</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "reviews" && styles.activeTab]}
        onPress={() => setActiveTab("reviews")}
      >
        <Text style={styles.tabText}>내가 작성한 리뷰</Text>
      </TouchableOpacity>
    </View>
  </>
);

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState("info");
  const profileData = useProfile();

  if (profileData.loading && !profileData.userData) {
    return (
      <View style={profileStyles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>데이터 로딩 중...</Text>
      </View>
    );
  }

  if (profileData.error) {
    return (
      <View style={profileStyles.centered}>
        <Text style={profileStyles.errorText}>{profileData.error}</Text>
      </View>
    );
  }

  return (
    <>
      {activeTab === "info" ? (
        <ScrollView style={profileStyles.container}>
          <ProfileHeader activeTab={activeTab} setActiveTab={setActiveTab} />
          <MemberInfo profileData={profileData} />
          {!profileData.userData && !profileData.loading && (
            <View style={profileStyles.centered}>
              <Text>표시할 데이터가 없습니다.</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={profileStyles.container}>
          <ProfileHeader activeTab={activeTab} setActiveTab={setActiveTab} />
          {activeTab === "bookmarklist" && <BookmarkList />}
          {activeTab === "reviews" && <MyReviews />}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontWeight: "bold",
  },
});
