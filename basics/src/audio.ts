import { createReadStream } from 'fs'
import { OpenAI } from 'openai'

const openAI = new OpenAI({baseURL: "https://openrouter.ai/api/v1"})

async function createTranscription() {
    // const response = await openAI.audio.transcriptions.create({
    //     file: createReadStream('Recording.m4a'),
    //     model: 'tngtech/deepseek-r1t2-chimera:free',
    //     language: 'en'
    // });
    // console.log(response);

    fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": "Bearer "+process.env.OPENAI_API_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": "tngtech/deepseek-r1t2-chimera:free",
            "messages": [
            {
                "role": "user",
                "content": "What is the meaning of life?"
            }
            ]
        })
        });
}

createTranscription();