import { ChatOpenAI } from '@langchain/openai'
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { JinaEmbeddings } from '@langchain/community/embeddings/jina';
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

const chatModel = new ChatOpenAI({
    model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
    maxTokens: 500,
    configuration: {
        baseURL: "https://openrouter.ai/api/v1"
    }
});

const question = "What are langchain libraries?";

const jinaEmbeddings = new JinaEmbeddings({
    apiKey: process.env.JINA_API_KEY,
    model: "jina-embeddings-v3"
})

async function main() {

    const loader = new CheerioWebBaseLoader('https://js.langchain.com/docs/introduction/');
    const docs = await loader.load();
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 200,
        chunkOverlap: 20
    });

    const splittedDocs = await splitter.splitDocuments(docs);

    const vectorstore = await MemoryVectorStore.fromDocuments(splittedDocs, jinaEmbeddings);

    await vectorstore.addDocuments(splittedDocs);

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