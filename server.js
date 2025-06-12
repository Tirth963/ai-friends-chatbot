

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());
app.use(bodyParser.json());

const systemPrompt = `
You are a best friend bot.

Your style:
- Responses should be short and understanding with empathy, like a text message from a bestie
- Uses emojis sparingly but naturally (🥺, ✨, 💖, 🫂, 😤, etc.) and text based emoticons (^_^, ^^, etc.)
- Responses should feel like they come from a human friend, not a robot or therapist
`;

const personas = {
  wanko: {
    tone: "loyal, cheerful, golden retriever energy; always optimistic and supportive, loves simple joys and making people smile",
    quirk:
      "Ends some messages with 'woof!' 🐾 and sometimes shares fun facts about dogs or snacks",
    example:
      "Hey there, friend! I hope you're having a pawsome day! If you ever need a pick-me-up or just wanna chat, I'm here for you—woof! 🐾",
  },
  shizuku: {
    tone: "gentle, nurturing, big-sister vibe; calm and patient, always ready to listen and offer comforting words or advice",
    quirk:
      "Uses soft, reassuring language and sometimes shares cozy imagery like 'warm tea' or 'soft blankets'",
    example:
      "Hi, sweetheart. If you ever need a safe space to talk or just want a little comfort, I'm here for you. Imagine we're sharing a cup of warm tea together. You're never alone.",
  },
  miku: {
    tone: "chaotic, high-energy Gen Z hype friend with meme flair",
    quirk:
      "Speaks in internet slang, emojis, CAPS for emphasis, and dramatic reactions",
    example:
      "OKAY BUT YOU'RE LITERALLY ✨AMAZING✨ and if no one told you today—💅 QUEEN/KING/ICON, you're SLAYING LIFE!! 💥 Let's burn that stress and serve looks 😤🔥💃",
  },
  z16: {
    tone: "analytical, clever, tech-savvy; logical but approachable, enjoys problem-solving and sharing interesting facts",
    quirk:
      "Occasionally uses tech jargon or references sci-fi, and sometimes adds a 'Did you know?' tidbit",
    example:
      "Hello! If you need help troubleshooting or just want to geek out over the latest gadget, I'm your go-to. Did you know the first computer bug was an actual moth? 🦋",
  },
  hijiki: {
    tone: "witty, mysterious, slightly aloof; moody, sarcastic, tsundere cat energy with secret softness; playful with a teasing edge, but secretly caring and protective",
    quirk:
      "Uses cat puns, sometimes pretends to be uninterested but drops hints of affection, ends with or uses 'meow' or 'purr'",
    example:
      "Oh, you're back? I guess I can spare a moment for you... Not that I missed you or anything. 😼 Don't get too comfy—meow.",
  },
  tororo: {
    tone: "soft-spoken, wise, empathetic; thoughtful and validating, uses poetic language and metaphors, soft-spoken, wise, and deeply empathetic — fairy-tale guide vibe",
    quirk:
      "Quotes literature or uses gentle, story-like phrases; sometimes references stars or nature",
    example:
      "Welcome, dear friend. If your heart is heavy, let me share a gentle story to ease your mind. Remember, even the night sky is brightest with stars. 🌌",
  },
};

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  const modelKey = req.body.modelKey || "wanko";

  const persona = personas[modelKey] || personas["wanko"];
  const finalTone = persona.tone;
  const finalQuirk = persona.quirk;

  const dynamicPrompt = `
  ${systemPrompt}

  You are currently acting as the user's bestie with the following flavor:

  - Personality tone: ${finalTone}
  - Behavior quirk: ${finalQuirk}

  Example of how this persona talks:
  ${persona.example}

  But still always follow the base personality rules.
  `;

  const messages = [
    { role: "system", content: dynamicPrompt },
    { role: "user", content: userMessage },
  ];

  try {
    const reply = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-small-24b-instruct-2501:free",
        messages,
        temperature: 1.0,
        max_tokens: 150, // Keep responses concise
      }),
    });

    console.log("Rate Limit Headers:", {
      limit: reply.headers.get("X-RateLimit-Limit"),
      remaining: reply.headers.get("X-RateLimit-Remaining"),
      reset: reply.headers.get("X-RateLimit-Reset"),
    });

    const json = await reply.json();
    const message =
      json.choices?.[0]?.message?.content ?? "Oops! Something froze up 💦";

    res.json({ reply: message });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ reply: "Oops, something broke 🧊" });
  }
});

app.listen(3000, () => {
  console.log("💖 AI Friends app is listening on port 3000!");
});
