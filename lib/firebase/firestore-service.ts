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
import { DEFAULT_CANDIDATE_PROFILE, type CandidateProfile, type JobMetadata } from "../assam-job-classifier";
import type { LiveStory, ReminderItem } from "../types";

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

// -------------------------------------------------------------
// Permanent Vacancies Cloud Storage
// -------------------------------------------------------------

export type PermanentVacancy = {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  discoveredAt: string;
  importanceScore?: number;
  importanceReason?: string;
  jobMetadata?: JobMetadata;
  syncedAt?: string;
  isPermanent: boolean;
};

export function sanitizeVacancyDocId(item: { id?: string; url?: string; title?: string }): string {
  const raw = item.id || item.url || item.title || "vacancy";
  const sanitized = raw.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/^_+|_+$/g, "").slice(0, 120);
  return sanitized.length > 0 ? sanitized : `vac_${Date.now()}`;
}

export function liveStoryToPermanentVacancy(item: LiveStory): PermanentVacancy {
  return {
    id: item.id || sanitizeVacancyDocId(item),
    title: item.title || "Untitled Recruitment Alert",
    summary: item.summary || "",
    url: item.url || "",
    source: item.source || "Assam Career Updates",
    publishedAt: item.publishedAt || new Date().toISOString(),
    discoveredAt: item.discoveredAt || new Date().toISOString(),
    importanceScore: item.importanceScore,
    importanceReason: item.importanceReason,
    jobMetadata: item.jobMetadata,
    isPermanent: true,
  };
}

export async function saveVacanciesToFirestore(
  items: LiveStory[]
): Promise<{ success: boolean; savedCount: number; errors: string[] }> {
  const db = getFirebaseFirestore();
  if (!db) {
    return { success: false, savedCount: 0, errors: ["Firebase is not configured or initialized."] };
  }

  if (!items.length) {
    return { success: true, savedCount: 0, errors: [] };
  }

  const errors: string[] = [];
  let savedCount = 0;

  // Process in batches of 25 for Firestore write safety
  const batchSize = 25;
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize);
    try {
      const promises = chunk.map(async (story) => {
        const docId = sanitizeVacancyDocId(story);
        const record = liveStoryToPermanentVacancy(story);
        const vacancyRef = doc(db, "vacancies", docId);
        await setDoc(
          vacancyRef,
          {
            ...record,
            syncedAt: new Date().toISOString(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        savedCount += 1;
      });
      await Promise.all(promises);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to write batch to Firestore";
      errors.push(message);
    }
  }

  return {
    success: errors.length === 0,
    savedCount,
    errors,
  };
}

export async function getPermanentVacanciesFromFirestore(
  limitCount = 100
): Promise<LiveStory[]> {
  const db = getFirebaseFirestore();
  if (!db) return [];
  try {
    const vacanciesRef = collection(db, "vacancies");
    const snapshot = await getDocs(vacanciesRef);
    const docs = snapshot.docs.map((d) => {
      const data = d.data() as PermanentVacancy;
      return {
        id: data.id || d.id,
        title: data.title,
        summary: data.summary,
        url: data.url,
        source: data.source,
        publishedAt: data.publishedAt,
        discoveredAt: data.discoveredAt,
        importanceScore: data.importanceScore,
        jobMetadata: data.jobMetadata ? (data.jobMetadata as unknown as LiveStory["jobMetadata"]) : undefined,
      };
    });

    // Sort descending by publishedAt / discoveredAt
    docs.sort((a, b) => {
      const timeA = Date.parse(a.publishedAt || a.discoveredAt || "0");
      const timeB = Date.parse(b.publishedAt || b.discoveredAt || "0");
      return timeB - timeA;
    });

    return docs.slice(0, limitCount);
  } catch (err) {
    console.error("Failed to load permanent vacancies from Firestore:", err);
    return [];
  }
}
