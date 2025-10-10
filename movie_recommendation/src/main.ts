import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

export type DataWithEmbedding = {
    input: string,
    embedding: number[]
}

export async function generateEmbeddings(input: string|string[]) {
    const API_KEY = process.env.JINA_API_KEY;
    const response = await fetch("https://api.jina.ai/v1/embeddings", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer "+API_KEY
        },
        body: JSON.stringify({
            model: "jina-embeddings-v2-base-en",
            input: input
        })
        });

        const data = await response.json();
        return data;
}

export function loadJsonData(filename: string) {
    const path = join(__dirname,filename);
    const rawData = readFileSync(path);
    return JSON.parse(rawData.toString());
}

export function saveDataToJson(data: any, filename: string) {
    const dataString = JSON.stringify(data);
    const dataBuffer = Buffer.from(dataString);
    const path = join(__dirname, filename);
    writeFileSync(path, dataBuffer);
    console.log(`Data saved to ${filename}`);
}
