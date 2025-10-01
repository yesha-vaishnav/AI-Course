import { OpenAI } from 'openai';

const openAI = new OpenAI({baseURL: "https://openrouter.ai/api/v1"});

const context:OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
        role: 'system',
        content: 'You are a helpful chatbot'
    }
]

function getDate() {
    return new Date().getDate();
}

function getOrderStatus(orderId: string) {
    console.log("Getting status of order ID: "+orderId);
    const orderNumber = parseInt(orderId);
    if(orderNumber % 2 == 0) {
        return 'IN PROGRESS';
    } else {
        return 'COMPLETE';
    }
}

async function callOpenAIWithTools() {

    const response = await openAI.chat.completions.create({
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
                    name: 'getOrderStatus',
                    description: 'Returns status of order',
                    parameters: {
                        type: 'object',
                        properties: {
                            orderId: {
                                type: 'string',
                                description: 'The id of the order to fetch status'
                            }
                        },
                        required: ['orderId']
                    }
                }
            }
        ],
        tool_choice: 'auto'
    })

    const willInvokeTool = response.choices[0].finish_reason == 'tool_calls';
    const toolCall = response.choices[0].message.tool_calls![0];
    if(willInvokeTool && toolCall) {
        
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

        if(fn.name == 'getOrderStatus') {
            const toolResponse = getOrderStatus(JSON.parse(fn.arguments).orderId);
            context.push(response.choices[0].message);
            context.push({
                role: 'tool',
                content: toolResponse,
                tool_call_id: toolCall.id
            })
        }
    }

    const secondResponse = await openAI.chat.completions.create({
        model: 'deepseek/deepseek-chat-v3.1:free',
        messages: context
    })
    console.log(`Assistant: `+secondResponse.choices[0].message.content);
}

process.stdin.addListener('data', async function(input) {
    const userInput = input.toString().trim();
    context.push({
        role: 'user',
        content: userInput
    })
    await callOpenAIWithTools();
    
})
// callOpenAIWithTools();