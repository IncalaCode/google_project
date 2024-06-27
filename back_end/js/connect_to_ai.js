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

    // Example method to initiate the process
    async run(fileInput) {
        try {
            const generatedText = await this.textGen(fileInput);
            // Handle or use generatedText as needed
        } catch (error) {
            console.error('Error running AI process:', error);
        }
    }

    async generateQuestions() {

    }
}
