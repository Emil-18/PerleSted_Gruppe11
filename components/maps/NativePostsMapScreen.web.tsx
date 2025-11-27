import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function NativePostsMapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kart</Text>
      <Text style={styles.text}>
        Kartet støttes bare på mobil (iOS/Android).{"\n"}
        Åpne appen i Expo Go eller en simulator/emulator for å se kartet.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    textAlign: "center",
    color: "#555",
  },
});
