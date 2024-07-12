import { GoogleGenerativeAI } from "@google/generative-ai";

export default class ImportAI {
    constructor() {
        this.genAI = new GoogleGenerativeAI("AIzaSyDTYPNXHwNE5nA5-uHRnBhS_mCXJSoDHXQ"); // Replace with your actual API key
        // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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

        const prompt =
            `You're a meticulous and thorough information processing expert with a keen eye for detail.
                     You have been trained on a vast amount of text data and are well-versed in generating precise and relevant questions from given information.
                        Your task is to generate questions based on the input provided.

                        Please use the following information to generate one question:

                        Information: [${focus_points}]
                        Question Type: [${type}]
                        Difficulty Level: [${difficulty}]
                        ${(type == 'choose') ? "choice must be : [A-Z](3,5) : 'choice here' " : ""}

                        Return the question only in  JSON format, with the following structure:

                        { "question": ""${(type == 'choose') ? ",choice : []" : ""}, "answer": "", "explanation": "" }`



        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();


        return text

    }
    async genrateDox(value) {
        const prompt = `generate a 2000 word article about "${value}"`
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return text

    }


}
