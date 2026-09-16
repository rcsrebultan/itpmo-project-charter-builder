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

}

function addTeamMember() {

    const container =
        document.querySelector(".team-grid");

    const memberCard = document.createElement("div");

    memberCard.className = "team-card";

    memberCard.innerHTML = `
        <input
            type="text"
            placeholder="Name">

        <input
            type="text"
            placeholder="Role">

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

    const fileInput =
        document.querySelector(
            '.upload-area input[type="file"]'
        );

    if (!fileInput) return;

    const fileList =
        document.createElement("div");

    fileList.id = "uploaded-files";

    fileList.style.marginTop = "15px";

    fileInput.parentElement
        .appendChild(fileList);

    fileInput.addEventListener("change", (e) => {

        fileList.innerHTML = "";

        [...e.target.files].forEach(file => {

            const item =
                document.createElement("div");

            item.innerHTML = `
                📄 ${file.name}
            `;

            fileList.appendChild(item);

        });

    });

}

// ===========================================
// COLLECT DATA
// ===========================================

function collectProjectData() {

    const inputs =
        document.querySelectorAll(
            "input, textarea, select"
        );

    const data = {};

    inputs.forEach((input, index) => {

        data[`field_${index}`] =
            input.value;

    });

    const teamMembers = [];

    document
        .querySelectorAll(".team-card")
        .forEach(card => {

            const fields =
                card.querySelectorAll("input");

            teamMembers.push({

                name: fields[0]?.value || "",
                role: fields[1]?.value || ""

            });

        });

    const risks = [];

    document
        .querySelectorAll(".risk-card")
        .forEach(card => {

            const textareas =
                card.querySelectorAll("textarea");

            risks.push({

                risk:
                    textareas[0]?.value || "",

                mitigation:
                    textareas[1]?.value || ""

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

    const generateBtns =
        document.querySelectorAll(
            ".primary-btn"
        );

    generateBtns.forEach(btn => {

        if (
            btn.innerText
                .toLowerCase()
                .includes("generate")
        ) {

            btn.addEventListener(
                "click",
                generateJSON
            );

        }

    });

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