import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Platform,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { AppleMaps, GoogleMaps } from "expo-maps";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/FirebaseConfig";
import { useRouter } from "expo-router";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { PanGestureHandler } from "react-native-gesture-handler";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.4;

type Post = {
  id: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
};

export default function PostsMapScreen() {
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const defaultCenter = { latitude: 59.9139, longitude: 10.7522 };


  const sheetTranslateY = useSharedValue(SHEET_HEIGHT + 40);

  useEffect(() => {
    const ref = collection(db, "posts");

    const unsub = onSnapshot(ref, (snapshot) => {
      const next: Post[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as any;
        const geo = data.locationGeo;

        if (!geo) return;

        const firstImage =
          Array.isArray(data.imageUrls) && data.imageUrls.length > 0
            ? data.imageUrls[0]
            : undefined;

        next.push({
          id: docSnap.id,
          title: data.title ?? "Untitled",
          description: data.description ?? "",
          latitude: geo.latitude,
          longitude: geo.longitude,
          imageUrl: firstImage,
        });
      });

      setPosts(next);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const center = useMemo(() => {
    if (posts.length === 0) return defaultCenter;
    return {
      latitude: posts[0].latitude,
      longitude: posts[0].longitude,
    };
  }, [posts]);

  const markers = useMemo(
    () =>
      posts.map((p) => ({
        id: p.id,
        coordinates: { latitude: p.latitude, longitude: p.longitude },
        title: p.title,
        snippet: p.description,
        showCallout: true,
      })),
    [posts]
  );

  const showSheet = () => {
    sheetTranslateY.value = withSpring(SHEET_HEIGHT * 0.3);
  };

  const hideSheet = () => {
    sheetTranslateY.value = withSpring(SHEET_HEIGHT + 40);
    runOnJS(setSelectedPost)(null);
  };

  const onMarkerPress = (markerId: string) => {
    const post = posts.find((p) => p.id === markerId);
    if (!post) return;
    setSelectedPost(post);
    showSheet();
  };

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  const handleGesture = (event: any) => {
    const { translationY, state, velocityY } = event.nativeEvent ?? event;

    if (state === 2) {
      sheetTranslateY.value = Math.max(
        0,
        Math.min(SHEET_HEIGHT + 40, sheetTranslateY.value + translationY * 0.9)
      );
    } else if (state === 5 || state === 3) {
      const isClosing =
        sheetTranslateY.value > SHEET_HEIGHT * 0.7 || velocityY > 800;

      if (isClosing) {
        sheetTranslateY.value = withSpring(SHEET_HEIGHT + 40, {}, () => {
          runOnJS(setSelectedPost)(null);
        });
      } else if (sheetTranslateY.value < SHEET_HEIGHT * 0.4) {
        sheetTranslateY.value = withSpring(0);
      } else {
        sheetTranslateY.value = withSpring(SHEET_HEIGHT * 0.3);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading posts on map...</Text>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No posts with location yet.</Text>
      </View>
    );
  }

  const MapComponent = Platform.OS === "ios" ? AppleMaps.View : GoogleMaps.View;

  return (
    <View style={styles.container}>
      <MapComponent
        style={StyleSheet.absoluteFillObject}
        cameraPosition={{
          coordinates: center,
          zoom: 11,
        }}
        markers={markers}
        properties={{
          isMyLocationEnabled: true,
        }}
        onMarkerClick={(marker) => {
          if (marker.id) {
            onMarkerPress(marker.id);
          }
        }}
      />

      {selectedPost && (
        <PanGestureHandler onGestureEvent={handleGesture} onHandlerStateChange={handleGesture}>
          <Animated.View
            style={[
              styles.sheetContainer,
              { height: SHEET_HEIGHT + 40 },
              animatedSheetStyle,
            ]}
          >
            <View style={styles.sheetHandle} />
            <View style={styles.sheetContent}>
              <Text style={styles.sheetTitle} numberOfLines={1}>
                {selectedPost.title}
              </Text>

              {selectedPost.imageUrl && (
                <Image
                  source={{ uri: selectedPost.imageUrl }}
                  style={styles.sheetImage}
                  resizeMode="cover"
                />
              )}

              <Text style={styles.sheetDescription} numberOfLines={4}>
                {selectedPost.description || "No description"}
              </Text>

              <View style={{ marginTop: 10 }}>
                <Text
                  style={styles.sheetLink}
                  onPress={() =>
                    router.push({
                      pathname: "/feed/[id]",
                      params: { id: selectedPost.id },
                    })
                  }
                >
                  View details →
                </Text>
              </View>
            </View>
          </Animated.View>
        </PanGestureHandler>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  sheetContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -40,
    backgroundColor: "white",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#ddd",
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 6,
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  sheetImage: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    marginBottom: 10,
  },
  sheetDescription: {
    fontSize: 14,
    color: "#444",
  },
  sheetLink: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
  },
});
