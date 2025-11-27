import React, { useCallback, useRef, useState } from "react";
import { View, Text, Pressable, Image, Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import { useFocusEffect, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RESET_NEW_PLACE_KEY = "reset-new-place";
const IS_WEB = Platform.OS === "web";
const MAX = 10;

export default function NewPlaces() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [requesting, setRequesting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const addUris = (uris: string[]) => {
    setImages(prev => {
      const remaining = MAX - prev.length;
      const next = uris.slice(0, Math.max(0, remaining));
      if (uris.length > next.length) {
        Alert.alert("Limit reached", `You can add up to ${MAX} photos total.`);
      }
      return Array.from(new Set([...prev, ...next])).slice(0, MAX);
    });
  };

  
  const requestPermissionsIfNeeded = useCallback(async () => {
    if (IS_WEB) return;
    try {
      const hasRequested = await AsyncStorage.getItem("newPlaces_permissions_requested_v1");
      if (hasRequested) return;
      setRequesting(true);
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      if (mediaStatus !== "granted" || cameraStatus !== "granted") {
        Alert.alert("Permissions needed", "Allow Camera and Photos to add a new place.");
      } else {
        await AsyncStorage.setItem("newPlaces_permissions_requested_v1", "1");
      }
    } finally {
      setRequesting(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const checkReset = async () => {
        try {
          const flag = await AsyncStorage.getItem(RESET_NEW_PLACE_KEY);
          if (!isActive) return;

          if (flag === "1") {
            // Tøm lokal state
            setImages([]);
            setRequesting(false);

            // Fjern flagget så dette bare skjer én gang
            await AsyncStorage.removeItem(RESET_NEW_PLACE_KEY);
          }
        } catch (e) {
          console.log("Failed to check reset flag", e);
        }
      };

      checkReset();

      return () => {
        isActive = false;
      };
    }, [])
  );


  const pickFromGallery = async () => {
    if (IS_WEB) {
      fileInputRef.current?.click();
      return;
    }
  
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.9,
    });
  
    if (!res.canceled) {
      
      const uris = res.assets.map(a => a.uri);
      addUris(uris);
    }
  };


  const takePhoto = async () => {
    if (IS_WEB) {
      Alert.alert("Not available on web", "Use the gallery button (it will also open the camera on mobile browsers).");
      return;
    }
    if (images.length >= MAX) return Alert.alert("Limit reached", `Max ${MAX} photos.`);
    const res = await ImagePicker.launchCameraAsync({
      quality: Platform.OS === "ios" ? 0.9 : 1,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!res.canceled && res.assets?.length) addUris([res.assets[0].uri]);
  };

  const onWebFilesSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files ?? []);
    const uris = files.map(f => URL.createObjectURL(f));
    addUris(uris);
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Add a photo of this place</Text>
        {images.length > 0 && (
          <Pressable
            onPress={() =>
              router.push({ pathname: "/newPlaces/details", params: { images: JSON.stringify(images) } })
            }
            style={{ paddingHorizontal: 14, paddingVertical: 10, backgroundColor: "#2563eb", borderRadius: 10 }}
          >
            <Text style={{ color: "white", fontWeight: "700" }}>Next</Text>
          </Pressable>
        )}
      </View>

      <Text style={{ opacity: 0.6 }}>{images.length}/{MAX} selected</Text>

      {images.length ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 }}>
          {images.map((uri, idx) => (
            <View key={`${uri}-${idx}`} style={{ width: "33.333%", padding: 4 }}>
              <View style={{ aspectRatio: 1, position: "relative" }}>
                <Image source={{ uri }} style={{ width: "100%", height: "100%", borderRadius: 10 }} />
                <Pressable
                  onPress={() => setImages(prev => prev.filter((_, i) => i !== idx))}
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
          <Text style={{ opacity: 0.6 }}>No photos — choose from galler or take a photo</Text>
        </View>
      )}

      <View style={{ flexDirection: "row", gap: 12 }}>
        <Pressable
          onPress={pickFromGallery}
          disabled={requesting || images.length >= MAX}
          style={{
            flex: 1, backgroundColor: "#eee", paddingVertical: 14,
            borderRadius: 10, alignItems: "center",
            opacity: requesting || images.length >= MAX ? 0.6 : 1,
          }}
        >
          <Text>{IS_WEB ? "Choose files" : "Choose from gallery"}</Text>
        </Pressable>

        {!IS_WEB && (
          <Pressable
            onPress={takePhoto}
            disabled={requesting || images.length >= MAX}
            style={{
              flex: 1, backgroundColor: "#eee", paddingVertical: 14,
              borderRadius: 10, alignItems: "center",
              opacity: requesting || images.length >= MAX ? 0.6 : 1,
            }}
          >
            <Text>Take a photo</Text>
          </Pressable>
        )}
      </View>

      {/* Hidden web file input */}
      {IS_WEB && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onWebFilesSelected}
          style={{ display: "none" }}
        />
      )}

      {images.length === 0 && (
        <Text style={{ fontSize: 12, opacity: 0.6 }}>
        </Text>
      )}
    </View>
  );
}

