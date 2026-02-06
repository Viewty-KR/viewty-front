import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

export const getToken = async () => {
  let token: string | null = null;
  if (Platform.OS === "web") {
    token = localStorage.getItem("userToken");
  } else {
    token = await SecureStore.getItemAsync("userToken");
  }

  if (!token) {
    return null;
  }

  return token;
};

export const setToken = async (token: string) => {
  if (Platform.OS === "web") {
    localStorage.setItem("userToken", token);
  } else {
    await SecureStore.setItemAsync("userToken", token);
  }
};

export const removeToken = async () => {
  if (Platform.OS === "web") {
    localStorage.removeItem("userToken");
  } else {
    await SecureStore.deleteItemAsync("userToken");
  }
  router.replace("/");
};
