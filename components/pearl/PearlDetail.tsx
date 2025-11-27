import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { appStyles, inputStyle } from "../../app/styles";

export type LocationSuggestion = {
  id: string;
  name: string;
};

type PearlDetailProps = {
  imageUris: string[];

  title: string;
  description: string;
  location: string;
  tags: string;

  canCreate: boolean;

  suggestions: LocationSuggestion[];
  loadingSuggestions: boolean;
  hasLocationGeo: boolean;

  onChangeTitle: (v: string) => void;
  onChangeDescription: (v: string) => void;
  onChangeLocation: (v: string) => void;
  onChangeTags: (v: string) => void;

  onSelectSuggestion: (s: LocationSuggestion) => void;
  onCreate: () => void;
};

export function PearlDetail(props: PearlDetailProps) {
  const {
    imageUris,
    title,
    description,
    location,
    tags,
    canCreate,
    suggestions,
    loadingSuggestions,
    hasLocationGeo,
    onChangeTitle,
    onChangeDescription,
    onChangeLocation,
    onChangeTags,
    onSelectSuggestion,
    onCreate,
  } = props;

  const cover = imageUris[0];
  const others = imageUris.slice(1);

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text
        style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}
      >
        details
      </Text>

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
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginHorizontal: -4,
                marginBottom: 16,
              }}
            >
              {others.map((uri, idx) => (
                <View
                  key={`${uri}-${idx}`}
                  style={{ width: "33.333%", padding: 4 }}
                >
                  <Image
                    source={{ uri }}
                    style={{
                      width: "100%",
                      aspectRatio: 1,
                      borderRadius: 10,
                    }}
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
          onChangeText={onChangeTitle}
          placeholder="Legg til overskrift ..."
          style={inputStyle}
        />
      </Field>


      <Field label="Description">
        <TextInput
          value={description}
          onChangeText={onChangeDescription}
          placeholder="Legg til beskrivelse ..."
          style={[inputStyle, { height: 100, textAlignVertical: "top" }]}
          multiline
        />
      </Field>

      <Field label="Location">
        <TextInput
          value={location}
          onChangeText={onChangeLocation}
          placeholder="Skriv f.eks. Halden, Norge"
          style={inputStyle}
        />
        {loadingSuggestions && (
          <Text style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
            Søker etter steder...
          </Text>
        )}
        {suggestions.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => onSelectSuggestion(s)}
            style={{
              paddingVertical: 8,
              borderBottomWidth: 1,
              borderColor: "#eee",
            }}
          >
            <Text>{s.name}</Text>
          </Pressable>
        ))}
        {hasLocationGeo && (
          <Text style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
            Valgt posisjon er lagret for kartet ✅
          </Text>
        )}
      </Field>

      <Field label="Tags">
        <TextInput
          value={tags}
          onChangeText={onChangeTags}
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
        <Text style={{ color: "white", fontWeight: "700" }}>
          Create new post
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={appStyles.fieldContainer}>
      <Text style={appStyles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}
