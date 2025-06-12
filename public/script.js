let currentModel = "wanko";
let widget;
let isModelLoading = false;

// Updated personas with better color schemes
const personas = {
  wanko: {
    name: "Moko 🐶",
    title: "The Cheer Pup",
    backgroundColor: "#FFF8E7", // Warm cream
    containerColor: "#FFFFFF",
    chatboxColor: "#FFFBF0",
    placeholder: "Got a tail to tell? 🐾",
  },
  shizuku: {
    name: "Hina 🌸",
    title: "The Comforter",
    backgroundColor: "#FDF2F8", // Soft rose
    containerColor: "#FFFFFF",
    chatboxColor: "#FEF7FF",
    placeholder: "What's on your heart today, love? ☕",
  },
  miku: {
    name: "Zaza 🎤",
    title: "The Hype Gremlin",
    backgroundColor: "#EFF6FF", // Light blue
    containerColor: "#FFFFFF",
    chatboxColor: "#F0F9FF",
    placeholder: "Drop the tea or just scream into the void 💅🔥",
  },
  z16: {
    name: "Byte 🤖",
    title: "The Glitch Wiz",
    backgroundColor: "#F0FDF4", // Mint green
    containerColor: "#FFFFFF",
    chatboxColor: "#F7FEF7",
    placeholder: "Got a bug or a brain glitch? I'm on it 💾",
  },
  hijiki: {
    name: "Nyoro 🐱",
    title: "The Feral Flirt",
    backgroundColor: "#FAF5FF", // Lavender
    containerColor: "#FFFFFF",
    chatboxColor: "#FEFBFF",
    placeholder: "You again? …Not like I missed you or anything 🙄",
  },
  tororo: {
    name: "Lumi 🌙",
    title: "The Dream Sage",
    backgroundColor: "#F8FAFC", // Moonlight gray
    containerColor: "#FFFFFF",
    chatboxColor: "#FBFCFD",
    placeholder: "Share your story beneath the stars… 🌌",
  },
};

// Friend List toggle
function toggleFriendList() {
  const friendList = document.getElementById("friendList");
  const chatbox = document.getElementById("chatbox");
  const avatar = document.getElementById("avatarContainer");
  const title = document.getElementById("mobileChatTitle");
  const backBtn = document.getElementById("backButton");
  const personaName = document.getElementById("personaName");

  if (friendList.style.display === "none") {
    friendList.style.display = "flex";
    chatbox.style.display = "none";
    avatar.style.display = "none";

    if (window.innerWidth > 785) personaName.innerText = "Your AI Friends";
    if (window.innerWidth <= 785) title.innerText = "Your AI Friends";
    backBtn.style.display = "block";
  } else {
    friendList.style.display = "none";
    chatbox.style.display = "flex";
    avatar.style.display = "";

    if (window.innerWidth > 785) {
      personaName.innerText = personas[currentModel].name;
    }
    if (window.innerWidth <= 785) {
      title.innerText = personas[currentModel].name;
    }
    backBtn.style.display = "block";
  }
}

// Complete cleanup of existing Live2D widget
function destroyCurrentWidget() {
  const oldCanvas = document.getElementById("live2d-widget");
  if (oldCanvas) {
    oldCanvas.remove();
  }

  if (window.L2Dwidget && typeof window.L2Dwidget.destroy === "function") {
    try {
      window.L2Dwidget.destroy();
    } catch (e) {
      console.log("L2Dwidget destroy error:", e);
    }
  }

  widget = null;
  return new Promise((resolve) => setTimeout(resolve, 200));
}

// Load new Live2D model with better error handling
async function selectFriend(modelKey) {
  if (isModelLoading) {
    console.log("Model already loading, please wait...");
    return;
  }

  const models = {
    wanko: "./models/wanko/wanko.model.json",
    shizuku: "./models/koharu/index.json",
    miku: "./models/unitychan/unitychan.model.json",
    z16: "./models/22/index.json",
    hijiki: "./models/hijiki/hijiki.model.json",
    tororo: "./models/histoire/index.json",
  };

  if (!models[modelKey]) {
    console.error("Model not found:", modelKey);
    return;
  }

  isModelLoading = true;
  console.log("Loading model:", modelKey);

  try {
    // Complete cleanup of existing widget
    await destroyCurrentWidget();

    // Update current model
    currentModel = modelKey;

    // Update friend selection UI
    const friends = document.querySelectorAll(".friend");
    friends.forEach((friend) => friend.classList.remove("selected"));
    const selectedFriend = document.querySelector(
      `.friend-avatar[data-model="${modelKey}"]`,
    )?.parentNode;
    if (selectedFriend) selectedFriend.classList.add("selected");

    // Update UI with persona metadata
    const persona = personas[modelKey];
    updateTheme(persona);

    document.getElementById("personaName").textContent = persona.name;
    document.getElementById("userInput").placeholder = persona.placeholder;
    document.getElementById("mobileChatTitle").textContent = persona.name;

    // Load new model
    await initLive2D(models[modelKey]);

    // Clear chat and return to chat view
    clearChat();
    toggleFriendList();
  } catch (error) {
    console.error("Error loading model:", error);
  } finally {
    isModelLoading = false;
  }
}

// Update theme colors
function updateTheme(persona) {
  document.body.style.backgroundColor = persona.backgroundColor;

  // const container = document.querySelector(".container");
  const chatbox = document.querySelector(".chatbox");

  // if (container) {
  //   container.style.backgroundColor = persona.containerColor;
  // }

  if (chatbox) {
    chatbox.style.backgroundColor = persona.chatboxColor;
  }
}

