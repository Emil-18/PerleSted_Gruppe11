import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../../FirebaseConfig";

type Post = {
  id: string;
  title: string;
  description?: string;
  imageUrls: string[];
  author?: {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
  };
};

export default function PearlDetailScreen() {
  const router = useRouter();
  const { id, uid } = useLocalSearchParams<{ id: string; uid: string }>();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      if (!id || !uid) {
        setLoading(false);
        return;
      }
      try {
        // direkte path: users/{uid}/posts/{id}
        const ref = doc(db, "users", uid, "posts", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setPost(null);
        } else {
          setPost(snap.data() as Post);
        }
      } catch (e) {
        console.log("Error loading post:", e);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id, uid]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Laster innlegget...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Fant ikke innlegget</Text>
      </View>
    );
  }

  const cover = post.imageUrls?.[0];
  const createdBy =
    post.author?.displayName ||
    post.author?.email ||
    "Ukjent";

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f9fff7" }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={{ position: "relative" }}>
        {cover ? (
          <Image
            source={{ uri: cover }}
            style={{ width: "100%", height: 280 }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: "100%",
              height: 280,
              backgroundColor: "#e5e7eb",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#6b7280" }}>No image</Text>
          </View>
        )}

        {/* Tilbake-knapp */}
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/feed/feed")}
          style={{
            position: "absolute",
            top: 40,
            left: 16,
            backgroundColor: "rgba(255,255,255,0.8)",
            borderRadius: 30,
            padding: 6,
          }}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>

        {/* Favoritt-knapp (bare UI for nå) */}
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 280,
            right: 10,
            backgroundColor: "rgba(255,255,255,0.8)",
            borderRadius: 50,
            padding: 6,
          }}
          hitSlop={8}
        >
          <Ionicons name="heart-outline" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Innhold */}
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 6 }}>
          {post.title}
        </Text>

        {!!post.description && (
          <Text style={{ color: "#444", lineHeight: 20, marginBottom: 10 }}>
            {post.description}
          </Text>
        )}

        {/* Opprettet av */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
          <Ionicons name="person-circle-outline" size={20} color="#000" />
          <Text style={{ marginLeft: 6 }}>
            Opprettet av {createdBy}
          </Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
