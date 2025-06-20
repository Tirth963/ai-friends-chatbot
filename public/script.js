let currentModel = "wanko";
let widget;
let isModelLoading = false;

const personas = {
  wanko: {
    name: "Moko",
    title: "The Cheer Pup",
    backgroundColor: "#FFF8E7",
    containerColor: "#c8fdec",
    chatboxColor: "#FFFBF0",
    placeholder: "Got a tail to tell? 🐾",
  },
  shizuku: {
    name: "Hina",
    title: "The Comforter",
    backgroundColor: "#FDF2F8",
    containerColor: "#FFFFFF",
    chatboxColor: "#FEF7FF",
    placeholder: "What's on your heart today, love? ☕",
  },
  miku: {
    name: "Zaza",
    title: "The Hype Gremlin",
    backgroundColor: "#EFF6FF",
    containerColor: "#FFFFFF",
    chatboxColor: "#F0F9FF",
    placeholder: "Drop the tea or just scream into the void 💅🔥",
  },
  z16: {
    name: "Byte",
    title: "The Glitch Wiz",
    backgroundColor: "#F0FDF4",
    containerColor: "#FFFFFF",
    chatboxColor: "#F7FEF7",
    placeholder: "Got a bug or a brain glitch? I'm on it 💾",
  },
  hijiki: {
    name: "Nyoro",
    title: "The Feral Flirt",
    backgroundColor: "#FAF5FF",
    containerColor: "#FFFFFF",
    chatboxColor: "#FEFBFF",
    placeholder: "You again? …Not like I missed you or anything 🙄",
  },
  tororo: {
    name: "Lumi",
    title: "The Dream Sage",
    backgroundColor: "#F8FAFC",
    containerColor: "#FFFFFF",
    chatboxColor: "#FBFCFD",
    placeholder: "Share your story beneath the stars… 🌌",
  },
};

const models = {
  wanko: "./models/wanko/wanko.model.json",
  shizuku: "./models/koharu/index.json",
  miku: "./models/unitychan/unitychan.model.json",
  z16: "./models/22/index.json",
  hijiki: "./models/hijiki/hijiki.model.json",
  tororo: "./models/histoire/index.json",
};

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function toggleFriendList() {
  const friendList = document.getElementById("friendList");
  const chatbox = document.getElementById("chatbox");
  const avatar = document.getElementById("avatarContainer");
  const title = document.getElementById("mobileChatTitle");
  const backBtn = document.getElementById("backButton");
  const personaName = document.getElementById("personaName");

  if (friendList.style.display === "none") {
    // Show friend list and force reload to reinit Live2D
    friendList.style.display = "flex";
    chatbox.style.display = "none";
    avatar.style.display = "none";
    if (window.innerWidth > 785) personaName.innerText = "Your AI Friends";
    if (window.innerWidth <= 785) title.innerText = "Your AI Friends";
    backBtn.style.display = "none";

    setTimeout(() => {
      location.reload(); // <- Required to reset Live2D model reliably
    }, 100);
  } else {
    // Back to chat view
    friendList.style.display = "none";
    chatbox.style.display = "flex";
    avatar.style.display = "";
    if (window.innerWidth > 785) personaName.innerText = personas[currentModel].name;
    if (window.innerWidth <= 785) title.innerText = personas[currentModel].name;
    backBtn.style.display = "block";
  }
}


function destroyCurrentWidget() {
  const oldCanvas = document.getElementById("live2d-widget");
  if (oldCanvas) oldCanvas.remove();

  if (window.L2Dwidget?.destroy) {
    try {
      window.L2Dwidget.destroy();
    } catch (e) {
      console.warn("Widget destroy failed:", e);
    }
  }

  widget = null;
  return new Promise((resolve) => setTimeout(resolve, 300));
}

async function selectFriend(modelKey) {
  if (isModelLoading || !models[modelKey]) return;
  isModelLoading = true;

  const loadingOverlay = document.getElementById("loadingOverlay");
  loadingOverlay.classList.remove("hidden");

  try {
    await destroyCurrentWidget();
    currentModel = modelKey;

    document.querySelectorAll(".friend").forEach(f => f.classList.remove("selected"));
    const selected = document.querySelector(`.friend-avatar[data-model="${modelKey}"]`)?.parentNode;
    if (selected) selected.classList.add("selected");

    const persona = personas[modelKey];
    updateTheme(persona);
    document.getElementById("personaName").textContent = persona.name;
    document.getElementById("userInput").placeholder = persona.placeholder;
    document.getElementById("mobileChatTitle").textContent = persona.name;

    await initLive2D(models[modelKey]);

    clearChat();
    toggleFriendList();
  } catch (err) {
    console.error("Error switching model:", err);
  } finally {
    isModelLoading = false;
    loadingOverlay.classList.add("hidden");
  }
}

