import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  initializeAuth,
  setPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";
import { ReactNativePersistence } from "./reactNativePersistence";
import { getStorage } from "firebase/storage";
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  AppCheck,
} from "firebase/app-check";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);

// ---------- AUTH ----------
let _auth = getAuth(app);

if (Platform.OS === "web") {
  setPersistence(_auth, browserLocalPersistence).catch(() => {});
} else {
  try {
    _auth = initializeAuth(app, {
      persistence: new ReactNativePersistence(AsyncStorage),
    });
  } catch {
    _auth = getAuth(app);
  }
}

export const auth = _auth;
export const db = getFirestore(app);
export const storage = getStorage(app);

// ---------- APP CHECK (WEB) ----------
/* let appCheck: AppCheck | undefined;

if (
  Platform.OS === "web" &&
  typeof window !== "undefined" &&
  typeof document !== "undefined"
) {
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(
      process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY as string
    ),
    isTokenAutoRefreshEnabled: true,
  });
}

export { appCheck }; */
