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

interface ErrorModalProps {
  visible: boolean;
  message: string | null;
  onClose: () => void;
  onRetry: () => void;
}

export const ErrorModal = ({
  visible,
  message,
  onClose,
  onRetry,
}: ErrorModalProps) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="alert-circle"
              size={ICON_SIZE.modalIcon}
              color={COLORS.primary}
            />
          </View>
          <Text style={styles.title}>오류가 발생했습니다</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={onClose}
            >
              <Text style={styles.buttonTextSecondary}>닫기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={onRetry}
            >
              <Text style={styles.buttonTextPrimary}>다시 시도</Text>
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
    padding: SPACING.xxxl,
    width: "100%",
    maxWidth: 400,
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
