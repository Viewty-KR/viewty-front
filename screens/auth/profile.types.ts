export interface UserData {
  userId: string;
  email: string;
  name: string;
  concerns: string[] | string; 
  sensitivity: string | null;
  skinType: string | null;
  feelingAfterWash?: string | null; // skinType이 'D'일 때만 존재
  afternoonSkin?: string | null; // skinType이 'D'일 때만 존재
  poreSize?: string | null; // skinType이 'D'일 때만 존재
}

export interface AuthResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ProfileHookResult {
  loading: boolean;
  userData: UserData | null;
  error: string | null;
  passwordUpdateLoading: boolean;
  password: string;
  setPassword: (password: string) => void;
  passwordConfirm: string;
  setPasswordConfirm: (passwordConfirm: string) => void;
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
  handlePasswordUpdate: () => Promise<void>;
  handleUpdate: () => Promise<void>;
  fetchUserData: () => Promise<void>;
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  modalMessage: string;
  setModalMessage: (message: string) => void;
  modalType: "error" | "confirm" | "alert";
  onModalConfirm: () => void;
}
