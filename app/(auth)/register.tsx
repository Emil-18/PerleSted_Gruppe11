import { Link, router } from "expo-router";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateCurrentUser, updatePhoneNumber, updateProfile } from "firebase/auth";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { auth, db } from "../../FirebaseConfig";
import { styles } from "../styles";

import {
    collection,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [ phone, setPhone ] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const usernameRef = useRef<TextInput | null>(null);
  const emailRef = useRef<TextInput | null>(null);

  const normalizeUsername = (name: string) =>
    name.trim().toLowerCase();

  const handleRegister = async () => {
    if (isLoading) return;

    const uname = normalizeUsername(username);

    if (!uname || uname.length < 3 || uname.length > 20) {
      alert("Brukernavn må være 3–20 tegn.");
      return;
    }
    if (!/^[a-z0-9_]+$/.test(uname)) {
      alert("Brukernavn kan bare inneholde a–z, 0–9 og _.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passordene er ikke like.");
      return;
    }

    setIsLoading(true);
    try {
      const unameRef = doc(db, "usernames", uname);
      const unameSnap = await getDoc(unameRef);
      if (unameSnap.exists()) {
        alert("Epost addressenn er allerede tatt.");
        return;
      }

      const { user } = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
        );
      

      await runTransaction(db, async (tx) => {
        const latestUnameSnap = await tx.get(unameRef);
        if (latestUnameSnap.exists()) {
          throw new Error("USERNAME_TAKEN");
        }

        const userRef = doc(db, "users", user.uid);
        tx.set(unameRef, { uid: user.uid });
        tx.set(userRef, {
          email: user.email,
          username: uname,
          createdAt: serverTimestamp(),
        });
      });

        router.replace("/(tabs)/home");
        //auth.currentUser.displayName = username;
        //auth.currentUser.phoneNumber = phone;
        //auth.currentUser.password = password;
        updateProfile(user, { "displayName": uname});
        const userDoc = doc(db, "users", user.uid);
        await setDoc(
          userDoc, 
          { phoneNumber: phone,
            notifications: true 
          }
        );
    } catch (e: any) {
      if (e?.code === "auth/email-already-in-use") {
        alert("Denne e-posten er allerede registrert.");
      } else if (e?.message === "USERNAME_TAKEN") {
        alert("Brukernavnet er allerede tatt.");
      } else {
        console.log(e);
        alert("Registrering feilet: " + (e?.message ?? "Ukjent feil"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.authContainer}>
      <Text style={styles.authTitle}>Registrer ny bruker</Text>

      <TextInput
        ref={emailRef}
        style={styles.authInput}
        placeholder="Epost-adresse"
        placeholderTextColor="#888888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        ref={usernameRef}
        style={styles.authInput}
        placeholder="Brukernavn"
        placeholderTextColor="#888888"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
          />
          <TextInput
              placeholder="telefonnummer"
              style={styles.authInput}
              placeholderTextColor= "#888888"
              keyboardType="number-pad"
              maxLength="8"
              onChangeText = {setPhone}
          ></TextInput>
      <TextInput
        style={styles.authInput}
        placeholder="Passord"
        placeholderTextColor="#888888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.authInput}
        placeholder="Skriv inn passord på nytt"
        placeholderTextColor="#888888"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <Pressable
        style={styles.authButton}
        onPress={handleRegister}
              disabled={isLoading}
        accessibilityRole = "button"
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.authButtonText}>Registrer</Text>
        )}
      </Pressable>

      <Link href="/login" style={styles.authLink}>
        <Text>Tilbake til login</Text>
      </Link>
    </View>
  );
}