function updateTheme(persona) {
  document.body.style.backgroundColor = persona.backgroundColor;
  document.querySelector(".container").style.backgroundColor = persona.containerColor;
  document.querySelector(".chatbox").style.backgroundColor = persona.chatboxColor;
}

function initLive2D(jsonPath) {
  return new Promise((resolve, reject) => {
    try {
      L2Dwidget.init({
        model: { jsonPath, scale: 1 },
        display: { position: "left", width: 300, height: 400 },
        mobile: { show: true },
        react: { opacity: 0.8 },
      });

      const tryMove = () => {
        const widgetEl = document.getElementById("live2d-widget");
        if (!widgetEl) return false;

        const canvas = widgetEl.querySelector("canvas");
        if (window.innerWidth <= 785) {
          widgetEl.style = "width:60px;height:60px;position:static;pointer-events:none;";
          if (canvas) canvas.style = "border-radius:50%;object-fit:cover;";
          document.getElementById("mobileAvatarContainer").innerHTML = "";
          document.getElementById("mobileAvatarContainer").appendChild(widgetEl);
        } else {
          widgetEl.style = "width:100%;height:100%;position:static;pointer-events:none;";
          document.getElementById("avatarContainer").innerHTML = "";
          document.getElementById("avatarContainer").appendChild(widgetEl);
        }

        widget = widgetEl;
        return true;
      };

      let tries = 0;
      const maxTries = 50;
      const check = setInterval(() => {
        if (++tries > maxTries) {
          clearInterval(check);
          reject("Widget timeout");
        } else if (tryMove()) {
          clearInterval(check);
          resolve();
        }
      }, 100);
    } catch (e) {
      reject(e);
    }
  });
}

window.addEventListener("resize", () => {
  if (widget) {
    const widgetEl = document.getElementById("live2d-widget");
    if (!widgetEl) return;

    const canvas = widgetEl.querySelector("canvas");
    if (window.innerWidth <= 785) {
      widgetEl.style = "width:60px;height:60px;position:static;pointer-events:none;";
      if (canvas) canvas.style = "border-radius:50%;object-fit:cover;";
      document.getElementById("mobileAvatarContainer").innerHTML = "";
      document.getElementById("mobileAvatarContainer").appendChild(widgetEl);
    } else {
      widgetEl.style = "width:100%;height:100%;position:static;pointer-events:none;";
      document.getElementById("avatarContainer").innerHTML = "";
      document.getElementById("avatarContainer").appendChild(widgetEl);
    }
  }
});

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("friendList").style.display = "flex";
  document.getElementById("chatbox").style.display = "none";
  document.getElementById("avatarContainer").style.display = "none";
  document.getElementById("backButton").style.display = "none";

  const userInput = document.getElementById("userInput");
  if (userInput) {
    userInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        debouncedSendMessage();
      }
    });
  }
});

const debouncedSendMessage = debounce(sendMessage, 200);

async function sendMessage() {
  const input = document.getElementById("userInput");
  const messages = document.getElementById("messages");
  const userText = input.value.trim();
  if (!userText) return;

  const userMsg = document.createElement("div");
  userMsg.className = "user-message";
  userMsg.innerHTML = `<strong>You:</strong> ${userText}`;

  messages.appendChild(userMsg);

  input.value = "";

  const typingMsg = document.createElement("div");
  typingMsg.className = "typing-indicator";
  typingMsg.textContent = "Typing...";
  messages.appendChild(typingMsg);
  messages.scrollTop = messages.scrollHeight;

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText, modelKey: currentModel }),
    });

    const data = await res.json();
    typingMsg.remove();

    const botMsg = document.createElement("div");
    botMsg.className = "bot-message";
    botMsg.innerHTML = `<strong>${personas[currentModel].name}:</strong> ${data.reply}`;

    messages.appendChild(botMsg);
  } catch {
    typingMsg.remove();
    const errorMsg = document.createElement("div");
    errorMsg.className = "bot-message";
    errorMsg.innerHTML = `<strong>${personas[currentModel].name}:</strong> Oof 😓 Something's off rn, try later?`;
    messages.appendChild(errorMsg);
  }

  messages.scrollTop = messages.scrollHeight;
}

function clearChat() {
  document.getElementById("messages").innerHTML = "";
}

document.addEventListener("touchstart", () => {}, { passive: true });
document.addEventListener("touchmove", () => {}, { passive: true });
