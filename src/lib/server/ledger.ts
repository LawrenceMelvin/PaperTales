import crypto from "node:crypto";
import { getAdminDb } from "@/lib/firebase/admin";

export type LedgerTransactionType =
  | "purchase"
  | "usage"
  | "free_grant"
  | "refund"
  | "adjustment";

export interface UserProfileDoc {
  uid: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
  tokenBalance: number;
  freeGrantClaimed: boolean;
  freeGrantBookId?: string;
  anon?: {
    chatTurns: number;
    proofs: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TokenTransactionDoc {
  id: string;
  uid: string;
  type: LedgerTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  refId: string;
  createdAt: string;
}

export class InsufficientTokensError extends Error {
  public readonly status = 402;
  public readonly code = "insufficient_tokens";
  constructor(
    public readonly required: number,
    public readonly available: number
  ) {
    super(`Insufficient tokens: need ${required}, have ${available}.`);
    this.name = "InsufficientTokensError";
  }
}

export interface LedgerStore {
  runTransaction<T>(fn: (tx: LedgerTx) => Promise<T>): Promise<T>;
}

export interface LedgerTx {
  getUser(uid: string): Promise<UserProfileDoc | null>;
  setUser(uid: string, data: UserProfileDoc): void;
  addTransaction(doc: TokenTransactionDoc): void;
  hasPaidOrder(uid: string): Promise<boolean>;
}

export function createFirestoreLedgerStore(): LedgerStore {
  const db = getAdminDb();
  return {
    async runTransaction<T>(fn: (tx: LedgerTx) => Promise<T>): Promise<T> {
      return db.runTransaction(async (fsTx) => {
        const tx: LedgerTx = {
          async getUser(uid: string) {
            const snap = await fsTx.get(db.collection("users").doc(uid));
            return snap.exists ? (snap.data() as UserProfileDoc) : null;
          },
          setUser(uid: string, data: UserProfileDoc) {
            fsTx.set(db.collection("users").doc(uid), data, { merge: true });
          },
          addTransaction(doc: TokenTransactionDoc) {
            fsTx.set(db.collection("tokenTransactions").doc(doc.id), doc);
          },
          async hasPaidOrder(uid: string) {
            const q = db
              .collection("orders")
              .where("uid", "==", uid)
              .where("status", "in", ["paid", "in_production", "shipped", "delivered"])
              .limit(1);
            const snap = await fsTx.get(q);
            return !snap.empty;
          },
        };
        return fn(tx);
      });
    },
  };
}

function defaultUserDoc(uid: string): UserProfileDoc {
  const now = new Date().toISOString();
  return {
    uid,
    tokenBalance: 0,
    freeGrantClaimed: false,
    createdAt: now,
    updatedAt: now,
  };
}

export async function creditTokens(
  uid: string,
  amount: number,
  type: Exclude<LedgerTransactionType, "usage">,
  refId: string,
  description: string,
  store: LedgerStore = createFirestoreLedgerStore()
): Promise<{ txnId: string; balanceAfter: number }> {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Credit amount must be a positive integer.");
  }

  return store.runTransaction(async (tx) => {
    const existing = (await tx.getUser(uid)) ?? defaultUserDoc(uid);
    const balanceBefore = existing.tokenBalance ?? 0;
    const balanceAfter = balanceBefore + amount;
    const now = new Date().toISOString();
    const txnId = `txn_${crypto.randomUUID()}`;

    tx.setUser(uid, {
      ...existing,
      tokenBalance: balanceAfter,
      updatedAt: now,
    });

    tx.addTransaction({
      id: txnId,
      uid,
      type,
      amount,
      balanceBefore,
      balanceAfter,
      description,
      refId,
      createdAt: now,
    });

    return { txnId, balanceAfter };
  });
}

export async function debitTokens(
  uid: string,
  amount: number,
  refId: string,
  description: string,
  store: LedgerStore = createFirestoreLedgerStore()
): Promise<{ txnId: string; balanceAfter: number }> {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Debit amount must be a positive integer.");
  }

  return store.runTransaction(async (tx) => {
    const existing = (await tx.getUser(uid)) ?? defaultUserDoc(uid);
    const balanceBefore = existing.tokenBalance ?? 0;

    if (balanceBefore < amount) {
      throw new InsufficientTokensError(amount, balanceBefore);
    }

    const balanceAfter = balanceBefore - amount;
    const now = new Date().toISOString();
    const txnId = `txn_${crypto.randomUUID()}`;

    tx.setUser(uid, {
      ...existing,
      tokenBalance: balanceAfter,
      updatedAt: now,
    });

    tx.addTransaction({
      id: txnId,
      uid,
      type: "usage",
      amount: -amount,
      balanceBefore,
      balanceAfter,
      description,
      refId,
      createdAt: now,
    });

    return { txnId, balanceAfter };
  });
}

export async function refundTokens(
  uid: string,
  amount: number,
  debitTxnId: string,
  description: string,
  store: LedgerStore = createFirestoreLedgerStore()
): Promise<{ txnId: string; balanceAfter: number }> {
  return creditTokens(uid, amount, "refund", debitTxnId, description, store);
}

/**
 * Claims the one-time First-5-Free-Pages grant for a permanent account on its first book.
 * Returns true if granted on this call, false if already claimed or user has paid orders.
 */
export async function claimFreeGrant(
  uid: string,
  bookId: string,
  store: LedgerStore = createFirestoreLedgerStore()
): Promise<boolean> {
  return store.runTransaction(async (tx) => {
    const existing = (await tx.getUser(uid)) ?? defaultUserDoc(uid);
    if (existing.freeGrantClaimed) {
      return false;
    }
    if (await tx.hasPaidOrder(uid)) {
      return false;
    }

    const now = new Date().toISOString();
    const balance = existing.tokenBalance ?? 0;
    const txnId = `txn_${crypto.randomUUID()}`;

    tx.setUser(uid, {
      ...existing,
      freeGrantClaimed: true,
      freeGrantBookId: bookId,
      updatedAt: now,
    });

    tx.addTransaction({
      id: txnId,
      uid,
      type: "free_grant",
      amount: 0,
      balanceBefore: balance,
      balanceAfter: balance,
      description: `First 5 free pages granted for book ${bookId}`,
      refId: bookId,
      createdAt: now,
    });

    return true;
  });
}
