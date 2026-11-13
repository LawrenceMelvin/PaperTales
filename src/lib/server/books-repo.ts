import crypto from "node:crypto";
import { getAdminDb } from "@/lib/firebase/admin";
import { BookCoverDesign, BookPage, BookProject } from "@/types/book";
import { BookEntitlement } from "@/lib/server/entitlement";
import { getSignedReadUrl, ONE_HOUR_SECONDS } from "@/lib/server/storage";

export interface StoredBookPage extends Omit<BookPage, "imageUrl"> {
  imagePath?: string;
  imageUrl?: string; // Only populated transiently when hydrating signed URLs, or external non-data URLs
}

export interface StoredBookCover extends Omit<BookCoverDesign, "imageUrl"> {
  imagePath?: string;
  imageUrl?: string;
}

export interface BookPdfArtifacts {
  interiorPath?: string;
  coverPath?: string;
  wysiwygPath?: string;
  version?: number;
}

export interface StoredBookRecord {
  id: string;
  uid: string;
  title: string;
  subtitle?: string;
  authorName: string;
  genre: BookProject["genre"];
  targetAge: string;
  character: BookProject["character"];
  artStyle?: string;
  pageStructure?: string;
  showPageNumbers?: boolean;
  singleSidedColoring?: boolean;
  cover?: StoredBookCover;
  pages: StoredBookPage[];
  pageCount: number;
  format: BookProject["format"];
  entitlement: BookEntitlement;
  contentVersion: number;
  pdf?: BookPdfArtifacts;
  createdAt: string;
  updatedAt: string;
}

function stripBase64FromPage(page: BookPage & { imagePath?: string }): StoredBookPage {
  const { imageUrl, ...rest } = page;
  const safeExternalUrl =
    imageUrl && !imageUrl.startsWith("data:") && !imageUrl.includes("X-Goog-Signature")
      ? imageUrl
      : undefined;
  return {
    ...rest,
    ...(safeExternalUrl ? { imageUrl: safeExternalUrl } : {}),
  };
}

function stripBase64FromCover(
  cover?: BookCoverDesign & { imagePath?: string }
): StoredBookCover | undefined {
  if (!cover) return undefined;
  const { imageUrl, ...rest } = cover;
  const safeExternalUrl =
    imageUrl && !imageUrl.startsWith("data:") && !imageUrl.includes("X-Goog-Signature")
      ? imageUrl
      : undefined;
  return {
    ...rest,
    ...(safeExternalUrl ? { imageUrl: safeExternalUrl } : {}),
  };
}

export async function createBook(
  uid: string,
  input: Partial<BookProject>
): Promise<StoredBookRecord> {
  const db = getAdminDb();
  const id = input.id && !input.id.startsWith("book_default")
    ? input.id
    : `book_${crypto.randomUUID().slice(0, 12)}`;
  const now = new Date().toISOString();

  const record: StoredBookRecord = {
    id,
    uid,
    title: input.title || "Untitled Story",
    subtitle: input.subtitle,
    authorName: input.authorName || "PaperTales Author",
    genre: input.genre || "coloring_book",
    targetAge: input.targetAge || "All Ages",
    character: input.character || { name: "", type: "", traits: [] },
    artStyle: input.artStyle,
    pageStructure: input.pageStructure,
    showPageNumbers: input.showPageNumbers ?? true,
    singleSidedColoring: input.singleSidedColoring ?? true,
    cover: stripBase64FromCover(input.cover),
    pages: (input.pages || []).map((p) => stripBase64FromPage(p)),
    pageCount: input.pageCount || input.pages?.length || 12,
    format: input.format || {
      trimSize: "8.5x8.5",
      binding: "saddle_stitch",
      interiorColor: "black_and_white",
    },
    entitlement: {
      freePages: 1,
      paidThrough: 0,
    },
    contentVersion: 1,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection("books").doc(id).set(record);
  return record;
}

export async function getBookForOwner(
  bookId: string,
  uid: string
): Promise<StoredBookRecord | null> {
  const snap = await getAdminDb().collection("books").doc(bookId).get();
  if (!snap.exists) return null;
  const data = snap.data() as StoredBookRecord;
  if (data.uid !== uid) return null;
  return data;
}

export async function listBooksForOwner(uid: string): Promise<StoredBookRecord[]> {
  const snap = await getAdminDb()
    .collection("books")
    .where("uid", "==", uid)
    .orderBy("updatedAt", "desc")
    .limit(20)
    .get();
  return snap.docs.map((d) => d.data() as StoredBookRecord);
}

export async function updateBookForOwner(
  bookId: string,
  uid: string,
  patch: Partial<Omit<StoredBookRecord, "id" | "uid" | "createdAt" | "entitlement">>,
  bumpContentVersion: boolean = true
): Promise<StoredBookRecord | null> {
  const db = getAdminDb();
  const ref = db.collection("books").doc(bookId);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return null;
    const existing = snap.data() as StoredBookRecord;
    if (existing.uid !== uid) return null;

    const updated: StoredBookRecord = {
      ...existing,
      ...patch,
      ...(patch.pages ? { pages: patch.pages.map((p) => stripBase64FromPage(p)) } : {}),
      ...(patch.cover ? { cover: stripBase64FromCover(patch.cover) } : {}),
      contentVersion: bumpContentVersion
        ? (existing.contentVersion || 1) + 1
        : existing.contentVersion || 1,
      updatedAt: new Date().toISOString(),
    };
    tx.set(ref, updated);
    return updated;
  });
}

export async function setBookPageImagePath(
  bookId: string,
  uid: string,
  pageNumber: number,
  imagePath: string
): Promise<void> {
  const db = getAdminDb();
  const ref = db.collection("books").doc(bookId);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return;
    const existing = snap.data() as StoredBookRecord;
    if (existing.uid !== uid) return;

    if (pageNumber === 0) {
      tx.set(
        ref,
        {
          cover: { ...(existing.cover || {}), imagePath, isDesigned: true },
          contentVersion: (existing.contentVersion || 1) + 1,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return;
    }

    const pages = existing.pages.map((p) =>
      p.pageNumber === pageNumber ? { ...p, imagePath, isLocked: false } : p
    );
    tx.set(
      ref,
      {
        pages,
        contentVersion: (existing.contentVersion || 1) + 1,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  });
}

export async function claimAnonymousBook(
  bookId: string,
  anonymousUid: string,
  targetUid: string
): Promise<StoredBookRecord | null> {
  const db = getAdminDb();
  const ref = db.collection("books").doc(bookId);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return null;
    const existing = snap.data() as StoredBookRecord;
    if (existing.uid !== anonymousUid) return null;

    const updated: StoredBookRecord = {
      ...existing,
      uid: targetUid,
      updatedAt: new Date().toISOString(),
    };
    tx.set(ref, updated);
    return updated;
  });
}

export async function hydrateBookSignedUrls(
  book: StoredBookRecord,
  signFn: (path: string, ttl: number) => Promise<string> = getSignedReadUrl
): Promise<StoredBookRecord> {
  const pages = await Promise.all(
    book.pages.map(async (p) => {
      if (p.imagePath) {
        const signed = await signFn(p.imagePath, ONE_HOUR_SECONDS);
        return { ...p, imageUrl: signed };
      }
      return p;
    })
  );

  let cover = book.cover;
  if (cover?.imagePath) {
    cover = {
      ...cover,
      imageUrl: await signFn(cover.imagePath, ONE_HOUR_SECONDS),
    };
  }

  return { ...book, pages, cover };
}
