const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateReply(userText) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a professional AI sales assistant from SkyUp Digital Solutions. Speak clearly and professionally."
      },
      {
        role: "user",
        content: userText
      }
    ],
  });

  return completion.choices[0].message.content;
}

module.exports = { generateReply };