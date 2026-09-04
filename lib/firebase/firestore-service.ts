import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseFirestore } from "./config";
import type { CandidateProfile } from "../assam-job-classifier";
import { DEFAULT_CANDIDATE_PROFILE } from "../assam-job-classifier";
import type { ReminderItem } from "../types";

export type AspirantProfile = CandidateProfile & {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  stream?: string;
  passingYear?: string;
  percentageOrCgpa?: string;
  employmentExchangeNumber?: string;
  employmentExchangeDate?: string;
  notificationsEnabled: boolean;
  minFitScoreAlert: number;
};

export type AspirantDocument = {
  id: string;
  type:
    | "prc"
    | "employment_exchange"
    | "caste_certificate"
    | "marksheet_10th"
    | "marksheet_12th"
    | "degree_certificate"
    | "other";
  title: string;
  fileName: string;
  fileSize?: number;
  fileUrl: string;
  uploadedAt: string;
};

export const DEFAULT_ASPIRANT_PROFILE: AspirantProfile = {
  ...DEFAULT_CANDIDATE_PROFILE,
  fullName: "",
  email: "",
  phoneNumber: "",
  stream: "",
  passingYear: "",
  percentageOrCgpa: "",
  employmentExchangeNumber: "",
  employmentExchangeDate: "",
  notificationsEnabled: true,
  minFitScoreAlert: 80,
};

export async function getAspirantProfile(uid: string): Promise<AspirantProfile | null> {
  const db = getFirebaseFirestore();
  if (!db) return null;
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (!userDoc.exists()) return null;
    const data = userDoc.data();
    return (data.profile as AspirantProfile) || null;
  } catch (err) {
    console.error("Failed to load aspirant profile from Firestore:", err);
    return null;
  }
}

export async function saveAspirantProfile(
  uid: string,
  profile: Partial<AspirantProfile>,
  userMeta?: { email?: string; displayName?: string; photoURL?: string }
): Promise<boolean> {
  const db = getFirebaseFirestore();
  if (!db) return false;
  try {
    const userRef = doc(db, "users", uid);
    await setDoc(
      userRef,
      {
        profile,
        ...(userMeta ? { ...userMeta } : {}),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error("Failed to save aspirant profile to Firestore:", err);
    return false;
  }
}

export async function getAspirantDocuments(uid: string): Promise<AspirantDocument[]> {
  const db = getFirebaseFirestore();
  if (!db) return [];
  try {
    const docsRef = collection(db, "users", uid, "documents");
    const snapshot = await getDocs(docsRef);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AspirantDocument));
  } catch (err) {
    console.error("Failed to get documents from Firestore:", err);
    return [];
  }
}

export async function saveAspirantDocument(
  uid: string,
  document: AspirantDocument
): Promise<boolean> {
  const db = getFirebaseFirestore();
  if (!db) return false;
  try {
    const docRef = doc(db, "users", uid, "documents", document.id);
    await setDoc(docRef, { ...document, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (err) {
    console.error("Failed to save document to Firestore:", err);
    return false;
  }
}

export async function deleteAspirantDocument(uid: string, docId: string): Promise<boolean> {
  const db = getFirebaseFirestore();
  if (!db) return false;
  try {
    await deleteDoc(doc(db, "users", uid, "documents", docId));
    return true;
  } catch (err) {
    console.error("Failed to delete document from Firestore:", err);
    return false;
  }
}

export async function saveAspirantFcmToken(uid: string, token: string): Promise<boolean> {
  const db = getFirebaseFirestore();
  if (!db) return false;
  try {
    const tokenRef = doc(db, "users", uid, "fcm_tokens", token.slice(0, 32));
    await setDoc(
      tokenRef,
      {
        token,
        device: typeof navigator !== "undefined" ? navigator.userAgent : "browser",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error("Failed to save FCM token to Firestore:", err);
    return false;
  }
}

export async function getAspirantApplications(uid: string): Promise<ReminderItem[]> {
  const db = getFirebaseFirestore();
  if (!db) return [];
  try {
    const appsRef = collection(db, "users", uid, "applications");
    const snapshot = await getDocs(appsRef);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ReminderItem));
  } catch (err) {
    console.error("Failed to get applications from Firestore:", err);
    return [];
  }
}

export async function saveAspirantApplication(
  uid: string,
  app: ReminderItem
): Promise<boolean> {
  const db = getFirebaseFirestore();
  if (!db) return false;
  try {
    const appRef = doc(db, "users", uid, "applications", String(app.id));
    await setDoc(appRef, { ...app, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (err) {
    console.error("Failed to save application to Firestore:", err);
    return false;
  }
}
