import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { JinaEmbeddings } from '@langchain/community/embeddings/jina';
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { ChromaConnector } from './Connector.js';
import { CustomChromaStore } from './CustomChromaStore.js';


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

    const connector = new ChromaConnector();

	await connector.createCollection("langchain");

  	const vectorStore = new CustomChromaStore(connector, "langchain");
	console.log(vectorStore);

    await vectorStore.addDocuments(docs);

    const retriever = async (query: string) => {
        const docs = await vectorStore.similaritySearch(query, 2);
        return docs.map(d => d.pageContent).join("\n");
    };

    const result = await retriever(question);

    const template = ChatPromptTemplate.fromMessages([
        ['system', 'Answer the users question based on the following context : {context}'],
        ['user', '{input}']
    ]);

    const chain = template.pipe(chatModel);

    const response = await chain.invoke({
        input: question,
        context: result
    });

    console.log(response.content);
}

main().catch(err => {
  console.error("❌ Unhandled Error:", err);
});
