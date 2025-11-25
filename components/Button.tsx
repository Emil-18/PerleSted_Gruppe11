import { Pressable, StyleProp, Text, TextStyle, ViewStyle } from "react-native";

import { router } from "expo-router";
import React from "react";

interface ButtonProps {
  text: string;
  path: Parameters<typeof router.push>[0];
  buttonStyle: StyleProp<ViewStyle>;
  buttonTextStyle: StyleProp<TextStyle>;
}

export default function Button({
  path,
  text,
  buttonStyle,
  buttonTextStyle,
}: ButtonProps) {
  const handlePress = () => {
    router.push(path);
  };

  return (
    <Pressable onPress={handlePress} style={buttonStyle} accessibilityRole = "button">
      <Text style={buttonTextStyle}>{text}</Text>
    </Pressable>
  );
}
