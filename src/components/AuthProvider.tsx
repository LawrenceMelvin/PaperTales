"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  User,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signInWithCredential,
  linkWithPopup,
  linkWithRedirect,
  signOut as firebaseSignOut,
} from "firebase/auth";
import {
  getFirebaseAppCheck,
  getFirebaseAuth,
  isFirebaseClientConfigured,
} from "@/lib/firebase/client";
import { apiFetch } from "@/lib/api-fetch";

export interface ServerProfile {
  uid: string;
  isAnonymous: boolean;
  email?: string;
  displayName?: string;
  photoUrl?: string;
  tokenBalance: number;
  freeGrantClaimed: boolean;
  freeGrantBookId?: string;
}

interface AuthContextValue {
  user: User | null;
  isAnonymous: boolean;
  isLoading: boolean;
  profile: ServerProfile | null;
  tokenBalance: number;
  freeGrantClaimed: boolean;
  refreshProfile: () => Promise<void>;
  signInWithGoogle: (activeBookId?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAnonymous: true,
  isLoading: true,
  profile: null,
  tokenBalance: 0,
  freeGrantClaimed: false,
  refreshProfile: async () => {},
  signInWithGoogle: async () => false,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ServerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await apiFetch("/api/me", { method: "GET" });
      if (res.ok) {
        const data = (await res.json()) as ServerProfile;
        setProfile(data);
        window.dispatchEvent(
          new CustomEvent("tokens_updated", { detail: { balance: data.tokenBalance } })
        );
        window.dispatchEvent(new Event("customer_status_updated"));
      }
    } catch {
      // Offline or unauthenticated
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseClientConfigured()) {
      setIsLoading(false);
      refreshProfile();
      return;
    }

    getFirebaseAppCheck();
    const auth = getFirebaseAuth();
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        try {
          await signInAnonymously(auth);
          return; // onAuthStateChanged will fire again with anonymous user
        } catch (err) {
          console.warn("Anonymous sign-in skipped:", err);
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          return;
        }
      }

      setUser(fbUser);
      await refreshProfile();
      setIsLoading(false);
    });

    const handleRefresh = () => {
      refreshProfile();
    };
    window.addEventListener("tokens_updated_server", handleRefresh);
    return () => {
      unsub();
      window.removeEventListener("tokens_updated_server", handleRefresh);
    };
  }, [refreshProfile]);

  const signInWithGoogle = useCallback(
    async (activeBookId?: string): Promise<boolean> => {
      const auth = getFirebaseAuth();
      if (!auth) return false;
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      try {
        if (auth.currentUser?.isAnonymous) {
          const anonToken = await auth.currentUser.getIdToken();
          try {
            await linkWithPopup(auth.currentUser, provider);
          } catch (err: any) {
            if (err?.code === "auth/popup-blocked") {
              await linkWithRedirect(auth.currentUser, provider);
              return true;
            }
            if (err?.code === "auth/credential-already-in-use") {
              const cred = GoogleAuthProvider.credentialFromError(err);
              if (cred) {
                await signInWithCredential(auth, cred);
                if (activeBookId && anonToken) {
                  await apiFetch("/api/books/claim", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      anonymousBookId: activeBookId,
                      anonymousIdToken: anonToken,
                    }),
                  }).catch(() => {});
                }
              }
            } else {
              throw err;
            }
          }
        } else {
          await signInWithPopup(auth, provider);
        }

        await refreshProfile();
        return true;
      } catch (err) {
        console.error("Google Sign-In failed:", err);
        return false;
      }
    },
    [refreshProfile]
  );

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await firebaseSignOut(auth);
    setProfile(null);
  }, []);

  const isAnonymous = Boolean(!user || user.isAnonymous || profile?.isAnonymous);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAnonymous,
        isLoading,
        profile,
        tokenBalance: profile?.tokenBalance ?? 0,
        freeGrantClaimed: Boolean(profile?.freeGrantClaimed),
        refreshProfile,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
