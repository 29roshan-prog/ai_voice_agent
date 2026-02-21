const axios = require("axios");
const fs = require("fs");

async function generateSpeech(text) {
  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
    {
      text,
      model_id: "eleven_turbo_v2",
      voice_settings: {
        stability: 0.85,
        similarity_boost: 0.8,
        style: 0.05,
        use_speaker_boost: true,
      },
    },
    {
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
    }
  );

  const outputFile = "reply.mp3";
  fs.writeFileSync(outputFile, response.data);

  return outputFile;
}

module.exports = { generateSpeech };