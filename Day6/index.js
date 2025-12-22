import { GoogleGenAI,Type } from '@google/genai';
import ReadlineSync from 'readline-sync'
import 'dotenv/config'
import {exec} from 'child_process'
import util from 'util'
import os from 'os'


const execute = util.promisify(exec)

const platform = os.platform();

const ai = new GoogleGenAI({})



async function executeCommand({command}) {

    try{
        const {stdout,stderr} = await execute(command)

        if(stderr){
            return `Error: ${stderr}`
        }

        return `Success : ${stdout}`
    }
    catch(err){
        return `Error: ${err}`
    }
    
}


const executeInfo = {
    name:'executeCommand',
    description:"It takes any shell/terminal command and execute it. It will help us to create, read, write, update, delete any folder and file",
    parameters:{
        type:Type.OBJECT,
        properties:{
            command:{
                type:Type.STRING,
                description:"It is the terminal/shell command. Ex: mkdir calculator , touch calculator/index.js etc"
            }
        },
        required:['command']
    }
}

const History = [];

async function buildWebsite() {

    let iterations = 0;
    const MAX_ITERATIONS = 20; // ✅ FIX #3 - Add iteration limit

    while(iterations < MAX_ITERATIONS){
        iterations++;

        const result = await ai.models.generateContent({
            model:'gemini-2.5-flash', 
            contents:History,
            config:{
            systemInstruction:` 
            You are a website Builder, which will create the frontend part of the website using terminal/shell Command.
            You will give shell/terminal command one by one and our tool will execute it.

            Give the command according to the Operating system we are using.
            My Current user Operating system is: ${platform}.

            CRITICAL: Write complete file content in ONE command and add code with proper indentation. Do NOT write files line by line.

            Your Job
            1: Analyse the user query
            2: Take the neccessary action after analysing the query by giving proper shell command according to the user operating system.

            Step By Step Guide

            1: First create the folder for the website, ex: mkdir calculator
            2: Create html file,CSS file and Javascript file ex: touch calculator/index.html (or just use the write command directly)
            3: Write COMPLETE html file content in ONE command
            4: Write COMPLETE css file content in ONE command
            5: Write COMPLETE javascript file content in ONE command
            6: Fix errors if present by reading and rewriting files


            Write File Content Examples:

            
            For Windows (PowerShell - use this format)
            
            @"
            <!DOCTYPE html>
            <html>
            <head>
                <title>Calculator</title>
                <link rel="stylesheet" href="style.css">
            </head>
            <body>
                <div id="calculator"></div>
                <script src="script.js"></script>
            </body>
            </html>
            "@ | Out-File -FilePath calculator/index.html -Encoding utf8

            OR if PowerShell is not available, create a temp file and copy:
            
            echo ^<!DOCTYPE html^>^<html^>^<head^>^<title^>Calculator^</title^>^<link rel="stylesheet" href="style.css"^>^</head^>^<body^>^<div id="calculator"^>^</div^>^<script src="script.js"^>^</script^>^</body^>^</html^> > calculator\\index.html
            
            
            For Mac/Linux (use heredoc - this writes everything at once):

            cat > calculator/index.html << 'EOF'
            <!DOCTYPE html>
            <html>
            <head>
                <title>Calculator</title>
                <link rel="stylesheet" href="style.css">
            </head>
            <body>
                <div id="calculator"></div>
                <script src="script.js"></script>
            </body>
            </html>
            EOF

            For CSS files:
            cat > calculator/style.css << 'EOF'
            body { margin: 0; padding: 20px; }
            #calculator { max-width: 400px; margin: 0 auto; }
            EOF

            For JavaScript files:
            cat > calculator/script.js << 'EOF'
            document.getElementById('calculator').innerHTML = 'Calculator App';
            console.log('Calculator loaded');
            EOF
            
                    
            `
            ,
            tools:[
                {
                    functionDeclarations:[executeInfo]
                }
            ] 

           }
        });

        if(result.functionCalls && result.functionCalls.length>0){


            const functionCall = result.functionCalls[0]

            const {name,args} = functionCall

            const toolResponse = await executeCommand(args);


            const functionResponsePart = {
                name:functionCall.name,
                response:{
                    result:toolResponse
                }
            }

            History.push({
                role:'model',
                parts:[
                    {
                        functionCall:functionCall
                    }
                ]
            })

            History.push({
                role:'tool',
                parts:[
                    {
                        functionResponse:functionResponsePart
                    }
                ]
            })

        }
        else{
            History.push({
                role:'model',
                parts:[
                    {
                        text:result.text
                    }
                ]
            })

            console.log(result.text)
            break;
        }
    }

    // ✅ FIX #3 - Handle max iterations
    if(iterations >= MAX_ITERATIONS){
        console.log('\n⚠️ Max iterations reached. Task may be incomplete.');
    }
    
}

while(true){

    const question = ReadlineSync.question('Tell me to Build something: ')

    if(question.toLowerCase() === 'exit') // ✅ Better comparison
        break;

    History.push({
        role:'user',
        parts:[
            {
                text:question
            }
        ]
    })

    await buildWebsite()
}