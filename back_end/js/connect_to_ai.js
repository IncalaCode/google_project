import NotyfService from "./message.shower.js";

class errorcount {
    static count = 0
}

export default class ImportAI {
    constructor() {
        this.apiKey = window.process.env.api_key;
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        this.history = ""
        this.fphistory = ""
    }

    async callGemini(text) {
        const response = await fetch(this.baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': this.apiKey
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: text
                    }]
                }]
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    save(history) {
        this.history = JSON.stringify(history);
    }

    async img_convert_text(fileInput) {
        console.log('Image processing not implemented for direct API calls');
        return 'Image processing not available';
    }

    async generateQuestions(focus_points, type, difficulty) {
        let typeSpecificInstruction = '';

        switch (type) {
            case 'choose':
                typeSpecificInstruction = `The question should have 3-5 answer choices labeled as A, B, C, etc. Example: ["A. Choice 1", "B. Choice 2", "C. Choice 3"]. Choices must always be included.`;
                break;
            case 't_f':
                typeSpecificInstruction = `The question should be a statement that can be answered with "True" or "False".`;
                break;
            case 'match':
                typeSpecificInstruction = `The question should have pairs of items to match, with each pair consisting of a question and an answer. Example: { "questions": ["Q1"], "answers": ["A1"] }. The questions must be short.`;
                break;
            case 'short_answer':
                typeSpecificInstruction = `The question should be open-ended, requiring a brief text response.`;
                break;
            case 'essay':
                typeSpecificInstruction = `The question should require a detailed and comprehensive response, typically a few paragraphs long.`;
                break;
            default:
                console.error('Unknown question type:', type);
                return '';
        }

        const prompt = `You are an expert in creating educational content. Generate a question based on:
        
        Information: ${focus_points}
        Question Type: ${type}
        Difficulty: ${difficulty}
        Previous topics: ${this.fphistory}
        Instructions: ${typeSpecificInstruction}
        
        Return only valid JSON:
        {
            "question": ""${(type === 'choose' || type === 'match') ? ', "choice": []' : ''},
            "answer": "",
            "explanation": ""
        }`;

        this.fphistory = this.fphistory + " " + focus_points;

        try {
            const text = await this.callGemini(prompt);
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
                await new Promise(resolve => setTimeout(resolve, 16000));
                NotyfService.showMessage('loading', "Continuing to generate");
            } else {
                NotyfService.showMessage('info', "It will take some time to be present.", false, false);
                NotyfService.showMessage('loading', "Continuing to generate");
            }
            console.error(error);
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
            const prompt = `Generate a 2000 word article about "${value}"`;
            const text = await this.callGemini(prompt);
            return text;
        } catch (e) {
            NotyfService.dismiss('loading', "wait a litle bit generating");
            if (errorcount.count > 2) {
                throw NotyfService.showMessage('error', "try again the Input");
            }
            return this.genrateDox(value);
        }
    }

    async getchat(value, get) {
        NotyfService.showMessage('info', "Running in the background");
        const prompt = `Chat history: ${this.history}\nUser question: ${value}\n\nPlease answer the user's question based on the chat history. Be helpful and supportive.`;
        const text = await this.callGemini(prompt);
        
        this.history += `,[user : ${value}]`;
        document.getElementById('chatPopup').style.display = 'block';
        
        return text;
    }

    async get_suggestion(value) {
        const prompt = `Make 5 suggestions about the topic "${value}". Return only valid JSON format:
[{"word": "suggestion1", "reference": "https://example.com/ref1"}, {"word": "suggestion2", "reference": "https://example.com/ref2"}, {"word": "suggestion3", "reference": "https://example.com/ref3"}, {"word": "suggestion4", "reference": "https://example.com/ref4"}, {"word": "suggestion5", "reference": "https://example.com/ref5"}]`;
        const text = await this.callGemini(prompt);
        console.log(text);
        return this.parseJsonFromText_list(text);
    }

    parseJsonFromText_list(text) {
        const startIndex = text.indexOf('[');
        const endIndex = text.lastIndexOf(']');
        const trimmedJsonData = text.substring(startIndex, endIndex + 1);
        console.log(trimmedJsonData);
        const parsedData = JSON.parse(trimmedJsonData);
        return parsedData;
    }
}