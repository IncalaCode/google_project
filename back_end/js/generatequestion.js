import ImportAI from "./connect_to_ai.js";
import NotyfService from './message.shower.js';

class GeneratedText {
    constructor() {
        this.question_type = {
            t_f: [],
            match: [],
            choose: [],
            short_answer: [],
            essay: []
        };

        this.info = {
            question_mode: {
                exam: { easy: [], medium: [], hard: [], default: [] },
                quiz: { easy: [], medium: [], hard: [], default: [] },
                essay: { easy: [], medium: [], hard: [], default: [] },
                test: { easy: [], medium: [], hard: [], default: [] }
            }
        };

        this.history = {
            docx: {
                full_doc: null,
                focus_points: [],
                lastClassifiedText: null,
                versions: []
            },
            full_history_data: []
        };
    }

    classifyWords(text, numQuestions) {
        const words = text.split(/\s+/);
        const totalWords = words.length;

        // Calculate maximum word limits based on numQuestions
        const wordLimits = {
            t_f: totalWords * 0.55 / numQuestions,
            match: totalWords * 0.70 / numQuestions,
            choose: totalWords * 0.80 / numQuestions,
            short_answer: totalWords * 0.90 / numQuestions,
            essay: totalWords * 1 / numQuestions
        };

        let currentWords = [];
        let currentQuestionType = 't_f';

        const questionTypes = Object.keys(wordLimits);
        let questionTypeIndex = 0;

        words.forEach(word => {
            currentWords.push(word);

            if (currentWords.length >= wordLimits[currentQuestionType]) {
                const spanText = currentWords.join(' ');
                this.history.docx.focus_points.push({ text: spanText, type: currentQuestionType });
                this.question_type[currentQuestionType].push(spanText);
                currentWords = [];

                questionTypeIndex = (questionTypeIndex + 1) % questionTypes.length;
                currentQuestionType = questionTypes[questionTypeIndex];
            }
        });

        if (currentWords.length > 0) {
            const spanText = currentWords.join(' ');
            this.history.docx.focus_points.push({ text: spanText, type: currentQuestionType });
            this.question_type[currentQuestionType].push(spanText);
        }

        this.saveVersion(); // Save current version after classification
    }

    hasDocumentChanged(newText) {
        if (newText !== this.history.docx.lastClassifiedText) {
            this.history.docx.lastClassifiedText = newText;
            return true;
        }
        return false;
    }

    findFocusPoint() {
        const spans = document.getElementById('display_list').querySelectorAll('focus_point');
        return spans.length > 0 ? Array.from(spans).map(span => span.innerText).join(' ') : false;
    }

    addRule(numQuestions) {
        const focusPoints = this.findFocusPoint() || this.history.docx.full_doc;
        if (!focusPoints) {
            NotyfService.showMessage('error', 'No document content available for classification.');
            return;
        }

        if (!this.hasDocumentChanged(focusPoints)) {
            NotyfService.showMessage('info', 'Document content unchanged. Skipping reclassification.');
            return;
        }

        this.classifyWords(focusPoints, numQuestions);
    }

    async arrangeQuestons(numQuestions, difficulty, mode, selectedTypes) {
        let remainingQuestions = numQuestions;
        let selectedQuestions = [];

        const totalAvailableQuestions = selectedTypes.reduce((sum, type) => sum + this.question_type[type].length, 0);

        if (totalAvailableQuestions < numQuestions) {
            NotyfService.showMessage('warning', 'Not enough questions available to fulfill the request.');
            remainingQuestions = totalAvailableQuestions;
        }

        const ai = new ImportAI();

        while (remainingQuestions > 0) {
            for (const type of selectedTypes) {
                if (this.question_type[type].length > 0 && remainingQuestions > 0) {
                    const focusPoint = this.question_type[type].shift();
                    const generatedQuestion = await ai.generateQuestions(focusPoint, type);
                    selectedQuestions.push({ text: generatedQuestion, type: type });
                    remainingQuestions--;
                }
            }
        }

        this.info.question_mode[mode][difficulty] = selectedQuestions;

        this.saveVersion(); // Save current version after generating questions
    }

    saveVersion() {
        const currentVersion = {
            question_type: { ...this.question_type },
            info: { ...this.info },
            timestamp: new Date().toLocaleString()
        };

        this.history.docx.versions.push(currentVersion);
        this.displayVersions(); // Update displayed versions after saving
    }

    rollbackToVersion(versionIndex) {
        if (versionIndex >= 0 && versionIndex < this.history.docx.versions.length) {
            const version = this.history.docx.versions[versionIndex];
            this.question_type = { ...version.question_type };
            this.info = { ...version.info };
            NotyfService.showMessage('info', `Rolled back to version ${versionIndex}`);
        } else {
            NotyfService.showMessage('error', 'Invalid version index.');
        }
    }

    displayVersions() {
        const versionContainer = document.getElementById('versionContainer');
        versionContainer.innerHTML = '';

        this.history.docx.versions.forEach((version, index) => {
            const button = document.createElement('button');
            button.textContent = `Version ${index}: ${version.timestamp}`;
            button.classList.add('version-button');
            button.addEventListener('click', () => {
                this.rollbackToVersion(index);
            });
            versionContainer.appendChild(button);

            // Display details of each version
            const versionDetails = document.createElement('div');
            versionDetails.classList.add('version-details');
            versionDetails.innerHTML = `
                <p><strong>Version ${index} Details:</strong></p>
                <ul>
                    <li><strong>Question Type:</strong> ${JSON.stringify(version.question_type)}</li>
                    <li style='display:none;'><strong>Info:</strong> ${JSON.stringify(version.info)}</li>
                </ul>
            `;
            versionContainer.appendChild(versionDetails);
        });
    }

