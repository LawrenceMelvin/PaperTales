# Google Cloud & Firebase Production Setup (`papertale-studio`)

PaperTales AI runs in its own isolated Google Cloud project **`papertale-studio`** (`5293527863`) in **`us-central1`** (selected so Cloud Storage stays within the 5 GB US always-free tier).

---

## 1. Provisioned Resources

| Resource | Identifier | Notes |
| :--- | :--- | :--- |
| **GCP Project** | `papertale-studio` | Isolated from `auratap-505817` |
| **Region** | `us-central1` | Colocated Firestore, GCS, and Cloud Run |
| **Firestore** | `(default)` (Native mode) | TTL enabled on `rateLimits.expiresAt` |
| **GCS Bucket** | `gs://papertale-studio-assets` | Uniform access, Public Access Prevention enforced |
| **Runtime Service Account** | `papertale-runtime@papertale-studio.iam.gserviceaccount.com` | `datastore.user`, `storage.objectAdmin` (bucket), `firebaseauth.admin`, `firebaseappcheck.tokenVerifier`, `secretmanager.secretAccessor`, self-`iam.serviceAccountTokenCreator` |
| **Firebase Web App** | `1:5293527863:web:94db514e7357b587b280b2` | Auth: Anonymous enabled; Google Sign-In enabled in Firebase Console |
| **App Check / reCAPTCHA** | `6LfT6B4uAAAAAP7QM-y1GxotSblRzRmgxbF6hFkj` | reCAPTCHA Enterprise (SCORE, `minValidScore: 0.5`) |
| **Billing Budget** | `PaperTale Budget` | `2500 INR` with 50% / 90% / 100% alerts |

---

## 2. Provisioning Commands Reference

```bash
# 1. Create & link project
gcloud projects create papertale-studio --name="PaperTale"
gcloud billing projects link papertale-studio --billing-account=<BILLING_ACCOUNT_ID>
gcloud config set project papertale-studio

# 2. Enable required APIs
gcloud services enable \
  firebase.googleapis.com \
  identitytoolkit.googleapis.com \
  firestore.googleapis.com \
  storage.googleapis.com \
  firebaseappcheck.googleapis.com \
  recaptchaenterprise.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  iamcredentials.googleapis.com \
  billingbudgets.googleapis.com

# 3. Firestore (Native) + TTL
gcloud firestore databases create --location=us-central1 --type=firestore-native
gcloud firestore fields ttls update expiresAt --collection-group=rateLimits --enable-ttl

# 4. Private GCS bucket
gcloud storage buckets create gs://papertale-studio-assets \
  --location=us-central1 \
  --uniform-bucket-level-access \
  --public-access-prevention

# 5. Runtime Service Account & IAM
gcloud iam service-accounts create papertale-runtime --display-name="PaperTale Cloud Run Runtime"
gcloud storage buckets add-iam-policy-binding gs://papertale-studio-assets \
  --member="serviceAccount:papertale-runtime@papertale-studio.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
gcloud iam service-accounts add-iam-policy-binding \
  papertale-runtime@papertale-studio.iam.gserviceaccount.com \
  --member="serviceAccount:papertale-runtime@papertale-studio.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountTokenCreator"
```

---

## 3. Local Development Credentials (No Key Files)

Instead of downloading long-lived JSON key files, authenticate local ADC by impersonating the runtime service account:

```bash
gcloud auth application-default login \
  --impersonate-service-account=papertale-runtime@papertale-studio.iam.gserviceaccount.com
```

This allows `firebase-admin` and `@google-cloud/storage` (including V4 `getSignedUrl()` via IAM `signBlob`) to work locally without any service-account key on disk.

---

## 4. Required Environment Variables

See `.env.example` for the full list:

* **Server-side:** `GCP_PROJECT_ID`, `GCS_BUCKET`, `REQUIRE_AUTH`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `LULU_CLIENT_SECRET`, `CHANNEL3_API_KEY`, `GEMINI_API_KEY`
* **Client-side (`NEXT_PUBLIC_*`):** `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN` (dev only)
