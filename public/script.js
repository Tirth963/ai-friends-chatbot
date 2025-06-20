

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
    friendList.style.display = "flex";
    chatbox.style.display = "none";
    avatar.style.display = "none";
    if (window.innerWidth > 785) personaName.innerText = "Your AI Friends";
    else title.innerText = "Your AI Friends";
    backBtn.style.display = "none";

    setTimeout(() => {
      location.reload();
    }, 100);
  } else {
    friendList.style.display = "none";
    chatbox.style.display = "flex";
    avatar.style.display = "";
    if (window.innerWidth > 785) personaName.innerText = personas[currentModel].name;
    else title.innerText = personas[currentModel].name;
    backBtn.style.display = "block";
  }
}

function destroyCurrentWidget() {
  const oldCanvas = document.getElementById("live2d-widget");
  if (oldCanvas) oldCanvas.remove();
  if (window.L2Dwidget?.destroy) try { window.L2Dwidget.destroy(); } catch {}
  widget = null;
  return new Promise(resolve => setTimeout(resolve, 300));
}

async function selectFriend(modelKey) {
  if (isModelLoading || !models[modelKey]) return;
  isModelLoading = true;
  document.getElementById("loadingOverlay").classList.remove("hidden");

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
  } catch (e) {
    console.error("Avatar load error", e);
  } finally {
    isModelLoading = false;
    document.getElementById("loadingOverlay").classList.add("hidden");
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

      let tries = 0;
      const max = 30;
      const timer = setInterval(() => {
        if (++tries > max) return clearInterval(timer) || reject();
        const el = document.getElementById("live2d-widget");
        if (el?.querySelector("canvas")) {
          clearInterval(timer);
          positionAvatar();
          resolve();
        }
      }, 200);
    } catch (e) {
      reject(e);
    }
  });
}

function positionAvatar() {
  const tryMove = () => {
    const widgetEl = document.getElementById("live2d-widget");
    const canvas = widgetEl?.querySelector("canvas");
    if (!widgetEl || !canvas) return false;

    if (window.innerWidth <= 785) {
      widgetEl.style.width = "60px";
      widgetEl.style.height = "60px";
      widgetEl.style.position = "static";
      widgetEl.style.pointerEvents = "none";
      canvas.style.borderRadius = "50%";
      canvas.style.objectFit = "cover";
      const mobile = document.getElementById("mobileAvatarContainer");
      if (!mobile.contains(widgetEl)) {
        mobile.innerHTML = "";
        mobile.appendChild(widgetEl);
      }
    } else {
      widgetEl.style.width = "100%";
      widgetEl.style.height = "100%";
      widgetEl.style.position = "static";
      widgetEl.style.pointerEvents = "none";
      const avatar = document.getElementById("avatarContainer");
      if (!avatar.contains(widgetEl)) {
        avatar.innerHTML = "";
        avatar.appendChild(widgetEl);
      }
    }
    return true;
  };

  let attempts = 0;
  const max = 20;
  const interval = setInterval(() => {
    if (tryMove() || ++attempts > max) clearInterval(interval);
  }, 200);
}

window.addEventListener("resize", () => setTimeout(positionAvatar, 300));

window.addEventListener("DOMContentLoaded", () => {
  initializePage();
  setTimeout(positionAvatar, 800);

  const input = document.getElementById("userInput");
  if (input) {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        debouncedSendMessage();
      }
    });
  }
});

function initializePage() {
  document.getElementById("friendList").style.display = "flex";
  document.getElementById("chatbox").style.display = "none";
  document.getElementById("avatarContainer").style.display = "none";
  document.getElementById("backButton").style.display = "none";
  document.getElementById("mobileChatTitle").innerText = "Your AI Friends";
}

const debouncedSendMessage = debounce(sendMessage, 200);

async function sendMessage() {
  const input = document.getElementById("userInput");
  const messages = document.getElementById("messages");
  const text = input.value.trim();
  if (!text) return;

  const userMsg = document.createElement("div");
  userMsg.className = "user-message";
  userMsg.innerHTML = `<strong>You:</strong> ${text}`;
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
      body: JSON.stringify({ message: text, modelKey: currentModel }),
    });
    const data = await res.json();
    typingMsg.remove();

    const botMsg = document.createElement("div");
    botMsg.className = "bot-message";
    botMsg.innerHTML = `<strong>${personas[currentModel].name}:</strong> ${data.reply}`;
    messages.appendChild(botMsg);
    messages.scrollTop = messages.scrollHeight;
  } catch {
    typingMsg.remove();
    const errorMsg = document.createElement("div");
    errorMsg.className = "bot-message";
    errorMsg.innerHTML = `<strong>${personas[currentModel].name}:</strong> Oof 😓 Something's off rn, try later?`;
    messages.appendChild(errorMsg);
  }
}

function clearChat() {
  document.getElementById("messages").innerHTML = "";
}

document.addEventListener("touchstart", () => {}, { passive: true });
document.addEventListener("touchmove", () => {}, { passive: true });