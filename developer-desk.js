/* ==========================================
   HORIZON DEVELOPER DESK
========================================== */

const STORAGE_KEYS = {
    theme: "horizon-theme",
    notes: "horizon-dev-notes"
};


/* ------------------------------------------
   THEME
------------------------------------------ */

const themeBtn = document.getElementById("themeBtn");

function applyTheme(theme) {
    document.body.classList.toggle("light-theme", theme === "light");
    localStorage.setItem(STORAGE_KEYS.theme, theme);
}

const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);

if (savedTheme === "light") {
    applyTheme("light");
} else {
    applyTheme("dark");
}

themeBtn?.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("light-theme")
        ? "dark"
        : "light";

    applyTheme(nextTheme);
});


/* ------------------------------------------
   CODE EDITOR
------------------------------------------ */

function runCode() {
    const editor = document.getElementById("codeEditor");
    const output = document.getElementById("codeOutput");

    if (!editor || !output) return;

    const code = editor.value;
    const logs = [];

    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    const capture = (...args) => {
        logs.push(
            args.map(value => {
                if (typeof value === "string") return value;

                try {
                    return JSON.stringify(value, null, 2);
                } catch {
                    return String(value);
                }
            }).join(" ")
        );
    };

    try {
        console.log = capture;
        console.warn = capture;
        console.error = capture;

        new Function(code)();

        output.textContent = logs.length
            ? logs.join("\n")
            : "Code executed successfully.";
    } catch (error) {
        output.textContent = `Error: ${error.message}`;
    } finally {
        console.log = originalLog;
        console.warn = originalWarn;
        console.error = originalError;
    }
}

async function copyCode() {
    const editor = document.getElementById("codeEditor");
    if (!editor) return;

    await copyText(editor.value);
}

function clearEditor() {
    const editor = document.getElementById("codeEditor");
    const output = document.getElementById("codeOutput");

    if (editor) editor.value = "";
    if (output) output.textContent = "Ready.";
}


/* ------------------------------------------
   TERMINAL
------------------------------------------ */

const terminalInput = document.getElementById("terminalInput");
const terminalOutput = document.getElementById("terminalOutput");

terminalInput?.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;

    const command = terminalInput.value.trim();
    if (!command) return;

    addTerminalLine(`> ${command}`, "command");

    const parts = command.split(/\s+/);
    const baseCommand = parts[0].toLowerCase();

    switch (baseCommand) {
        case "help":
            addTerminalLine(
                "Available commands: help, clear, date, echo, whoami, version"
            );
            break;

        case "clear":
            clearTerminal();
            break;

        case "date":
            addTerminalLine(new Date().toString());
            break;

        case "echo":
            addTerminalLine(command.substring(5));
            break;

        case "whoami":
            addTerminalLine("horizon-developer");
            break;

        case "version":
            addTerminalLine("HORIZON Developer Desk 1.0");
            break;

        default:
            addTerminalLine(`Command not found: ${baseCommand}`);
    }

    terminalInput.value = "";
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
});

function addTerminalLine(text, type = "output") {
    const line = document.createElement("div");

    if (type === "command") {
        line.style.color = "#39c8ff";
    } else {
        line.style.color = "#8ca7c1";
    }

    line.textContent = text;
    terminalOutput?.appendChild(line);
}

function clearTerminal() {
    if (!terminalOutput) return;

    terminalOutput.innerHTML =
        "<div>Terminal cleared.</div>";
}


/* ------------------------------------------
   JSON FORMATTER
------------------------------------------ */

const defaultJSON = '{"name":"HORIZON","version":1}';

function parseJSONInput() {
    const input = document.getElementById("jsonInput");

    if (!input) return null;

    try {
        return JSON.parse(input.value);
    } catch {
        setStatus("jsonStatus", "Invalid JSON.", "error");
        return null;
    }
}

function formatJSON() {
    const input = document.getElementById("jsonInput");
    if (!input) return;

    const parsed = parseJSONInput();
    if (parsed === null) return;

    input.value = JSON.stringify(parsed, null, 4);
    setStatus("jsonStatus", "JSON formatted.", "success");
}

