import { GoogleGenAI } from "@google/genai";
import 'dotenv/config'

const ai = new GoogleGenAI({});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "What is current date and my name?",
    config:{
        systemInstruction:`your name is Harshit Vashisht , current date is: ${new Date.now()}`
    }
  });
  console.log(response.text);
}

await main();