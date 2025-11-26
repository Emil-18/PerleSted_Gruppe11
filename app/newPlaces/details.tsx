import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, Image, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function NewPlaceDetails() {
  const router = useRouter();

  const params = useLocalSearchParams<{ images?: string }>();
  let imageUris: string[] = [];
  try {
    imageUris = params.images ? JSON.parse(params.images) : [];
  } catch {
    imageUris = [];
  }

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");

  const canCreate = useMemo(
    () => imageUris.length > 0 && title.trim().length > 0,
    [imageUris.length, title]
  );

  const onCreate = async () => {
    if (!canCreate) return;

    const payload = {
      imageUrls: imageUris,
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 10),
      createdAt: new Date().toISOString(),
    };

    Alert.alert("Post created", "Your new place has been created.");
    router.replace("/feed/feed");
  };

  const cover = imageUris[0];
  const others = imageUris.slice(1);

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>Nytt sted</Text>

      {cover ? (
        <>
          <Image
            source={{ uri: cover }}
            style={{
              width: "100%",
              aspectRatio: 4 / 3,
              borderRadius: 12,
              marginBottom: 12,
            }}
          />
          {others.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4, marginBottom: 16 }}>
              {others.map((uri, idx) => (
                <View key={`${uri}-${idx}`} style={{ width: "33.333%", padding: 4 }}>
                  <Image
                    source={{ uri }}
                    style={{ width: "100%", aspectRatio: 1, borderRadius: 10 }}
                  />
                </View>
              ))}
            </View>
          )}
        </>
      ) : (
        <Text style={{ color: "red", marginBottom: 16 }}>
          Images missing — go back and select at least one.
        </Text>
      )}

      <Field label="Title *">
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Legg til overskrift ..."
          style={inputStyle}
        />
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
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="Legg til sted"
          style={inputStyle}
        />
      </Field>

      <Field label="Tags (comma-separated)">
        <TextInput
          value={tags}
          onChangeText={setTags}
          placeholder="e.g. cozy, waterfront, sunset"
          style={inputStyle}
        />
      </Field>

      <Pressable
        onPress={onCreate}
        disabled={!canCreate}
        style={{
          marginTop: 12,
          backgroundColor: canCreate ? "#111" : "#bbb",
          paddingVertical: 14,
          borderRadius: 10,
          alignItems: "center",
        }}
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
