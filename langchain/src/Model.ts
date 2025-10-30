import { ChatOpenAI } from '@langchain/openai'

export const model = new ChatOpenAI({
    model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
    maxTokens: 500,
    configuration: {
        baseURL: "https://openrouter.ai/api/v1"
    }
});

async function main() {
    const response1 = await model.invoke('Give me 4 books to read');
    console.log(response1.content);
    // const response2 = await model.stream('Give me 4 books to read');
    // for await (const chunk of response2) {
    //     console.log(chunk.content);
    // }
}
main();