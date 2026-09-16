// ===========================================
// GLOBAL STATE
// ===========================================

let currentStep = 0;

const sections = document.querySelectorAll(".card");
const steps = document.querySelectorAll(".step");

// ===========================================
// INITIALIZE
// ===========================================

document.addEventListener("DOMContentLoaded", () => {

    buildNavigation();

    showStep(0);

    initializeTeamSection();

    initializeRiskSection();

    initializeFileUpload();

    initializeDraftStorage();

});

// ===========================================
// STEPPER
// ===========================================

function showStep(index) {

    currentStep = index;

    sections.forEach((section, i) => {

        if (i === index) {
            section.style.display = "block";
        } else {
            section.style.display = "none";
        }

    });

    steps.forEach((step, i) => {

        step.classList.remove("active");
        step.classList.remove("completed");

        if (i < index) {
            step.classList.add("completed");
        }

        if (i === index) {
            step.classList.add("active");
        }

    });

}

function buildNavigation() {

    sections.forEach((section, index) => {

        const navContainer = document.createElement("div");

        navContainer.className = "step-navigation";

        if (index === 0) {
            navContainer.classList.add("upload-navigation");
        }

        const prevBtn = document.createElement("button");

        prevBtn.className = "secondary-btn";

        prevBtn.innerText = "Previous";

        prevBtn.onclick = () => {

            if (currentStep > 0) {
                showStep(currentStep - 1);
            }

        };

        const nextBtn = document.createElement("button");

        nextBtn.className = "primary-btn";

        if (index === 0) {
            nextBtn.classList.add("upload-next");
            nextBtn.hidden = true;
        }

        nextBtn.innerText =
            index === sections.length - 1
            ? "Finish"
            : "Next";

        nextBtn.onclick = async () => {

            if (index === sections.length - 1) {
                window.location.reload();
                return;
            }

            if (index === 0) {
                if (section.dataset.analysisReady === "true") {
                    showStep(1);
                } else {
                    await handleUploadNext();
                }
            } else {
                showStep(currentStep + 1);
            }

        };

        if (index > 0) {
            navContainer.appendChild(prevBtn);
        }
        navContainer.appendChild(nextBtn);

        section.appendChild(navContainer);

    });

    steps.forEach((step, index) => {

        step.addEventListener("click", () => {
            showStep(index);
        });

    });

}

// ===========================================
// TEAM MEMBERS
// ===========================================

function initializeTeamSection() {

    const addBtn = document.querySelector(".team-grid")
        ?.parentElement
        ?.querySelector(".secondary-btn");

    if (!addBtn) return;

    addBtn.addEventListener("click", addTeamMember);

    document
        .querySelectorAll(".team-card")
        .forEach(initializeTeamCard);

}

function initializeTeamCard(card) {

    card.querySelector(".remove-btn")
        ?.addEventListener("click", () => card.remove());

}

function addTeamMember(member = {}) {

    const container =
        document.querySelector(".team-grid");

    const memberCard = document.createElement("div");

    memberCard.className = "team-card";

    memberCard.innerHTML = `
        <input
            type="text"
            data-team-field="name"
            placeholder="Name">

        <input
            type="text"
            data-team-field="role"
            placeholder="Role">

        <button
            class="remove-btn">
            Remove
        </button>
    `;

    memberCard.querySelector('[data-team-field="name"]').value = member.name || "";
    memberCard.querySelector('[data-team-field="role"]').value = member.role || "";

    memberCard
        .querySelector(".remove-btn")
        .addEventListener("click", () => {

            memberCard.remove();

        });

    container.appendChild(memberCard);

}

// ===========================================
// RISKS
// ===========================================

function initializeRiskSection() {

    const riskAddBtn =
        document.querySelector(".risk-grid")
        ?.parentElement
        ?.querySelector(".secondary-btn");

    if (!riskAddBtn) return;

    riskAddBtn.addEventListener("click", addRisk);

}

