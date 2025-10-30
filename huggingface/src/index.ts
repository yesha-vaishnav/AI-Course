import { HfInference} from '@huggingface/inference'
import { writeFile } from 'fs';

const inference = new HfInference(process.env.HF_TOKEN);

async function embed() {

    const output = await inference.featureExtraction({
        inputs: 'My embeddings',
        provider: 'hf-inference'
    });

    console.log(output);
}

async function translate() {
    const result = await inference.translation({
        inputs: 'How is the weather in Gujarat?',
        model: 't5-base',
        provider: 'hf-inference'
    })

    console.log(result);
}

async function answerQuestion() {
    const result = await inference.questionAnswering({
        inputs: {
            context: 'The weather is gujarat is humid and monsoon season',
            question: 'How is the weather in gujarat?'
        },
        provider: 'hf-inference'
    })

    console.log(result);
}

async function textToImage() {
    const result:any = await inference.textToImage({
        inputs: 'A hillstation',
        model: "black-forest-labs/FLUX.1-schnell",
        provider: 'hf-inference',
        parameters: {
            negative_prompt: "blurry"
        }
    });
    const blob = result as Blob;

    const buffer = Buffer.from(await blob.arrayBuffer());
    writeFile('image.png', buffer, () => {
        console.log('Image saved');
    })


}

// embed();
// translate();
// answerQuestion();
textToImage();