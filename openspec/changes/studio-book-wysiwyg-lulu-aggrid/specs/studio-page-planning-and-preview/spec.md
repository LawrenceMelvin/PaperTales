# studio-page-planning-and-preview Specification Delta

## ADDED Requirements

### Requirement: Pure virtual book surface without in-page tweak buttons
The `BookViewer` component SHALL render both the cover spread and all interior page spreads without floating in-page `Tweak Art`, `Tweak Cover`, or `Design in Chat` action buttons inside the book frame.

#### Scenario: Viewing an interior coloring or story spread
- **WHEN** the creator views an interior spread (`Index >= 1`) in `BookViewer`
- **THEN** no `Tweak Art` button or token badge is rendered inside the illustration or journal page frame

#### Scenario: Viewing the book cover spread
- **WHEN** the creator views the cover spread (`Index 0`) in `BookViewer`
- **THEN** no `Tweak Cover` or `Design in Chat` button is rendered inside the cover frame

### Requirement: External "Edit This Page in Chat" reference button below the book
The system SHALL display an `Edit This Page in Chat` (or `Edit Cover in Chat` on `Index 0`) button below the `BookViewer` viewport that attaches the active page or cover details as a visual reference chip in the Studio AI chat and focuses the chat input.

#### Scenario: Attaching an interior page to chat for editing
- **WHEN** the creator clicks `Edit This Page in Chat` while viewing Spread `k` (`k >= 1`)
- **THEN** the Studio opens the chat discussion view, attaches a reference chip for Page `k` containing its current title, story/prompt text, and illustration metadata, and sends that page context with the creator's next chat message so `/api/ai/chat` or `/api/ai/image` updates Page `k` directly

#### Scenario: Attaching the book cover to chat for editing
- **WHEN** the creator clicks `Edit Cover in Chat` while viewing the Cover Spread (`Index 0`)
- **THEN** the Studio attaches a Cover Reference chip in the chat input bar with the current cover title, subtitle, back-cover blurb, and cover prompt so the creator can conversational-edit and regenerate the cover

### Requirement: Non-expanding constant two-page book footprint
The `BookViewer` component SHALL maintain a consistent two-page spread aspect ratio and container width across both the Cover Spread (`Index 0`, showing Back Cover on the left leaf and Front Cover on the right leaf) and all Interior Spreads (`Index 1..N`) so flipping pages never expands or shrinks the book container.

#### Scenario: Flipping from Cover Spread to Spread 1
- **WHEN** the creator clicks `Next` to flip from `Index 0` (Cover Spread) to `Index 1` (Spread 1)
- **THEN** the outer book spread container retains the exact same width and aspect ratio class without expanding

### Requirement: Full-frame edge-to-edge illustrations on cover and interior pages
The system SHALL render AI-generated cover artwork and interior page illustrations edge-to-edge within their respective page leaf containers without restrictive `max-h-[240px]` or `max-h-[360px]` caps or nested inner boxes, and `/api/ai/image` SHALL request square/full-frame composition.

#### Scenario: Redesigning Page 1 or generating Front Cover artwork
- **WHEN** a cover or interior page illustration is generated or redesigned via `/api/ai/image`
- **THEN** the image fills the full page leaf frame without narrow vertical letterboxing or inner box borders

### Requirement: AI Helper consultation for single-sided coloring book pages
When the creator designs a `coloring_book`, the AI Helper (`/api/ai/chat`) SHALL ask whether they want single-sided coloring pages to prevent marker, paint, and watercolor bleed-through, and synchronize `singleSidedColoring` on the book project.

#### Scenario: Creator selects single-sided coloring mode in chat
- **WHEN** the AI Helper asks about marker/paint bleed-through protection for a coloring book and the creator chooses single-sided pages
- **THEN** `bookDraft.singleSidedColoring` is set to `true` and `BookViewer` and PDF compilation render each coloring sheet with a bleed-guard reverse side
