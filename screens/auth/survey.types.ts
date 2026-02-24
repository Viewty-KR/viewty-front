export interface SurveyData {
  userId: string;
  concerns: string[];
  sensitivity: string;
  skinType: string;
  feelingAfterWash?: string;
  afternoonSkin?: string;
  poreSize?: string;
}

export interface SurveyHookResult {
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
  handleCancel: () => void;
  handleSave: () => Promise<void>;
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  modalMessage: string;
  setModalMessage: (message: string) => void;
  onModalConfirm: () => void;
}
