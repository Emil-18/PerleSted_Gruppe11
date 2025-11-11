// FirebaseConfig.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  initializeAuth,
  setPersistence
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

// ถ้าใช้ polyfill RN persistence ของคุณ
import { getReactNativePersistence } from "./reactNativePersistence";

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

export const auth =
  Platform.OS === "web"
    ? getAuth(app) // เว็บ: ใช้ Web SDK ปกติ
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage), // มือถือ: RN persistence
      });

// (ถ้าต้องการ persistence แบบคงอยู่บนเว็บ)
if (Platform.OS === "web") {
  // ทำเป็น async/await ได้ในที่ที่คุณ init แอป
  setPersistence(auth, browserLocalPersistence).catch(console.warn);
}

export const db = getFirestore(app);
