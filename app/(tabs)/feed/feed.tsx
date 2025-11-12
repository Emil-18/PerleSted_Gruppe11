import { router } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { PearlCard } from "../../../components/pearl/PearlCard";
import { DummyPearls } from "../../../data/pearlsDummy";

const Feed = () => {
  return (
    <FlatList
      data={DummyPearls}
      keyExtractor={(item) => item.id} //each item has i own Id
      renderItem={({ item }) => (
        <PearlCard
          id={item.id}
          title={item.title}
          imageLocal={item.imageLocal}
          //imageUrl={item.imageUrl}

          onPress={() =>
            router.push({
              pathname: "/feed/[id]",
              params: { id: String(item.id) },
            })
          }
        />
      )}
      ListHeaderComponent={
        <View style={styles.content}>
          <View style={styles.row}></View>
        </View>
      }
    />
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fcfffd",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center", // ถ้าจะมีหลายการ์ดค่อยใช้ FlatList + numColumns/columnWrapperStyle
  },
});
export default Feed;
