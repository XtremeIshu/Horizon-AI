
const API_KEY = "AQ.Ab8RN6IjrayPUCGjdsuY_SsY0TpZkTJLfyDI-HfFnKK0KtraqQ";

const MODEL = "gemini-3.8-flash";

const API_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const container =
    document.querySelector(".container");

const chatsContainer =
    document.querySelector(".chats-container");

const promptForm =
    document.querySelector(".prompt-form");

const promptInput =
    promptForm?.querySelector(".prompt-input");

const fileInput =
    promptForm?.querySelector("#file-input");

const fileUploadWrapper =
    promptForm?.querySelector(".file-upload-wrapper");

const themeToggleBtn =
    document.querySelector("#theme-toggle-btn");

const deleteChatsBtn =
    document.querySelector("#delete-chats-btn");

const stopResponseBtn =
    document.querySelector("#stop-response-btn");

const cancelFileBtn =
    document.querySelector("#cancel-file-btn");

const addFileBtn =
    document.querySelector("#add-file-btn");


/* =========================================================
   STATE
========================================================= */

let controller = null;
let typingInterval = null;
let responseToken = 0;

const chatHistory = [];

const userData = {
    message: "",
    file: {}
};


/* =========================================================
   API KEY CHECK
========================================================= */

function hasApiKey() {
    return (
        typeof API_KEY === "string" &&
        API_KEY.trim().length > 10 &&
        !API_KEY.includes(
            "AQ.Ab8RN6IjrayPUCGjdsuY_SsY0TpZkTJLfyDI-HfFnKK0KtraqQ"
        )
    );
}


/* =========================================================
   CREATE MESSAGE
========================================================= */

function createMessageElement(
    content,
    ...classes
) {
    const div =
        document.createElement("div");

    div.classList.add(
        "message",
        ...classes
    );

    div.innerHTML = content;

    return div;
}


/* =========================================================
   SCROLL
========================================================= */

function scrollToBottom() {

    if (!container) return;

    container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth"
    });
}


/* =========================================================
   STOP TYPING
========================================================= */

function stopTypingEffect() {

    if (typingInterval) {

        clearInterval(
            typingInterval
        );

        typingInterval = null;
    }
}


/* =========================================================
   TYPING EFFECT
========================================================= */

function typingEffect(
    text,
    textElement,
    botMsgDiv,
    requestToken
) {

    stopTypingEffect();

    textElement.textContent = "";

    const words =
        text.split(/\s+/);

    let wordIndex = 0;

    typingInterval =
        setInterval(() => {

            if (
                requestToken !==
                responseToken
            ) {

                stopTypingEffect();

                return;
            }


            if (
                wordIndex <
                words.length
            ) {

                textElement.textContent +=
                    (
                        wordIndex === 0
                            ? ""
                            : " "
                    ) +
                    words[wordIndex++];

                scrollToBottom();

            } else {

                stopTypingEffect();

                botMsgDiv.classList.remove(
                    "loading"
                );

                document.body.classList.remove(
                    "bot-responding"
                );
            }

        }, 35);
}


/* =========================================================
   API ERROR
========================================================= */

function getApiErrorMessage(data) {

    return (
        data?.error?.message ||
        "Gemini returned an unknown error."
    );
}


/* =========================================================
   BUILD REQUEST PARTS
========================================================= */

function buildUserParts() {

    const parts = [
        {
            text: userData.message
        }
    ];


    /*
       Add uploaded file when available.
       Current Gemini REST format uses inlineData.
    */

    if (userData.file?.data) {

        parts.push({
            inlineData: {
                mimeType:
                    userData.file.mime_type ||
                    "application/octet-stream",

                data:
                    userData.file.data
            }
        });
    }


    return parts;
}


/* =========================================================
   GENERATE RESPONSE
========================================================= */

