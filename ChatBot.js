// ============ DOM ELEMENTS ============
const container = document.querySelector(".container");
const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");
const fileInput = promptForm.querySelector("#file-input");
const fileUploadWrapper = promptForm.querySelector(".file-upload-wrapper");
const themeToggleBtn = document.querySelector("#theme-toggle-btn");

// ============ GROQ API CONFIG ============
const API_KEY = "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";          // Get free key at https://console.groq.com/keys
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Free text model (fast, no image support):
const MODEL = "openai/gpt-oss-120b";

// If you need to send images, replace the line above with a vision model:
// const MODEL = "qwen/qwen3.6-27b";   // supports images (check Groq console for availability)
// ========================================

let controller, typingInterval;
const chatHistory = [];                  // stores { role, content } objects
const userData = { message: "", file: {} };

// ============ THEME ============
const isLightTheme = localStorage.getItem("themeColor") === "light_mode";
document.body.classList.toggle("light-theme", isLightTheme);
themeToggleBtn.textContent = isLightTheme ? "dark_mode" : "light_mode";

// ============ HELPERS ============
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

const scrollToBottom = () =>
  container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });

// Typing effect for bot response
const typingEffect = (text, textElement, botMsgDiv) => {
  textElement.textContent = "";
  const words = text.split(" ");
  let wordIndex = 0;

  typingInterval = setInterval(() => {
    if (wordIndex < words.length) {
      textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
      scrollToBottom();
    } else {
      clearInterval(typingInterval);
      botMsgDiv.classList.remove("loading");
      document.body.classList.remove("bot-responding");
    }
  }, 40);
};

// ============ GROQ API CALL ============
const generateResponse = async (botMsgDiv) => {
  const textElement = botMsgDiv.querySelector(".message-text");
  controller = new AbortController();

  // Build the messages array in OpenAI/Groq format
  const messages = [...chatHistory];   // copy previous history

  // Prepare current user content
  let userContent;
  if (userData.file.data && userData.file.isImage) {
    // Vision model: content must be an array of parts
    userContent = [
      { type: "text", text: userData.message },
      {
        type: "image_url",
        image_url: {
          url: `data:${userData.file.mime_type};base64,${userData.file.data}`,
        },
      },
    ];
  } else {
    // Text‑only model: content is a simple string
    userContent = userData.message;
  }

  // Add current user message to the request and to history
  messages.push({ role: "user", content: userContent });
  chatHistory.push({ role: "user", content: userContent });

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,   // <-- Bearer prefix is required
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2048,
        stream: false,
      }),
      signal: controller.signal,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "Groq API error");
    }

    // Extract the assistant's reply
    const responseText = data.choices[0].message.content
      .replace(/\*\*([^*]+)\*\*/g, "$1")   // strip markdown bold
      .trim();

    // Show response with typing effect
    typingEffect(responseText, textElement, botMsgDiv);

    // Save assistant reply to history
    chatHistory.push({ role: "assistant", content: responseText });
  } catch (error) {
    textElement.textContent =
      error.name === "AbortError"
        ? "Response generation stopped."
        : error.message;
    textElement.style.color = "#d62939";
    botMsgDiv.classList.remove("loading");
    document.body.classList.remove("bot-responding");
    scrollToBottom();
  } finally {
    userData.file = {};   // clear any attached file
  }
};

// ============ FORM SUBMISSION ============
const handleFormSubmit = (e) => {
  e.preventDefault();
  const userMessage = promptInput.value.trim();

  // Prevent empty messages or overlapping requests
  if (!userMessage || document.body.classList.contains("bot-responding")) return;

  userData.message = userMessage;
  promptInput.value = "";
  document.body.classList.add("chats-active", "bot-responding");
  fileUploadWrapper.classList.remove("file-attached", "img-attached", "active");

  // Build user message HTML (with optional image)
  const userMsgHTML = `
    <p class="message-text"></p>
    ${
      userData.file.data && userData.file.isImage
        ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="img-attachment" />`
        : ""
    }
  `;

  const userMsgDiv = createMessageElement(userMsgHTML, "user-message");
  userMsgDiv.querySelector(".message-text").textContent = userData.message;
  chatsContainer.appendChild(userMsgDiv);
  scrollToBottom();

  // Small delay before bot response (simulates thinking)
  setTimeout(() => {
    const botMsgHTML = `
      <img class="avatar" src="Logo.jpg" />
      <p class="message-text">Just a sec...</p>
    `;
    const botMsgDiv = createMessageElement(botMsgHTML, "bot-message", "loading");
    chatsContainer.appendChild(botMsgDiv);
    scrollToBottom();
    generateResponse(botMsgDiv);
  }, 600);
};

// ============ FILE UPLOAD (images only) ============
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const isImage = file.type.startsWith("image/");
  if (!isImage) {
    alert("Only image files are supported with Groq. Please upload an image.");
    fileInput.value = "";
    return;
  }

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    fileInput.value = "";
    const base64String = e.target.result.split(",")[1];

    fileUploadWrapper.querySelector(".file-preview").src = e.target.result;
    fileUploadWrapper.classList.add("active", "img-attached");

    userData.file = {
      fileName: file.name,
      data: base64String,
      mime_type: file.type,
      isImage: true,
    };
  };
});

// Cancel file upload
document.querySelector("#cancel-file-btn").addEventListener("click", () => {
  userData.file = {};
  fileUploadWrapper.classList.remove("file-attached", "img-attached", "active");
});

// ============ STOP RESPONSE ============
document.querySelector("#stop-response-btn").addEventListener("click", () => {
  controller?.abort();
  userData.file = {};
  clearInterval(typingInterval);
  chatsContainer.querySelector(".bot-message.loading")?.classList.remove("loading");
  document.body.classList.remove("bot-responding");
});

// ============ THEME TOGGLE ============
themeToggleBtn.addEventListener("click", () => {
  const isLight = document.body.classList.toggle("light-theme");
  localStorage.setItem("themeColor", isLight ? "light_mode" : "dark_mode");
  themeToggleBtn.textContent = isLight ? "dark_mode" : "light_mode";
});

// ============ DELETE ALL CHATS ============
document.querySelector("#delete-chats-btn").addEventListener("click", () => {
  chatHistory.length = 0;
  chatsContainer.innerHTML = "";
  document.body.classList.remove("chats-active", "bot-responding");
});

// ============ SUGGESTIONS ============
document.querySelectorAll(".suggestions-item").forEach((suggestion) => {
  suggestion.addEventListener("click", () => {
    promptInput.value = suggestion.querySelector(".text").textContent;
    promptForm.dispatchEvent(new Event("submit"));
  });
});

// ============ MOBILE CONTROLS ============
document.addEventListener("click", ({ target }) => {
  const wrapper = document.querySelector(".prompt-wrapper");
  const shouldHide =
    target.classList.contains("prompt-input") ||
    (wrapper.classList.contains("hide-controls") &&
      (target.id === "add-file-btn" || target.id === "stop-response-btn"));
  wrapper.classList.toggle("hide-controls", shouldHide);
});

// ============ EVENT LISTENERS ============
promptForm.addEventListener("submit", handleFormSubmit);
promptForm.querySelector("#add-file-btn").addEventListener("click", () => fileInput.click());
