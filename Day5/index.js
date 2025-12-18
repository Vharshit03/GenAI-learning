import { GoogleGenAI,Type } from '@google/genai';
import ReadlineSync from 'readline-sync'
import 'dotenv/config'



const ai = new GoogleGenAI({});



async function cryptoCurrency({coin}) {

    const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&ids=${coin}`)
    const data = await response.json();
    return data;
    
}

async function weatherInformation({city}) {

    const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=d6a3bcd7a43c4ed59c2155208252404&q=${city}&aqi=no`)
    const data = await response.json();
    return data;
    
}


const cryptoInfo = {
    name:'cryptoCurrency',
    description:'you can get current crypto price and related information like bitcoin,etherium,etc',
    parameters:{
        type:Type.OBJECT,
        properties:{
            coin:{
                type:Type.STRING,
                description:'It will be the name of crypto currency like bitcoin,ethereum,etc',
            }
        },
        required:['coin']
    }
}

const weatherInfo = {
    name:'weatherInformation',
    description:'you can get current weather information of any city like london,etc',
    parameters:{
        type:Type.OBJECT,
        properties:{
            city:{
                type:Type.STRING,
                description:' name of city for which i have to fetch current weather information  like goa,london,etc',
            }
        },
        required:['city']
    }
}

const tools = [
    {
        functionDeclarations:[cryptoInfo,weatherInfo]
    }
]

const toolfunctions = {
    "cryptoCurrency":cryptoCurrency,
    "weatherInformation":weatherInformation

}
const History = [];


async function runAgent(){

    while(true){

        const result = await ai.models.generateContent({
            model:'gemini-2.5-flash',
            contents:History,
            config: {tools}
        });

        if(result.functionCalls && result.functionCalls.length > 0){
            
            console.log('Function called')
            // const functionCall = result.functionCalls[0]

            // const {name,args} = functionCall

            // const toolResponse = await toolfunctions[name](args);

            // const functionResponsePart = {
            //     name:functionCall.name,
            //     response:{
            //         result:toolResponse
            //     }
            // }

            // History.push({
            //     role:"model",
            //     parts:[{functionCall:functionCall}]
            // });

            // History.push({
            //     role:'tool',
            //     parts:[{functionResponse:functionResponsePart}]
            // });
            const toolParts = [];

            for (const call of result.functionCalls) {
              const { name, args } = call;
    
              // Execute the tool
               const toolResponse = await toolfunctions[name](args);
    
               console.log(`Executed ${name}`);

              // Prepare the response part
              toolParts.push({
              functionResponse: {
              name: name,
              response: { result: toolResponse }
              }
              });
            }

            // 2. Push the Model's request to history (it contains the list of calls)
            History.push({
                role: "model",
                parts: result.functionCalls.map(call => ({ functionCall: call }))
            });

            // 3. Push ALL tool results back to history at once
            History.push({
                role: 'tool',
                parts: toolParts
            });
        }
        else{
            History.push({
                role:'model',
                parts:[{text:result.text}]
            });
            console.log(result.text)
            break;

        }

    }
}

while(true){

    const question = ReadlineSync.question('Ask me anything: ')

    if(question=='exit'){
       break;
    }
        

    
    History.push({
        role:'user',
        parts:[{text:question}]
    });

    await runAgent();

}