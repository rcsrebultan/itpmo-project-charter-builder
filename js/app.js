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

        nextBtn.innerText =
            index === sections.length - 1
            ? "Finish"
            : "Next";

        nextBtn.onclick = () => {

            if (currentStep < sections.length - 1) {
                showStep(currentStep + 1);
            }

        };

        navContainer.appendChild(prevBtn);
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

function addTeamMember() {

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

        <input
            type="text"
            data-team-field="solutionHO"
            placeholder="Solution HO">

        <input
            type="text"
            data-team-field="date"
            placeholder="Date">

        <button
            class="remove-btn">
            Remove
        </button>
    `;

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

function addRisk() {

    const container =
        document.querySelector(".risk-grid");

    const riskCard =
        document.createElement("div");

    riskCard.className = "risk-card";

    riskCard.innerHTML = `
        <div class="field">

            <label>Risk</label>

            <textarea rows="3"></textarea>

        </div>

        <div class="field">

            <label>Mitigation</label>

            <textarea rows="3"></textarea>

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
                solutionHO: field("solutionHO"),
                date: field("date")

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

        const run = xml.createElementNS(namespace, "w:r");
        const text = xml.createElementNS(namespace, "w:t");
        text.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve");
        text.textContent = value || "";
        run.appendChild(text);
        paragraph.appendChild(run);
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

    for (let index = 0; index < 7; index++) {
        const member = teamMembers[index] || {};
        const rowIndex = 16 + index;
        set(rowIndex, 0, member.name);
        set(rowIndex, 1, member.role);
        set(rowIndex, 2, member.solutionHO);
        set(rowIndex, 3, member.date);
    }

    const risks = data.risks
        .filter(risk => risk.risk || risk.mitigation)
        .map(risk => `Risk: ${risk.risk || ""}\nMitigation: ${risk.mitigation || ""}`)
        .join("\n\n");

    set(23, 0, "Identified Risks and Mitigation");
    set(24, 0, risks);
    for (let index = 23; index < 29; index++) {
        if (index !== 24) set(index, 1, "");
        set(index, 2, "");
    }

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