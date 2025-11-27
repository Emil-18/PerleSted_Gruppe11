import React, { useEffect, useState } from "react";
import { FlatList, View, Text, Image } from "react-native";
import Button from "@/components/Button";
import { styles } from "../styles";

import { db } from "../../FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";

interface Post {
  id: string;
  title: string;
  description: string;
  imageUrls?: string[];
  author: {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
  };
}

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const loadPosts = async () => {
      const postsCol = collection(db, "posts");
      const snapshot = await getDocs(postsCol);

      const results: Post[] = [];

      snapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data(),
        } as Post);
      });

      setPosts(results);
    };

    loadPosts();
  }, []);

  return (
    <View>
      <Button
        text="Min profil"
        path="/profile"
        buttonStyle={styles.profileButton}
        buttonTextStyle={styles.profileText}
      />

      <Button
        text="Innstillinger"
        path="/settings"
        buttonStyle={styles.profileButton}
        buttonTextStyle={styles.profileText}
      />

      <Text style={{ marginTop: 20, fontSize: 20, fontWeight: "bold" }}>
        Innlegg fra alle brukere
      </Text>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 15 }}>
            <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
            <Text>{item.description}</Text>

            {item.imageUrls && item.imageUrls.length > 0 && (
              <Image
                source={{ uri: item.imageUrls[0] }}
                style={{ width: 150, height: 150, marginTop: 10 }}
              />
            )}

            <Text style={{ marginTop: 5, fontStyle: "italic" }}>
              Av: {item.author.displayName ?? "Ukjent bruker"}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default Home;
