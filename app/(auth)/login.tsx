import { Link, useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { auth } from "../../FirebaseConfig";
import { styles } from "../styles";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  /*
  const handleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await login(username, password);
    } catch (e) {
      alert("Innlogging feilet (dummy-feil)");
      setIsLoading(false);
    }
  };
*/
  const signIn = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const usern = await signInWithEmailAndPassword(auth, username, password);
      if (usern.user) {
          router.replace("/(tabs)/home");
          
      }
    } catch (error: any) {
      console.log(error);
      alert("Innlogging feilet: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.authContainer}>
      <Text style={styles.authTitle}>PerleSted</Text>

      <TextInput
        style={styles.authInput}
        placeholder="e-post"
        placeholderTextColor="#888888"
              value={ username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.authInput}
        placeholder="Passord"
        placeholderTextColor="#888888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable
        style={styles.authButton}
        onPress={signIn}
              disabled={isLoading}
        accessibilityRole = "button";
      >
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.authButtonText}>Logg inn</Text>
        )}
      </Pressable>

      <Link href="/register" style={styles.authLink}>
        <Text>Ny bruker? Registrer deg</Text>
      </Link>
    </View>
  );
}
