# AI Book Helper Hybrid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance PaperTales AI Book Helper with an interactive text highlight-to-refine popover, illustration tweak control, and a PayPal credit refill monetization loop without adding third-party npm package bloat.

**Architecture:** Lightweight Hybrid approach combining native browser DOM Selection + floating Glacier Glass popover, Next.js 15 App Router API routes (`/api/ai/refine`, `/api/ai/image`), and the existing PayPal Smart Vault token store (`token-store.ts`, `TokenModal.tsx`).

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide React, PayPal JavaScript SDK.

## Global Constraints
- Strictly adhere to dark Glacier Glass aesthetic (`glacier-glass`, `bg-slate-900/90`, `border-sky-400/30`, `text-sky-300`).
- Zero new npm dependencies; leverage native Web APIs (`window.getSelection()`, `getBoundingClientRect()`).
- All state mutations must be strictly typed in TypeScript (`npx tsc --noEmit` must pass with zero errors).
- Credit deduction rules: 1 Token for text selection refinement; 2 Tokens for art tweaks. If balance is insufficient, automatically trigger `TokenModal.tsx`.
- Never execute or commit code without explicit user approval.

---

### Task 1: Implement Interactive Text Selection & Floating AI Refine Popover in BookViewer

**Files:**
- Modify: `src/components/BookViewer.tsx:1-230`

**Interfaces:**
- Consumes:
  - `BookViewerProps`: add `onOpenTokenModal?: () => void`
  - `deductClientTokens(amount: number): boolean` from `@/lib/token-store`
  - `getClientTokenBalance(): number` from `@/lib/token-store`
- Produces:
  - Text selection listener on story paragraph (`onMouseUp`, `onTouchEnd`)
  - Floating popover with preset chips (1 Token) and custom instruction input
  - `/api/ai/refine` integration updating `activePage.storyText` via `onPageUpdate`
  - Live "Undo" state restoring previous text version

- [x] **Step 1: Define selection & popover state in `BookViewer.tsx`**
  Add state for:
  ```tsx
  interface SelectionState {
    text: string;
    top: number;
    left: number;
    visible: boolean;
  }
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [customInstruction, setCustomInstruction] = useState<string>("");
  const [previousStoryText, setPreviousStoryText] = useState<string | null>(null);
  ```

- [x] **Step 2: Implement mouse/touch selection handler**
  ```tsx
  const handleTextSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      return;
    }
    const text = sel.toString().trim();
    if (text.length < 3) return; // Ignore accidental tiny clicks

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setSelection({
      text,
      top: rect.top - 10,
      left: rect.left + rect.width / 2,
      visible: true,
    });
  };
  ```

- [x] **Step 3: Implement `handleApplyRefine` with token check & `/api/ai/refine` call**
  ```tsx
  const handleApplyRefine = async (instruction: string) => {
    if (!selection || !activePage) return;
    const balance = getClientTokenBalance();
    if (balance < 1) {
      if (onOpenTokenModal) onOpenTokenModal();
      setSelection(null);
      return;
    }

    setIsRefining(true);
    const originalText = selection.text;
    const currentFullText = activePage.storyText;

    try {
      const res = await fetch("/api/ai/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalText,
          instruction,
          fullStoryText: currentFullText,
          bookTitle: book.title,
          genre: book.genre,
        }),
      });

      const data = await res.json();
      if (data.success && data.refinedText) {
        deductClientTokens(1);
        setPreviousStoryText(currentFullText);
        const updatedFullText = currentFullText.replace(originalText, data.refinedText);
        onPageUpdate({ ...activePage, storyText: updatedFullText });
      }
    } catch (err) {
      console.error("Failed to refine text:", err);
    } finally {
      setIsRefining(false);
      setSelection(null);
      setCustomInstruction("");
    }
  };
  ```

- [x] **Step 4: Render Floating Popover and Undo Toast in UI**
  Render fixed-position floating popover when `selection?.visible` is true, styled with `glacier-glass`, containing preset chips:
  - 🪄 *"Playful"*
  - 👶 *"Simplify"*
  - 🎭 *"Sensory"*
  - Custom input bar with submit button.
  Also display an Undo pill if `previousStoryText` is available.

---

### Task 2: Implement Illustration Tweak & Regeneration Control in BookViewer

**Files:**
- Modify: `src/components/BookViewer.tsx:230-395`

**Interfaces:**
- Consumes:
  - `activePage.svgData?: string`
  - `activePage.imageUrl?: string`
  - `/api/ai/image` endpoint with `{ prompt, characterTraits, pageNumber }`
  - `deductClientTokens(2)` from `@/lib/token-store`