// Initialize Live2D model with better handling
function initLive2D(jsonPath) {
  return new Promise((resolve, reject) => {
    try {
      L2Dwidget.init({
        model: {
          jsonPath,
          scale: 1,
        },
        display: {
          position: "left",
          width: 300,
          height: 400,
        },
        mobile: {
          show: true,
        },
        react: {
          opacity: 0.8,
        },
      });

      const moveAvatar = () => {
        const widgetEl = document.getElementById("live2d-widget");
        const avatarContainer = document.getElementById("avatarContainer");
        const mobileAvatar = document.getElementById("mobileAvatarContainer");

        if (!widgetEl) return false;

        try {
          if (window.innerWidth <= 785) {
            widgetEl.style.width = "60px";
            widgetEl.style.height = "60px";
            widgetEl.style.position = "static";
            widgetEl.style.pointerEvents = "none";

            const canvas = widgetEl.querySelector("canvas");
            if (canvas) {
              canvas.style.borderRadius = "50%";
              canvas.style.objectFit = "cover";
            }

            mobileAvatar.innerHTML = "";
            mobileAvatar.appendChild(widgetEl);
          } else {
            widgetEl.style.width = "100%";
            widgetEl.style.height = "100%";
            widgetEl.style.position = "static";
            widgetEl.style.pointerEvents = "none";

            avatarContainer.innerHTML = "";
            avatarContainer.appendChild(widgetEl);
          }

          widget = widgetEl;
          return true;
        } catch (e) {
          console.error("Error moving avatar:", e);
          return false;
        }
      };

      let attempts = 0;
      const maxAttempts = 50;
      const checkWidget = setInterval(() => {
        attempts++;

        if (moveAvatar()) {
          clearInterval(checkWidget);
          console.log("Widget loaded successfully");
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkWidget);
          console.error("Widget failed to load within timeout");
          reject(new Error("Widget load timeout"));
        }
      }, 100);
    } catch (error) {
      console.error("Error initializing L2Dwidget:", error);
      reject(error);
    }
  });
}

// Handle window resize
window.addEventListener("resize", () => {
  if (widget) {
    const moveAvatar = () => {
      const widgetEl = document.getElementById("live2d-widget");
      const avatarContainer = document.getElementById("avatarContainer");
      const mobileAvatar = document.getElementById("mobileAvatarContainer");

      if (!widgetEl) return;

      if (window.innerWidth <= 785) {
        widgetEl.style.width = "60px";
        widgetEl.style.height = "60px";
        widgetEl.style.position = "static";
        widgetEl.style.pointerEvents = "none";

        const canvas = widgetEl.querySelector("canvas");
        if (canvas) {
          canvas.style.borderRadius = "50%";
          canvas.style.objectFit = "cover";
        }

        mobileAvatar.innerHTML = "";
        mobileAvatar.appendChild(widgetEl);
      } else {
        widgetEl.style.width = "100%";
        widgetEl.style.height = "100%";
        widgetEl.style.position = "static";
        widgetEl.style.pointerEvents = "none";

        avatarContainer.innerHTML = "";
        avatarContainer.appendChild(widgetEl);
      }
    };

    moveAvatar();
  }
});

// Initialize page with friend list visible
function initializePage() {
  const friendList = document.getElementById("friendList");
  const chatbox = document.getElementById("chatbox");
  const avatar = document.getElementById("avatarContainer");
  const title = document.getElementById("mobileChatTitle");
  const backBtn = document.getElementById("backButton");
  const personaName = document.getElementById("personaName");

  friendList.style.display = "flex";
  chatbox.style.display = "none";
  avatar.style.display = "none";

  if (window.innerWidth > 785) personaName.innerText = "Your AI Friends";
  if (window.innerWidth <= 785) title.innerText = "Your AI Friends";
  backBtn.style.display = "block";
}

// Page initialization
window.addEventListener("DOMContentLoaded", async () => {
  console.log("Initializing page...");
  initializePage();

  // Add enter key support for input
  const userInput = document.getElementById("userInput");
  if (userInput) {
    userInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
      }
    });
  }
});

// Enhanced chat functionality
async function sendMessage() {
  const input = document.getElementById("userInput");
  const messages = document.getElementById("messages");
  const userText = input.value.trim();

  if (!userText) return;

  const userMsg = document.createElement("div");
  userMsg.classList.add("user-message");
  userMsg.innerHTML = `You: ${userText}`;
  messages.appendChild(userMsg);

  input.value = "";

  // Show typing indicator
  const typingMsg = document.createElement("div");
  typingMsg.classList.add("typing-indicator");
  typingMsg.textContent = "Typing...";
  messages.appendChild(typingMsg);

  // Auto scroll
  messages.scrollTop = messages.scrollHeight;

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userText,
        modelKey: currentModel,
      }),
    });

    const data = await res.json();

    typingMsg.remove();

    const botMsg = document.createElement("div");
    botMsg.classList.add("bot-message");
    botMsg.innerHTML = `${personas[currentModel].name}: ${data.reply}`;
    messages.appendChild(botMsg);

    messages.scrollTop = messages.scrollHeight;
  } catch (error) {
    typingMsg.remove();

    const errorMsg = document.createElement("div");
    errorMsg.classList.add("bot-message");
    errorMsg.textContent = `${personas[currentModel].name}: Oof 😓 Something's off rn, try later?`;
    messages.appendChild(errorMsg);
  }
}

function clearChat() {
  document.getElementById("messages").innerHTML = "";
}

// Add touch event support for mobile
document.addEventListener("touchstart", function () {}, { passive: true });
document.addEventListener("touchmove", function () {}, { passive: true });
