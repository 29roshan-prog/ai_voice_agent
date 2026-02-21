const fs = require("fs");
const { spawn } = require("child_process");

function saveAudioChunk(stream, payload) {
  const audioChunk = Buffer.from(payload, "base64");
  stream.write(audioChunk);
}

function convertToWav(inputFile, outputFile) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-y",
      "-f", "mulaw",
      "-ar", "8000",
      "-ac", "1",
      "-i", inputFile,
      "-ar", "16000",
      "-ac", "1",
      outputFile
    ]);

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error("FFmpeg conversion failed"));
      }
    });
  });
}

function cleanupFiles(files) {
  files.forEach((file) => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });
}

module.exports = {
  saveAudioChunk,
  convertToWav,
  cleanupFiles,
};