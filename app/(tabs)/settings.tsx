import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { Pressable, Switch, Text, TextInput, View, Alert } from "react-native";

import { SettingCard } from "../../components/settings/SettingCard";
import image from "../../assets/beluga.png";
import Button from "../../components/Button";
import { styles } from "../styles";
import { auth, db } from "../../FirebaseConfig";

import {
  updateProfile,
  updatePassword,
  updateEmail,
  User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

const Settings = () => {
  const user = auth.currentUser as User | null;

  // Hvis ingen er logget inn:
  if (!user) {
    return (
      <View style={styles.settingsContainer}>
        <Text>Ingen bruker er logget inn.</Text>
      </View>
    );
  }

  // Firestore-dokument: /users/{uid}
  const userDoc = doc(db, "users", user.uid);

  const [email, setEmail] = useState(user.email ?? "");
  const [userName, setUserName] = useState(user.displayName ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [userNotifications, setUserNotifications] = useState(false);
  const [loading, setLoading] = useState(true);

  // Hent ekstra info fra Firestore (phoneNumber, notifications)
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const snap = await getDoc(userDoc);
        if (!isMounted) return;

        if (snap.exists()) {
          const data = snap.data() as any;
          if (data.phoneNumber) {
            setPhone(String(data.phoneNumber));
          }
          if (typeof data.notifications === "boolean") {
            setUserNotifications(data.notifications);
          }
        }
      } catch (e) {
        console.log("Feil ved henting av bruker-doc:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [userDoc]);

  const onSave = async () => {
    try {
      // --- Validering ---
      if (userName && (userName.length < 3 || userName.length > 20)) {
        Alert.alert("Feil", "Brukernavnet må være mellom 3 og 20 tegn");
        return;
      }

      if (email && !(email.includes("@") && email.includes("."))) {
        Alert.alert("Feil", "E-postadressen er ugyldig: " + email);
        return;
      }

      if (password) {
        if (password !== confirmPassword) {
          Alert.alert("Feil", "Passordene er ikke like");
          return;
        }
        if (password.length <= 3) {
          Alert.alert("Feil", "Passordet må være lengre enn tre tegn");
          return;
        }
      }

      if (phone && !phone.match(/^[0-9]{8}$/)) {
        Alert.alert("Feil", "Ugyldig telefonnummer (må være 8 siffer)");
        return;
      }

      // --- Oppdater Firebase Auth ---

      // displayName
      if (userName && userName !== user.displayName) {
        await updateProfile(user, { displayName: userName });
      }

      if (email && email !== user.email) {
        await updateEmail(user, email);
      }

      if (password) {
        await updatePassword(user, password);
      }

      await setDoc(
        userDoc,
        {
          username: userName || user.displayName || null,
          phoneNumber: phone || null,
          notifications: userNotifications,
        },
        { merge: true }
      );

      Alert.alert("Lagret", "Innstillingene dine er oppdatert.");
    } catch (e: any) {
      console.log("Feil ved lagring:", e);
      Alert.alert("Feil", e?.message ?? "Noe gikk galt ved lagring.");
    }
  };

  if (loading) {
    return (
      <View style={styles.settingsContainer}>
        <Text>Laster innstillinger...</Text>
      </View>
    );
  }

  return (
    <View style={styles.settingsContainer}>
      {/* Bruk statisk bilde fra assets */}
      <Image source={image} style={styles.profileImage} />

      <Button
        text="Endre bilde"
        path="./profile"
        buttonStyle={styles.settingsBigButton}
        buttonTextStyle={styles.text}
      />

      <SettingCard
        setting="Brukernavn"
        settingInfo={userName ?? "Ingen brukernavn"}
        btnText="Endre"
        settingComponent={
          <TextInput
            onChangeText={setUserName}
            value={userName}
            style={{ borderWidth: 1, padding: 4 }}
          />
        }
      />

      <SettingCard
        setting="Passord"
        settingInfo="********"
        btnText="Endre"
        settingComponent={
          <TextInput
            onChangeText={setPassword}
            secureTextEntry
            value={password}
            style={{ borderWidth: 1, padding: 4 }}
          />
        }
      />

      <SettingCard
        setting="Gjenta passord"
        settingInfo="********"
        btnText=""
        settingComponent={
          <TextInput
            secureTextEntry
            onChangeText={setConfirmPassword}
            value={confirmPassword}
            style={{ borderWidth: 1, padding: 4 }}
          />
        }
      />

      <SettingCard
        setting="E-post"
        settingInfo={user.email ?? "Ingen e-post"}
        btnText="Endre"
        settingComponent={
          <TextInput
            keyboardType="email-address"
            onChangeText={setEmail}
            value={email}
            style={{ borderWidth: 1, padding: 4 }}
          />
        }
      />

      <SettingCard
        setting="Telefonnummer"
        settingInfo={phone || "Ingen telefon lagret"}
        btnText="Endre"
        settingComponent={
          <TextInput
            keyboardType="number-pad"
            onChangeText={setPhone}
            value={phone}
            style={{ borderWidth: 1, padding: 4 }}
          />
        }
      />

      <SettingCard
        setting="Varsler"
        settingInfo={userNotifications ? "På" : "Av"}
        btnText="Endre"
        settingComponent={
          <Switch
            onValueChange={setUserNotifications}
            value={userNotifications}
          />
        }
      />

      <Pressable onPress={onSave} accessibilityRole="button">
        <Text style={{ marginTop: 16 }}>Lagre</Text>
      </Pressable>

      <Button
        text="Logg ut"
        path=".././"
        buttonStyle={styles.settingsBigButton}
        buttonTextStyle={styles.text}
      />
    </View>
  );
};

export default Settings;