import React, { useCallback, useState } from "react";
import { View, Text, Pressable, Image, Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import { useFocusEffect, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PERMISSION_FLAG = "newPlaces_permissions_requested_v1";

export default function NewPlaces() {
  const router = useRouter();
  // const [imageUri, setImageUri] = useState<string | null>(null);
const MAX = 10;
const [images, setImages] = useState<string[]>([]);

const addUris = (uris: string[]) => {
  setImages(prev => {
    const remaining = MAX - prev.length;
    const next = uris.slice(0, Math.max(0, remaining));
    if (uris.length > next.length) {
      Alert.alert("Limit reached", `You can add up to ${MAX} photos total.`);
    }

    const merged = Array.from(new Set([...prev, ...next]));
    return merged.slice(0, MAX);
  });
};

const removeAt = (idx: number) =>
  setImages(prev => prev.filter((_, i) => i !== idx));

  const [requesting, setRequesting] = useState(false);

  // Request both gallery & camera permissions (first time the tab is opened)
  const requestPermissionsIfNeeded = useCallback(async () => {
    try {
      const hasRequested = await AsyncStorage.getItem(PERMISSION_FLAG);
      if (hasRequested) return;

      setRequesting(true);
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();

      if (mediaStatus !== "granted" || cameraStatus !== "granted") {
        Alert.alert(
          "Permissions needed",
          "Please allow Camera and Photos permissions in Settings to add a new place."
        );
      } else {
        await AsyncStorage.setItem(PERMISSION_FLAG, "1");
      }
    } finally {
      setRequesting(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      requestPermissionsIfNeeded();
    }, [requestPermissionsIfNeeded])
  );

  const pickFromGallery = async () => {
    const perm = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: false,
      allowsMultipleSelection: true,
    });
    if (!res.canceled && res.assets?.length) {
      addUris(res.assets.map(a => a.uri).filter(Boolean) as string[]);
    }
  };
  

  const takePhoto = async () => {
    if (images.length >= MAX) {
      return Alert.alert("Limit reached", `Max ${MAX} photos.`);
    }
    const perm = await Camera.getCameraPermissionsAsync();
    if (perm.status !== "granted") {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== "granted") return;
    }
    const res = await ImagePicker.launchCameraAsync({
      quality: Platform.OS === "ios" ? 0.9 : 1,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!res.canceled && res.assets?.length) addUris([res.assets[0].uri]);
  };
  

  return (
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
  <Text style={{ fontSize: 18, fontWeight: "700" }}>Add a photo of this place</Text>

  {images.length > 0 ? (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/newPlaces/details",
          params: { images: JSON.stringify(images) },
        })
      }
      style={{ paddingHorizontal: 14, paddingVertical: 10, backgroundColor: "#2563eb", borderRadius: 10 }}
    >
      <Text style={{ color: "white", fontWeight: "700" }}>Next</Text>
    </Pressable>
  ) : null}
</View>

<Text style={{ opacity: 0.6 }}>{images.length}/{MAX} selected</Text>



{images.length ? (
  <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 }}>
    {images.map((uri, idx) => (
      <View key={`${uri}-${idx}`} style={{ width: "33.333%", padding: 4 }}>
        <View style={{ aspectRatio: 1, position: "relative" }}>
          <Image source={{ uri }} style={{ width: "100%", height: "100%", borderRadius: 10 }} />
          <Pressable
            onPress={() => removeAt(idx)}
            style={{ position: "absolute", top: 6, right: 6, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 }}
          >
            <Text style={{ color: "white", fontWeight: "700" }}>×</Text>
          </Pressable>
        </View>
      </View>
    ))}
  </View>
) : (
  <View style={{ width: "100%", aspectRatio: 4/3, borderRadius: 12, borderWidth: 1, borderStyle: "dashed", alignItems: "center", justifyContent: "center", borderColor: "#ddd" }}>
    <Text style={{ opacity: 0.6 }}>No photos — choose or take up to 10</Text>
  </View>
)}

<Pressable
  onPress={pickFromGallery}
  disabled={requesting || images.length >= MAX}
  style={{
    flex: 1,
    backgroundColor: "#eee",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    opacity: requesting || images.length >= MAX ? 0.6 : 1, // visual feedback
  }}
>
  <Text>Choose from gallery</Text>
</Pressable>

<Pressable
  onPress={takePhoto}
  disabled={requesting || images.length >= MAX}
  style={{
    flex: 1,
    backgroundColor: "#eee",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    opacity: requesting || images.length >= MAX ? 0.6 : 1,
  }}
>
  <Text>Take a photo</Text>
</Pressable>


      {images.length === 0 ? (
      <Text style={{ fontSize: 12, opacity: 0.6 }}>
        “Next” appears here after you select a photo.
        </Text>
        ) : null}
    </View>
  );
}
