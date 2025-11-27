import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Alert,
} from "react-native";

import {
  GeoPoint,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../../../FirebaseConfig";

import { uploadImageAsync } from "@/lib/uploadImage";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  LocationSuggestion,
  PearlDetail,
} from "../../../components/pearl/PearlDetail";

const RESET_NEW_PLACE_KEY = "reset-new-place";
const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;


type Picked = {
  uri: string;
  assetId?: string;
  mimeType?: string;
  fileName?: string;
};

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
        router.replace("/nyttStedSide");
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


  const [locationGeo, setLocationGeo] = useState<GeoPoint | null>(null);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const canCreate = useMemo(
    () => imageUris.length > 0 && title.trim().length > 0,
    [imageUris.length, title]
  );

  useEffect(() => {
    const q = location.trim();
    if (!q || q.length < 2) {
      setSuggestions([]);
      return;
    }
    if (!MAPBOX_TOKEN) {
      console.warn("Missing EXPO_PUBLIC_MAPBOX_TOKEN");
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);

        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          q
        )}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5&language=no`;

        const res = await fetch(url);
        const json = await res.json();

        const items: LocationSuggestion[] = (json.features ?? []).map(
          (f: any) => ({
            id: f.id,
            name: f.place_name as string,
            lat: f.center[1],
            lng: f.center[0],
          })
        );

        setSuggestions(items);
      } catch (e) {
        console.warn("Failed to fetch location suggestions", e);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [location]);

  const handleSelectSuggestion = (s: LocationSuggestion) => {
    setLocation(s.name);
    setLocationGeo(new GeoPoint(s.lat, s.lng));
    setSuggestions([]);
  };

  const onCreate = async () => {
    console.log("CREATE BUTTON PRESSED");
    try {
      if (!canCreate) return;

      const user = auth.currentUser;
      if (!user) {
        Alert.alert("You must be signed in to post.");
        return;
      }

      if (!locationGeo) {
        Alert.alert(
          "Velg sted",
          "Søk etter sted og trykk på et forslag, slik at vi kan plassere posten på kartet."
        );
        return;
      }

      const postRef = doc(collection(db, "users", user.uid, "posts"));
      const postId = postRef.id;

      const imageUrls = await Promise.all(
        assets.map((a, i) => {
          const ext = extFrom(a);
          const path = `users/${user.uid}/posts/${postId}/image_${i}.jpg`;
          return uploadImageAsync({ asset: a, path });
        })
      );

      const tagArray = tags
        .split(/[,\s]+/)
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 10);

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
        locationGeo: locationGeo,
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
      setLocationGeo(null);
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
  };

  return (
    <PearlDetail
      imageUris={imageUris}
      title={title}
      description={description}
      location={location}
      tags={tags}
      canCreate={canCreate}
      suggestions={suggestions}
      loadingSuggestions={loadingSuggestions}
      hasLocationGeo={!!locationGeo}
      onChangeTitle={setTitle}
      onChangeDescription={setDescription}
      onChangeLocation={(text) => {
        setLocation(text);
        setLocationGeo(null);
      }}
      onChangeTags={setTags}
      onSelectSuggestion={handleSelectSuggestion}
      onCreate={onCreate}
    />
  );
}