function addRisk(risk = {}) {

    const container =
        document.querySelector(".risk-grid");

    const riskCard =
        document.createElement("div");

    riskCard.className = "risk-card";

    riskCard.innerHTML = `
        <div class="field">

            <label>Risk</label>

            <textarea rows="3" data-risk-field="risk"></textarea>

        </div>

        <div class="field">

            <label>Mitigation</label>

            <textarea rows="3" data-risk-field="mitigation" placeholder="Mitigation plan"></textarea>

        </div>

        <button class="remove-btn">

            Remove Risk

        </button>
    `;

    riskCard
        .querySelector(".remove-btn")
        .addEventListener("click", () => {

            riskCard.remove();

        });

    riskCard.querySelector('[data-risk-field="risk"]').value = risk.risk || "";
    riskCard.querySelector('[data-risk-field="mitigation"]').value = risk.mitigation || "";

    container.appendChild(riskCard);

}

// ===========================================
// FILE UPLOAD
// ===========================================

function initializeFileUpload() {

    const uploadArea =
        document.querySelector(".upload-area");

    const fileInput =
        document.querySelector(
            '.upload-area input[type="file"]'
        );

    if (!uploadArea || !fileInput) return;

    const fileList =
        document.createElement("div");

    fileList.id = "uploaded-files";

    fileList.style.marginTop = "15px";

    fileInput.parentElement
        .appendChild(fileList);

    const handleFiles = (files) => {

        const supportedFiles = [...files].filter(file => {
            const fileName = file.name.toLowerCase();
            return file.type === "application/pdf"
                || file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
                || fileName.endsWith(".pdf")
                || fileName.endsWith(".pptx");
        });

        fileList.innerHTML = "";

        if (supportedFiles.length !== files.length) {
            const error = document.createElement("p");
            error.className = "upload-error";
            error.textContent = "Only PDF and PPTX files are supported.";
            fileList.appendChild(error);
        }

        supportedFiles.forEach(file => {

            const item =
                document.createElement("div");

            item.className = "uploaded-file";
            item.textContent = file.name;

            fileList.appendChild(item);

        });

    };

    fileInput.addEventListener("change", (event) => {
        handleFiles(event.target.files);
    });

    document
        .querySelector('[data-action="analyze-document"]')
        ?.addEventListener("click", handleDocumentAnalysis);

    document
        .querySelector('[data-action="build-manually"]')
        ?.addEventListener("click", () => showStep(1));

    ["dragenter", "dragover"].forEach(eventName => {
        uploadArea.addEventListener(eventName, (event) => {
            event.preventDefault();
            uploadArea.classList.add("drag-over");
        });
    });

    ["dragleave", "drop"].forEach(eventName => {
        uploadArea.addEventListener(eventName, (event) => {
            event.preventDefault();
            uploadArea.classList.remove("drag-over");
        });
    });

    uploadArea.addEventListener("drop", (event) => {
        const files = event.dataTransfer.files;

        try {
            const dataTransfer = new DataTransfer();
            [...files].forEach(file => dataTransfer.items.add(file));
            fileInput.files = dataTransfer.files;
        } catch (error) {
            fileInput.value = "";
        }

        handleFiles(files);
    });

}

// ===========================================
// COLLECT DATA
// ===========================================

function collectProjectData() {

    const inputs =
        document.querySelectorAll("[data-field]");

    const data = {};

    inputs.forEach(input => {

        data[input.dataset.field] =
            input.value;

    });

    const teamMembers = [];

    document
        .querySelectorAll(".team-card")
        .forEach(card => {

            const field = name =>
                card.querySelector(`[data-team-field="${name}"]`)
                    ?.value || "";

            teamMembers.push({

                name: field("name"),
                role: field("role"),
            });

        });

    const risks = [];

    document
        .querySelectorAll(".risk-card")
        .forEach(card => {

            const field = name =>
                card.querySelector(`[data-risk-field="${name}"]`)
                    ?.value || "";

            risks.push({

                risk: field("risk"),
                mitigation: field("mitigation")

            });

        });

    data.teamMembers = teamMembers;
    data.risks = risks;

    return data;

}

// ===========================================
// GENERATE JSON
// ===========================================

function generateJSON() {

    const data =
        collectProjectData();

    console.log(
        JSON.stringify(
            data,
            null,
            2
        )
    );

    alert(
        "Project Charter payload generated. Check browser console."
    );

}

