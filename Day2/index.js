import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config'

const ai = new GoogleGenerativeAI({});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "What is current date and my name?",
    config:{
        systemInstruction:`your name is Harshit Vashisht , current date is: ${new Date().toLocaleDateString()}`
    }
  });
  console.log(response.text);
}

await main();