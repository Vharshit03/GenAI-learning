import { GoogleGenAI, Type } from '@google/genai';
import ReadlineSync from 'readline-sync';
import 'dotenv/config';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import util from 'util';
import os from 'os';

const execute = util.promisify(exec);
const platform = os.platform();
const ai = new GoogleGenAI({});

// Function to execute shell commands
async function executeCommand({ command }) {
    try {
        const { stdout, stderr } = await execute(command);
        if (stderr && !stdout) {
            return `Error: ${stderr}`;
        }
        return `Success: ${stdout || 'Command executed successfully'}`;
    } catch (err) {
        return `Error: ${err.message}`;
    }
}

// Function to write file content (BETTER APPROACH)
async function writeFile({ filePath, content }) {
    try {
        const dir = path.dirname(filePath);
        // Ensure directory exists
        await fs.mkdir(dir, { recursive: true });
        // Write entire file content at once
        await fs.writeFile(filePath, content, 'utf8');
        return `Success: File ${filePath} written successfully with ${content.length} characters`;
    } catch (err) {
        return `Error: ${err.message}`;
    }
}

// Function to create directory
async function createDirectory({ dirPath }) {
    try {
        await fs.mkdir(dirPath, { recursive: true });
        return `Success: Directory ${dirPath} created successfully`;
    } catch (err) {
        return `Error: ${err.message}`;
    }
}

// Function to read file
async function readFile({ filePath }) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        return `Success: ${content}`;
    } catch (err) {
        return `Error: ${err.message}`;
    }
}

// Tool definitions
const executeCommandInfo = {
    name: 'executeCommand',
    description: 'Executes shell/terminal commands. Use for operations like opening browser, running npm commands, etc.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            command: {
                type: Type.STRING,
                description: 'Terminal/shell command to execute'
            }
        },
        required: ['command']
    }
};

const writeFileInfo = {
    name: 'writeFile',
    description: 'Writes complete file content in one operation. Use this to create and write HTML, CSS, JavaScript files with full content.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            filePath: {
                type: Type.STRING,
                description: 'Full path of the file to write (e.g., "calculator/index.html")'
            },
            content: {
                type: Type.STRING,
                description: 'Complete content to write to the file. Write the entire HTML/CSS/JS code here.'
            }
        },
        required: ['filePath', 'content']
    }
};

const createDirectoryInfo = {
    name: 'createDirectory',
    description: 'Creates a directory/folder',
    parameters: {
        type: Type.OBJECT,
        properties: {
            dirPath: {
                type: Type.STRING,
                description: 'Path of directory to create'
            }
        },
        required: ['dirPath']
    }
};

const readFileInfo = {
    name: 'readFile',
    description: 'Reads content of a file',
    parameters: {
        type: Type.OBJECT,
        properties: {
            filePath: {
                type: Type.STRING,
                description: 'Path of file to read'
            }
        },
        required: ['filePath']
    }
};

const History = [];
const MAX_ITERATIONS = 20; // Prevent infinite loops

async function buildWebsite() {
    let iterations = 0;

    while (iterations < MAX_ITERATIONS) {
        iterations++;

        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: History,
            config: {
                systemInstruction: `
                You are an expert website builder that creates frontend websites using provided tools.

                **CRITICAL RULES:**
                1. Use the writeFile tool to write COMPLETE file content in ONE operation
                2. NEVER write files line by line
                3. Always write the ENTIRE HTML/CSS/JavaScript code in a single writeFile call
                4. Current OS: ${platform}

                **Workflow:**
                1. Use createDirectory to create project folder
                2. Use writeFile to create index.html with COMPLETE HTML content
                3. Use writeFile to create style.css with COMPLETE CSS content  
                4. Use writeFile to create script.js with COMPLETE JavaScript content
                5. If errors occur, use readFile to check content, then use writeFile to fix

                **Example:**
                Step 1: createDirectory({ dirPath: "calculator" })
                Step 2: writeFile({ 
                    filePath: "calculator/index.html", 
                    content: "<!DOCTYPE html>\\n<html>\\n<head>\\n<title>Calculator</title>\\n<link rel=\\"stylesheet\\" href=\\"style.css\\">\\n</head>\\n<body>\\n<div id=\\"calculator\\"></div>\\n<script src=\\"script.js\\"></script>\\n</body>\\n</html>"
                })

                Write production-quality, complete, functional code. Be efficient - use minimum tool calls needed.
`,
                tools: [{
                    functionDeclarations: [
                        createDirectoryInfo,
                        writeFileInfo,
                        readFileInfo,
                        executeCommandInfo
                    ]
                }]
            }
        });

        if (result.functionCalls && result.functionCalls.length > 0) {
            const functionCall = result.functionCalls[0];
            const { name, args } = functionCall;

            // Execute the appropriate function
            let toolResponse;
            switch (name) {
                case 'executeCommand':
                    toolResponse = await executeCommand(args);
                    break;
                case 'writeFile':
                    toolResponse = await writeFile(args);
                    break;
                case 'createDirectory':
                    toolResponse = await createDirectory(args);
                    break;
                case 'readFile':
                    toolResponse = await readFile(args);
                    break;
                default:
                    toolResponse = 'Error: Unknown function';
            }

            console.log(`[Tool: ${name}]`, toolResponse);

            // Add function call to history
            History.push({
                role: 'model',
                parts: [{ functionCall: functionCall }]
            });

            // Add function response to history
            History.push({
                role: 'tool',
                parts: [{
                    functionResponse: {
                        name: functionCall.name,
                        response: { result: toolResponse }
                    }
                }]
            });
        } else {
            // Model has finished - no more function calls
            History.push({
                role: 'model',
                parts: [{ text: result.text }]
            });

            console.log('\n' + result.text);
            break;
        }
    }

    if (iterations >= MAX_ITERATIONS) {
        console.log('\n⚠️  Max iterations reached. The task may be incomplete.');
    }
}

// Main loop
console.log('Website Builder with LLM');
console.log('Type "exit" to quit\n');

while (true) {
    const question = ReadlineSync.question('Tell me to build something: ');

    if (question.toLowerCase() === 'exit') {
        break;
    }

    History.push({
        role: 'user',
        parts: [{ text: question }]
    });

    await buildWebsite();
    console.log('\n---\n');
}