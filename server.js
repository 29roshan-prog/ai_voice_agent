require("dotenv").config();
const express = require("express");
const fs = require("fs");
const axios = require("axios");
const OpenAI = require("openai");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static("public"));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ---------------- CLEAN TEXT ---------------- */

function cleanText(text) {
  return text
    .replace(/[*#_`]/g, "")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ---------------- ELEVENLABS TTS ---------------- */

async function generateSpeech(text, fileName) {
  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
    {
      text: text,
      model_id: "eleven_flash_v2"
    },
    {
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
    }
  );

  fs.writeFileSync(`./public/${fileName}`, response.data);
}

/* ---------------- CALL START ---------------- */

app.post("/voice", async (req, res) => {
  console.log("📞 Call Started");

  const openingText =
    "Hi sir, this is Saanvi from SkyUp Digital Solutions. I got to know you're interested in our digital services. May I know which service you're looking for?";

  await generateSpeech(openingText, "welcome.mp3");

  const twiml = `
  <Response>
      <Play>${process.env.BASE_URL}/public/welcome.mp3</Play>
      <Gather input="speech" action="/process" method="POST" speechTimeout="auto"></Gather>
  </Response>
  `;

  res.type("text/xml");
  res.send(twiml);
});
/* ---------------- PROCESS USER SPEECH ---------------- */

app.post("/process", async (req, res) => {
  const totalStart = Date.now();

  const userText = req.body.SpeechResult;
  console.log("\n===============================");
  console.log("🧠 User Said:", userText);

  if (!userText) {
    const twiml = `
    <Response>
        <Say>I didn't catch that. Could you repeat please?</Say>
        <Gather input="speech" action="/process" method="POST" speechTimeout="auto"></Gather>
    </Response>
    `;
    res.type("text/xml");
    return res.send(twiml);
  }

  /* -------- GPT TIMER -------- */

  const gptStart = Date.now();

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-nano",
    messages: [
      {
        role: "system",
        content: `
        You are Saanvi from SkyUp Digital Solutions.

This is a strict outbound sales follow-up call.

Rules you MUST follow:

1. Never start with "How can I help you today?"
2. Assume the customer already showed interest.
3. Keep responses under 2 short sentences.
4. No bullet points.
5. No markdown.
6. Be confident and structured.

Services & Starting Prices:
Social Media Marketing – ₹18,thousand per month
PPC Ads – ₹12,thousand per month (ad spend extra)
SEO – ₹15,thousand per month
Email Marketing – ₹10,thousand per month
Branding – ₹20,thousand one-time
Graphics Design – ₹8,hudndred per design
UI/UX Design – ₹25,thousand per project
Website Development – ₹35,thousand one-time
AI Automation – ₹45,thousand per project
Machine Learning – starting ₹75,thousand

Conversation Handling:

- If user says specific service → explain briefly, mention price, ask one qualifying question.
- If user asks about services → mention service names only, then ask which they need.
- Always guide conversation toward booking a strategy call.
- If user ends conversation → close politely.
        `
      },
      {
        role: "user",
        content: userText
      }
    ],
    temperature: 0.4,
    max_tokens: 70
  });

  const gptEnd = Date.now();
  console.log("⏱ GPT Time:", (gptEnd - gptStart) / 1000, "seconds");

  let replyText = completion.choices[0].message.content;
  replyText = cleanText(replyText);

  console.log("🤖 GPT Reply:", replyText);

  /* -------- ELEVENLABS TIMER -------- */

  const ttsStart = Date.now();

  await generateSpeech(replyText, "reply.mp3");

  const ttsEnd = Date.now();
  console.log("⏱ ElevenLabs Time:", (ttsEnd - ttsStart) / 1000, "seconds");

  const totalEnd = Date.now();
  console.log("⏱ TOTAL Processing Time:", (totalEnd - totalStart) / 1000, "seconds");
  console.log("===============================\n");

  const twiml = `
  <Response>
      <Play>${process.env.BASE_URL}/public/reply.mp3</Play>
      <Gather input="speech" action="/process" method="POST" speechTimeout="auto"></Gather>
  </Response>
  `;

  res.type("text/xml");
  res.send(twiml);
});

/* ---------------- SERVER START ---------------- */

app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});