async function generateResponse(
    botMsgDiv
) {

    const textElement =
        botMsgDiv.querySelector(
            ".message-text"
        );


    /* -----------------------------------------
       API KEY CHECK
    ----------------------------------------- */

    if (!hasApiKey()) {

        textElement.textContent =
            "Add your new Gemini API key in ChatBot.js first.";

        textElement.style.color =
            "#d62939";

        botMsgDiv.classList.remove(
            "loading"
        );

        document.body.classList.remove(
            "bot-responding"
        );

        userData.file = {};

        return;
    }


    /* -----------------------------------------
       CREATE CONTROLLER
    ----------------------------------------- */

    controller =
        new AbortController();

    const currentController =
        controller;

    const requestToken =
        ++responseToken;


    /* -----------------------------------------
       ADD USER MESSAGE
    ----------------------------------------- */

    chatHistory.push({
        role: "user",

        parts:
            buildUserParts()
    });


    try {

        /* -------------------------------------
           GEMINI REQUEST
        ------------------------------------- */

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "x-goog-api-key":
                            API_KEY
                    },

                    body: JSON.stringify({

                        contents:
                            chatHistory,

                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 1500
                        }
                    }),

                    signal:
                        currentController.signal
                }
            );


        /* -------------------------------------
           READ JSON
        ------------------------------------- */

        let data = {};

        try {

            data =
                await response.json();

        } catch {

            data = {};
        }


        /* -------------------------------------
           HANDLE API ERROR
        ------------------------------------- */

        if (!response.ok) {

            throw new Error(
                getApiErrorMessage(data)
            );
        }


        /* -------------------------------------
           GET RESPONSE TEXT
        ------------------------------------- */

        const responseText =
            data
                ?.candidates
                ?.at?.(0)
                ?.content
                ?.parts
                ?.map(
                    part =>
                        part?.text || ""
                )
                .join("")
                .trim();


        if (!responseText) {

            throw new Error(
                "Gemini returned an empty response."
            );
        }


        /* -------------------------------------
           SAVE BOT RESPONSE
        ------------------------------------- */

        chatHistory.push({
            role: "model",

            parts: [
                {
                    text:
                        responseText
                }
            ]
        });


        /* -------------------------------------
           TYPE RESPONSE
        ------------------------------------- */

        typingEffect(
            responseText,
            textElement,
            botMsgDiv,
            requestToken
        );


    } catch (error) {

        console.error(
            "HORIZON AI ERROR:",
            error
        );


        /* -------------------------------------
           STOPPED
        ------------------------------------- */

        if (
            error.name ===
            "AbortError"
        ) {

            stopTypingEffect();

            textElement.textContent =
                "Response generation stopped.";

            botMsgDiv.classList.remove(
                "loading"
            );

            document.body.classList.remove(
                "bot-responding"
            );

            scrollToBottom();

        }


        /* -------------------------------------
           OTHER ERROR
        ------------------------------------- */

        else {

            /*
               Remove failed user message
               from conversation history.
            */

            if (
                chatHistory.length &&
                chatHistory[
                    chatHistory.length - 1
                ]?.role === "user"
            ) {

                chatHistory.pop();
            }


            textElement.textContent =
                error.message ||
                "Could not connect to Gemini.";


            textElement.style.color =
                "#d62939";


            botMsgDiv.classList.remove(
                "loading"
            );


            document.body.classList.remove(
                "bot-responding"
            );


            scrollToBottom();
        }

    } finally {

        if (
            controller ===
            currentController
        ) {

            controller = null;
        }

        userData.file = {};
    }
}


/* =========================================================
   FORM SUBMIT
========================================================= */

