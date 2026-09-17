# Changelog

## 2026-09-17

### Project Timeline

- Added a dedicated Project Timeline section to generated Word charters.
- Added single-date milestone support for Solutions Handover, IT Kick-off Call, and Go-Live.
- Added start and end dates for IT Setup, UAT, Train-the-Trainer, CET, and PST.
- Added a week-by-week timeline grid with date headers.
- Added colored bars for multi-day activities.
- Added larger circle markers for single-day milestones.
- Added a star marker for Go-Live.
- Added blank timeline output when no dates are entered, while retaining the editable timeline title and table.
- Added full-width and autofit formatting for the generated timeline table.
- Vertically centered timeline table cells.

### Word Charter Formatting

- Removed timeline dates from the Teams/Resources table.
- Updated Teams/Resources to use Role and Name columns.
- Merged Teams/Resources section headers across the table width.
- Removed unused resource rows based on the number of entered resources.
- Added a full-width Risks / Mitigation header.
- Added Identified Risks and Mitigation Plan column headers.
- Placed each risk and mitigation pair on its own row.
- Applied matching dark-teal and white styling to the main charter section headers.

### Manual Builder Defaults

- Restored standard Project Summary labels for manual and skipped-upload flows:
  - Location
  - LOB
  - Scope
  - Seats
  - HC
  - Training start date (CET or PST)
  - Nesting/Go-live
  - HOOP
- Restored standard Project Scope category templates.
- Restored standard Deliverables category templates.
- Kept the templates editable for users to complete manually.

### AI-Assisted Extraction

- Enabled Gemini Nano to receive document images when uploaded files contain images, in addition to extracted text.
- Added fallback extraction of Project Scope categories directly from extracted PDF/PPTX text when Nano omits visible sections.
- Preserved scope details for image-only or text-unreadable uploads.
- Tightened scope extraction instructions to require explicit, readable source evidence.
- Removed fuzzy scope matching that could retain unsupported or hallucinated wording.
- Kept unsupported details blank instead of inventing or paraphrasing content.

#### AI Accuracy Safeguards

- Instructed Gemini Nano to copy readable source wording rather than summarize or expand it.
- Instructed Gemini Nano not to infer missing details, expand abbreviations, combine bullets, or fill empty categories.
- Added source-text fallback extraction for scope categories that Nano misses.
- Require future extraction improvements to retain source text and slide references for each captured bullet.
- Recommended validating every AI-generated bullet against the uploaded document before displaying it.

### Deployment

- Added the timeline work to the `timeline` branch for review.
- Merged the timeline work into `main`.
- Published the completed changes to the GitHub repository and GitHub Pages deployment flow.
