import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'

const model = new ChatOpenAI({
    model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
    maxTokens: 500,
    configuration: {
        baseURL: "https://openrouter.ai/api/v1"
    }
});

async function fromTemplate() {
    const prompt = ChatPromptTemplate.fromTemplate(
        'Write a short description for following product : {product_name}'
    );
    // const wholePrompt =  await prompt.format({
    //     product_name: 'Car'
    // });

    const chain = await prompt.pipe(model);
    const response = await chain.invoke({
        product_name: 'Car'
    });
    console.log(response.content);
}

async function fromMessage() {
    const prompt = ChatPromptTemplate.fromMessages([
        ['system', 'Write a short description for the product provided by user'],
        ['human', '{product_name}']
    ]);

    const chain = await prompt.pipe(model);

    const result = await chain.invoke({
        product_name: 'car'
    });
    console.log(result.content);
}

// fromTemplate();
fromMessage();