function handleFormSubmit(event) {

    event.preventDefault();


    const userMessage =
        promptInput.value.trim();


    if (!userMessage) {
        return;
    }


    if (
        document.body.classList.contains(
            "bot-responding"
        )
    ) {

        return;
    }


    userData.message =
        userMessage;

    promptInput.value = "";


    document.body.classList.add(
        "chats-active",
        "bot-responding"
    );


    /*
       Save selected file before clearing UI.
    */

    const selectedFile =
        {
            ...userData.file
        };


    fileUploadWrapper?.classList.remove(
        "file-attached",
        "img-attached",
        "active"
    );


    /* =====================================================
       USER MESSAGE
    ===================================================== */

    const safeFileName =
        String(
            selectedFile.fileName || ""
        )
        .replace(
            /[<>&"]/g,
            ""
        );


    const userMsgHTML = `

        <p class="message-text"></p>

        ${
            selectedFile.data

                ? selectedFile.isImage

                    ? `
                        <img
                            src="data:${selectedFile.mime_type};base64,${selectedFile.data}"
                            class="img-attachment"
                            alt="${safeFileName}"
                        />
                    `

                    : `
                        <p class="file-attachment">

                            <span
                                class="material-symbols-rounded"
                            >
                                description
                            </span>

                            ${safeFileName}

                        </p>
                    `

                : ""
        }

    `;


    const userMsgDiv =
        createMessageElement(
            userMsgHTML,
            "user-message"
        );


    userMsgDiv.querySelector(
        ".message-text"
    ).textContent =
        userData.message;


    chatsContainer.appendChild(
        userMsgDiv
    );


    scrollToBottom();


    /* =====================================================
       BOT MESSAGE
    ===================================================== */

    setTimeout(() => {

        const botMsgHTML = `

            <img
                class="avatar"
                src="Logo.jpg"
                alt="Horizon"
            />

            <p class="message-text">
                Just a sec...
            </p>

        `;


        const botMsgDiv =
            createMessageElement(
                botMsgHTML,
                "bot-message",
                "loading"
            );


        chatsContainer.appendChild(
            botMsgDiv
        );


        scrollToBottom();


        /*
           Restore selected file for API call.
        */

        userData.file =
            selectedFile;


        generateResponse(
            botMsgDiv
        );

    }, 350);
}


/* =========================================================
   FILE UPLOAD
========================================================= */

fileInput?.addEventListener(
    "change",
    () => {

        const file =
            fileInput.files?.[0];


        if (!file) {
            return;
        }


        const isImage =
            file.type.startsWith(
                "image/"
            );


        const reader =
            new FileReader();


        reader.onload =
            event => {

                fileInput.value = "";


                const result =
                    event.target?.result;


                if (
                    typeof result !==
                    "string"
                ) {

                    return;
                }


                const commaIndex =
                    result.indexOf(",");


                const base64String =
                    commaIndex >= 0
                        ? result.substring(
                            commaIndex + 1
                        )
                        : result;


                const preview =
                    fileUploadWrapper?.querySelector(
                        ".file-preview"
                    );


                if (preview) {

                    preview.src =
                        result;
                }


                fileUploadWrapper?.classList.add(
                    "active"
                );


                fileUploadWrapper?.classList.add(
                    isImage
                        ? "img-attached"
                        : "file-attached"
                );


                userData.file = {

                    fileName:
                        file.name,

                    data:
                        base64String,

                    mime_type:
                        file.type ||
                        "application/octet-stream",

                    isImage
                };
            };


        reader.onerror =
            () => {

                userData.file = {};

                fileUploadWrapper?.classList.remove(
                    "active",
                    "img-attached",
                    "file-attached"
                );

                console.error(
                    "Could not read file."
                );
            };


        reader.readAsDataURL(
            file
        );
    }
);


/* =========================================================
   CANCEL FILE
========================================================= */

cancelFileBtn?.addEventListener(
    "click",
    () => {

        userData.file = {};


        if (fileInput) {
            fileInput.value = "";
        }


        const preview =
            fileUploadWrapper?.querySelector(
                ".file-preview"
            );


        if (preview) {
            preview.src = "#";
        }


        fileUploadWrapper?.classList.remove(
            "file-attached",
            "img-attached",
            "active"
        );
    }
);


/* =========================================================
   STOP RESPONSE
========================================================= */

stopResponseBtn?.addEventListener(
    "click",
    () => {

        responseToken++;

        stopTypingEffect();

        controller?.abort();


        const loadingMessage =
            chatsContainer.querySelector(
                ".bot-message.loading"
            );


        if (loadingMessage) {

            const textElement =
                loadingMessage.querySelector(
                    ".message-text"
                );


            if (textElement) {

                textElement.textContent =
                    "Response generation stopped.";
            }


            loadingMessage.classList.remove(
                "loading"
            );
        }


        document.body.classList.remove(
            "bot-responding"
        );


        userData.file = {};
    }
);


/* =========================================================
   THEME
========================================================= */

function loadTheme() {

    const isLightTheme =
        localStorage.getItem(
            "themeColor"
        ) === "light_mode";


    document.body.classList.toggle(
        "light-theme",
        isLightTheme
    );


    if (themeToggleBtn) {

        themeToggleBtn.textContent =
            isLightTheme
                ? "dark_mode"
                : "light_mode";
    }
}


loadTheme();


themeToggleBtn?.addEventListener(
    "click",
    () => {

        const isLightTheme =
            document.body.classList.toggle(
                "light-theme"
            );


        localStorage.setItem(
            "themeColor",
            isLightTheme
                ? "light_mode"
                : "dark_mode"
        );


        themeToggleBtn.textContent =
            isLightTheme
                ? "dark_mode"
                : "light_mode";
    }
);


/* =========================================================
   DELETE CHAT
========================================================= */

deleteChatsBtn?.addEventListener(
    "click",
    () => {

        responseToken++;

        stopTypingEffect();

        controller?.abort();

        chatHistory.length = 0;

        chatsContainer.innerHTML = "";


        document.body.classList.remove(
            "chats-active",
            "bot-responding"
        );
    }
);


/* =========================================================
   SUGGESTIONS
========================================================= */

document
    .querySelectorAll(
        ".suggestions-item"
    )
    .forEach(
        suggestion => {

            suggestion.addEventListener(
                "click",
                () => {

                    const text =
                        suggestion
                            .querySelector(".text")
                            ?.textContent
                            ?.trim();


                    if (!text) {
                        return;
                    }


                    promptInput.value =
                        text;


                    promptForm.requestSubmit();
                }
            );
        }
    );


/* =========================================================
   MOBILE CONTROLS
========================================================= */

document.addEventListener(
    "click",
    ({ target }) => {

        if (
            !(target instanceof Element)
        ) {

            return;
        }


        const wrapper =
            document.querySelector(
                ".prompt-wrapper"
            );


        if (!wrapper) {
            return;
        }


        const shouldHide =
            target.classList.contains(
                "prompt-input"
            ) ||
            (
                wrapper.classList.contains(
                    "hide-controls"
                ) &&
                (
                    target.id ===
                        "add-file-btn" ||
                    target.id ===
                        "stop-response-btn"
                )
            );


        wrapper.classList.toggle(
            "hide-controls",
            shouldHide
        );
    }
);


/* =========================================================
   FORM EVENTS
========================================================= */

promptForm?.addEventListener(
    "submit",
    handleFormSubmit
);


addFileBtn?.addEventListener(
    "click",
    () => {

        fileInput?.click();

    }
);


/* =========================================================
   DEBUG
========================================================= */

console.log(
    "HORIZON AI loaded successfully.",
    `Model: ${MODEL}`
);
