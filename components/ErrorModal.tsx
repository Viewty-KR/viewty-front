import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  BORDER_RADIUS,
  COLORS,
  FONT_SIZE,
  FONT_WEIGHT,
  ICON_SIZE,
  modalShadowStyle,
  SPACING,
} from "../constants/theme";

export type ModalType = "error" | "confirm" | "alert";

interface ErrorModalProps {
  visible: boolean;
  type?: ModalType;
  title?: string;
  message: string | null;
  onRetry?: () => void;  // 확인, 다시 시도 버튼
  onClose?: () => void;   // 취소, 닫기 버튼
  confirmText?: string;
  cancelText?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const ErrorModal = ({
  visible,
  type = "error",
  title,
  message,
  onRetry,
  onClose,
  confirmText,
  cancelText,
  icon,
}: ErrorModalProps) => {
  // 모달 타입별 기본 설정
  const config = {
    error: {
      defaultTitle: "오류가 발생했습니다",
      defaultIcon: "alert-circle" as const,
      defaultConfirmText: "다시 시도",
      defaultCancelText: "닫기",
      showCancel: true,
    },
    confirm: {
      defaultTitle: "확인",
      defaultIcon: "help-circle" as const,
      defaultConfirmText: "확인",
      defaultCancelText: "취소",
      showCancel: true,
    },
    alert: {
      defaultTitle: "알림",
      defaultIcon: "notifications" as const,
      defaultConfirmText: "확인",
      defaultCancelText: "",
      showCancel: false,
    },
  }[type];

  const finalTitle = title || config.defaultTitle;
  const finalIcon = icon || config.defaultIcon;
  const finalConfirmText = confirmText || config.defaultConfirmText;
  const finalCancelText = cancelText || config.defaultCancelText;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose || onRetry}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={finalIcon}
              size={ICON_SIZE.modalIcon}
              color={COLORS.primary}
            />
          </View>
          <Text style={styles.title}>{finalTitle}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonContainer}>
            {config.showCancel && onClose && (
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={onClose}
              >
                <Text style={styles.buttonTextSecondary}>{finalCancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={onRetry}
            >
              <Text style={styles.buttonTextPrimary}>{finalConfirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlayDark,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  content: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.xxxl,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xxl,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    ...modalShadowStyle,
  },
  iconContainer: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  message: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: SPACING.xxl,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: SPACING.md,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.lightGray,
  },
  buttonTextPrimary: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
  },
  buttonTextSecondary: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.medium,
  },
});