function minifyJSON() {
    const input = document.getElementById("jsonInput");
    if (!input) return;

    const parsed = parseJSONInput();
    if (parsed === null) return;

    input.value = JSON.stringify(parsed);
    setStatus("jsonStatus", "JSON minified.", "success");
}

async function copyJSON() {
    const input = document.getElementById("jsonInput");
    if (!input) return;

    await copyText(input.value);
    setStatus("jsonStatus", "JSON copied.", "success");
}

function resetJSON() {
    const input = document.getElementById("jsonInput");
    if (!input) return;

    input.value = defaultJSON;
    setStatus("jsonStatus", "JSON reset.", "success");
}


/* ------------------------------------------
   COLOR PICKER
------------------------------------------ */

const colorPicker = document.getElementById("colorPicker");

function updateColor() {
    if (!colorPicker) return;

    const hex = colorPicker.value.toUpperCase();

    const preview = document.getElementById("colorPreview");
    const hexValue = document.getElementById("hexValue");
    const rgbValue = document.getElementById("rgbValue");

    if (preview) preview.style.background = hex;
    if (hexValue) hexValue.textContent = hex;

    const number = parseInt(hex.slice(1), 16);

    const r = (number >> 16) & 255;
    const g = (number >> 8) & 255;
    const b = number & 255;

    if (rgbValue) {
        rgbValue.textContent = `${r}, ${g}, ${b}`;
    }
}

colorPicker?.addEventListener("input", updateColor);

async function copyColorValue(type) {
    const hex = document.getElementById("hexValue")?.textContent || "";
    const rgb = document.getElementById("rgbValue")?.textContent || "";

    const value = type === "hex"
        ? hex
        : `rgb(${rgb})`;

    await copyText(value);
    setStatus("colorStatus", `${value} copied.`, "success");
}


/* ------------------------------------------
   NOTES
------------------------------------------ */

const notes = document.getElementById("developerNotes");

if (notes) {
    notes.value =
        localStorage.getItem(STORAGE_KEYS.notes) || "";
}

function saveDeveloperNotes() {
    if (!notes) return;

    localStorage.setItem(
        STORAGE_KEYS.notes,
        notes.value
    );

    setStatus(
        "notesStatus",
        "Notes saved locally.",
        "success"
    );
}

function clearDeveloperNotes() {
    if (!notes) return;

    notes.value = "";

    setStatus(
        "notesStatus",
        "Notes cleared from the editor.",
        "success"
    );
}

function resetDeveloperNotes() {
    if (!notes) return;

    notes.value =
        localStorage.getItem(STORAGE_KEYS.notes) || "";

    setStatus(
        "notesStatus",
        "Saved notes restored.",
        "success"
    );
}


/* ------------------------------------------
   SNIPPETS
------------------------------------------ */

const snippets = {
    "console.log": `console.log("Hello World");`,

    arrow: `const myFunction = (value) => {
    return value;
};`,

    fetch: `fetch("https://api.example.com/data")
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));`,

    trycatch: `try {
    const data = JSON.parse(input);
    console.log(data);
} catch (error) {
    console.error(error.message);
}`
};

function insertSnippet(type) {
    const editor = document.getElementById("codeEditor");
    if (!editor || !snippets[type]) return;

    editor.value = snippets[type];
    editor.focus();
}


/* ------------------------------------------
   SHARED HELPERS
------------------------------------------ */

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch {
        const helper = document.createElement("textarea");

        helper.value = text;
        helper.style.position = "fixed";
        helper.style.opacity = "0";

        document.body.appendChild(helper);
        helper.focus();
        helper.select();

        try {
            document.execCommand("copy");
        } finally {
            helper.remove();
        }
    }
}

function setStatus(id, message, type = "normal") {
    const element = document.getElementById(id);
    if (!element) return;

    element.textContent = message;

    if (type === "error") {
        element.style.color = "var(--danger)";
    } else if (type === "success") {
        element.style.color = "var(--success)";
    } else {
        element.style.color = "var(--muted)";
    }

    clearTimeout(element._statusTimer);

    element._statusTimer = setTimeout(() => {
        element.textContent = "";
    }, 2500);
}


/* ------------------------------------------
   INITIAL STATE
------------------------------------------ */

updateColor();
