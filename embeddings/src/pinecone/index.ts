import { Pinecone } from '@pinecone-database/pinecone';

const PINECONE_API_KEY:any = process.env.PINECONE_API_KEY;
const pc = new Pinecone({
  apiKey: PINECONE_API_KEY
});

async function createIndex() {
    await pc.createIndex({
        name: 'ai-project-index',
        dimension: 768,
        metric: 'cosine',
        spec: {
            serverless: {
                cloud: 'aws',
                region: 'us-east-1'
            }
        }
    });
}

async function listIndexes() {
    const indexes = await pc.listIndexes();
    return indexes;
}

function getIndex(name: string) {
    const index = pc.index(name);
    return index;
}

async function createNamespace() {
    const index = getIndex('ai-project-index');
    const namespace = index.namespace('ai-project-namespace');
    return namespace;
}

function generateNumberArray(length: number) {
    return Array.from({length}, () => Math.random());
}

async function upsertVectors() {
    const embedding = generateNumberArray(1024);
    const index = getIndex('ai-project-index');
    console.log(index);
    const upsertResult = await index.upsert([
        {
            id: 'id1',
            values: embedding
        }
    ])
}

async function queryVectors() {
    const index = getIndex('ai-project-index');
    const result = await index.query({
        id: 'id1',
        topK: 10
    });
    return result;
}

async function main() {
    // console.log(await listIndexes());
    // console.log(getIndex('ai-course-index'));
    // const namespace = await createNamespace();
    // console.log(namespace);

    // const result = await upsertVectors();
    const vectors = await queryVectors();
    console.log(vectors);

}

main();