async function generateDocx() {

    if (!window.JSZip) {
        alert("The Word template tools could not be loaded. Check your internet connection and try again.");
        return;
    }

    const data = collectProjectData();
    const response = await fetch("assets/project-charter-template.docx");
    const zip = await JSZip.loadAsync(await response.arrayBuffer());
    const xmlText = await zip.file("word/document.xml").async("string");
    const xml = new DOMParser().parseFromString(xmlText, "application/xml");
    const namespace = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
    const rows = [...xml.getElementsByTagNameNS(namespace, "tbl")[0]
        .getElementsByTagNameNS(namespace, "tr")];

    const cellText = (cell, value) => {
        const paragraphs = [...cell.getElementsByTagNameNS(namespace, "p")];
        const paragraph = paragraphs[0];
        if (!paragraph) return;

        paragraphs.slice(1).forEach(item => item.remove());
        [...paragraph.childNodes]
            .filter(node => node.localName === "r")
            .forEach(run => run.remove());

        String(value || "").split(/\r?\n/).forEach((line, index) => {
            if (index > 0) {
                paragraph.appendChild(xml.createElementNS(namespace, "w:br"));
            }

            const run = xml.createElementNS(namespace, "w:r");
            const text = xml.createElementNS(namespace, "w:t");
            text.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve");
            text.textContent = line;
            run.appendChild(text);
            paragraph.appendChild(run);
        });
    };

    const cells = rowIndex => [...rows[rowIndex].getElementsByTagNameNS(namespace, "tc")];
    const set = (rowIndex, cellIndex, value) => cellText(cells(rowIndex)[cellIndex], value);

    set(0, 0, `Project Charter - ${data.projectName || ""}`);
    set(1, 1, data.projectName);
    set(2, 1, data.projectSummary);
    set(3, 1, data.projectManager);
    set(3, 3, data.solutionArchitect);
    set(4, 1, data.deliveryLocation);
    set(4, 3, data.workType);
    set(6, 0, data.projectScope);
    set(6, 1, data.deliverables);

    const teamMembers = data.teamMembers
        .filter(member => Object.values(member).some(Boolean));

    const milestoneDates = [
        data.solutionHandoverDate,
        data.itKickoffCall,
        data.itSetup,
        data.uat,
        data.trainTheTrainer,
        data.cet,
        data.pst,
        data.goLive
    ].map(value => typeof value === "string" ? value.trim() : "");

    for (let index = 0; index < 8; index++) {
        const member = teamMembers[index] || {};
        const rowIndex = 15 + index;
        set(rowIndex, 0, member.name);
        set(rowIndex, 1, member.role);
        set(rowIndex, 3, milestoneDates[index]);
    }

    const risks = data.risks.filter(risk => risk.risk || risk.mitigation);
    set(24, 0, risks.map(risk => risk.risk || "").join("\n"));
    set(24, 1, risks.map(risk => risk.mitigation || "").join("\n"));
    set(25, 0, "");
    set(25, 1, "");

    zip.file("word/document.xml", new XMLSerializer().serializeToString(xml));
    const blob = await zip.generateAsync({ type: "blob" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = downloadUrl;
    link.download = `${data.projectName || "project-charter"}.docx`;
    link.click();
    URL.revokeObjectURL(downloadUrl);

}

// ===========================================
// SAVE DRAFT
// ===========================================

function saveDraft() {

    const data =
        collectProjectData();

    localStorage.setItem(
        "charterDraft",
        JSON.stringify(data)
    );

    alert(
        "Draft saved."
    );

}

// ===========================================
// LOAD DRAFT
// ===========================================

function initializeDraftStorage() {

    document
        .querySelectorAll('[data-action="generate-docx"]')
        .forEach(btn => btn.addEventListener("click", generateDocx));

    const saveBtns =
        document.querySelectorAll(
            ".secondary-btn"
        );

    saveBtns.forEach(btn => {

        if (
            btn.innerText
                .toLowerCase()
                .includes("save")
        ) {

            btn.addEventListener(
                "click",
                saveDraft
            );

        }

    });

    const existing =
        localStorage.getItem(
            "charterDraft"
        );

    if (!existing) return;

    console.log(
        "Draft detected."
    );

}

// ===========================================
// FUTURE AI HOOK
// ===========================================

async function runAIExtraction() {

    console.log(
        "Future OpenAI / Python extraction hook."
    );

}

function setAIStatus(message, state = "", progress = null) {

    const status = document.querySelector(".ai-status");
    const progressBar = document.querySelector(".ai-progress");
    if (!status) return;

    status.textContent = message;
    status.dataset.state = state;

    if (progressBar && progress !== null) {
        progressBar.hidden = false;
        progressBar.value = progress;
    }

}

async function handleUploadNext() {

    const fileInput = document.querySelector('.upload-area input[type="file"]');

    if (!fileInput?.files.length) {
        showStep(1);
        setAIStatus("Manual builder selected. You can complete the fields yourself.", "manual");
        return;
    }

    await handleDocumentAnalysis();

}

async function handleDocumentAnalysis() {

    const fileInput = document.querySelector('.upload-area input[type="file"]');
    const files = [...(fileInput?.files || [])];
    const analyzeButton = document.querySelector('[data-action="analyze-document"]');
    const uploadSection = document.querySelector(".upload-area")?.closest(".card");

    if (!files.length) {
        setAIStatus("File not uploaded. Please upload a PDF or PPTX file before analyzing.", "error");
        document.querySelector(".upload-next")?.setAttribute("hidden", "true");
        return;
    }

    const unsupportedFile = files.find(file => !isSupportedDocument(file));
    if (unsupportedFile) {
        setAIStatus("Incorrect file format. Only PDF and PPTX files are accepted.", "error");
        document.querySelector(".upload-next")?.setAttribute("hidden", "true");
        return;
    }

    if (analyzeButton) analyzeButton.disabled = true;

    try {
        setAIStatus("Reading the uploaded document locally: 10%", "working", 10);
        const documentContent = await extractDocumentContent(files);
        await populateFromGemini(documentContent);
        if (uploadSection) uploadSection.dataset.analysisReady = "true";
        document.querySelector(".upload-next")?.removeAttribute("hidden");
        setAIStatus("Analysis successful: 100%. Click Next to review populated fields.", "success", 100);
    } catch (error) {
        console.error(error);
        if (uploadSection) uploadSection.dataset.analysisReady = "false";
        document.querySelector(".upload-next")?.setAttribute("hidden", "true");
        setAIStatus(`AI analysis was unavailable. You can still complete the form manually. (${error.message})`, "error");
    } finally {
        if (analyzeButton) analyzeButton.disabled = false;
    }

}

async function extractDocumentContent(files) {

    const textParts = [];
    const sections = [];
    const images = [];
    const titleParts = [];

    for (const file of files) {
        if (file.name.toLowerCase().endsWith(".pdf")) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
            for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
                const page = await pdf.getPage(pageNumber);
                const content = await page.getTextContent();
                const pageText = content.items.map(item => item.str).join(" ");
                textParts.push(`PDF ${file.name}, page ${pageNumber}:\n${pageText}`);
                sections.push({ label: `PDF page ${pageNumber}`, text: pageText });
                if (pageNumber === 1) titleParts.push(pageText.slice(0, 300));

                const viewport = page.getViewport({ scale: 1 });
                const canvas = document.createElement("canvas");
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
                const pageImage = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.8));
                if (pageImage) images.push(await prepareAIImage(pageImage));
            }
        } else {
            const zip = await JSZip.loadAsync(await file.arrayBuffer());
            const slideNames = Object.keys(zip.files)
                .filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name))
                .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

            for (const slideName of slideNames) {
                const xml = new DOMParser().parseFromString(await zip.file(slideName).async("string"), "application/xml");
                const slideParagraphs = [...xml.getElementsByTagNameNS("http://schemas.openxmlformats.org/drawingml/2006/main", "p")]
                    .map(paragraph => [...paragraph.getElementsByTagNameNS("http://schemas.openxmlformats.org/drawingml/2006/main", "t")]
                        .map(node => node.textContent)
                        .join(""))
                    .filter(Boolean);
                const slideText = slideParagraphs.join("\n");
                textParts.push(`PPTX ${file.name}, ${slideName}:\n${slideText}`);
                sections.push({ label: slideName, text: slideText });
                if (slideName === "ppt/slides/slide1.xml") titleParts.push(slideText.slice(0, 300));
            }

            for (const name of Object.keys(zip.files).filter(item => item.startsWith("ppt/media/"))) {
                const imageFile = zip.file(name);
                if (imageFile) {
                    const extension = name.split(".").pop().toLowerCase();
                    const mimeByExtension = {
                        png: "image/png",
                        jpg: "image/jpeg",
                        jpeg: "image/jpeg",
                        webp: "image/webp"
                    };
                    const mime = mimeByExtension[extension];
                    if (mime) {
                        images.push(await prepareAIImage(new Blob([await imageFile.async("arraybuffer")], { type: mime })));
                    }
                }
            }
        }
    }

    return { text: textParts.join("\n\n"), sections, images, title: titleParts.join("\n") };

}

