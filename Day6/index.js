import { GoogleGenAI,Type } from '@google/genai';
import ReadlineSync from 'readline-sync'
import 'dotenv/config'
import {exec} from 'child_process'
import util from 'util'
import fs from 'fs'





const asyncwriteFile = util.promisify(fs.writeFile)
const execute = util.promisify(exec)
const ai = new GoogleGenAI({})



async function executeCommand({command,content,filePath}) {

    try{
        if(content && filePath){
            await asyncwriteFile(filePath,content)
            return `Success: File Created at ${filePath}`
        }
        else if(command){

            const {stdout,stderr} = await execute(command)
            if(stderr){
                return `Error: ${stderr}`
            }
            return `Success: ${stdout || 'command executed successfully'}`
        }

        return `Error: NO content or command provided`
    }
    catch(error){
        return `Error: ${error.message}`
    }
    
}


const executeInfo = {
    name:'executeCommand',
    description:"Execute commands or create files with content on Windows systems",
    parameters:{
        type:Type.OBJECT,
        properties:{
            command:{
                type:'STRING',
                description:'A Windows terminal command (e.g., "mkdir my-project")'
            },
            content:{
                type:'STRING',
                description:'Complete file content to write (for HTML/CSS/JS files)'
            },
            filePath:{
                type:'STRING',
                description:'Path where file should be created (e.g., "my-project/index.html")'
            }
        },
    }
}

const availableTools = {
   executeCommand
}

const History = [];

async function buildWebsite(problem) {

    History.push({
        role:'user',
        parts:[{text:problem}]
    })

    while(true){

        try{
            const result = await ai.models.generateContent({
                model:'gemini-2.5-flash', 
                contents:History,
                config:{
                systemInstruction:`You are an expert Website builder. Follow these steps:
                        
                        1. FIRST create the project folder: mkdir project-name
                        2. THEN create files with COMPLETE TEMPLATES:
                        - index.html (with basic HTML5 structure)
                        - style.css (with basic styles)
                        - script.js (with basic functionality)
                        
                        IMPORTANT:
                        - Use the 'content' parameter to send COMPLETE file content
                        - Always include the 'filePath' parameter when writing files
                        - For folders, use the 'command' parameter with mkdir
                        - Include proper DOCTYPE, meta tags, and semantic HTML
                        - Include responsive CSS (viewport meta, flexible units)
                        - Include DOMContentLoaded event in JavaScript
                        
                        EXAMPLE for a calculator:
                        1. {command: "mkdir calculator"}
                        2. {content: "<!DOCTYPE html>...", filePath: "calculator/index.html"}
                        3. {content: "body { font-family: Arial...}", filePath: "calculator/style.css"}
                        4. {content: "document.addEventListener...", filePath: "calculator/script.js"}`,
                tools:[{
                        functionDeclarations:[executeInfo]
                    }] 

               }
            });

            if(result.functionCalls?.length>0){


                const {name,args} = result.functionCalls[0]

                if (args.content && args.filePath) {
                    console.log(`Creating file: ${args.filePath}`);
                } 
                else if (args.command) {
                    console.log(`Executing command: ${args.command}`);
                }

                const response = await availableTools[name](args);
                console.log(`Result: ${response}`);


                History.push({
                    role:'model',
                    parts:[
                        {
                            functionCall: result.functionCalls[0]
                        }
                    ]
                })

                History.push({
                    role:'user',
                    parts:[{
                        functionResponse:{
                            name:name,
                            response:{response}
                        }
                    }]
                })
            }
            else{
                History.push({
                    role:'model',
                    parts:[{ text : result.text}]
                })
                console.log(result.text)
                break;
            }
        }
        catch(error){
            console.error("Error:", error);
            break;
        }
    }

    
}

async function main() {
    console.log("🚀 Website Builder - Describe the website you want to create");
    const userProblem = ReadlineSync.question("Your idea: ");
    await buildWebsite(userProblem);
    main();
}

main();