import { useState, useEffect, useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AuthApi } from "../../libs/api";
import { SurveyHookResult, SurveyData } from "./survey.types";

export const useSurvey = (): SurveyHookResult => {
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

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState<(() => void) | null>(
    null,
  );

  const showModal = useCallback((message: string, action?: () => void) => {
    setModalMessage(message);
    setOnConfirmAction(() => action || null);
    setIsModalVisible(true);
  }, []);

  useEffect(() => {
    if (!userId) {
      showModal("사용자 정보가 없습니다. 로그인 페이지로 이동합니다.", () =>
        router.replace("/auth/login"),
      );
    }
  }, [userId, router, showModal]);

  const toggleConcern = useCallback((concern: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(concern)
        ? prev.filter((item) => item !== concern)
        : [...prev, concern],
    );
  }, []);

  const handleCancel = useCallback(() => {
    setSelectedConcerns([]);
    setSelectedSensitivity(null);
    setSelectedSkinType(null);
    setSelectedFeelingAfterWash(null);
    setSelectedAfternoonSkin(null);
    setSelectedPoreSize(null);
  }, []);

  const handleSave = useCallback(async () => {
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

    if (!userId) {
      showModal("사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.", () =>
        router.replace("/auth/login"),
      );
      return;
    }

    const surveyData: SurveyData = {
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
        showModal("회원가입이 완료되었습니다.", () =>
          router.replace("/auth/login"),
        );
      } else {
        showModal(responseData.message || "설문 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      showModal("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    }
  }, [
    userId,
    router,
    selectedConcerns,
    selectedSensitivity,
    selectedSkinType,
    selectedFeelingAfterWash,
    selectedAfternoonSkin,
    selectedPoreSize,
    showModal,
  ]);

  const onModalConfirm = () => {
    setIsModalVisible(false);
    if (onConfirmAction) {
      onConfirmAction();
      setOnConfirmAction(null);
    }
  };

  return {
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
    setIsModalVisible,
    modalMessage,
    setModalMessage,
    onModalConfirm,
  };
};
