import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/FirebaseConfig";

type Post = {
  id: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
};

export default function PostsMapScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultCenter = { latitude: 59.9139, longitude: 10.7522 };

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

  const region: Region = useMemo(() => {
    const center =
      posts.length > 0
        ? { latitude: posts[0].latitude, longitude: posts[0].longitude }
        : defaultCenter;

    return {
      ...center,
      latitudeDelta: 0.2,
      longitudeDelta: 0.2,
    };
  }, [posts]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Laster kart…</Text>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Ingen poster med lokasjon enda.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={region}>
        {posts.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
          >
            <View style={styles.markerCard}>
              {p.imageUrl && (
                <Image
                  source={{ uri: p.imageUrl }}
                  style={styles.markerImage}
                  resizeMode="cover"
                />
              )}
              <Text style={styles.markerTitle} numberOfLines={1}>
                {p.title}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const CARD_BG = "#eaf7e5";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CARD_BG,
  },
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CARD_BG,
  },
  markerCard: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  markerImage: {
    width: 60,
    height: 40,
    borderRadius: 8,
    marginBottom: 2,
  },
  markerTitle: {
    fontSize: 12,
    fontWeight: "600",
  },
});
