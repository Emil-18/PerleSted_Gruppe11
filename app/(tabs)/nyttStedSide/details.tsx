import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import React, { useMemo, useState, useCallback } from "react";
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { GeoPoint, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../../../FirebaseConfig";

import { getCurrentCoords } from "@/lib/location";
import { uploadImageAsync } from "@/lib/uploadImage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RESET_NEW_PLACE_KEY = "reset-new-place";

type Picked = { uri: string; assetId?: string; mimeType?: string; fileName?: string };


function parseImagesParam(images?: string): string[] {
  if (!images) return [];
  try {
    const parsed = JSON.parse(images);
    if (Array.isArray(parsed)) {
      return parsed.filter((u): u is string => typeof u === "string");
    }
    return [];
  } catch {
    return [];
  }
}

function extFrom(a: Picked) {
  if (!a) return "jpg";

  if (a.fileName && a.fileName.includes(".")) {
    return a.fileName.split(".").pop()!.toLowerCase();
  }

  if (a.mimeType && a.mimeType.includes("/")) {
    return a.mimeType.split("/").pop()!.toLowerCase();
  }

  if (!a.uri) return "jpg";

  const fromUri = a.uri.split(".").pop()?.split("?")[0]?.toLowerCase();
  return fromUri || "jpg";
}

export default function NewPlaceDetails() {
  const router = useRouter();
  
  const { images } = useLocalSearchParams<{ images?: string }>();
  const [imageUris, setImageUris] = useState<string[]>(() =>
  parseImagesParam(images)
  );

  useFocusEffect(
    useCallback(() => {
      if (imageUris.length === 0) {
        // No images -> this screen makes no sense, go to "Add a photo" page
        router.replace("/nyttStedSide"); // path to your picker/index screen
      }
    }, [imageUris, router])
  );

  const assets: Picked[] = useMemo(
    () => imageUris.map((uri) => ({ uri })),
    [imageUris]
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");

  const canCreate = useMemo(
    () => imageUris.length > 0 && title.trim().length > 0,
    [imageUris.length, title]
  );

  const onCreate = async () => {
    console.log("CREATE BUTTON PRESSED");
    try {
      if (!canCreate) return;

      const user = auth.currentUser;
      if (!user) {
        Alert.alert("You must be signed in to post.");
        return;
      }

      const postRef = doc(collection(db, "users", user.uid, "posts"));
      const postId = postRef.id;


      const imageUrls = await Promise.all(
        assets.map((a, i) => {
          const ext = extFrom(a);
          const path = `users/${user.uid}/posts/${postId}/image_${i}.${ext}`;
          return uploadImageAsync({ asset: a, path });
        })
      );

      console.log("IMAGE URLS AFTER UPLOAD:", imageUrls);
      // 3) Tags
      const tagArray = tags
        .split(/[,\s]+/)
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 10);

      // 4) Coordinates (optional)
      let geo: GeoPoint | null = null;
      try {
        const { lat, lng } = await getCurrentCoords();
        geo = new GeoPoint(lat, lng);
      } catch {}

      // 5) Firestore
      await setDoc(postRef, {
        id: postId,
        userId: user.uid,
        author: {
          uid: user.uid,
          email: user.email || null,
          displayName: user.displayName || null,
          photoURL: user.photoURL || null,
        },

        title: title.trim(),
        description: description.trim(),
        locationText: location.trim(),
        locationGeo: geo,
        tags: tagArray,
        imageUrls,

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likeCount: 0,
        commentCount: 0,
      });

      await AsyncStorage.setItem(RESET_NEW_PLACE_KEY, "1");

      setTitle("");
      setDescription("");
      setLocation("");
      setTags("");
      setImageUris([]);

      
      Alert.alert("Post created!");
      router.replace("/feedSide/feed/");
    } catch (error: any) {
      console.log("STORAGE UPLOAD ERROR:", {
        name: error.name,
        code: error.code,
        message: error.message,
        customData: error.customData,
      });
    }
  }

  const cover = imageUris[0];
  const others = imageUris.slice(1);

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>details</Text>

      {cover ? (
        <>
          <Image source={{ uri: cover }} style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: 12, marginBottom: 12 }} />
          {others.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4, marginBottom: 16 }}>
              {others.map((uri, idx) => (
                <View key={`${uri}-${idx}`} style={{ width: "33.333%", padding: 4 }}>
                  <Image source={{ uri }} style={{ width: "100%", aspectRatio: 1, borderRadius: 10 }} />
                </View>
              ))}
            </View>
          )}
        </>
      ) : (
        <Text style={{ color: "red", marginBottom: 16 }}>Images missing — go back and select at least one.</Text>
      )}

      <Field label="Title *">
        <TextInput value={title} onChangeText={setTitle} placeholder="Legg til overskrift ..." style={inputStyle} />
      </Field>

      <Field label="Description">
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Legg til beskrivelse ..."
          style={[inputStyle, { height: 100, textAlignVertical: "top" }]}
          multiline
        />
      </Field>

      <Field label="Location">
        <TextInput value={location} onChangeText={setLocation} placeholder="Legg til sted" style={inputStyle} />
      </Field>

      <Field label="Tags">
        <TextInput value={tags} onChangeText={setTags} placeholder="e.g. cozy, waterfront, sunset" style={inputStyle} />
      </Field>

      <Pressable
        onPress={onCreate}
        disabled={!canCreate}
        style={{ marginTop: 12, backgroundColor: canCreate ? "#111" : "#bbb", paddingVertical: 14, borderRadius: 10, alignItems: "center" }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>Create new post</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontWeight: "600", marginBottom: 6 }}>{label}</Text>
      {children}
    </View>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: "#ddd",
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 12,
  backgroundColor: "white",
} as const;
