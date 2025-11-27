import { router } from "expo-router";
import {
  collectionGroup,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { db } from "../../../FirebaseConfig";
import { PearlCard } from "../../../components/pearl/PearlCard";

type Post = {
  id: string;
  userId: string;
  title: string;
  imageUrls: string[];
  author?: {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
  };
};

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collectionGroup(db, "posts"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        })) as Post[];

        setPosts(items);
        setLoading(false);
      },
      (error) => {
        console.log("Error loading posts (realtime):", error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
        <Text>Laster inn innlegg...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <PearlCard
          id={item.id}
          title={item.title}
          imageUrl={item.imageUrls?.[0]}
          onPress={() =>
            router.push({
              pathname: "/feedSide/[id]",
              params: { id: item.id, uid: item.userId }, // 👈 viktig
            })
          }
        />
      )}
      ListHeaderComponent={<View style={styles.content} />}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
