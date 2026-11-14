import { initializeApp, getApps, getApp, cert, App, ServiceAccount } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAppCheck, AppCheck } from "firebase-admin/app-check";

function getProjectId(): string {
  return (
    process.env.GCP_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "papertale-studio"
  );
}

function getServiceAccount(): ServiceAccount | null {
  const raw = process.env.GCP_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ServiceAccount & { private_key?: string };
    if (parsed.private_key) {
      parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    }
    return parsed;
  } catch (err) {
    console.error("Failed to parse GCP_SERVICE_ACCOUNT_JSON:", err);
    return null;
  }
}

export function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }
  const sa = getServiceAccount();
  return initializeApp({
    ...(sa ? { credential: cert(sa) } : {}),
    projectId: getProjectId(),
    storageBucket: process.env.GCS_BUCKET || `${getProjectId()}-assets`,
  });
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}

export function getAdminAppCheck(): AppCheck {
  return getAppCheck(getAdminApp());
}
