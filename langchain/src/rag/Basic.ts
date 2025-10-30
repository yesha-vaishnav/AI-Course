import { ChatOpenAI } from '@langchain/openai'
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from '@langchain/core/documents'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { JinaEmbeddings } from '@langchain/community/embeddings/jina';

const chatModel = new ChatOpenAI({
    model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
    maxTokens: 500,
    configuration: {
        baseURL: "https://openrouter.ai/api/v1"
    }
});

const myData = [
    "My name is Yesha",
    "My name is Misha",
    "My favorite food is Pizza",
    "My favorite food is Pasta"
];

const question = "What are my favorite foods?";

const jinaEmbeddings = new JinaEmbeddings({
    apiKey: process.env.JINA_API_KEY,
    model: "jina-embeddings-v3"
})

async function main() {
    const vectorstore = await MemoryVectorStore.fromDocuments(
        myData.map(content => new Document({
            pageContent: content
        })
        ),
        jinaEmbeddings)
    await vectorstore.addDocuments(myData.map(
        content => new Document({
            pageContent: content
        })
    ));
    const retriever = vectorstore.asRetriever({
        k: 2
    });

    const results = await retriever._getRelevantDocuments(question);
    const resultPages = results.map(
        result => result.pageContent
    );

    const template = ChatPromptTemplate.fromMessages([
        ['system', 'Answer the users question based on the following context : {context}'],
        ['user', '{input}']
    ]);

    const chain = template.pipe(chatModel);

    const response = await chain.invoke({
        input: question,
        context: resultPages
    });

    console.log(response.content);
}

main();