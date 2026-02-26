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
        <ActivityIndicator size="large" color="#FF2D78" />
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
        <Text style={styles.emptyText}>찜한 상품이 없습니다.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: BookmarkItem }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      activeOpacity={0.8}
      onPress={() => router.push(`/product/${item.productId}`)}
    >
      <Image
        source={{
          uri:
            item.productImgUrl ||
            "https://via.placeholder.com/150?text=No+Image",
        }}
        style={styles.itemImage}
        resizeMode="contain"
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.productName}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={bookmarkList}
      renderItem={renderItem}
      keyExtractor={(item) => item.bookmarkId.toString()}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
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
  emptyText: {
    fontSize: 15,
    color: "#888",
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: "row",
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    marginRight: 14,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    lineHeight: 20,
  },
});

export default BookmarkList;
