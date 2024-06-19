import { GoogleGenerativeAI } from "@google/generative-ai";

export default class import_ai {
    import_ai() {
        genAI = new GoogleGenerativeAI("AIzaSyDTYPNXHwNE5nA5-uHRnBhS_mCXJSoDHXQ");
    }

    async img_convert_text() {

    }

    async text_gen() {
        // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "what is your name."

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(text);

        return text;

    }
}

