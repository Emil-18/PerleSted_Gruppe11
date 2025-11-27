import { Image } from "expo-image";
import React, { memo, useMemo } from "react";
import { ImageSourcePropType, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../app/styles";

type PearlCardProps = {
  id: string;
  title: string;
  imageUrl?: string;
  imageLocal?: ImageSourcePropType;
  onPress?: () => void;
};

const PearlCardComponent: React.FC<PearlCardProps> = ({
  id,
  title,
  imageUrl,
  imageLocal,
  onPress,
}) => {
  const source = useMemo(() => {
    if (imageLocal) return imageLocal;
    if (imageUrl) return { uri: imageUrl };
    return null;
  }, [imageLocal, imageUrl]);

  const displayTitle = (title || "").trim() || "FredikstenFestning";

  return (
    <TouchableOpacity
      style={styles.PearlCard}
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`Open ${displayTitle}`}
      testID={`pearl-card-${id}`}
    >
      <View style={styles.PearlImageWrap}>
        {source ? (
          <Image
            source={source}
            style={styles.PearlImage}
            contentFit="cover"
          />
        ) : (
          <View
            style={[
              styles.PearlImage,
              {
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#e5e7eb",
              },
            ]}
          >
            <Text style={{ color: "#9ca3af", fontSize: 12 }}>No image</Text>
          </View>
        )}
      </View>

      <Text style={styles.pearlTitle} numberOfLines={1}>
        {displayTitle}
      </Text>
    </TouchableOpacity>
  );
};

export const PearlCard = memo(PearlCardComponent);