- Produces:
  - "🎨 Tweak Art (2 Tokens)" button on illustration panel
  - Tweak prompt input modal
  - Dynamic display of custom SVG or image line art

- [x] **Step 1: Add artwork tweak state in `BookViewer.tsx`**
  ```tsx
  const [artPromptModalOpen, setArtPromptModalOpen] = useState<boolean>(false);
  const [artPrompt, setArtPrompt] = useState<string>("");
  const [isGeneratingArt, setIsGeneratingArt] = useState<boolean>(false);
  ```

- [x] **Step 2: Add dynamic SVG / image rendering in right page container**
  Check `activePage?.svgData` and `activePage?.imageUrl` before falling back to default genre templates:
  ```tsx
  {activePage?.imageUrl ? (
    <img src={activePage.imageUrl} alt={activePage.title} className="w-full h-full max-h-[340px] object-contain" />
  ) : activePage?.svgData ? (
    <div dangerouslySetInnerHTML={{ __html: activePage.svgData }} className="w-full h-full flex items-center justify-center max-h-[340px]" />
  ) : isIceCreamTheme ? (
    /* existing ice cream SVG */
  ) : (
    /* existing default SVGs */
  )}
  ```

- [x] **Step 3: Implement `handleTweakArt` with token deduction (2 Tokens)**
  ```tsx
  const handleTweakArt = async (customPrompt?: string) => {
    if (!activePage) return;
    const balance = getClientTokenBalance();
    if (balance < 2) {
      if (onOpenTokenModal) onOpenTokenModal();
      setArtPromptModalOpen(false);
      return;
    }

    setIsGeneratingArt(true);
    try {
      const fullPrompt = customPrompt || `${activePage.imagePrompt}, fresh alternative composition`;
      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: fullPrompt,
          characterTraits: book.character?.traits?.join(", ") || "",
          pageNumber: activePage.pageNumber,
        }),
      });
      const data = await res.json();
      if (data.success) {
        deductClientTokens(2);
        if (data.imageUrl) {
          onPageUpdate({ ...activePage, imageUrl: data.imageUrl, svgData: undefined });
        } else if (data.svg) {
          onPageUpdate({ ...activePage, svgData: data.svg, imageUrl: undefined });
        }
      }
    } catch (err) {
      console.error("Failed to generate art:", err);
    } finally {
      setIsGeneratingArt(false);
      setArtPromptModalOpen(false);
      setArtPrompt("");
    }
  };
  ```

- [ ] **Step 4: Add "🎨 Tweak Art" button and popover modal on right page**
  Add action pill above/inside the illustration canvas so users can either one-click re-roll or input their custom tweak instructions.

---

### Task 3: Connect Token Refill Modal in Studio Page

**Files:**
- Modify: `src/app/studio/page.tsx:880-895`

**Interfaces:**
- Consumes:
  - `setTokenModalOpen(true)` in `src/app/studio/page.tsx`
  - `<BookViewer />` component
- Produces:
  - `onOpenTokenModal={() => setTokenModalOpen(true)}` passed to `<BookViewer />`

- [ ] **Step 1: Pass `onOpenTokenModal` to `BookViewer`**
  ```tsx
  <BookViewer
    book={book}
    onPageUpdate={handlePageUpdate}
    onDownloadPdf={handleDownloadFullPdf}
    onPrintFirstPage={handlePrintFirstPage}
    onOpenBookDetails={() => setBookDetailsOpen(true)}
    onOrderPhysical={() => setOrderModalOpen(true)}
    onOpenTokenModal={() => setTokenModalOpen(true)}
    isDownloading={isDownloadingPdf || isPrintingPageOne}
    isConfirmed={isConfirmed}
  />
  ```

---

### Task 4: Empirical Verification & Typecheck

**Files:**
- Test: `npx tsc --noEmit`
- Test: Verify local dev server at `http://localhost:3000/studio`

- [ ] **Step 1: Run TypeScript strict typecheck**
  Run: `npx tsc --noEmit`
  Expected: Clean compilation with 0 errors.

- [ ] **Step 2: Test Interactive Text Selection**
  - Highlight text on the story page.
  - Verify floating glass popover appears directly above selection.
  - Click preset chip "Playful" -> verify text updates and 1 token is deducted.
  - Click "Undo" -> verify text returns to original.

- [ ] **Step 3: Test Insufficient Tokens Trigger**
  - With 0 tokens, attempt text refine or art tweak.
  - Verify PayPal `TokenModal` immediately opens with packs ($4.99 / $9.99 / $19.99).
