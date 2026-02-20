import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useMyReviews } from "../myReviews.utils";
import { MyReviewItem } from "../../../libs/api";

const MyReviews = () => {
  const { myReviews, loading, error } = useMyReviews();
  const router = useRouter();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>내가 작성한 리뷰를 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (myReviews.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>작성한 리뷰가 없습니다.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: MyReviewItem }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => router.push(`/product/${item.productId}`)}
    >
      <Image
        source={{
          uri:
            item.productImgUrl ||
            "https://viewty-s3.s3.ap-northeast-2.amazonaws.com/image/placeholder.png",
        }}
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.productName}</Text>
        <Text style={styles.reviewContent}>{item.content}</Text>
        <Text style={styles.reviewRating}>평점: {item.rating} / 5</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={myReviews}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
  listContainer: {
    padding: 10,
  },
  itemContainer: {
    flexDirection: "row",
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  reviewContent: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  reviewRating: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
});

export default MyReviews;