    save() {
        const currentState = {
            docx: { ...this.history.docx },
            info: { ...this.info }
        };
        this.history.full_history_data.push(currentState);
        console.log('Current state saved:', this.history.full_history_data);
    }

    async generateQuestions_ai(mode, difficulty) {
        const ai = new ImportAI();
        const questions = this.info.question_mode[mode][difficulty];

        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            question.text = await ai.generateQuestions(question.text, question.type);
        }
    }

}

function getUserInputsAndApplyRules(data) {
    const difficulty = document.getElementById('difficulty').value;
    const numQuestions = parseInt(document.getElementById('numQuestions').value, 10);
    const modeElement = document.querySelector('input[name="questionMode"]:checked');

    if (!modeElement) {
        NotyfService.showMessage('warning', 'Please select a question mode.');
        return null;
    }

    const mode = modeElement.value;
    const selectedTypes = [];
    document.querySelectorAll('.form-check-input:checked').forEach(checkbox => {
        selectedTypes.push(checkbox.value);
    });

    const modeCheckbox = document.getElementById(`mode${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
    if (modeCheckbox) {
        const modeDifficulty = modeCheckbox.dataset.difficulty;

        if (difficulty) {
            data.addRule(numQuestions);
        } else {
            data.addRule(numQuestions);
        }
    }

    return { numQuestions, difficulty, mode, selectedTypes };
}
//generate button clicked
document.getElementById('generatequestion').addEventListener('click', generate)


export async function generate() {
    try {
        NotyfService.showMessage('loading', "started to generate the question", true)
        const data = new GeneratedText();
        data.history.docx.full_doc = document.getElementById('display_list').innerText.trim();

        const userInput = getUserInputsAndApplyRules(data);
        if (!userInput) return;

        const { numQuestions, difficulty, mode, selectedTypes } = userInput;

        await data.arrangeQuestons(numQuestions, difficulty, mode, selectedTypes);
        await data.generateQuestions_ai(mode, difficulty);

        displayGeneratedQuestions(data.info.question_mode[mode][difficulty]);

        data.save();
        NotyfService.dismiss('success', "finsied generating the question")
    } catch (error) {
        NotyfService.showMessage('warning', 'Error occurred while generating questions.');
        console.error(error);
    }
};

// function showMessage(type, message) {
//     console.log(`${type}: ${message}`);
// }

function displayGeneratedQuestions(questions) {
    questions.sort((a, b) => {
        const order = ['t_f', 'match', 'choose', 'short_answer', 'essay'];
        return order.indexOf(a.type) - order.indexOf(b.type);
    });

    const container = document.getElementById('generatedQuestions');
    container.innerHTML = '';
    questions.forEach(question => {
        const div = document.createElement('div');
        div.className = 'card mt-2';
        div.innerHTML = `
            <div class="card-body">
                <p class="card-text">${question.text}</p>
                <p class="card-text"><strong>Type:</strong> ${question.type}</p>
            </div>
        `;
        container.appendChild(div);
    });
}




/// chat bot

// Respond to user input
document.addEventListener('DOMContentLoaded', function () {
    var chatInput = document.getElementById('chat_bot_input');
    var chatMessages = document.getElementById('chatMessages');
    var sendButton = document.getElementById('sendButton');

    // Function to add a new message to the chat
    function addMessage(author, text, isUser = true, isLoading = false) {
        var messageDiv = document.createElement('div');
        messageDiv.classList.add('chatbot-message', isUser ? 'user' : isLoading ? 'loading' : 'bot');

        var messageText = document.createElement('div');
        messageText.textContent = text;

        messageDiv.appendChild(messageText);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
    }

    // Function to determine bot response
    function getBotResponse(userText) {
        userText = userText.toLowerCase();
        if (userText.includes('menu')) {
            return "Sure, here is the menu: \n1. Pizza \n2. Pasta \n3. Salad";
        } else if (userText.includes('order')) {
            return "What would you like to order?";
        } else if (userText.includes('thank you') || userText.includes('thanks')) {
            return "You're welcome! Enjoy your meal!";
        } else if (userText.includes('hello') || userText.includes('hi')) {
            return "Hello! How can I assist you today?";
        } else {
            return "I'm here to help. You can ask for the menu or place an order.";
        }
    }

    // Function to show the bot response with a loading indicator
    function showBotMessage(userText) {
        addMessage('User', userText, true);
        addMessage('Bot', 'Typing...', false, true);

        setTimeout(function () {
            // Remove the loading message
            var loadingMessage = document.querySelector('.chatbot-message.loading');
            if (loadingMessage) {
                loadingMessage.remove();
            }

            let botResponse = getBotResponse(userText);
            addMessage('Bot', botResponse, false);
        }, 1000); // Simulate a delay for bot response
    }

    // Event listener for the input field
    chatInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            let userInput = this.value.trim();
            if (userInput) {
                showBotMessage(userInput);
                this.value = '';
            }
        }
    });

    // Event listener for the send button
    sendButton.addEventListener('click', function () {
        let userInput = chatInput.value.trim();
        if (userInput) {
            showBotMessage(userInput);
            chatInput.value = '';
        }
    });
});