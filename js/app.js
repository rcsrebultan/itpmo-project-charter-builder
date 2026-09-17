// ===========================================
// GLOBAL STATE
// ===========================================

let currentStep = 0;

const defaultTeamRoles = [
    "Network",
    "Network Security",
    "Server",
    "Voice",
    "IT Ops"
];

const sections = document.querySelectorAll(".card");
const steps = document.querySelectorAll(".step");

// ===========================================
// INITIALIZE
// ===========================================

document.addEventListener("DOMContentLoaded", () => {

    buildNavigation();

    showStep(0);

    document
        .querySelector('[data-action="go-to-upload"]')
        ?.addEventListener("click", () => showStep(0));

    initializeTeamSection();

    initializeRiskSection();

    initializeDatePickers();

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
            data-team-field="role"
            placeholder="Role">

        <input
            type="text"
            data-team-field="name"
            placeholder="Name">

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

function addDefaultTeamMembers() {

    defaultTeamRoles.forEach(role => addTeamMember({ role }));

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
            ?.addEventListener("click", () => {
                applyManualTemplates();
                showStep(1);
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

    applyManualTemplates();
    const data = collectProjectData();
    const response = await fetch("assets/project-charter-template.docx");
    const zip = await JSZip.loadAsync(await response.arrayBuffer());
    const xmlText = await zip.file("word/document.xml").async("string");
    const xml = new DOMParser().parseFromString(xmlText, "application/xml");
    const namespace = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
    const rows = [...xml.getElementsByTagNameNS(namespace, "tbl")[0]
        .getElementsByTagNameNS(namespace, "tr")];

    const cellText = (cell, value, alignment) => {
        const paragraphs = [...cell.getElementsByTagNameNS(namespace, "p")];
        const paragraph = paragraphs[0];
        if (!paragraph) return;

        if (alignment) {
            let paragraphProperties = paragraph.getElementsByTagNameNS(namespace, "pPr")[0];
            if (!paragraphProperties) {
                paragraphProperties = xml.createElementNS(namespace, "w:pPr");
                paragraph.insertBefore(paragraphProperties, paragraph.firstChild);
            }

            [...paragraphProperties.getElementsByTagNameNS(namespace, "jc")]
                .forEach(element => element.remove());
            const justification = xml.createElementNS(namespace, "w:jc");
            justification.setAttributeNS(namespace, "w:val", alignment);
            paragraphProperties.appendChild(justification);
        }

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
    const setRow = (row, cellIndex, value, alignment) => {
        const rowCells = [...row.getElementsByTagNameNS(namespace, "tc")];
        cellText(rowCells[cellIndex], value, alignment);
    };
    const set = (rowIndex, cellIndex, value, alignment) => setRow(rows[rowIndex], cellIndex, value, alignment);
    const styleHeaderCell = cell => {
        const properties = cell.getElementsByTagNameNS(namespace, "tcPr")[0];
        const shading = properties.getElementsByTagNameNS(namespace, "shd")[0]
            || xml.createElementNS(namespace, "w:shd");
        shading.setAttributeNS(namespace, "w:fill", "0F4C5C");
        if (!shading.parentNode) properties.appendChild(shading);

        [...cell.getElementsByTagNameNS(namespace, "p")].forEach(paragraph => {
            const paragraphProperties = paragraph.getElementsByTagNameNS(namespace, "pPr")[0]
                || paragraph.insertBefore(xml.createElementNS(namespace, "w:pPr"), paragraph.firstChild);
            const alignment = paragraphProperties.getElementsByTagNameNS(namespace, "jc")[0]
                || xml.createElementNS(namespace, "w:jc");
            alignment.setAttributeNS(namespace, "w:val", "center");
            if (!alignment.parentNode) paragraphProperties.appendChild(alignment);
            [...paragraph.getElementsByTagNameNS(namespace, "r")].forEach(run => {
                const runProperties = run.getElementsByTagNameNS(namespace, "rPr")[0]
                    || run.insertBefore(xml.createElementNS(namespace, "w:rPr"), run.firstChild);
                if (!runProperties.getElementsByTagNameNS(namespace, "b").length) {
                    runProperties.appendChild(xml.createElementNS(namespace, "w:b"));
                }
                const color = runProperties.getElementsByTagNameNS(namespace, "color")[0]
                    || xml.createElementNS(namespace, "w:color");
                color.setAttributeNS(namespace, "w:val", "FFFFFF");
                if (!color.parentNode) runProperties.appendChild(color);
            });
        });
    };
    const mergeRowAcrossTable = rowIndex => {
        const row = rows[rowIndex];
        const rowCells = [...row.getElementsByTagNameNS(namespace, "tc")];
        rowCells.slice(1).forEach(cell => row.removeChild(cell));
        const properties = rowCells[0].getElementsByTagNameNS(namespace, "tcPr")[0];
        [...properties.getElementsByTagNameNS(namespace, "gridSpan")].forEach(element => element.remove());
        const gridSpan = xml.createElementNS(namespace, "w:gridSpan");
        gridSpan.setAttributeNS(namespace, "w:val", "4");
        properties.appendChild(gridSpan);
        properties.getElementsByTagNameNS(namespace, "tcW")[0]
            .setAttributeNS(namespace, "w:w", "10209");
    };
    const normalizeResourceRow = rowIndex => {
        const row = rows[rowIndex];
        const rowCells = [...row.getElementsByTagNameNS(namespace, "tc")];
        rowCells.slice(2).forEach(cell => row.removeChild(cell));
        rowCells.slice(0, 2).forEach(cell => {
            const properties = cell.getElementsByTagNameNS(namespace, "tcPr")[0];
            [...properties.getElementsByTagNameNS(namespace, "gridSpan")].forEach(element => element.remove());
            const gridSpan = xml.createElementNS(namespace, "w:gridSpan");
            gridSpan.setAttributeNS(namespace, "w:val", "2");
            properties.appendChild(gridSpan);
            const width = properties.getElementsByTagNameNS(namespace, "tcW")[0];
            width.setAttributeNS(namespace, "w:w", "5104");
            width.setAttributeNS(namespace, "w:type", "dxa");
        });
    };
    const projectName = String(data.projectName || "Untitled Project").trim();
    const edrNumber = String(data.edrNumber || "").trim();
    const charterName = `Project Charter - ${projectName}${edrNumber ? ` - EDR ${edrNumber}` : ""}`;

    set(0, 0, charterName);
    set(1, 1, data.projectName);
    set(2, 1, data.projectSummary);
    set(3, 1, data.projectManager);
    set(3, 3, data.solutionArchitect);
    set(4, 1, data.deliveryLocation);
    set(4, 3, data.workType);
    set(6, 0, data.projectScope);
    set(6, 1, data.deliverables);
    styleHeaderCell(cells(0)[0]);
    styleHeaderCell(cells(5)[0]);
    styleHeaderCell(cells(5)[1]);

    const teamMembers = data.teamMembers
        .filter(member => Object.values(member).some(Boolean));

    mergeRowAcrossTable(14);
    set(14, 0, "Team Members/Resources");
    styleHeaderCell(cells(14)[0]);
    for (let rowIndex = 22; rowIndex >= 16 + teamMembers.length; rowIndex--) {
        rows[rowIndex].parentNode.removeChild(rows[rowIndex]);
    }
    for (let rowIndex = 15; rowIndex < 16 + teamMembers.length; rowIndex++) {
        normalizeResourceRow(rowIndex);
    }
    set(15, 0, "Role");
    set(15, 1, "Name");

    for (let index = 0; index < teamMembers.length; index++) {
        const member = teamMembers[index] || {};
        const rowIndex = 16 + index;
        set(rowIndex, 0, member.role, "left");
        set(rowIndex, 1, member.name);
    }

    const timelineEntries = [
        { label: "Solutions Handover", start: data.solutionHandoverDate, end: data.solutionHandoverDate },
        { label: "IT Kick-off Call", start: data.itKickoffCall, end: data.itKickoffCall },
        { label: "IT Setup", start: data.itSetupStart, end: data.itSetupEnd },
        { label: "UAT", start: data.uatStart, end: data.uatEnd },
        { label: "Train-the-Trainer", start: data.trainTheTrainerStart, end: data.trainTheTrainerEnd },
        { label: "CET", start: data.cetStart, end: data.cetEnd },
        { label: "PST", start: data.pstStart, end: data.pstEnd },
        { label: "Go-Live", start: data.goLive, end: data.goLive }
    ].map(entry => ({
        ...entry,
        start: formatTimelineDate(entry.start),
        end: formatTimelineDate(entry.end)
    }));

    const createTextRun = (value, options = {}) => {
        const run = xml.createElementNS(namespace, "w:r");
        const properties = xml.createElementNS(namespace, "w:rPr");
        const text = xml.createElementNS(namespace, "w:t");
        text.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve");
        text.textContent = value;
        if (options.bold) properties.appendChild(xml.createElementNS(namespace, "w:b"));
        if (options.color) {
            const color = xml.createElementNS(namespace, "w:color");
            color.setAttributeNS(namespace, "w:val", options.color);
            properties.appendChild(color);
        }
        if (options.size) {
            const size = xml.createElementNS(namespace, "w:sz");
            size.setAttributeNS(namespace, "w:val", options.size);
            properties.appendChild(size);
            const sizeCs = xml.createElementNS(namespace, "w:szCs");
            sizeCs.setAttributeNS(namespace, "w:val", options.size);
            properties.appendChild(sizeCs);
        }
        run.appendChild(properties);
        run.appendChild(text);
        return run;
    };
    const createTimelineCell = (value, options = {}) => {
        const cell = xml.createElementNS(namespace, "w:tc");
        const properties = xml.createElementNS(namespace, "w:tcPr");
        const width = xml.createElementNS(namespace, "w:tcW");
        const verticalAlignment = xml.createElementNS(namespace, "w:vAlign");
        const paragraph = xml.createElementNS(namespace, "w:p");
        width.setAttributeNS(namespace, "w:w", options.width || "5000");
        width.setAttributeNS(namespace, "w:type", "dxa");
        verticalAlignment.setAttributeNS(namespace, "w:val", "center");
        properties.appendChild(width);
        properties.appendChild(verticalAlignment);
        if (options.fill) {
            const shading = xml.createElementNS(namespace, "w:shd");
            shading.setAttributeNS(namespace, "w:fill", options.fill);
            properties.appendChild(shading);
        }
        if (options.alignment) {
            const paragraphProperties = xml.createElementNS(namespace, "w:pPr");
            const alignment = xml.createElementNS(namespace, "w:jc");
            alignment.setAttributeNS(namespace, "w:val", options.alignment);
            paragraphProperties.appendChild(alignment);
            paragraph.appendChild(paragraphProperties);
        }
        paragraph.appendChild(createTextRun(value, options));
        cell.appendChild(properties);
        cell.appendChild(paragraph);
        return cell;
    };
    const parseTimelineDate = value => {
        const match = String(value || "").match(/^(\d{2})-([A-Za-z]{3})-(\d{4})$/);
        if (!match) return null;
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = months.findIndex(item => item.toLowerCase() === match[2].toLowerCase());
        const date = new Date(Date.UTC(Number(match[3]), month, Number(match[1])));
        return Number.isNaN(date.getTime()) ? null : date;
    };
    const startOfWeek = date => {
        const result = new Date(date);
        const day = result.getUTCDay();
        result.setUTCDate(result.getUTCDate() - (day === 0 ? 6 : day - 1));
        return result;
    };
    const addDays = (date, days) => {
        const result = new Date(date);
        result.setUTCDate(result.getUTCDate() + days);
        return result;
    };
    const datedMilestones = timelineEntries.flatMap(entry => [entry.start, entry.end])
        .map(parseTimelineDate).filter(Boolean);
    const hasTimelineData = datedMilestones.length > 0;
    const firstWeek = hasTimelineData
        ? startOfWeek(datedMilestones.reduce((earliest, item) => item < earliest ? item : earliest, datedMilestones[0]))
        : startOfWeek(new Date());
    const lastWeek = hasTimelineData
        ? startOfWeek(datedMilestones.reduce((latest, item) => item > latest ? item : latest, datedMilestones[0]))
        : firstWeek;
    const weekCount = Math.floor((lastWeek - firstWeek) / (7 * 24 * 60 * 60 * 1000)) + 1;
    const weeks = Array.from({ length: weekCount }, (_, index) => addDays(firstWeek, index * 7));
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const weekIndexFor = date => Math.floor((startOfWeek(date) - firstWeek) / (7 * 24 * 60 * 60 * 1000));
    const timelineTable = xml.createElementNS(namespace, "w:tbl");
    const tableProperties = xml.createElementNS(namespace, "w:tblPr");
    const tableWidth = xml.createElementNS(namespace, "w:tblW");
    tableWidth.setAttributeNS(namespace, "w:w", "5000");
    tableWidth.setAttributeNS(namespace, "w:type", "pct");
    const tableLayout = xml.createElementNS(namespace, "w:tblLayout");
    tableLayout.setAttributeNS(namespace, "w:type", "autofit");
    tableProperties.appendChild(tableWidth);
    tableProperties.appendChild(tableLayout);
    const borders = xml.createElementNS(namespace, "w:tblBorders");
    ["top", "left", "bottom", "right", "insideH", "insideV"].forEach(edge => {
        const border = xml.createElementNS(namespace, `w:${edge}`);
        border.setAttributeNS(namespace, "w:val", "single");
        border.setAttributeNS(namespace, "w:sz", "4");
        border.setAttributeNS(namespace, "w:color", "D9E2F3");
        borders.appendChild(border);
    });
    tableProperties.appendChild(borders);
    timelineTable.appendChild(tableProperties);
    const headerRow = xml.createElementNS(namespace, "w:tr");
    headerRow.appendChild(createTimelineCell("Milestone", { width: "3000", fill: "0F4C5C", bold: true, color: "FFFFFF" }));
    headerRow.appendChild(createTimelineCell("Date", { width: "1600", fill: "0F4C5C", bold: true, color: "FFFFFF", alignment: "center" }));
    if (hasTimelineData) weeks.forEach((week, index) => headerRow.appendChild(createTimelineCell(
        `WK${index + 1}\n${monthNames[week.getUTCMonth()]} ${week.getUTCDate()}`,
        { width: "600", fill: "0F4C5C", bold: true, color: "FFFFFF", alignment: "center" }
    )));
    timelineTable.appendChild(headerRow);
    timelineEntries.forEach(({ label, start, end }, index) => {
        const row = xml.createElementNS(namespace, "w:tr");
        const fill = index % 2 === 0 ? "F3F7FA" : "FFFFFF";
        const parsedStart = parseTimelineDate(start);
        const parsedEnd = parseTimelineDate(end || start);
        const startWeek = parsedStart ? weekIndexFor(parsedStart) : -1;
        const endWeek = parsedEnd ? weekIndexFor(parsedEnd) : startWeek;
        const dateLabel = start && end && start !== end ? `${start} - ${end}` : start;
        row.appendChild(createTimelineCell(label, { width: "3000", fill }));
        row.appendChild(createTimelineCell(dateLabel || "", { width: "1600", fill, alignment: "center" }));
        if (hasTimelineData) weeks.forEach((week, weekIndex) => {
            const inRange = weekIndex >= startWeek && weekIndex <= endWeek && startWeek >= 0;
            const singleDay = parsedStart && parsedEnd && parsedStart.getTime() === parsedEnd.getTime();
            const marker = inRange && singleDay ? (label === "Go-Live" ? "★" : "●") : "";
            row.appendChild(createTimelineCell(marker, {
                width: "600",
                fill: inRange && !singleDay ? "2A9D8F" : fill,
                color: singleDay ? "159A9C" : "FFFFFF",
                size: singleDay ? (label === "Go-Live" ? "40" : "34") : null,
                alignment: "center"
            }));
        });
        timelineTable.appendChild(row);
    });
    const body = xml.getElementsByTagNameNS(namespace, "body")[0];
    const sectionProperties = body.getElementsByTagNameNS(namespace, "sectPr")[0];
    const insertBeforeSection = node => body.insertBefore(node, sectionProperties || null);
    const pageBreak = xml.createElementNS(namespace, "w:p");
    const pageBreakRun = xml.createElementNS(namespace, "w:r");
    const pageBreakElement = xml.createElementNS(namespace, "w:br");
    pageBreakElement.setAttributeNS(namespace, "w:type", "page");
    pageBreakRun.appendChild(pageBreakElement);
    pageBreak.appendChild(pageBreakRun);
    const timelineHeading = xml.createElementNS(namespace, "w:p");
    const headingProperties = xml.createElementNS(namespace, "w:pPr");
    const headingStyle = xml.createElementNS(namespace, "w:pStyle");
    headingStyle.setAttributeNS(namespace, "w:val", "Heading1");
    headingProperties.appendChild(headingStyle);
    timelineHeading.appendChild(headingProperties);
    timelineHeading.appendChild(createTextRun("Project Timeline", { bold: true }));
    insertBeforeSection(pageBreak);
    insertBeforeSection(timelineHeading);
    insertBeforeSection(timelineTable);

    const risks = data.risks.filter(risk => risk.risk || risk.mitigation);
    mergeRowAcrossTable(23);
    set(23, 0, "Risks / Mitigation");
    styleHeaderCell(cells(23)[0]);
    set(24, 0, "Identified Risks");
    set(24, 1, "Mitigation Plan");

    const riskRows = [rows[25]];
    while (riskRows.length < risks.length) {
        const newRow = rows[25].cloneNode(true);
        rows[25].parentNode.appendChild(newRow);
        riskRows.push(newRow);
    }
    riskRows.forEach((row, index) => {
        const risk = risks[index] || {};
        setRow(row, 0, risk.risk || "");
        setRow(row, 1, risk.mitigation || "");
    });

    zip.file("word/document.xml", new XMLSerializer().serializeToString(xml));
    const blob = await zip.generateAsync({ type: "blob" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = downloadUrl;
    link.download = `Project Charter - ${projectName}.docx`;
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

    if (!progressBar) return;

    progressBar.hidden = false;
    if (progress === null) {
        progressBar.removeAttribute("value");
    } else {
        progressBar.value = progress;
    }

}

async function handleUploadNext() {

    const fileInput = document.querySelector('.upload-area input[type="file"]');

    if (!fileInput?.files.length) {
        applyManualTemplates();
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
                const tableRows = [...xml.getElementsByTagNameNS("http://schemas.openxmlformats.org/drawingml/2006/main", "tr")]
                    .map(row => [...row.getElementsByTagNameNS("http://schemas.openxmlformats.org/drawingml/2006/main", "tc")]
                        .map(cell => [...cell.getElementsByTagNameNS("http://schemas.openxmlformats.org/drawingml/2006/main", "t")]
                            .map(node => node.textContent)
                            .join(""))
                        .join(" | "))
                    .filter(row => row.replace(/\|/g, "").trim());
                const slideText = [
                    ...slideParagraphs,
                    ...(tableRows.length ? ["TABLE ROWS:", ...tableRows] : [])
                ].join("\n");
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
        ? "Preparing Gemini Nano: 30%"
        : "Gemini Nano is ready: 30%", "working", 30);

    const session = await LanguageModel.create({
        ...options,
        monitor(monitor) {
            monitor.addEventListener("downloadprogress", event => {
                const downloadProgress = Math.round(event.loaded * 100);
                setAIStatus(`Downloading Gemini Nano: ${downloadProgress}%`, "working", 30 + Math.round(downloadProgress * .3));
            });
        }
    });

    setAIStatus("Gemini Nano is analyzing the document. Progress is being calculated...", "working");

    const schema = {
        type: "object",
        properties: {
            projectName: { type: "string" },
            projectSummary: { type: "string" },
            projectScope: { type: "string" },
            deliverables: { type: "string" },
            workType: { type: "string" },
            solutionArchitect: { type: "string" }
        },
        required: [
            "projectName", "projectSummary", "projectScope", "deliverables",
            "workType", "solutionArchitect"
        ],
        additionalProperties: false
    };

    const promptText = `Extract only facts from the supplied document. Do not invent, infer, guess, or hallucinate any value. Return only valid JSON with exactly these keys: projectName, projectSummary, projectScope, deliverables, workType, solutionArchitect.

If a value is not explicitly present in the document, return an empty string for that field. Never return explanations, disclaimers, search instructions, or phrases such as "not explicitly mentioned", "not found", "unknown", "not available", or "consulting from". Missing data must remain blank.

Use the explicit document title for projectName. If the title starts with "Technology Solution for", remove that phrase and keep only the client name as projectName. Format projectSummary exactly with these labels, one per line. Put a value after the colon only when that value is explicitly stated in the document; otherwise leave it empty. Do not write an introduction, explanation, summary paragraph, or any text outside these eight labels. Do not use square brackets, commas between fields, or HTML:
Location:
LOB:
Scope:
Seats:
HC:
Training start date (CET or PST):
Nesting/Go-live:
HOOP:

For workType, inspect the source page or section containing General Solution Information, IT Transition Dates, or the highlighted Work Type entry. Extract the exact documented value, such as B&M, WAH, B&M only, WAH only, or both. Do not infer a work type when it is not stated; return an empty string instead.

Put the complete Technology Solution Summary into projectScope, not projectSummary. Use only wording and facts explicitly present in the supplied document. Do not add assumptions, recommendations, plausible details, or general industry knowledge. If a scope detail is not supported by the document, omit it. Format the result as separate sections. Every detail line must start with exactly one dash and a space. Never leave a detail line bare. For example:
Network:
- detail
- detail

Internet:
- detail
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

For the project summary, search every slide/page, not only headings that match the field names. Apply these strict rules: Location must be a real place/site name with at least two letters, never a sentence or explanation. Seats must be a number only. HC must be a number only; for a line such as "101 Seats - 80: Agents and 21 Hierarchy", return Seats as 101 and HC as 80. Training start date and Nesting/Go-live must each be a date only. Treat Training Date and Training start date as the same field. Treat Go Live, Go-Live, and Nesting/Go-live as the same field. HOOP must contain business operating hours only, such as weekday/weekend hours or a Monday-Friday time range. If a value does not meet its rule, return an empty string rather than an explanation. For HC, use explicit non-peak and peak staffing values when present.

For solutionArchitect, use the explicit ITSA or IT Solution Architect value when present. If it is not explicitly labeled, inspect the Document History table: the person listed under the Updated By column is the assigned ITSA for this charter. Return that person's full name. Return plain text only inside all string values.

DOCUMENT TITLE:
${documentContent.title}

FULL DOCUMENT TEXT:
${documentContent.text}`;
    const promptOptions = { responseConstraint: schema };
    let response;

    try {
        const promptImages = documentContent.images.slice(0, 4);
        if (promptImages.length) {
            response = await session.prompt([
                {
                    role: "user",
                    content: [
                        { type: "text", value: promptText },
                        ...promptImages.map(value => ({ type: "image", value }))
                    ]
                }
            ], promptOptions);
        } else {
            response = await session.prompt(promptText, promptOptions);
        }
    } finally {
        session.destroy();
    }

    setAIStatus("Gemini Nano returned a response: 90%", "working", 90);

    let data;
    try {
        data = parseAIJson(response);
    } catch (error) {
        data = recoverAIFields(response);
        if (!data) {
            throw new Error("Gemini returned an unreadable response instead of structured fields");
        }
    }

    sanitizeAIValues(data);
    data.workType = data.workType || extractWorkType(documentContent.text);
    data.solutionArchitect = extractITSA(documentContent.text) || data.solutionArchitect;
    data.projectScope = sanitizeProjectScope(data.projectScope, documentContent.text);

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
                ? standardizeDeliverables(value)
                : name === "projectScope"
                    ? standardizeProjectScope(value)
                : name === "projectName"
                    ? cleanProjectName(value)
                    : cleanExtractedText(value);
            field.value = name === "projectSummary"
                ? standardizeProjectSummary(cleanedValue)
                : cleanedValue;
        }
    });

    const teamMembers = (data.teamMembers || []).filter(member => member.name || member.role);
    const teamGrid = document.querySelector(".team-grid");
    if (teamGrid) {
        teamGrid.innerHTML = "";
        teamMembers.forEach(member => addTeamMember(member));
        if (!teamMembers.length) addDefaultTeamMembers();
    }

    const riskGrid = document.querySelector(".risk-grid");
    if (riskGrid) {
        riskGrid.innerHTML = "";
        (data.risks || []).filter(risk => risk.risk || risk.mitigation).forEach(risk => addRisk(risk));
        if (!riskGrid.children.length) addRisk();
    }

}

function formatProjectScope(value) {

    const headings = new Set([
        "Network",
        "Internet",
        "Information Security",
        "BC/DR",
        "Tools & Applications",
        "Voice Solution",
        "Deskside",
        "Others"
    ]);
    const lines = cleanExtractedText(value)
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);

    return lines.map(line => {
            const withoutBullet = line.replace(/^(?:[-*]|\u2022)\s*/, "").trim();
        const heading = withoutBullet.replace(/:$/, "").trim();
        if (headings.has(heading)) return `${heading}:`;
        return `- ${withoutBullet}`;
    }).join("\n");

}

function sanitizeProjectScope(value, source) {

    const sourceText = normalizeForSourceMatch(source);
    const formattedScope = formatProjectScope(value);
    if (!sourceText) return formattedScope;

    const headings = new Set([
        "Network",
        "Internet",
        "Information Security",
        "BC/DR",
        "Tools & Applications",
        "Voice Solution",
        "Deskside",
        "Others"
    ]);
    const lines = formattedScope.split(/\r?\n/);

    return lines.filter(line => {
        const content = line.replace(/^[-]\s*/, "").replace(/:$/, "").trim();
        if (!content) return false;
        if (headings.has(content)) return true;

        const normalizedContent = normalizeForSourceMatch(content);
        if (normalizedContent.length < 4) return false;
        if (sourceText.includes(normalizedContent)) return true;

        const tokens = normalizedContent.split(" ").filter(token => token.length > 2);
        const matchingTokens = tokens.filter(token => sourceText.includes(token));
        return tokens.length >= 4 && matchingTokens.length / tokens.length >= 0.75;
    }).join("\n");

}

function normalizeForSourceMatch(value) {

    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .replace(/\s+/g, " ");

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
        "Location",
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

function applyManualTemplates() {

    const templates = {
        projectSummary: [
            "Location:",
            "LOB:",
            "Scope:",
            "Seats:",
            "HC:",
            "Training start date (CET or PST):",
            "Nesting/Go-live:",
            "HOOP:"
        ].join("\n"),
        projectScope: [
            "Network:",
            "-",
            "-",
            "",
            "Internet:",
            "-",
            "-",
            "",
            "Information Security:",
            "-",
            "-",
            "",
            "BC/DR:",
            "-",
            "-",
            "",
            "Tools & Applications",
            "-",
            "-",
            "",
            "Voice Solution",
            "-",
            "-",
            "",
            "Deskside",
            "-",
            "-",
            "",
            "Others",
            "-",
            "-"
        ].join("\n"),
        deliverables: cleanDeliverables()
    };

    Object.entries(templates).forEach(([name, value]) => {
        const field = document.querySelector(`[data-field="${name}"]`);
        if (field && !field.value.trim()) field.value = value;
    });

}

function extractExplicitSummary(documentContent) {

    const source = documentContent.text || (documentContent.sections || [])
        .map(section => section.text)
        .join("\n");
    const lines = source
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);
    const labels = [
        "Location", "LOB", "Scope", "Seats", "HC", "Training start date",
        "Nesting", "Go-live", "HOOP", "Delivery Center", "Functions and Hours of Operation"
    ];
    const escapePattern = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const findValue = label => {
        const nextLabels = labels
            .filter(candidate => candidate.toLowerCase() !== label.toLowerCase())
            .map(escapePattern)
            .join("|");
        const match = source.match(new RegExp(
            `${escapePattern(label)}\\s*:?\\s*([\\s\\S]*?)(?=\\s+(?:${nextLabels})\\s*:?|\\n|$)`,
            "i"
        ));
        return match?.[1]?.trim() || "";
    };
    const deliveryCenterIndex = lines.findIndex(line => /functions and hours of operation/i.test(line));
    const deliveryCenterText = source.match(/Delivery Center[\s\S]*?(?=Data Network Solution|Voice Solution)/i)?.[0] || source;
    const siteMatch = deliveryCenterText.match(/(Philippines|Thailand|India|Mexico|United States|Canada)\s*\n\s*([^\n]+)/i);
    const location = findValue("Location") || (siteMatch
        ? `${siteMatch[1].trim()} - ${siteMatch[2].trim()}`
        : "");
    const nonPeak = source.match(/HC and Seats Non Peak[^\n]*?Agents\s*[–-]\s*([^;\n]+);\s*Support Staff\s*[–-]\s*([^\n]+)/i);
    const peak = source.match(/HC and Seats Peak[^\n]*?Agents\s*[–-]\s*([^;\n]+);\s*Support Staff\s*[–-]\s*([^\n]+)/i);
    const formatHeadcount = match => match
        ? `Agents - ${match[1].trim()}, Support Staff - ${match[2].trim()}`
        : "";
    const nonPeakValue = formatHeadcount(nonPeak);
    const peakValue = formatHeadcount(peak);
    const seatLine = source.match(/\b(\d{1,5})\s+Seats?\s*[–-]\s*([^\n]+)/i);
    const seats = seatLine?.[1] || findValue("Seats");
    const lineHeadcount = seatLine?.[2]?.trim() || "";
    const hc = [nonPeakValue ? `(non-peak) ${nonPeakValue}` : "", peakValue ? `(peak) ${peakValue}` : "", lineHeadcount]
        .filter(Boolean)
        .join(" | ");
    const hoopMatches = [...source.matchAll(/(?:Operating hours are|Weekend operating hours are|HOOP\s*:?)\s+([^\n]+)/gi)]
        .map(match => match[1].trim());
    const hoop = hoopMatches.join(" | ");
    const trainingStart = source.match(/(?:Training\s*(?:start\s*)?Date|Training\s*start)\s*:?[\s-–]*((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:,?\s+)\d{4})/i)?.[1]
        || findValue("Training start");
    const goLive = source.match(/(?:Go\s*-?\s*Live|Nesting)\s*:?\s*[-–]?\s*([^\n]+)/i)?.[1]?.trim()
        || findValue("Go-live").replace(/^n\s+/i, "")
        || findValue("Nesting");

    return [
        `Location: ${location}`,
        "LOB:",
        "Scope:",
        `Seats: ${seats}`,
        `HC: ${hc}`,
        `Training start date (CET or PST): ${trainingStart}`,
        `Nesting/Go-live: ${goLive}`,
        `HOOP: ${hoop}`
    ].join("\n");

}

function normalizeSummaryValue(label, value) {

    const text = String(value || "")
        .replace(/\s+/g, " ")
        .trim();

    if (!text) return "";

    if (label === "Location") {
        if (text.length < 2 || !/[A-Za-z]{2}/.test(text)) return "";
        if (/per\s+seat|sizing\s+estimate|re-?evaluat|charged|price\s*-?change|to\s+validate|support\s+.+\s+operations/i.test(text)) return "";
        if (text.split(" ").length > 8 || /[.!?]/.test(text)) return "";
        return text;
    }

    if (label === "Seats" || label === "HC") {
        return text.match(/\b\d{1,6}\b/)?.[0] || "";
    }

    if (label === "Training start date (CET or PST)" || label === "Nesting/Go-live") {
        const date = text.match(/\b(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{1,2}[- ](?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[ -]\d{2,4}|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:,?\s+)\d{4})\b/i);
        return date?.[0] || "";
    }

    if (label === "HOOP") {
        return /\b(?:\d{1,2}(?::\d{2})?\s*(?:AM|PM)?\s*[-–]\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM)?|\d{1,2}:\d{2})\b/i.test(text)
            ? text
            : "";
    }

    return text;

}

function mergeProjectSummary(aiValue, explicitValue) {

    const aiLines = formatProjectSummary(aiValue || "").split("\n");
    const explicitLines = formatProjectSummary(explicitValue || "").split("\n");
    const labels = [
        "Location",
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
        const explicitFieldValue = normalizeSummaryValue(label, valueFor(explicitLines, label));
        const aiFieldValue = normalizeSummaryValue(label, valueFor(aiLines, label));
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
        "-",
        "",
        "Others:",
        "-",
        "-"
    ].join("\n");

}

function cleanProjectName(value) {

    return cleanExtractedText(value)
        .replace(/^\s*technology\s+solution\s+for\s*:?[\s-]*/i, "")
        .trim();

}

function parseAIJson(value) {

    if (value && typeof value === "object") {
        if (typeof value.text === "string") return parseAIJson(value.text);
        if (typeof value.output === "string") return parseAIJson(value.output);
        if (value.content && typeof value.content === "string") return parseAIJson(value.content);
        return value;
    }
    if (typeof value !== "string") throw new Error("AI response was not text or an object");

    const cleaned = value
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/^\s*```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/i, "")
        .trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("AI response did not contain a JSON object");

    const jsonText = cleaned
        .slice(start, end + 1)
        .replace(/,\s*([}\]])/g, "$1");
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("AI response JSON was not an object");
    }
    return parsed;

}

function recoverAIFields(value) {

    const text = typeof value === "string"
        ? value
        : value?.text || value?.output || value?.content || "";
    if (!text) return null;

    const fieldNames = [
        "projectName",
        "projectSummary",
        "projectScope",
        "deliverables",
        "workType",
        "solutionArchitect"
    ];
    const recovered = {};

    fieldNames.forEach((fieldName, index) => {
        const nextFields = fieldNames.slice(index + 1).join("|");
        const match = text.match(new RegExp(
            `["']?${fieldName}["']?\\s*:\\s*["']([\\s\\S]*?)["']\\s*(?=,?\\s*["']?(?:${nextFields})["']?\\s*:|\\s*[,}]|$)`,
            "i"
        ));
        if (match?.[1]) recovered[fieldName] = match[1]
            .replace(/\\n/g, "\n")
            .replace(/\\"/g, '"')
            .trim();
    });

    return Object.keys(recovered).length ? recovered : null;

}

function sanitizeAIValues(data) {

    const nonAnswerPattern = /not\s+(?:explicitly\s+)?mentioned|not\s+found|not\s+available|not\s+provided|unknown|cannot\s+(?:determine|find|identify)|unable\s+to|consulting\s+from|no\s+(?:explicit|specific)\s+(?:value|name|information)/i;

    Object.entries(data).forEach(([name, value]) => {
        if (typeof value === "string" && nonAnswerPattern.test(value)) {
            data[name] = "";
        }
    });

}

function extractWorkType(value) {

    const match = value
        .match(/work\s*type\s*:?\s*(B\s*&\s*M|WAH)(?:\s+only)?/i);

    return match?.[0]
        ?.replace(/^.*?:\s*/i, "")
        .trim() || "";

}

function extractITSA(value) {

    const directMatch = value.match(/(?:ITSA|IT\s+Solution\s+Architect)\s*:?[ \t]+([^\n]+)/i);
    if (directMatch?.[1]?.trim()) return directMatch[1].trim();

    const lines = value
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);

    for (let index = 0; index < lines.length; index++) {
        if (!/\bUpdated\s+By\b/i.test(lines[index]) || !lines[index].includes("|")) continue;

        const headers = lines[index].split("|").map(cell => cell.trim().toLowerCase());
        const columnIndex = headers.findIndex(cell => /updated\s+by/.test(cell));
        const nextRow = lines[index + 1]?.split("|").map(cell => cell.trim());
        if (columnIndex >= 0 && nextRow?.[columnIndex]) return nextRow[columnIndex];
    }

    for (let index = 0; index < lines.length; index++) {
        if (!/\bUpdated\s+By\b/i.test(lines[index])) continue;

        const sameLineValue = lines[index]
            .replace(/.*?\bUpdated\s+By\b\s*:?[ \t]*/i, "")
            .trim();
        if (sameLineValue) return sameLineValue;

        const nextValue = lines[index + 1];
        if (nextValue && !/^(Date|Version|Summary of Changes)$/i.test(nextValue)) {
            return nextValue;
        }
    }

    return "";

}

function initializeDatePickers() {

    document.querySelectorAll(".date-input").forEach(container => {
        const displayInput = container.querySelector('[data-field]');
        const nativeInput = container.querySelector(".native-date-input");
        const calendarButton = container.querySelector(".calendar-btn");

        if (!displayInput || !nativeInput || !calendarButton) return;

        calendarButton.addEventListener("click", () => {
            if (typeof nativeInput.showPicker === "function") {
                nativeInput.showPicker();
            } else {
                nativeInput.click();
            }
        });

        nativeInput.addEventListener("change", () => {
            displayInput.value = formatTimelineDate(nativeInput.value);
        });
    });

}

function formatTimelineDate(value) {

    const text = typeof value === "string" ? value.trim() : "";
    if (!text) return "";

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const displayMatch = text.match(/^(\d{2})-([A-Za-z]{3})-(\d{4})$/);
    const date = isoMatch
        ? new Date(Date.UTC(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3])))
        : displayMatch
            ? new Date(Date.UTC(
                Number(displayMatch[3]),
                months.findIndex(month => month.toLowerCase() === displayMatch[2].toLowerCase()),
                Number(displayMatch[1])
            ))
            : new Date(text);

    if (Number.isNaN(date.getTime())) return text;

    return `${String(date.getUTCDate()).padStart(2, "0")}-${months[date.getUTCMonth()]}-${date.getUTCFullYear()}`;

}

function standardizeProjectScope(value) {

    return standardizeCategorizedText(value, [
        "Network",
        "Internet",
        "Information Security",
        "BC/DR",
        "Tools & Applications",
        "Voice Solution",
        "Deskside",
        "Others"
    ]);

}

function standardizeDeliverables(value) {

    return standardizeCategorizedText(value, [
        "Network",
        "Network Security",
        "Server",
        "IT Ops",
        "Voice and Telephony",
        "Others"
    ]);

}

function standardizeCategorizedText(value, headings) {

    const sourceLines = cleanExtractedText(String(value || ""))
        .split(/\r?\n/)
        .map(line => line.trim());
    const normalizedHeadings = headings.map(heading => normalizeForSourceMatch(heading));

    return headings.map((heading, headingIndex) => {
        const headingPosition = sourceLines.findIndex(line => {
            const content = line.replace(/^(?:[-*]|\u2022)\s*/, "").replace(/:$/, "").trim();
            return normalizeForSourceMatch(content) === normalizedHeadings[headingIndex];
        });
        const nextHeadingPositions = normalizedHeadings
            .map((normalized, index) => index > headingIndex
                ? sourceLines.findIndex((line, lineIndex) => lineIndex > headingPosition
                    && normalizeForSourceMatch(line.replace(/^(?:[-*]|\u2022)\s*/, "").replace(/:$/, "").trim()) === normalized)
                : -1)
            .filter(position => position >= 0);
        const endPosition = nextHeadingPositions.length ? Math.min(...nextHeadingPositions) : sourceLines.length;
        const details = headingPosition >= 0
            ? sourceLines.slice(headingPosition + 1, endPosition)
                .filter(line => line && !/^[-*]\s*$/.test(line) && line.replace(/^[-*]\s*/, "").trim())
                .map(line => line.replace(/^(?:[-*]|\u2022)\s*/, "").trim())
                .slice(0, 3)
            : [];
        const detailLines = details.map(detail => `- ${detail}`);
        while (detailLines.length < 2) detailLines.push("-");

        return [`${heading}:`, ...detailLines].join("\n");
    }).join("\n\n");

}

function standardizeProjectSummary(value) {

    return formatProjectSummary(String(value || ""));

}