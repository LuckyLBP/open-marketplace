import { db } from "./firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const generateRandomSKU = (): string => {
  const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
  return `SKU-${randomDigits}`;
};

const isUniqueSKU = async (sku: string): Promise<boolean> => {
  const q = query(collection(db, "deals"), where("sku", "==", sku));
  const snapshot = await getDocs(q);
  return snapshot.empty;
};

export const generateUniqueSKU = async (): Promise<string> => {
  let sku = generateRandomSKU();
  let unique = await isUniqueSKU(sku);

  while (!unique) {
    sku = generateRandomSKU();
    unique = await isUniqueSKU(sku);
  }

  return sku;
};
