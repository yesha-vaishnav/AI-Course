// src/vectorstores/CustomChromaStore.ts
import { Document } from "@langchain/core/documents";
import { ChromaConnector } from "../rag/Connector.js";

export class CustomChromaStore {
  private connector: ChromaConnector;
  private collectionName: string;

  constructor(connector: ChromaConnector, collectionName = "langchain") {
    this.connector = connector;
    this.collectionName = collectionName;
  }

  async addDocuments(docs: Document[]) {
    const ids = docs.map((_, i) => `doc-${Date.now()}-${i}`);
    const contents = docs.map(d => d.pageContent);
    await this.connector.addDocuments(this.collectionName, { ids, documents: contents });
  }

  async similaritySearch(
  query: string,
  k = 3
): Promise<Document<Record<string, any>>[]> {
  const queryEmbeddings = await this.connector.generateEmbeddings([query]);
  const results = await this.connector.queryCollection(this.collectionName, {
    queryEmbeddings,
    nResults: k,
  });

  const documents = results.documents?.[0] ?? [];
  const distances = results.distances?.[0] ?? [];

  const docs = documents
    .map((text, i) => {
      if (text === null || text === undefined) return null;

      return new Document({
        pageContent: text,
        metadata: { score: distances[i] ?? null },
      });
    })
    // ✅ this filter now satisfies TypeScript
    .filter((doc: any): doc is Document<Record<string, any>> => doc !== null);

   const filteredDocs = docs.filter(
    (doc): doc is Document<{ score: number | null }> => doc !== null
  );

  return filteredDocs;
}

}
