import { OpenAI } from "openai";
import { encoding_for_model } from 'tiktoken';

const openai = new OpenAI({baseURL: "https://openrouter.ai/api/v1"});
const encoder = encoding_for_model('chatgpt-4o-latest');

const MAX_TOKENS = 100;

const context:OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
        role: 'system',
        content: 'You are a helpful chatbot'
    }
]

async function createChatCompletion() {
    const response = await openai.chat.completions.create({
        model:"deepseek/deepseek-chat-v3.1:free",
        messages: context,
    })
    const responseMessage = response.choices[0].message;
    context.push({
        role: 'assistant',
        content: responseMessage.content
    })
    if(response.usage && response.usage.total_tokens > MAX_TOKENS) {
        deleteOlderMsgs();
    }

    console.log("Assistant: "+response.choices[0].message.content);
    console.log("Me: ");
}

process.stdin.addListener('data', async function(input) {
    const userInput = input.toString().trim();
    context.push({
        role: 'user',
        content: userInput
    })
    await createChatCompletion();
    
})

function deleteOlderMsgs() {
    let contextLength = getContextLength();
    while(contextLength > MAX_TOKENS) {
        for(let i=0; i < context.length; i++) {
            const message = context[i];
            if(message.role != 'system') {
                context.splice(i, 1);
                contextLength = getContextLength();
                console.log("New context length: "+contextLength);
                break;
            }
        }
    }
}

function getContextLength() {
    let length = 0;
    context.forEach((message) => {
        if(typeof message.content == "string") {
            length += encoder.encode(message.content).length;
        } else if(Array.isArray(message.content)) {
            message.content.forEach((messageContent) => {
                if(messageContent.type == "text") {
                    length += encoder.encode(messageContent.text).length;
                }
            })
        }
    })
    return length;
}