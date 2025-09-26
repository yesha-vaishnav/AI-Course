import { OpenAI } from 'openai'
import { encoding_for_model } from 'tiktoken';
const openai = new OpenAI({baseURL: "https://openrouter.ai/api/v1"})

async function main() {
    const response = await openai.chat.completions.create({
        model:"deepseek/deepseek-chat-v3.1:free",
        messages: [{
            role: 'system',
            content: 'You respond like a cool guy! and your response format is a JSON like: { coolnessLevel: ranging from 1-10, answer: your answer}'
        },
            {
            role: 'user',
            content: 'Say something cool'
        }],
        n: 3
    });
    console.log(response.choices);
}

function encodePrompt() {
    const prompt = "My name is Yesha";
    const encoder = encoding_for_model('gpt-3.5-turbo');
    const words = encoder.encode(prompt);
    console.log(words);
}

// encodePrompt();
main();