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
  const [updateMessage, setUpdateMessage] = useState("");
  const [passwordUpdateMessage, setPasswordUpdateMessage] = useState("");
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

  const handlePasswordUpdate = useCallback(async () => {
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
        setPasswordUpdateMessage("로그인이 필요합니다.");
        return;
      }

      const responseData: AuthResponse<any> = await AuthApi.updatePassword({
        password: password,
      });

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
  }, [password, passwordConfirm]);

  const handleUpdate = useCallback(async () => {
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
        setUpdateMessage("로그인이 필요합니다.");
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

  return {
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
    fetchUserData,
  };
};

export const useLogout = () => {
  const handleLogout = useCallback(async () => {
    await removeToken();
    alert("로그아웃 되었습니다.");
  }, []);

  return { handleLogout };
};
