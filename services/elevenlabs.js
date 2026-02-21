const axios = require("axios");

async function textToSpeech(text) {
  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      {
        text: text,
        model_id: "eleven_turbo_v2",
        voice_settings: {
  stability: 0.88,
  similarity_boost: 0.9,
  style: 0.09,
  use_speaker_boost: true
}


      },
      {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer"
      }
    );

    return Buffer.from(response.data);

  } catch (error) {
    console.error("ElevenLabs error:", error.response?.data || error.message);
  }
}

module.exports = { textToSpeech };
