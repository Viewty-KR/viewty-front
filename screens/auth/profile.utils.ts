import { useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import { AuthApi } from "../../libs/api";
import { getToken, removeToken } from "../../hooks/useToken";
import { UserData, AuthResponse, ProfileHookResult } from "./profile.types";
import { router } from "expo-router";

if (Platform.OS === "web" && typeof atob === "undefined") {
  global.atob = (input) => Buffer.from(input, "base64").toString("binary");
}

export const useProfile = (): ProfileHookResult => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordUpdateLoading, setPasswordUpdateLoading] = useState(false);

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

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"error" | "confirm" | "alert">(
    "alert",
  );
  const [onConfirmAction, setOnConfirmAction] = useState<(() => void) | null>(
    null,
  );

  const showModal = (
    message: string,
    type: "error" | "confirm" | "alert" = "alert",
    onConfirm?: () => void,
  ) => {
    setModalMessage(message);
    setModalType(type);
    setOnConfirmAction(onConfirm ? () => onConfirm() : null);
    setIsModalVisible(true);
  };

  const fetchUserData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        setError("로그인이 필요합니다.");
        router.replace("/auth/login");
        setLoading(false);
        return;
      }

      const userProfile: AuthResponse<UserData> = await AuthApi.getProfile();
      if (userProfile.success && userProfile.data) {
        setUserData(userProfile.data);
      } else {
        setError(
          userProfile.message || "사용자 정보를 불러오는데 실패했습니다.",
        );
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "토큰이 만료되었습니다.") {
          setError("로그인이 만료되었습니다. 다시 로그인해주세요.");
          await removeToken();
          return;
        }
        console.error(err);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (userData) {
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

  const toggleConcern = useCallback((concern: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(concern)
        ? prev.filter((item) => item !== concern)
        : [...prev, concern],
    );
  }, []);

  const performPasswordUpdate = useCallback(async () => {
    setPasswordUpdateLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        showModal("로그인이 필요합니다.");
        return;
      }

      const responseData: AuthResponse<any> = await AuthApi.updatePassword({
        password: password,
      });

      if (responseData.success) {
        showModal("비밀번호가 성공적으로 변경되었습니다.");
        setPassword("");
        setPasswordConfirm("");
      } else {
        showModal(responseData.message || "비밀번호 변경에 실패했습니다.");
      }
    } catch (err) {
      console.error("Error updating password:", err);
      showModal("비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setPasswordUpdateLoading(false);
    }
  }, [password]);

  const handlePasswordUpdate = useCallback(async () => {
    if (!password) {
      showModal("새 비밀번호를 입력해주세요.");
      return;
    }
    if (!passwordConfirm) {
      showModal("비밀번호 확인을 입력해주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      showModal("비밀번호가 일치하지 않습니다.");
      return;
    }

    showModal("비밀번호를 변경하시겠습니까?", "confirm", performPasswordUpdate);
  }, [password, passwordConfirm, performPasswordUpdate]);

  const performUpdate = useCallback(async () => {
    if (!userData) return;
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        showModal("로그인이 필요합니다.");
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

      const responseData: AuthResponse<UserData> =
        await AuthApi.createSurvey(updateData);

      if (responseData.success) {
        showModal("피부 설문이 수정되었습니다.");
        fetchUserData();
      } else {
        showModal(responseData.message || "피부 설문 수정에 실패했습니다.");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      showModal("업데이트 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [
    userData,
    selectedConcerns,
    selectedSensitivity,
    selectedSkinType,
    selectedFeelingAfterWash,
    selectedAfternoonSkin,
    selectedPoreSize,
    fetchUserData,
  ]);

  const handleUpdate = useCallback(async () => {
    if (!userData) {
      showModal("사용자 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (selectedConcerns.length === 0) {
      showModal("1번 질문을 완료해주세요.");
      return;
    }
    if (!selectedSensitivity) {
      showModal("2번 질문을 완료해주세요.");
      return;
    }
    if (!selectedSkinType) {
      showModal("3번 질문을 완료해주세요.");
      return;
    }

    if (selectedSkinType === "D") {
      if (
        !selectedFeelingAfterWash ||
        !selectedAfternoonSkin ||
        !selectedPoreSize
      ) {
        showModal("3-1, 3-2, 3-3번 질문을 모두 완료해주세요.");
        return;
      }
    }

    showModal("피부 설문을 수정하시겠습니까?", "confirm", performUpdate);
  }, [
    userData,
    selectedConcerns,
    selectedSensitivity,
    selectedSkinType,
    selectedFeelingAfterWash,
    selectedAfternoonSkin,
    selectedPoreSize,
    performUpdate,
  ]);

  const onModalConfirm = () => {
    setIsModalVisible(false);
    if (onConfirmAction) {
      onConfirmAction();
      setOnConfirmAction(null);
    }
  };

  return {
    loading,
    userData,
    error,
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
    fetchUserData,
    isModalVisible,
    setIsModalVisible,
    modalMessage,
    setModalMessage,
    modalType,
    onModalConfirm,
  };
};

export const useLogout = () => {
  const handleLogout = useCallback(async () => {
    await removeToken();
  }, []);

  return { handleLogout };
};
