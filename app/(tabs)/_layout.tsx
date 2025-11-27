import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../features/components/Header";

const _Layout = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <Header />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { height: 50, paddingTop: 5, paddingBottom: 2 },
          tabBarItemStyle: { paddingVertical: 7 },
          tabBarLabelStyle: { fontSize: 12 },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Hjem",
            tabBarIcon: ({ color, size, focused }) => (
              <Feather name="home" size={34} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="feedSide"
          options={{
            title: "Feed",
            tabBarIcon: ({ color, size, focused }) => (
              <Feather name="image" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="nyttStedSide"
          options={{
            title: "Nytt sted",
            tabBarIcon: ({ color, size, focused }) => (
              <Feather name="plus-circle" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="map"
          options={{
            title: "Kart",
            tabBarIcon: ({ color, size, focused }) => (
              <Feather name="map" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen name="settings" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="pearl" options={{ href: null }} />
      </Tabs>
    </SafeAreaView>
  );
};

export default _Layout;
