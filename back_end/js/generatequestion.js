import ImportAI from "./connect_to_ai.js";
import NotyfService from './message.shower.js';
import createCard from './display_questions.js'

const ai = new ImportAI();


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
                // essay: { easy: [], medium: [], hard: [], default: [] },
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

    classifyWords(text, numQuestions, selectedTypes) {
        const words = text.split(/\s+/);
        const totalWords = words.length;
        console.log(selectedTypes)

        // Initialize wordLimits based on selectedTypes and numQuestions
        const wordLimits = {};

        Array.from(selectedTypes).forEach(type => {
            switch (type) {
                case 't_f':
                    wordLimits[type] = totalWords * 0.55 / numQuestions;
                    break;
                case 'match':
                    wordLimits[type] = totalWords * 0.70 / numQuestions;
                    break;
                case 'choose':
                    wordLimits[type] = totalWords * 0.80 / numQuestions;
                    break;
                case 'short_answer':
                    wordLimits[type] = totalWords * 0.90 / numQuestions;
                    break;
                case 'essay':
                    wordLimits[type] = totalWords * 1 / numQuestions;
                    break;
                default:
                    break;
            }
        });

        let currentWords = [];
        let currentQuestionType = selectedTypes[0]; // Start with the first selected type

        let questionTypeIndex = 0;

        words.forEach(word => {
            currentWords.push(word);

            // Check if currentQuestionType matches the type being processed
            const maxWords = wordLimits[currentQuestionType];
            if (currentWords.length >= maxWords) {
                const spanText = currentWords.join(' ');
                this.history.docx.focus_points.push({ text: spanText, type: currentQuestionType });
                this.question_type[currentQuestionType].push(spanText);
                currentWords = [];

                // Move to the next question type in rotation
                questionTypeIndex = (questionTypeIndex + 1) % selectedTypes.length;
                currentQuestionType = selectedTypes[questionTypeIndex];
            }
        });

        // Push remaining words to the last processed question type
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

    addRule(numQuestions, selectedTypes) {
        const focusPoints = this.findFocusPoint() || this.history.docx.full_doc;
        if (!focusPoints) {
            NotyfService.showMessage('error', 'No document content available for classification.');
            return;
        }

        if (!this.hasDocumentChanged(focusPoints)) {
            NotyfService.showMessage('info', 'Document content unchanged. Skipping reclassification.');
            return;
        }

        this.classifyWords(focusPoints, numQuestions, selectedTypes);
    }

    async arrangeQuestons(numQuestions, difficulty, mode, selectedTypes) {
        let remainingQuestions = numQuestions;
        let selectedQuestions = [];

        const totalAvailableQuestions = selectedTypes.reduce((sum, type) => sum + this.question_type[type].length, 0);

        if (totalAvailableQuestions < numQuestions) {
            NotyfService.showMessage('warning', 'Not enough questions available to fulfill the request.');
            remainingQuestions = totalAvailableQuestions;
        }



        while (remainingQuestions > 0) {
            for (const type of selectedTypes) {
                if (this.question_type[type].length > 0 && remainingQuestions > 0) {
                    const focusPoint = this.question_type[type].shift();
                    var generatedQuestion = await ai.generateQuestions(focusPoint, type);
                    generatedQuestion = this.parseJsonFromText(generatedQuestion)
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
        ai.save([this.info, this.history.docx.focus_points])
        console.log('Current state saved:', this.history.full_history_data);
    }

    parseJsonFromText(text) {
        try {
            const startIndex = text.indexOf('{');
            const endIndex = text.lastIndexOf('}');
            const trimmedJsonData = text.substring(startIndex, endIndex + 1);
            const parsedData = JSON.parse(trimmedJsonData.trim());
            return parsedData;
        } catch (error) {
            console.error('Error parsing JSON:', error);
            console.error('Input text:', text);
            return null;
        }
    }


    // async generateQuestions_ai(mode, difficulty) {
    //     const ai = new ImportAI();
    //     const questions = this.info.question_mode[mode][difficulty];

    //     for (let i = 0; i < questions.length; i++) {
    //         const question = questions[i];
    //         question.text = await ai.generateQuestions(question.text, question.type);
    //     }
    // }

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

        if (difficulty) {
            data.addRule(numQuestions, selectedTypes);
        } else {
            data.addRule(numQuestions, selectedTypes);
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

        displayGeneratedQuestions(data.info.question_mode[mode][difficulty], mode);

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
// Function to sort questions by their type
function sortQuestionsByType(questions) {
    const groupedQuestions = {
        trueFalse: [],
        multipleChoice: [],
        matching: [],
        shortAnswer: [],
        essay: []
    };

    questions.forEach(question => {
        switch (question.type) {
            case 't_f':
                groupedQuestions.trueFalse.push(question);
                break;
            case 'choose':
                groupedQuestions.multipleChoice.push(question);
                break;
            case 'match':
                groupedQuestions.matching.push(question);
                break;
            case 'short_answer':
                groupedQuestions.shortAnswer.push(question);
                break;
            case 'essay':
                groupedQuestions.essay.push(question);
                break;
            default:
                break;
        }
    });

    return groupedQuestions;
}

// Function to display the generated time span
function displayGeneratedTime_mode(mode) {
    const cardContainer = document.getElementById('card-container');

    // Create a new h3 element
    const timeSpanElement = document.createElement('h3');


    // Set the text content of the h3 element to the current date and time
    timeSpanElement.textContent = `Generated Time Span: ${new Date().toLocaleString()}`;

    // Append the new h3 element to the card container
    cardContainer.appendChild(timeSpanElement);

    document.getElementById('mode_show').innerHTML = `Mode : ${mode}`


}

function initializeTogglePanel() {

    const panel = document.getElementById('panel');
    const toggleButton = document.getElementById('toggleButton');

    // Open the panel and set the initial icon
    panel.classList.add('open');
    toggleButton.innerHTML = '<i class="fas fa-angle-double-down"></i>';
    toggleButton.classList.add('top')
}






// Function to display generated questions after sorting them by type
function displayGeneratedQuestions(questions, mode) {
    // Sort questions by their type
    const groupedQuestions = sortQuestionsByType(questions);

    // for displaying the vrsion 
    // Call the function to display the time span and open the slider
    displayGeneratedTime_mode(mode);
    initializeTogglePanel()

    // Display true/false questions
    groupedQuestions.trueFalse.forEach(question => {
        const { text: questionText, type: questionType } = question;
        createCard('trueFalse', 'True/False Question', questionText.question);
    });

    // Display multiple choice questions
    groupedQuestions.multipleChoice.forEach(question => {
        const { text: questionText, type: questionType } = question;
        createCard('multipleChoice', 'Multiple Choice Question', questionText.question, questionText.choice); // Example options
    });

    // Display combined matching questions
    if (groupedQuestions.matching.length > 0) {
        createCard('matching', 'Matching Questions', '', groupedQuestions.matching);
    }

    // Display short answer questions
    groupedQuestions.shortAnswer.forEach(question => {
        const { text: questionText, type: questionType } = question;
        createCard('shortAnswer', 'Short Answer Question', questionText.question);
    });

    // Display essay questions
    groupedQuestions.essay.forEach(question => {
        const { text: questionText, type: questionType } = question;
        createCard('essay', 'Essay Question', questionText.question);
    });

    setMode(mode)
}


/// chat bot


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
async function getBotResponse(userText) {
    userText = userText.toLowerCase();
    const text = await ai.getchat(userText);
    return text;
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
// sendButton.addEventListener('click', function () {
//     let userInput = chatInput.value.trim();
//     if (userInput) {
//         showBotMessage(userInput);
//         chatInput.value = '';
//     }
// });



function setMode(mode) {
    NotyfService.showMessage('warning', `question  mode ${mode} : offlimit`)
}

// Function to show the bot response with a loading indicator
export async function showBotMessage(userText, get) {
    addMessage('User', userText, true);
    addMessage('Bot', 'Typing...', false, true);

    try {
        // Await the bot response
        let botResponse = await getBotResponse(userText, get);

        // Remove the loading message
        var loadingMessage = document.querySelector('.chatbot-message.loading');
        if (loadingMessage) {
            loadingMessage.remove();
        }

        // Add the bot response message
        addMessage('Bot', botResponse, false);
    } catch (error) {
        console.error('Error getting bot response:', error);

        // Remove the loading message
        var loadingMessage = document.querySelector('.chatbot-message.loading');
        if (loadingMessage) {
            loadingMessage.remove();
        }

        // Add an error message
        addMessage('Bot', 'Sorry, something went wrong. Please try again.', false);
    }
}