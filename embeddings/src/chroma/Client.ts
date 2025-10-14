import { ChromaConnector } from './Connector';

const client = new ChromaConnector();

async function main(){
    const response = await client.createCollection("data-test");
    console.log(response);
}

async function addData() {
    const result = await client.addDocuments("data-test", 
        {
            ids: ['1', '2'],
            documents: ['Here is my entry', 'Here is my second entry']
        })
}

async function queryResults() {
    const queryResult = await client.queryCollection("data-test", {
    queryEmbeddings: await client.generateEmbeddings(["Hello"]),
    nResults: 1,
  });

  console.log("Query result:", queryResult);
}

main().catch(console.error);
addData();
queryResults();

