import * as ImageManipulator from "expo-image-manipulator";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../FirebaseConfig";

export type Picked = {
  uri: string;
  assetId?: string;
  mimeType?: string;
  fileName?: string;
};

async function ensureJpeg(uri: string) {
  // Konverterer uansett – HEIC → JPEG, og andre formater blir re-encodet
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [],
    {
      compress: 0.9,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );
  return result.uri; // ny lokal fil (nå JPEG)
}

export async function uploadImageAsync({
  asset,
  path,
}: {
  asset: Picked;
  path: string;
}): Promise<string> {
  // Sørg for at vi har JPEG, ikke HEIC
  const jpegUri = await ensureJpeg(asset.uri);

  const response = await fetch(jpegUri);
  const blob = await response.blob();

  const storageRef = ref(storage, path); // f.eks. users/uid/posts/postId/image_0.jpg
  await uploadBytes(storageRef, blob);

  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}
