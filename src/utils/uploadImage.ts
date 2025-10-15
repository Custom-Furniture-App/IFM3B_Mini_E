import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../api/firebaseConfig";


export const uploadImage = async (
  file: File,
  folder: string = "products"
): Promise<string> => {
  if (!file) throw new Error("No file provided");

  try {

    const fileName = `${file.name}_${Date.now()}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
