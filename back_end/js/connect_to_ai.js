import { GoogleGenerativeAI } from "@google/generative-ai";
import NotyfService from "./message.shower.js";

class errorcount {
    static count = 0
}


export default class ImportAI {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.api_key); // Replace with your actual API key
        // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
        // Initialize the Gemini 1.5 model with specific safety settings
        this.model = this.genAI.getGenerativeModel(
            {
                model: "gemini-1.5-flash" // Specify the model to be used
            },
            {
                safety_settings: {
                    'HATE': 'BLOCK_NONE', // No blocking for hate speech
                    'HARASSMENT': 'BLOCK_NONE', // No blocking for harassment
                    'SEXUAL': 'BLOCK_NONE', // No blocking for sexual content
                    'DANGEROUS': 'BLOCK_NONE' // No blocking for dangerous behavior
                }
            }
        );

        this.history = ""
        this.fphistory = ""
    }

    // Function to convert a base64-encoded image string to a GoogleGenerativeAI.Part object
    async fileToGenerativePart(imageDataUrl) {
        // Split the base64-encoded data from the data URL
        const base64EncodedData = imageDataUrl.split(',')[1];

        // Determine the MIME type from the data URL
        const mimeType = imageDataUrl.split(':')[1].split(';')[0];

        // Return GenerativeAI.Part object with inline data
        return {
            inlineData: { data: base64EncodedData, mimeType: mimeType },
        };
    }

    save(history) {
        this.history = JSON.stringify(history)
    }

    async img_convert_text(fileInput) {
        // Convert each selected file to GenerativeAI.Part object asynchronously
        const imageParts = await this.fileToGenerativePart(fileInput)


        // Define the prompt for the generative model
        const prompt = "describe this image from top to bottom";

        try {
            // Generate content using prompt and image parts
            const result = await this.model.generateContent([prompt, imageParts]);

            // Extract text response from the result
            const responseText = await result.response.text();
            console.log(responseText); // Log the generated text response

            return responseText; // Return the generated text response if needed
        } catch (error) {
            console.error('Error generating content:', error);
            return null; // Handle error as needed
        }
    }


    async generateQuestions(focus_points, type, difficulty) {
        let typeSpecificInstruction = '';

        switch (type) {
            case 'choose':
                typeSpecificInstruction = `
                The question should have 3-5 answer choices labeled as A, B, C, etc.
                Example: ["A. Choice 1", "B. Choice 2", "C. Choice 3"]. Choices must always be included.`;
                break;
            case 't_f':
                typeSpecificInstruction = `
                The question should be a statement that can be answered with "True" or "False".`;
                break;
            case 'match':
                typeSpecificInstruction = `
                The question should have pairs of items to match, with each pair consisting of a question and an answer.
                Example: { "questions": ["Q1"], "answers": ["A1"] }. The questions must be short.`;
                break;
            case 'short_answer':
                typeSpecificInstruction = `
                The question should be open-ended, requiring a brief text response.`;
                break;
            case 'essay':
                typeSpecificInstruction = `
                The question should require a detailed and comprehensive response, typically a few paragraphs long.`;
                break;
            default:
                console.error('Unknown question type:', type);
                return '';
        }

        prompt = `You are an expert in creating educational content, and your task is to generate a question based on the provided information.
    
        Please use the following information to generate a question:
    
        Information(foucs point): [${focus_points}]
        Question Type: [${type}]
        Difficulty Level: [${difficulty}]
        history of focus points [${this.fphistory}]
        typeSpecificInstruction :[${typeSpecificInstruction}]
    
        Return the question only in JSON format, with the following structure:
    
        {
            "question": ""${(type === 'choose' || type === 'match') ? ', "choice": []' : ''},
            "answer": "",
            "explanation": ""
        }`;

        this.fphistory = this.fphistory + " " + focus_points

        try {

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = await response.text();
            const parsedText = this.parseJsonFromText(text);
            console.log(parsedText);
            errorcount.count = 0;
            return parsedText;
        } catch (error) {
            errorcount.count++;
            if (errorcount.count == 1) {
                errorcount.count = 0;
                NotyfService.showMessage('error', `Error: ${error.message} !!`);
                NotyfService.showMessage('info', "the more you ask the more you wait ;).");
                await new Promise(resolve => setTimeout(resolve, 16000)); // Wait for 16 seconds
                NotyfService.showMessage('loading', "Continuing to generate");
            } else {
                NotyfService.showMessage('info', "It will take some time to be present.", false, false);
                NotyfService.showMessage('loading', "Continuing to generate");
            }

            console.error(error);
            // Retry the request
            return this.generateQuestions(focus_points, type, difficulty);
        }

    }
    parseJsonFromText(text) {
        const startIndex = text.indexOf('{');
        const endIndex = text.lastIndexOf('}');
        const trimmedJsonData = text.substring(startIndex, endIndex + 1);
        const parsedData = JSON.parse(trimmedJsonData.trim());
        return parsedData;

    }


    async genrateDox(value) {
        try {
            const prompt = `generate a 2000 word article about "${value}"`
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            return text
        } catch (e) {
            NotyfService.dismiss('loading', "wait a litle bit generating")
            if (errorcount.count > 2) {
                throw NotyfService.showMessage('error', "try again the Input")
            }
            this.genrateDox(value)
        }
    }
    async getchat(value, get) {
        NotyfService.showMessage('info', "Running in the background")
        const prompt = `{chat_history : "${this.history},now_user_prompt : ${value}} from the bove json put the history_chat at memory to help you
        to answer the user question and only return the anwer and if you dont have any json string answer the user  as be chat suporter`
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        this.history += `,[user : ${value}]`


        document.getElementById('chatPopup').style.display = 'block'

        return text

    }

    async get_suggestion(value) {
        const prompt = `
        make a 5 suggestion a about this topic or word and the word or topic is [ ${value}]  and  return only this in this json format with there reference for exmaple 
    [ { word: 'topic_suggetion', reference: 'https://example.com/apple' },
       { word: 'topic_suggetion', reference: 'https://example.com/apple' },... until 5 suggestion]
        `
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(text)
        return this.parseJsonFromText_list(text)
    }

    parseJsonFromText_list(text) {
        const startIndex = text.indexOf('[');
        const endIndex = text.lastIndexOf(']');
        const trimmedJsonData = text.substring(startIndex, endIndex + 1);
        console.log(trimmedJsonData)
        const parsedData = JSON.parse(trimmedJsonData);
        return parsedData;
    }


}

