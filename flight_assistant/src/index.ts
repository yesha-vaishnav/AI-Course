import { getRandomValues, randomInt } from 'crypto';
import { OpenAI } from 'openai';

const openai = new OpenAI({baseURL: "https://openrouter.ai/api/v1"});

interface flightInfo {
    bookingID: number,
    flightNumber: string,
    date: string
};
var flightBookings:flightInfo[] = [];

const context:OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
        role: 'system',
        content: 'You are a chatbot which helps in flight booking'
    }
]

function getDate() {
    return new Date();
}

function checkAvailableFlights(source: string, destination: string): string[] {
    console.log(`Checking available flights between ${source} and ${destination}`);
    if(source == 'Jamnagar' && destination == 'Ahmedabad') {
        return ['A123','B111'];
    }

    if(source == 'Jamnagar' && destination == 'Surat') {
        return ['A111', 'B567'];
    }

    if(source == 'Jamnagar' && destination == 'Mumbai') {
        return ['A127', 'B111'];
    }
    return [];
}

function bookFlight(flightNumber: string, date: string): number {
    console.log(`Booking flight number ${flightNumber} for ${date}`)
    const bookingID = randomInt(100000);
    console.log(`Your booking ID is: ${bookingID}`);
    flightBookings.push({bookingID, flightNumber, date});
    return bookingID;
}

function getBookings() {
    return flightBookings;
}

async function assistUser() {
    const response = await openai.chat.completions.create({
        model: 'deepseek/deepseek-chat-v3.1:free',
        messages: context,
        tools: [
            {
                type: 'function',
                function: {
                    name: 'getDate',
                    description: 'get date'
                }
            },
            {
                type: 'function',
                function: {
                    name: 'getBookings',
                    description: 'get booked flights details'
                }
            },
            {
                type: 'function',
                function: {
                    name: 'checkAvailableFlights',
                    description: 'To check available flights between source and destination',
                    parameters: {
                        type: 'object',
                        properties: {
                            source: {
                                type: 'string',
                                description: 'The source place of the journey'
                            },
                            destination: {
                                type: 'string',
                                description: 'The destination place of the journey'
                            }
                        },
                        required: ['source', 'destination']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'bookFlight',
                    description: 'To book a flight for a particular date',
                    parameters: {
                        type: 'object',
                        properties: {
                            flightNumber: {
                                type: 'string',
                                description: 'The flight number'
                            },
                            date: {
                                type: 'string',
                                description: 'The date of journey'
                            }
                        },
                        required: ['flightNumber', 'date']
                    }
                }
            }
        ],
        tool_choice: 'auto'
    })
    const finish_reason = response.choices[0].finish_reason;
    const msgContent = response.choices[0].message.content;

    if(finish_reason == 'stop') {
        console.log(msgContent);
        return;
    }

    const willInvokeTool = finish_reason == 'tool_calls';

    if(willInvokeTool) {
        if(!response.choices[0].message.tool_calls) {
            console.log(`Assistant: `+msgContent);
        } else {

            const toolCall = response.choices[0].message.tool_calls![0];
            if(toolCall) {
                const fn = (toolCall as any)['function'];

                if(fn.name == 'getDate') {
                    const toolResponse = getDate().toString();
                    context.push(response.choices[0].message);
                    context.push({
                        role: 'tool',
                        content: toolResponse,
                        tool_call_id: toolCall.id
                    })
                }

                if(fn.name == 'getBookings') {
                    const toolResponse = getBookings().toString();
                    context.push(response.choices[0].message);
                    context.push({
                        role: 'tool',
                        content: toolResponse,
                        tool_call_id: toolCall.id
                    })
                }

                if(fn.name === 'checkAvailableFlights') {
                    const args = JSON.parse(fn.arguments);
                    const toolResponse = checkAvailableFlights(args.source, args.destination);
                    context.push(response.choices[0].message);
                    context.push({
                        role: 'tool',
                        content: toolResponse.toString(),
                        tool_call_id: toolCall.id
                    })
                }

                if(fn.name === 'bookFlight') {
                    const args = JSON.parse(fn.arguments);
                    const toolResponse = bookFlight(args.flightNumber, args.date);
                    context.push(response.choices[0].message);
                    context.push({
                        role: 'tool',
                        content: toolResponse.toString(),
                        tool_call_id: toolCall.id
                    })
                }

            }
        }
    }

    const secondResponse = await openai.chat.completions.create({
        model: 'deepseek/deepseek-chat-v3.1:free',
        messages: context
    })
    console.log(`Assistant: `+secondResponse.choices[0].message.content);
}
console.log("Welcome to flight booking assistant. How may I help you?");
process.stdin.addListener('data', async function(input) {
    const userInput = input.toString().trim();
    context.push({
        role: 'user',
        content: userInput
    });
    await assistUser();
});