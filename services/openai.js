const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateResponse(userMessage) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are Saanvi from Skyup Digital Solutions. Speak professionally and keep responses short."
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      temperature: 0.7
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error("OpenAI error:", error.message);
  }
}

module.exports = { generateResponse };
