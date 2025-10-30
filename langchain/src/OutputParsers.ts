import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { CommaSeparatedListOutputParser, StringOutputParser, StructuredOutputParser } from "@langchain/core/output_parsers";

const model = new ChatOpenAI({
    model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
    maxTokens: 500,
    configuration: {
        baseURL: "https://openrouter.ai/api/v1"
    }
});

async function stringParser() {
    const prompt = ChatPromptTemplate.fromTemplate(
        'Write a short description for following product : {product_name}'
    );

    const parser = new StringOutputParser();

    const chain = prompt.pipe(model).pipe(parser);
    const response = await chain.invoke({
        product_name: 'Car'
    });
    console.log(response);
}

async function commaSeparatedListParser() {
    const prompt = ChatPromptTemplate.fromTemplate(
        'Provide comma separated ingredients for the following item: {product_name}'
    );

    const parser = new CommaSeparatedListOutputParser();

    const chain = prompt.pipe(model).pipe(parser);
    const response = await chain.invoke({
        product_name: 'Tomato Soup'
    });
    console.log(response);
}

async function structuredParser() {
    const templatePrompt = ChatPromptTemplate.fromTemplate(`Extract name and likes in JSON.
Example: {{"name": "Ayesha", "likes": "music"}}
Phrase: {phrase}
    {format_instructions}`);
    
    const parser = StructuredOutputParser.fromNamesAndDescriptions({
        name: 'name of the person',
        likes: 'what the person likes'
    });

    const chain = templatePrompt.pipe(model).pipe(parser);

    const result = await chain.invoke({
        phrase: 'Yesha likes pizza',
        format_instructions: parser.getFormatInstructions()
    })

    console.log(result);
}

// stringParser();
// commaSeparatedListParser();
structuredParser();