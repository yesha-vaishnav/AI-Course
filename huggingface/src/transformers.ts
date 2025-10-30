import { pipeline, round } from '@xenova/transformers'
import { WaveFile } from 'wavefile';

function test() {
    const result = round(5.555,2);
    console.log(result);
}

async function embedder() {
    const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    const result = await embedder('First local embeddings', {
        pooling: 'mean',
        normalize: true
    });

    console.log(result);
}

async function generateText() {
    const generator = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-783M');
    let result = await generator('Give me a list of good books', {
        max_new_tokens: 200
    })

    console.log(result);
}

async function speechRecognition() {
  console.log("🔊 Loading Whisper model...");
  const transcriber = await pipeline("automatic-speech-recognition", "Xenova/whisper-small.en");

  const url = "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/jfk.wav";
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();

  // Convert ArrayBuffer → Buffer
  const buffer = Buffer.from(new Uint8Array(arrayBuffer));

  // Parse WAV file
  const wav = new WaveFile(buffer);
  wav.toBitDepth("32f"); // Float32 for model
  wav.toSampleRate(16000); // Whisper expects 16kHz

  let audioData = wav.getSamples();

  // If stereo → merge channels
  if (Array.isArray(audioData)) {
    if (audioData.length > 1) {
      const SCALING_FACTOR = Math.sqrt(2);
      for (let i = 0; i < audioData[0].length; ++i) {
        audioData[0][i] = SCALING_FACTOR * (audioData[0][i] + audioData[1][i]) / 2;
      }
    }
    audioData = audioData[0]; // Use first channel
  }

  console.log("🎙️ Transcribing...");
  const result = await transcriber(audioData);

  console.log("📝 Transcription:");
  console.log(result);
}


// test();
// embedder();
// generateText();
speechRecognition();