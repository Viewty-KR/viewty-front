import React from "react";
import { View, Text, StyleSheet } from "react-native";

const MyReviews = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.emptyText}>아직 작성한 리뷰가 없습니다.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
  },
});

export default MyReviews;