import React, { useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useProfile, useLogout } from "./profile.utils";
import { profileStyles } from "./profile.style";
import SurveyQuestions from "./components/SurveyQuestions";
import { ProfileHookResult } from "./profile.types";
import BookmarkList from "./components/BookmarkList";
import MyReviews from "./components/MyReviews";
import { ErrorModal } from "../../components/ErrorModal";

const LogoutButton = () => {
  const { handleLogout } = useLogout();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={profileStyles.logoutButton}
      >
        <Text style={profileStyles.logoutButtonText}>로그아웃</Text>
      </TouchableOpacity>
      <ErrorModal
        visible={modalVisible}
        type="confirm"
        title="로그아웃"
        message="로그아웃 하시겠습니까?"
        confirmText="로그아웃"
        cancelText="취소"
        onRetry={() => {
          setModalVisible(false);
          handleLogout();
        }}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

const MemberInfo = ({ profileData }: { profileData: ProfileHookResult }) => {
  const {
    userData,
    passwordUpdateLoading,
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
    <View style={{ paddingBottom: 40 }}>
      {userData && (
        <View style={profileStyles.section}>
          <Text style={profileStyles.sectionTitle}>회원 정보</Text>
          <Text style={profileStyles.infoText}>아이디: {userData.userId}</Text>
          <Text style={profileStyles.infoText}>이메일: {userData.email}</Text>
          <Text style={profileStyles.infoText}>이름: {userData.name}</Text>
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
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={profileStyles.input}
          placeholder="새 비밀번호 확인"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          secureTextEntry
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity
          style={profileStyles.actionButton}
          onPress={handlePasswordUpdate}
          disabled={passwordUpdateLoading}
        >
          <Text style={profileStyles.actionButtonText}>비밀번호 변경</Text>
        </TouchableOpacity>
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
        <TouchableOpacity
          style={[profileStyles.actionButton, { backgroundColor: "#FF2D78" }]}
          onPress={handleUpdate}
          disabled={loading}
        >
          <Text style={profileStyles.actionButtonText}>설문 정보 저장</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
        accessibilityRole="tab"
      >
        <Text
          style={[styles.tabText, activeTab === "info" && styles.activeTabText]}
        >
          회원정보
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === "bookmarklist" && styles.activeTab]}
        onPress={() => setActiveTab("bookmarklist")}
        accessibilityRole="tab"
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "bookmarklist" && styles.activeTabText,
          ]}
        >
          찜한 상품
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === "reviews" && styles.activeTab]}
        onPress={() => setActiveTab("reviews")}
        accessibilityRole="tab"
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "reviews" && styles.activeTabText,
          ]}
        >
          나의 리뷰
        </Text>
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
        <ActivityIndicator size="large" color="#FF2D78" />
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
      <View style={profileStyles.container}>
        <ProfileHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === "info" && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <MemberInfo profileData={profileData} />
          </ScrollView>
        )}
        {activeTab === "bookmarklist" && <BookmarkList />}
        {activeTab === "reviews" && <MyReviews />}
      </View>
      <ErrorModal
        visible={profileData.isModalVisible}
        type={profileData.modalType}
        title="알림"
        message={profileData.modalMessage}
        onRetry={profileData.onModalConfirm}
        onClose={() => profileData.setIsModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#FF2D78",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
  },
  activeTabText: {
    color: "#FF2D78",
  },
});
