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
import { useBookmarkList, BookmarkItem } from "../bookmarkList.utils";

const BookmarkList = () => {
  const { bookmarkList, loading, error } = useBookmarkList();
  const router = useRouter();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>찜 목록을 불러오는 중...</Text>
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

  if (bookmarkList.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>찜한 상품이 없습니다.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: BookmarkItem }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => router.push(`/product/${item.productId}`)}
    >
      <Image
        source={{
          uri:
            item.productImgUrl ||
            "https://via.placeholder.com/150?text=No+Image",
        }}
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.productName}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={bookmarkList}
      renderItem={renderItem}
      keyExtractor={(item) => item.bookmarkId.toString()}
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
});

export default BookmarkList;