async function populateFromGemini(documentContent) {

    if (typeof LanguageModel === "undefined") {
        throw new Error("Chrome built-in AI is not available in this browser");
    }

    const hasExtractedText = Boolean(documentContent.text.trim());
    const options = {
        expectedInputs: hasExtractedText
            ? [{ type: "text", languages: ["en"] }]
            : [{ type: "text", languages: ["en"] }, { type: "image" }],
        expectedOutputs: [{ type: "text", languages: ["en"] }]
    };
    const availability = await LanguageModel.availability(options);

    if (availability === "unavailable") {
        throw new Error("Chrome Gemini Nano is unavailable on this device");
    }

    setAIStatus(availability === "downloadable" || availability === "downloading"
        ? "Preparing Gemini Nano: 25%"
        : "Gemini Nano is reviewing the document: 75%", "working", 25);

    const session = await LanguageModel.create({
        ...options,
        monitor(monitor) {
            monitor.addEventListener("downloadprogress", event => {
                const downloadProgress = Math.round(event.loaded * 100);
                setAIStatus(`Downloading Gemini Nano: ${downloadProgress}%`, "working", 25 + Math.round(downloadProgress * .5));
            });
        }
    });

    setAIStatus("Gemini Nano is ready. Reviewing the document: 80%", "working", 80);

    const schema = {
        type: "object",
        properties: {
            projectName: { type: "string" },
            projectSummary: { type: "string" },
            projectScope: { type: "string" },
            deliverables: { type: "string" },
            projectManager: { type: "string" },
            solutionArchitect: { type: "string" }
        },
        required: [
            "projectName", "projectSummary", "projectScope", "deliverables",
            "projectManager", "solutionArchitect"
        ],
        additionalProperties: false
    };

    const technologySection = documentContent.sections
        .find(section => /technology solution summary/i.test(section.text));
    const sourceText = technologySection?.text || documentContent.text;
    const summarySection = documentContent.sections
        .find(section => /high level summary|general solution information|delivery center/i.test(section.text));
    const summaryText = summarySection?.text || documentContent.text;
    const promptText = `Extract only facts from the supplied document. Do not invent names, dates, numbers, or locations. Return only valid JSON with exactly these keys: projectName, projectSummary, projectScope, deliverables, projectManager, solutionArchitect.

Use the explicit document title for projectName. If the title starts with "Technology Solution for", remove that phrase and keep only the client name as projectName. Format projectSummary exactly with these labels, one per line. Put a value after the colon only when that value is explicitly stated in the document; otherwise leave it empty. Do not write an introduction, explanation, summary paragraph, or any text outside these seven labels. Do not use square brackets, commas between fields, or HTML:
Site:
LOB:
Scope:
Seats:
HC:
Training start date (CET or PST):
Nesting/Go-live:
HOOP:

Put the complete Technology Solution Summary into projectScope, not projectSummary. Preserve every actual topic found in that summary and format it as separate sections with one detail per bullet, for example:
Network:
- detail
- detail

Internet:
- detail

Use the actual headings from the document, including Network, Internet, Information Security, BC/DR, Tools & Applications, Voice Solution, Deskside, and Others when present. Do not include HTML tags.

For deliverables, return exactly this plain-text template and do not add, remove, or fill any lines. Leave the two hyphen lines under each heading blank so the user can fill them in later:
Network:
-
-

Network Security:
-
-

Server:
-
-

IT Ops:
-
-

Voice and Telephony:
-
-

For HC, use explicit non-peak and peak staffing values when present. For HOOP, use explicit weekday and weekend operating hours when present. Return plain text only inside all string values.

DOCUMENT TITLE:
${documentContent.title}

HIGH-LEVEL SOURCE:
${summaryText.slice(0, 3500)}

TECHNOLOGY SUMMARY:
${sourceText.slice(0, 6500)}`;
    let response;

    try {
        if (documentContent.text.trim()) {
            response = await session.prompt(promptText);
        } else {
            const promptImages = documentContent.images.slice(0, 1);
            response = await session.prompt([
                {
                    role: "user",
                    content: [
                        { type: "text", value: promptText },
                        ...promptImages.map(value => ({ type: "image", value }))
                    ]
                }
            ]);
        }
    } finally {
        session.destroy();
    }

    let data;
    try {
        const jsonResponse = response
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();
        data = JSON.parse(jsonResponse);
    } catch (error) {
        throw new Error("Gemini returned an unreadable response instead of structured fields");
    }

    const populatedCount = Object.entries(data)
        .filter(([name, value]) => !["teamMembers", "risks"].includes(name)
            && typeof value === "string" && value.trim())
        .length
        + (data.teamMembers?.length || 0)
        + (data.risks?.length || 0);

    if (!populatedCount) {
        throw new Error("Gemini returned no usable values from the uploaded document");
    }

    data.projectSummary = mergeProjectSummary(
        data.projectSummary,
        extractExplicitSummary(documentContent)
    );

    applyExtractedData(data);

}

