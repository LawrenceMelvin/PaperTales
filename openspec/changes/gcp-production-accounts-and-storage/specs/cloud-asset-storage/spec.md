# Spec Delta

## Purpose
Stores PaperTales illustrations, compiled print PDFs, and bookstore catalog PDFs in private cloud object storage. Assets are delivered only through short-lived signed links, so books survive across devices and Lulu can fetch print files.

## ADDED Requirements

### Requirement: Private asset storage
All generated illustrations, compiled PDFs, and bookstore PDFs SHALL be stored in a private bucket with public access prevented. Objects SHALL never be reachable through a permanent public URL.

#### Scenario: Guessing an object URL
- **WHEN** an unauthenticated client requests a stored PDF by its raw storage path
- **THEN** access is denied

### Requirement: Generated illustrations persisted to storage
Every successfully generated page or cover illustration SHALL be saved to object storage under the owning user and book. The book SHALL reference the stored object instead of embedding base64 image data.

#### Scenario: Reloading a book on another device
- **WHEN** a signed-in user generates pages on a laptop and later opens the same book on a phone
- **THEN** all previously generated illustrations load on the phone without regeneration

#### Scenario: Illustration storage size
- **WHEN** a book with 12 generated pages is saved
- **THEN** the saved book record contains no inline base64 image data

### Requirement: Compiled PDFs stored per user and book
When a user unlocks and downloads a book, or places a print order, the compiled interior and cover PDFs SHALL be stored under that user and book and reused until the book content changes.

#### Scenario: Repeat download
- **WHEN** a user downloads the same unchanged book PDF twice
- **THEN** the second download is served from the stored PDF without recompiling

#### Scenario: Book edited after compile
- **WHEN** a user refines a page after a PDF was compiled
- **THEN** the next download compiles and stores a fresh PDF

### Requirement: Signed-URL delivery
Downloads SHALL be delivered through signed URLs that expire within 1 hour. For user-created books, a signed URL SHALL be issued only to the book's owner or to a print-order fulfillment request.

#### Scenario: Owner downloads their book
- **WHEN** the owner of an unlocked book requests a download
- **THEN** they receive a signed URL that works for at most 1 hour

#### Scenario: Another user requests the PDF
- **WHEN** a signed-in user requests a download for a book they do not own
- **THEN** the server responds `403` and issues no URL

### Requirement: Lulu receives fetchable print files
When a physical print order is submitted, the system SHALL give the print provider interior and cover PDF URLs that the provider can fetch without a user session, valid long enough for the provider's ingestion window.

#### Scenario: Physical order submitted
- **WHEN** a paid physical print order is sent to Lulu
- **THEN** the interior and cover URLs in the print job resolve to the stored PDFs for that book and return `application/pdf`

### Requirement: Bookstore catalog served from cloud storage
Bookstore catalog PDFs SHALL be served from object storage in production. Reading from the local `KDP SKETCH BOOK` folder SHALL be allowed only in development.

#### Scenario: Bookstore download in production
- **WHEN** a user who passes the existing bookstore download/purchase flow requests a title's PDF in production
- **THEN** the file is delivered via a signed URL to the stored catalog PDF, without reading the local filesystem

#### Scenario: Catalog object missing
- **WHEN** a catalog PDF is not found in storage in production
- **THEN** the server falls back to compiling a PDF from the catalog's preview pages, matching current behavior
