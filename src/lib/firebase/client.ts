import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  AppCheck,
  getToken as getAppCheckTokenSdk,
} from "firebase/app-check";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let appCheckInstance: AppCheck | null = null;

export function isFirebaseClientConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
}

export function getFirebaseClientApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  if (!isFirebaseClientConfigured()) return null;
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseClientApp();
  if (!app) return null;
  return getAuth(app);
}

export function getFirebaseAppCheck(): AppCheck | null {
  if (typeof window === "undefined") return null;
  if (appCheckInstance) return appCheckInstance;

  const app = getFirebaseClientApp();
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!app || !siteKey) return null;

  const debugToken = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN;
  if (debugToken && process.env.NODE_ENV !== "production") {
    (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: string }).FIREBASE_APPCHECK_DEBUG_TOKEN =
      debugToken;
  }

  appCheckInstance = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
  return appCheckInstance;
}

export async function getClientAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  const auth = getFirebaseAuth();
  if (auth?.currentUser) {
    try {
      const idToken = await auth.currentUser.getIdToken();
      if (idToken) {
        headers["Authorization"] = `Bearer ${idToken}`;
      }
    } catch {
      // Caller will receive 401 from server if auth is required
    }
  }

  const appCheck = getFirebaseAppCheck();
  if (appCheck) {
    try {
      const res = await getAppCheckTokenSdk(appCheck, false);
      if (res?.token) {
        headers["X-Firebase-AppCheck"] = res.token;
      }
    } catch {
      // App Check failure handled server-side
    }
  }

  return headers;
}
