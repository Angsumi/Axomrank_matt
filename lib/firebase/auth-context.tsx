"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getToken } from "firebase/messaging";
import {
  getFirebaseAuth,
  getFirebaseMessagingInstance,
  googleProvider,
  isFirebaseConfigured,
} from "./config";
import {
  getAspirantProfile,
  saveAspirantProfile,
  getAspirantDocuments,
  saveAspirantDocument,
  deleteAspirantDocument,
  saveAspirantFcmToken,
  DEFAULT_ASPIRANT_PROFILE,
  type AspirantProfile,
  type AspirantDocument,
} from "./firestore-service";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  profile: AspirantProfile;
  documents: AspirantDocument[];
  fcmToken: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AspirantProfile>) => Promise<boolean>;
  addDocument: (doc: AspirantDocument) => Promise<boolean>;
  deleteDocument: (docId: string) => Promise<boolean>;
  requestPushNotifications: () => Promise<string | null>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(() => isFirebaseConfigured());
  const [profile, setProfile] = useState<AspirantProfile>(DEFAULT_ASPIRANT_PROFILE);
  const [documents, setDocuments] = useState<AspirantDocument[]>([]);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const configured = isFirebaseConfigured();

  const loadUserData = useCallback(async (currentUser: User) => {
    try {
      const existing = await getAspirantProfile(currentUser.uid);
      if (existing) {
        setProfile(existing);
      } else {
        const initial: AspirantProfile = {
          ...DEFAULT_ASPIRANT_PROFILE,
          fullName: currentUser.displayName || "",
          email: currentUser.email || "",
        };
        await saveAspirantProfile(currentUser.uid, initial, {
          email: currentUser.email || "",
          displayName: currentUser.displayName || "",
          photoURL: currentUser.photoURL || "",
        });
        setProfile(initial);
      }

      const docs = await getAspirantDocuments(currentUser.uid);
      setDocuments(docs);
    } catch (err) {
      console.error("Error loading user profile & documents:", err);
    }
  }, []);

  useEffect(() => {
    if (!configured) {
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserData(currentUser);
      } else {
        setProfile(DEFAULT_ASPIRANT_PROFILE);
        setDocuments([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [configured, loadUserData]);

  const signInWithGoogle = async () => {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error("Firebase Authentication is not initialized.");
    }
    const res = await signInWithPopup(auth, googleProvider);
    if (res.user) {
      await loadUserData(res.user);
    }
  };

  const signOut = async () => {
    const auth = getFirebaseAuth();
    if (auth) {
      await firebaseSignOut(auth);
    }
    setUser(null);
    setProfile(DEFAULT_ASPIRANT_PROFILE);
    setDocuments([]);
  };

  const updateProfile = async (updates: Partial<AspirantProfile>): Promise<boolean> => {
    const merged: AspirantProfile = { ...profile, ...updates };
    setProfile(merged);
    if (!user) return true; // optimistic in guest mode
    return await saveAspirantProfile(user.uid, merged);
  };

  const addDocument = async (doc: AspirantDocument): Promise<boolean> => {
    setDocuments((prev) => [doc, ...prev.filter((d) => d.id !== doc.id)]);
    if (!user) return true;
    return await saveAspirantDocument(user.uid, doc);
  };

  const deleteDocument = async (docId: string): Promise<boolean> => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    if (!user) return true;
    return await deleteAspirantDocument(user.uid, docId);
  };

  const requestPushNotifications = async (): Promise<string | null> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return null;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        return null;
      }
      const messaging = await getFirebaseMessagingInstance();
      if (!messaging) return null;

      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      const token = await getToken(messaging, {
        vapidKey: vapidKey || undefined,
        serviceWorkerRegistration: await navigator.serviceWorker.ready,
      });

      if (token) {
        setFcmToken(token);
        if (user) {
          await saveAspirantFcmToken(user.uid, token);
        }
        return token;
      }
      return null;
    } catch (err) {
      console.error("Push notification registration failed:", err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: configured,
        profile,
        documents,
        fcmToken,
        signInWithGoogle,
        signOut,
        updateProfile,
        addDocument,
        deleteDocument,
        requestPushNotifications,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
