import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
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

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function PearlDetailScreen() {
  const router = useRouter();
  const { id, uid } = useLocalSearchParams<{ id: string; uid: string }>();

  // 🔹 ALL hooks must be here at the top, before any return
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!id || !uid) {
      setLoading(false);
      return;
    }

    const ref = doc(db, "users", uid, "posts", id);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setPost(null);
        } else {
          setPost(snap.data() as Post);
        }
        setLoading(false);
      },
      (error) => {
        console.log("Error loading post:", error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [id, uid]);

  // 🔹 early returns are OK *after* all hooks
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

  const createdBy =
    post.author?.displayName || post.author?.email || "Ukjent";

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f9fff7" }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={{ position: "relative" }}>
        {post.imageUrls && post.imageUrls.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH
              );
              setCurrentIndex(index);
            }}
          >
            {post.imageUrls.map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                style={{ width: SCREEN_WIDTH, height: 280 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
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

        {/* små prikker for hvilken side du er på */}
        {post.imageUrls && post.imageUrls.length > 1 && (
          <View
            style={{
              position: "absolute",
              bottom: 10,
              alignSelf: "center",
              flexDirection: "row",
            }}
          >
            {post.imageUrls.map((_, index) => (
              <View
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 4,
                  backgroundColor:
                    index === currentIndex
                      ? "#111827"
                      : "rgba(0,0,0,0.3)",
                }}
              />
            ))}
          </View>
        )}

        {/* Tilbake-knapp */}
        <TouchableOpacity
          onPress={() => router.replace("feedSide/feed")}
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

        {/* Favoritt-knapp */}
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

        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}
        >
          <Ionicons name="person-circle-outline" size={20} color="#000" />
          <Text style={{ marginLeft: 6 }}>Opprettet av {createdBy}</Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
