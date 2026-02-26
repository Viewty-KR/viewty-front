import { StyleSheet } from "react-native";

export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  customHeader: {
    flexDirection: "row",
    justifyContent: "center", // 변경: 가운데 정렬로 변경
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    position: "relative", // 추가: 로그아웃 버튼의 위치 기준점 설정
  },
  customHeaderTitle: {
    fontSize: 18, // 주변 폰트 크기에 맞춰 살짝 조정 (필요시 22 유지)
    fontWeight: "bold",
    color: "#333",
  },
  section: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  infoText: {
    fontSize: 15,
    color: "#555",
    marginBottom: 8,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  input: {
    height: 48,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: "#fafafa",
    fontSize: 15,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#444",
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginLeft: 5,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: 4,
    marginRight: 10,
  },
  checkboxSelected: {
    backgroundColor: "#FF2D78",
    borderColor: "#FF2D78",
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#ccc",
    marginRight: 10,
  },
  radioSelected: {
    backgroundColor: "#FF2D78",
    borderColor: "#FF2D78",
  },
  optionText: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  logoutButton: {
    position: "absolute", // 추가: 우측 끝에 고정
    right: 20, // 추가
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 6,
  },
  logoutButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  actionButton: {
    backgroundColor: "#333",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
});
