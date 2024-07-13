import { GoogleGenerativeAI } from "@google/generative-ai";

export default class ImportAI {
    constructor() {
        this.genAI = new GoogleGenerativeAI("AIzaSyDTYPNXHwNE5nA5-uHRnBhS_mCXJSoDHXQ"); // Replace with your actual API key
        // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        this.history = ""
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
    
        Information: [${focus_points}]
        Question Type: [${type}]
        Difficulty Level: [${difficulty}]
        ${typeSpecificInstruction}
    
        Return the question only in JSON format, with the following structure:
    
        {
            "question": ""${(type === 'choose' || type === 'match') ? ', "choice": []' : ''},
            "answer": "",
            "explanation": ""
        }`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log(text)
        return text

    }


    async genrateDox(value) {
        const prompt = `generate a 2000 word article about "${value}"`
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return text

    }
    async getchat(value, get) {
        const prompt = `{chat_history : "${this.history},now_user_prompt : ${value}} from the bove json put the history_chat at memory to help you
        to answer the user question and only return the anwer and if you dont have any json string answer the user  as be chat suporter`
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        this.history += `,[user : ${value}]`

        if (get) {
            document.getElementById('').classList.add('')
        }
        return text

    }


}
