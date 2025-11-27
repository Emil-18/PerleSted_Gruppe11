import { router } from "expo-router";
import {
  collectionGroup,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { db } from "../../../FirebaseConfig";
import { PearlCard } from "../../../components/pearl/PearlCard";

type Post = {
  id: string;
  userId: string;
  title: string;
  imageUrls: string[];
  author: {
    displayName: string | null;
    uid: string;
    photoURL: string | null;
  };
};

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const q = query(
          collectionGroup(db, "posts"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Post[];
        setPosts(items);
      } catch (e: any) {
        console.log("Error loading posts:", e?.code, e?.message);
      }
    };
  
    loadPosts();
  }, []);

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <PearlCard
          id={item.id}
          title={item.title}
          imageUrl={item.imageUrls[0]}
          onPress={() =>
            router.push({
              pathname: "/feed/[id]",
              params: { id: item.id, uid: item.userId },
            })
          }
        />
      )}
      ListHeaderComponent={<View style={styles.content}></View>}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
