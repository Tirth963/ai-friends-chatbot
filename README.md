# AI Friends – Your Cozy Corner on the Web

**AI Friends** is a delightful web app where you can chat with 6 quirky AI besties—each rocking a unique personality, mood, and animated Live2D avatar. Whether you're in the mood for comfort, chaos, wisdom, or sass, there's a Mochi friend for everyone.

🔗 **Live Demo**: [https://ai-friends-chatbot.onrender.com](https://ai-friends-chatbot.onrender.com)

---

## ✨ Features

* 💬 **Six AI Personas**
  Each friend has a distinct tone, chat style, and cute Live2D avatar.

* 🖼️ **Live2D Integration**
  Animated avatars for visual interaction using lightweight models.

* 🎨 **Persona-Based Styling**
  Background color, chat UI, and placeholder text adapt based on selected friend.

* 📱 **Responsive Design**
  Works seamlessly across desktop and mobile devices.

* ⚡ **Typing Indicator + Emoji Support**
  Makes the conversation feel real and alive.

* 🧹 **Clear Chat Anytime**
  Simple button to reset the conversation.

* 🎭 **Mood-Driven Chat Experience**
  Each persona responds in a way that reflects their vibe—whether it's soft, hype, tsundere, or techy!

---

## 💻 Tech Stack

| Layer            | Tech                                                                         |
| ---------------- | ---------------------------------------------------------------------------- |
| **Frontend**     | HTML, CSS, JavaScript (vanilla)                                              |
| **Backend**      | Node.js + Express                                                            |
| **API**          | [OpenRouter](https://openrouter.ai) using Mistral (free tier)                |
| **Live Avatars** | Live2D Models (via [L2DWidget](https://github.com/xiazeyu/live2d-widget.js)) |
| **Hosting**      | Render (Free Plan)                                                           |

---

## 📦 Folder Structure

```
public/
├── index.html
├── script.js
├── style.css
├── models/
│   └── [Live2D model folders]
```

---

## 🚀 Getting Started Locally

> You'll need **Node.js** installed.

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/ai-friends.git
cd ai-friends
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set your OpenRouter API key

Create a `.env` file in the root directory:

```
OPENROUTER_API_KEY=your_openrouter_api_key
```

You can get a free API key at 👉 [openrouter.ai](https://openrouter.ai)

### 4. Run the server

```bash
node server.js
```

Now open your browser and visit `http://localhost:3000`

---

## ⚠️ Limitations

* ⏳ **Model Load Delay**
  Live2D avatars may take a few seconds to appear, especially the first time.

* 💥 **Render Free Tier Sleep Time**
  After inactivity, the server may take 30–40 seconds to wake up.

* 🧂 **API Rate Limit**
  The free OpenRouter plan has daily token caps. You might see “Oops something broke” when it's exceeded.

---

## 👩‍🎨 Personas

| Avatar   | Nickname         | Vibe Description                       |
| -------- | ---------------- | -------------------------------------- |
| 🐶 Moko  | The Cheer Pup    | Loyal, bubbly, golden retriever energy |
| 🌸 Hina  | The Comforter    | Gentle, big-sis warmth and cozy vibes  |
| 🎤 Zaza  | The Hype Gremlin | Meme queen, chaotic and confident      |
| 🤖 Byte  | The Glitch Wiz   | Geeky, clever, loves tech facts        |
| 🐱 Nyoro | The Feral Flirt  | Moody tsundere cat energy              |
| 🌙 Lumi  | The Dream Sage   | Poetic, wise, and deeply validating    |

---

## 👨‍💻 Author

* Built with 🤖 by [Tirth](https://github.com/Tirth369)
* This project was made for fun, learning, and spreading good vibes!

---

## 📜 License

* MIT – free to use, remix, and share.
* Live2D models used are sample/free avatars—please check original licenses if reusing elsewhere.
