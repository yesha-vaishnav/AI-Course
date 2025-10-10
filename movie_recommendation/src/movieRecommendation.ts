import { existsSync } from "fs";
import { generateEmbeddings, loadJsonData, saveDataToJson } from "./main";
import { join } from "path";
import { dotProduct } from "./similarity";

type movie = {
    name: string,
    description: string
}

type movieEmbedding = movie & {embedding: number[]};

const data:movie[] = loadJsonData('movies.json');

async function recommendMovies(input: string) {
    const embedding = await generateEmbeddings(input);
    const descriptionEmbeddings = await getMovieEmbeddings();
    const movieEmbedding:movieEmbedding[] = [];
    for(let i=0; i < data.length; i++) {
        movieEmbedding.push({
            name: data[i].name,
            description: data[i].description,
            embedding: descriptionEmbeddings.data[i].embedding
        });
    }
    const similarities: {input: string, similarity: number}[] = [];

    for(const movie of movieEmbedding) {
        const similarity = dotProduct(movie.embedding, embedding.data[0].embedding);
        similarities.push({
            input: movie.name,
            similarity
        });
    }
    
    console.log(`If you like ${input}, we recommend: `);
    const sortedSimilarities = similarities.sort((a,b) => b.similarity - a.similarity);
    sortedSimilarities.forEach(sortedSimilarity => {
        console.log(`${sortedSimilarity.input} : ${sortedSimilarity.similarity}`);
    });
}

async function getMovieEmbeddings() {
    const filename = 'movieEmbeddings.json';
    const filepath = join(__dirname, filename);
    if(existsSync(filepath)) {
        const descriptionEmbeddings = loadJsonData(filename);
        return descriptionEmbeddings;
    } else {
        const descriptionEmbeddings = await generateEmbeddings(data.map(d => d.description));
        saveDataToJson(descriptionEmbeddings, filename);
        return descriptionEmbeddings;
    }
}

console.log("What type of movies do you like?");
process.stdin.addListener('data', async function(input) {
    let userInput = input.toString().trim();
    await recommendMovies(userInput);
})