
import { auth, storage } from "@/lib/FirebaseConfig";
import * as MediaLibrary from "expo-media-library";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Platform } from "react-native";

export type Picked = { uri: string; assetId?: string; mimeType?: string; fileName?: string };

async function ensureMediaLibraryPerms() {
  if (Platform.OS !== "ios") return true;
  const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();
  if (status === "granted") return true;
  if (canAskAgain) {
    const req = await MediaLibrary.requestPermissionsAsync();
    return req.status === "granted";
  }
  return false;
}

export async function uploadImageAsync({ asset, path } : {
  asset: Picked;
  path: string;
}): Promise<string> {
  try {
    const user = auth.currentUser;
    console.log("UPLOAD CURRENT USER:", user?.uid, user?.email);

    if (!user) {
      throw new Error("Not logged in when trying to upload image.");
    }
    let uri = asset.uri;

    if (Platform.OS === "ios" && uri.startsWith("ph://")) {
      const ok = await ensureMediaLibraryPerms();
      if (!ok) throw new Error("MediaLibrary permission denied (needed to read iOS photos).");
      if (!asset.assetId) throw new Error("Missing assetId for iOS ph:// URI");
      const info = await MediaLibrary.getAssetInfoAsync(asset.assetId);
      uri = info.localUri ?? info.uri;
      if (!uri) throw new Error("Could not resolve local file path for selected photo.");
    }

    const res = await fetch(uri);
    if (!res.ok) {
      throw new Error(`Fetch failed (${res.status}) for ${uri}`);
    }
    const blob = await res.blob();
    if (!blob || (blob as any).size === 0) {
      throw new Error("Selected image produced an empty blob.");
    }

    const objectRef = ref(storage, path);
    console.log(
      "STORAGE APP OPTIONS:",
      storage.app.options.projectId,
      storage.app.options.storageBucket
    );
    await uploadBytes(objectRef, blob, { contentType: asset.mimeType ?? (blob as any).type });
    const url = await getDownloadURL(objectRef);
    return url;
  } catch (e: any) {

    console.log(
      "STORAGE UPLOAD ERROR:\n",
      "code:", e?.code,
      "\nmessage:", e?.message,
      "\nserverResponse:", e?.serverResponse,
    );
    throw e;
  }
}