function applyExtractedData(data) {

    Object.entries(data).forEach(([name, value]) => {
        if (name === "teamMembers" || name === "risks") return;
        const field = document.querySelector(`[data-field="${name}"]`);
        if (field && !field.value && typeof value === "string") {
            const cleanedValue = name === "deliverables"
                ? cleanDeliverables()
                : name === "projectName"
                    ? cleanProjectName(value)
                    : cleanExtractedText(value);
            field.value = name === "projectSummary"
                ? formatProjectSummary(cleanedValue)
                : cleanedValue;
        }
    });

    const teamMembers = (data.teamMembers || []).filter(member => member.name || member.role);
    const teamGrid = document.querySelector(".team-grid");
    if (teamGrid) {
        teamGrid.innerHTML = "";
        teamMembers.forEach(member => addTeamMember(member));
        if (!teamMembers.length) addTeamMember();
    }

    const riskGrid = document.querySelector(".risk-grid");
    if (riskGrid) {
        riskGrid.innerHTML = "";
        (data.risks || []).filter(risk => risk.risk || risk.mitigation).forEach(risk => addRisk(risk));
        if (!riskGrid.children.length) addRisk();
    }

}

async function prepareAIImage(blob) {

    try {
        const bitmap = await createImageBitmap(blob);
        const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));
        canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();

        return await new Promise(resolve => {
            canvas.toBlob(resolve, "image/jpeg", 0.65);
        });
    } catch (error) {
        return blob;
    }

}

