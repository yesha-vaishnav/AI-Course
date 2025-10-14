import { ChromaConnector } from './Connector';
import { OpenAI } from 'openai';

const openai = new OpenAI({baseURL: "https://openrouter.ai/api/v1"});

const context:OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
        role: 'system',
        content: 'You are a chatbot which provides answers based on the context provided'
    }
]

const RatanTataInformation = "Ratan Tata was an Indian industrialist, philanthropist, and former chairman of the Tata Group, known for transforming the company into a global conglomerate through strategic acquisitions like Jaguar Land Rover and Corus. Born in 1937, he received engineering and business degrees from Cornell and Harvard. His leadership from 1991 to 2012 expanded the Tata Group globally, and he is also recognized for his significant philanthropic work and ethical leadership. He passed away on October 9, 2024, at the age of 86. Early life and education Born: December 28, 1937, in Mumbai, India. Education: Studied at the Campion School and Cathedral and John Connon School in Mumbai. He earned a bachelor's degree in architecture from Cornell University in 1962 and later completed the Advanced Management Program at Harvard Business School in 1975. Career and leadership Joined Tata Group: Started working on the shop floor of Tata Steel in 1961. Chairman: Became chairman of the Tata Group in 1991. Global expansion: Under his leadership, the Tata Group was transformed from an India-focused company into a global business. Key acquisitions included Tetley, Jaguar Land Rover, and Corus. Key initiatives: Launched projects like the Tata Nano, which was introduced as India's most affordable car. Interim Chairman: Held the position of interim chairman of Tata Sons from October 2016 to February 2017. Legacy and recognition Philanthropy: Made significant contributions to education and healthcare through philanthropic trusts, often described as having a vision for community service. Awards: Received India's second-highest civilian honor, the Padma Vibhushan, in 2008. Leadership style: Widely admired for his vision, integrity, and emphasis on ethical business practices";

const NMurthyInformation = "Nagavara Ramarao Narayana Murthy is an Indian billionaire software engineer and entrepreneur, best known as the co-founder of Infosys, a multinational corporation. Widely considered the `father of the Indian IT sector` he played a pivotal role in establishing India as a leader in IT services and outsourcing. Early life and education Born on August 20, 1946, in Sidlaghatta, Karnataka, India, into a middle-class family. Earned a bachelor's degree in electrical engineering in 1967 and a master's degree from IIT Kanpur in 1969. Early career Started at the Indian Institute of Management Ahmedabad as a chief systems programmer. Worked on projects in Paris in the 1970s. Worked at Patni Computer Systems before co-founding Infosys. Had an earlier entrepreneurial attempt with Softronics. Founding Infosys Co-founded Infosys in 1981 with six other software professionals and a small initial investment Served as CEO from 1981 to 2002 and chairman until 2011, becoming chairman emeritus in 2014. Business philosophy and legacy Credited with the Global Delivery Model, transforming the Indian IT services sector. Known for strong corporate governance and ethical standards. Pioneered the Employee Stock Option Plan (ESOP) in India. Involved in philanthropic work through the Infosys Foundation. Views AI as a tool to enhance human productivity. Awards and recognition Received India's Padma Vibhushan (2008) and Padma Shri (2000). Awarded France's Legion of Honour (2008). Named Ernst & Young World Entrepreneur Of The Year (2003). Called the `Father of the Indian IT Sector`` by Time magazine. Other roles and family Founded a venture capital firm, Catamaran Ventures, after retiring from Infosys. Married to author and philanthropist Sudha Murty. Their daughter is married to British politician Rishi Sunak."

const client = new ChromaConnector();

async function main() {
    const response = await client.createCollection("chat_app");

    const addResponse = await client.addDocuments("chat_app", {
        ids: ['INFO1', 'INFO2'],
        documents: [RatanTataInformation, NMurthyInformation]
    });
}

async function queryResult(queryString: string) {
    const response = await client.queryCollection('chat_app', {
        queryEmbeddings: await client.generateEmbeddings([queryString]),
        nResults: 1
    });
    return response.documents[0][0];
}

async function askQuestion(refContext: any, question: string) {
    context.push({
        role: "assistant",
        content: "Answer the next question based on the given context: "+refContext
    });
    context.push({
        role: "user",
        content: question
    })
    const response = await openai.chat.completions.create({
        model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
        messages: context
    });
    console.log(response.choices[0].message.content);
}

main();
console.log("Ask me a question!");
process.stdin.addListener('data', async function(input){
    const userInput = input.toString().trim();
    const queryResultResponse = await queryResult(userInput);
    askQuestion(queryResultResponse, userInput);
})