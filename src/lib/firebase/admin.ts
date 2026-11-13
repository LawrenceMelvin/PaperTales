import { initializeApp, getApps, getApp, App } from "firebase-admin/app";
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

export function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp({
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