function cleanExtractedText(value) {

    if (!/<[a-z][\s\S]*>/i.test(value)) return value.trim();

    const markedText = value
        .replace(/<li[^>]*>/gi, "\n• ")
        .replace(/<\/li>/gi, "\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/?(div|p|h[1-6]|ul|ol)[^>]*>/gi, "\n")
        .replace(/<[^>]+>/g, "");
    const decodedText = new DOMParser()
        .parseFromString(markedText, "text/html")
        .body
        .textContent;

    return decodedText
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

}

function isSupportedDocument(file) {

    const fileName = file.name.toLowerCase();
    return file.type === "application/pdf"
        || file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        || fileName.endsWith(".pdf")
        || fileName.endsWith(".pptx");

}

function formatProjectSummary(value) {

    const labels = [
        "Site",
        "LOB",
        "Scope",
        "Seats",
        "HC",
        "Training start date (CET or PST)",
        "Nesting/Go-live",
        "HOOP"
    ];
    const labelPattern = labels
        .map(label => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|");
    const normalizedValue = value
        .replace(/\[\s*(?:value)?\s*\]/gi, "")
        .replace(new RegExp(`,\\s*(?=(?:${labelPattern})\\s*:)`, "gi"), "\n")
        .replace(new RegExp(`[ \\t]+(?=(?:${labelPattern})\\s*:)`, "gi"), "\n");

    return labels.map((label, index) => {
        const labelPattern = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const match = normalizedValue.match(new RegExp(`(?:^|\\n)[ \\t]*${labelPattern}[ \\t]*:[ \\t]*([^\\n]*)`, "i"));
        const extractedValue = match?.[1]
            ?.replace(/\[\s*(?:value)?\s*\]/gi, "")
            .replace(/\s+/g, " ")
            .trim() || "";
        return `${label}: ${extractedValue}`;
    }).join("\n");

}

function extractExplicitSummary(documentContent) {

    const source = documentContent.sections
        .find(section => /high level summary|general solution information|delivery center/i.test(section.text))
        ?.text || "";
    const lines = source
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);
    const findValue = pattern => {
        const match = source.match(pattern);
        return match?.[1]?.trim() || "";
    };
    const deliveryCenterIndex = lines.findIndex(line => /functions and hours of operation/i.test(line));
    const deliveryCenterText = source.match(/Delivery Center[\s\S]*?(?=Data Network Solution|Voice Solution)/i)?.[0] || source;
    const siteMatch = deliveryCenterText.match(/(Philippines|Thailand|India|Mexico|United States|Canada)\s*\n\s*([^\n]+)/i);
    const site = siteMatch
        ? `${siteMatch[1].trim()} - ${siteMatch[2].trim()}`
        : "";
    const nonPeak = source.match(/HC and Seats Non Peak[^\n]*?Agents\s*[–-]\s*([^;\n]+);\s*Support Staff\s*[–-]\s*([^\n]+)/i);
    const peak = source.match(/HC and Seats Peak[^\n]*?Agents\s*[–-]\s*([^;\n]+);\s*Support Staff\s*[–-]\s*([^\n]+)/i);
    const formatHeadcount = match => match
        ? `Agents - ${match[1].trim()}, Support Staff - ${match[2].trim()}`
        : "";
    const nonPeakValue = formatHeadcount(nonPeak);
    const peakValue = formatHeadcount(peak);
    const hc = [nonPeakValue ? `(non-peak) ${nonPeakValue}` : "", peakValue ? `(peak) ${peakValue}` : ""]
        .filter(Boolean)
        .join(" | ");
    const hoopMatches = [...source.matchAll(/(?:Operating hours are|Weekend operating hours are)\s+([^\n]+)/gi)]
        .map(match => match[1].trim());
    const hoop = hoopMatches.join(" | ");
    const trainingStart = findValue(/Training start\s*:?\s*([^\n]+)/i);
    const goLive = findValue(/Go-Live\s*:?\s*([^\n]+)/i).replace(/^n\s+/i, "");

    return [
        `Site: ${site}`,
        "LOB:",
        "Scope:",
        "Seats:",
        `HC: ${hc}`,
        `Training start date (CET or PST): ${trainingStart}`,
        `Nesting/Go-live: ${goLive}`,
        `HOOP: ${hoop}`
    ].join("\n");

}

function mergeProjectSummary(aiValue, explicitValue) {

    const aiLines = formatProjectSummary(aiValue || "").split("\n");
    const explicitLines = formatProjectSummary(explicitValue || "").split("\n");
    const labels = [
        "Site",
        "LOB",
        "Scope",
        "Seats",
        "HC",
        "Training start date (CET or PST)",
        "Nesting/Go-live",
        "HOOP"
    ];
    const valueFor = (lines, label) => lines
        .find(line => line.toLowerCase().startsWith(`${label.toLowerCase()}:`))
        ?.slice(label.length + 1)
        .trim() || "";

    return labels.map(label => {
        const explicitFieldValue = valueFor(explicitLines, label);
        const aiFieldValue = valueFor(aiLines, label);
        return `${label}: ${explicitFieldValue || aiFieldValue}`.trimEnd();
    }).join("\n");

}

function cleanDeliverables() {

    return [
        "Network:",
        "-",
        "-",
        "",
        "Network Security:",
        "-",
        "-",
        "",
        "Server:",
        "-",
        "-",
        "",
        "IT Ops:",
        "-",
        "-",
        "",
        "Voice and Telephony:",
        "-",
        "-"
    ].join("\n");

}

function cleanProjectName(value) {

    return cleanExtractedText(value)
        .replace(/^\s*technology\s+solution\s+for\s*:?[\s-]*/i, "")
        .trim();

}