# ITPMO Project Charter Builder

## Leadership Overview

This browser-based tool helps users create standardized project charter documents from PDF or PPTX source materials.

## How It Works

1. Users upload a PDF or PPTX file.
2. The document is processed locally in the browser.
3. PDF text and pages, plus PPTX slide text and supported images, are extracted.
4. Chrome's built-in Gemini Nano analyzes the extracted content when available.
5. Detected project information, scope, deliverables, risks, and milestones are placed into editable form fields.
6. Users review and correct the information.
7. The completed information is inserted into the approved DOCX project charter template.
8. The user downloads the final Word document.

## Manual Fallback

Users can choose **Build Manually** if Gemini Nano is unavailable, the document cannot be read, the device does not meet Chrome AI requirements, or the user prefers to complete the charter manually.

## Technology and Privacy

- Hosted on GitHub Pages
- No backend server is currently required
- No paid AI API or API key is used
- Document processing is intended to happen locally in the user's browser
- The generated DOCX is downloaded directly to the user's device
- The approved DOCX template is stored with the website

## Important Limitations

- Gemini Nano requires compatible Chrome and device hardware.
- The first use may require Chrome to download the local AI model.
- Large or complex documents may exceed the model's context limit.
- AI output may require user correction.
- Missing information is intended to remain blank rather than be invented.
- The tool currently supports PDF and PPTX files only.

## Governance

The builder is an assistive automation tool, not an authoritative source. Users remain responsible for reviewing the populated fields before generating the final project charter.
