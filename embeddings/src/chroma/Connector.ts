import { ChromaClient, Collection } from "chromadb";
import axios from "axios";

interface AddParams {
  ids: string[];
  documents: string[];
  embeddings?: number[][]; // optional now
}

interface QueryParams {
  queryEmbeddings: number[][];
  nResults: number;
}

const JINA_API_URL = "https://api.jina.ai/v1/embeddings";
const JINA_API_KEY = process.env.JINA_API_KEY;

export class ChromaConnector {
  private client: ChromaClient;
  private collections: Map<string, Collection>;

  constructor() {
    //console.log("Initializing in-memory ChromaConnector...");
    this.client = new ChromaClient(); // in-memory
    this.collections = new Map();
  }

  // Heartbeat
  async heartbeat() {
    //console.log("➡️ Heartbeat request");
    const response = { status: "ok" };
    //console.log("⬅️ Heartbeat response:", response);
    return response;
  }

  // Create a collection
  async createCollection(name: string) {
    //console.log("➡️ Create collection request:", { name });
    let collection: Collection;
    try {
      collection = await this.client.getCollection({ name });
      //console.log("Collection already exists:", name);
    } catch {
      collection = await this.client.createCollection({ name });
      //console.log("Created collection:", name);
    }
    this.collections.set(name, collection);
    //console.log("⬅️ Create collection response:", { name });
    return { name };
  }

  // Internal: call Jina API to get embeddings
  private async getEmbeddings(texts: string[]): Promise<number[][]> {
    if (!JINA_API_KEY) throw new Error("Set your JINA_API_KEY in environment variables");

    const body = { model: "jina-embeddings-v2-base-en", input: texts };
    const response = await axios.post(JINA_API_URL, body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JINA_API_KEY}`,
      },
    });
    //console.log(response.data.data.map((item: any) => item.embedding));
    return response.data.data.map((item: any) => item.embedding);
  }

  // Inside ChromaConnector.ts
    public async generateEmbeddings(texts: string[]): Promise<number[][]> {
        return this.getEmbeddings(texts);
    }


  // Add documents with embeddings (embeddings optional)
  async addDocuments(collectionName: string, params: AddParams) {
    const { ids, documents } = params;
    let embeddings = params.embeddings;

    // If embeddings not provided, generate them using Jina
    if (!embeddings) {
      //console.log("Generating embeddings using Jina API...");
      embeddings = await this.getEmbeddings(documents);
    }

    //console.log("➡️ Add documents request:", { collectionName, ids, documents, embeddings });
    const collection = this.collections.get(collectionName);
    if (!collection) throw new Error(`Collection not found: ${collectionName}`);

    await collection.add({ ids, documents, embeddings });
    //console.log("⬅️ Add documents response: success");

    return { status: "success" };
  }

  // Query a collection
  async queryCollection(collectionName: string, params: QueryParams) {
    //console.log("➡️ Query request:", { collectionName, ...params });
    const collection = this.collections.get(collectionName);
    if (!collection) throw new Error(`Collection not found: ${collectionName}`);

    const result = await collection.query({
      queryEmbeddings: params.queryEmbeddings,
      nResults: params.nResults,
    });

    //console.log("⬅️ Query response:", result);
    return result;
  }
}
