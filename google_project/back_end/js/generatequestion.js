import ImportAI from "./connect_to_ai.js";
import NotyfService from './message.shower.js';
import { createCard, startMode } from './display_questions.js'
import { import_user } from "./save_user_data.js";

export const ai = new ImportAI();




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
                    wordLimits[type] = totalWords * 0.15 / numQuestions;
                    break;
                case 'match':
                    wordLimits[type] = totalWords * 0.20 / numQuestions;
                    break;
                case 'choose':
                    wordLimits[type] = totalWords * 0.30 / numQuestions;
                    break;
                case 'short_answer':
                    wordLimits[type] = totalWords * 0.40 / numQuestions;
                    break;
                case 'essay':
                    wordLimits[type] = totalWords * 0.50 / numQuestions;
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
            NotyfService.showMessage('loading', "conutining to generate the question", true)
        }

        this.classifyWords(focusPoints, numQuestions, selectedTypes);
    }

    async arrangeQuestons(numQuestions, difficulty, mode, selectedTypes) {
        let remainingQuestions = numQuestions;
        let selectedQuestions = [];

        const totalAvailableQuestions = selectedTypes.reduce((sum, type) => sum + this.question_type[type].length, 0);

        if (totalAvailableQuestions < numQuestions) {
            NotyfService.showMessage('warning', `question limmited :${totalAvailableQuestions} .`);
            remainingQuestions = totalAvailableQuestions;
        }


        while (remainingQuestions > 0) {
            for (const type of selectedTypes) {
                if (this.question_type[type].length > 0 && remainingQuestions > 0) {
                    // Process up to three questions of the same type
                    for (let i = 0; i < 3 && this.question_type[type].length > 0 && remainingQuestions > 0; i++) {
                        const focusPoint = this.question_type[type].shift();
                        var generatedQuestion = await ai.generateQuestions(focusPoint, type);
                        selectedQuestions.push({ text: generatedQuestion, type: type });
                        remainingQuestions--;
                    }
                }
            }
        }

        this.info.question_mode[mode][difficulty].push(selectedQuestions);

        this.saveVersion(difficulty, mode); // Save current version after generating questions
    }

    saveVersion(difficulty, mode) {
        const currentVersion = {
            generated: this.info.question_mode[mode][difficulty],
            timestamp: new Date().toLocaleString(),
            mode: mode
        };

        console.log(currentVersion)

        this.history.docx.versions.push(currentVersion);
        this.displayVersions(); // Update displayed versions after saving
    }



    displayVersions() {
        const versionContainer = document.getElementById('versionContainer');
        versionContainer.innerHTML = '';

        console.log(this.history)

        this.history.docx.versions.forEach((version, index) => {
            const button = document.createElement('button');
            button.textContent = `quenGen ${index}: ${version.timestamp}`;
            button.classList.add('version-button');
            button.id = index
            button.addEventListener('click', () => {
                displayGeneratedQuestions(version.generated[
                    version.generated.length > parseInt(button.id) ? parseInt(button.id) : (version.generated.length - 1 || 0)
                ], version.mode);
                NotyfService.showMessage('success', `swithed to ${version.timestamp}`)
            });
            versionContainer.appendChild(button);
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


// for the  const data = new GeneratedText(); to store
const data = new GeneratedText();

export async function generate() {
    try {
        NotyfService.showMessage('loading', "started to generate the question", true)

        data.history.docx.full_doc = document.getElementById('display_list').innerText.trim();

        const userInput = getUserInputsAndApplyRules(data);
        if (!userInput) return;

        const { numQuestions, difficulty, mode, selectedTypes } = userInput;

        await data.arrangeQuestons(numQuestions, difficulty, mode, selectedTypes);

        displayGeneratedQuestions(data.info.question_mode[mode][difficulty][data.info.question_mode[mode][difficulty].length - 1 || 0], mode);
        if (!sessionStorage.getItem('slide')) toggleLeftSidebar()
        data.save();
        NotyfService.dismiss('success', "finsied generating the question")
    } catch (error) {
        NotyfService.showMessage('warning', 'Error occurred while generating questions.');
        console.error(error);
    }
};
function toggleLeftSidebar() {
    var $leftSidebar = $('#left_side_slider');
    if ($leftSidebar.hasClass('show')) {
        $leftSidebar.removeClass('show');
        $('.push-content').removeClass('pushed_left');
    } else {
        $leftSidebar.addClass('show');
        $('.push-content').addClass('pushed_left');
    }
    sessionStorage.setItem('slide', "1")
}
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

    // Check if questions is an array or object, and convert to array if it's an object
    const questionsArray = Array.isArray(questions) ? questions : Object.values(questions);

    questionsArray.forEach(question => {
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
    enable_disable_Button(true, ["pre", "toggleButton"])
    displayGeneratedTime_mode(mode);
    initializeTogglePanel()
    startMode(mode)

    // Display true/false questions
    groupedQuestions.trueFalse.forEach(question => {
        const { text: questionText, type: questionType } = question;
        createCard('trueFalse', 'True/False Question', questionText.question, questionText.answer, questionText.explanation);
    });

    // Display multiple choice questions
    groupedQuestions.multipleChoice.forEach(question => {
        const { text: questionText, type: questionType } = question;
        createCard('multipleChoice', 'Multiple Choice Question', questionText.question, questionText.answer, questionText.explanation, questionText.choice); // Example options
    });

    // Display combined matching questions
    if (groupedQuestions.matching.length > 0) {
        createCard('matching', 'Matching Questions', '', groupedQuestions.matching);
    }

    // Display short answer questions
    groupedQuestions.shortAnswer.forEach(question => {
        const { text: questionText, type: questionType } = question;
        createCard('shortAnswer', 'Short Answer Question', questionText.question, questionText.answer, questionText.explanation);
    });

    // Display essay questions
    groupedQuestions.essay.forEach(question => {
        const { text: questionText, type: questionType } = question;
        createCard('essay', 'Essay Question', questionText.question, questionText.answer, questionText.explanation);
    });

    setMode(mode)
}


/// chat bot


var chatInput = document.getElementById('chat_bot_input');
var chatMessages = document.getElementById('chatMessages');

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
let confirmEndQuizListener;

function setMode(mode) {
    // Remove existing event listeners to avoid duplicate listeners
    removeEndQuizListener();

    switch (mode) {
        case "exam":
            exam();
            break;
        case "quiz":
            quiz();
            break;
        case "test":
            test();
            break;
        default:
            test();
            break;
    }
}

function setup() {
    // Add event listener to show the modal when the button is clicked
    document.getElementById('close_quiz').addEventListener('click', showEndQuizModal);

    // Add event listener to the close button in the modal
    document.getElementById('closeEndQuizModal').addEventListener('click', hideEndQuizModal);

    // Add event listener to the cancel button in the modal
    document.getElementById('cancelEndQuiz').addEventListener('click', hideEndQuizModal);

    // Add event listener to the confirm button in the modal
    const confirmEndQuizButton = document.getElementById('confirmEndQuiz');
    confirmEndQuizListener = () => {
        hideEndQuizModal();
        enable_disable_Button(true);
        document.getElementById('close_quiz').style.display = 'none'
    };
    confirmEndQuizButton.addEventListener('click', confirmEndQuizListener);
}


function enable_disable_Button(value, button = NaN) {
    const list = button || ["chatbutton", "pre", "toggleButton"];
    list.forEach(buttonId => {
        pre_hidden(value, buttonId);
    });

}

function showEndQuizModal() {
    document.getElementById('endQuizModal').style.display = 'block';
}

function hideEndQuizModal() {
    document.getElementById('endQuizModal').style.display = 'none';
}

function quiz() {
    console.log("Quiz mode activated");
    document.getElementById('close_quiz').style.display = 'block'
    enable_disable_Button(false);
    setup();
    return true;
}

function exam() {
    hideEndQuizModal()
    console.log("Exam mode activated");
    return true;
}

function test() {
    hideEndQuizModal()
    console.log("Test mode activated");
    return true;
}

function removeEndQuizListener() {
    const confirmEndQuizButton = document.getElementById('confirmEndQuiz');
    if (confirmEndQuizListener) {
        confirmEndQuizButton.removeEventListener('click', confirmEndQuizListener);
        confirmEndQuizListener = null;
    }
}

function pre_hidden(value, button) {
    var span = document.getElementById(button);
    if (span.style.visibility === 'hidden' && value || value) {
        span.style.visibility = 'visible';
    } else {
        span.style.visibility = 'hidden';
    }
}

export function scrollToElementById(elementId) {
    const element = document.getElementById(elementId);
    if (!sessionStorage.getItem('user') && !sessionStorage.getItem('scroll')) {
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            sessionStorage.setItem('scroll', "1")
        } else {
            console.error(`Element with ID ${elementId} not found.`);
        }
    }
}


enable_disable_Button(false, ["pre", "toggleButton"])

document.addEventListener('DOMContentLoaded', function () {
    const login_h4 = document.getElementById('login_h4');
    const login_user = document.getElementById('login_user');
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    let isSignUp = false;

    function displaySign(value) {
        isSignUp = value;
        login_h4.textContent = isSignUp ? "Sign Up" : "Login";
        login_user.value = isSignUp ? "Sign Up" : "Login";
        document.getElementById('login_sign').innerHTML = isSignUp ? "Already have an account? <a href='#' class='text - primary'>login</a > " : "Don't have an account? <a href='#' class='text - primary'>Sign up</a > ";
        $('#login').modal('show');
    }



    async function login(e) {
        NotyfService.showMessage('loading', `trying to ${!isSignUp ? "login" : "sign up"}`, true)
        e.preventDefault();

        const user = username.value.trim();
        const pass = password.value.trim();

        // Validate username and password
        if (/^[a-zA-Z0-9]+$/.test(user) && pass.length >= 8 && !isSignUp) {
            try {
                // Check user existence
                const response = await import_user({ username: user, password: pass }, "exists");
                if (response.status == 200) {
                    sessionStorage.setItem("user", JSON.stringify(response.data))
                    update_inside_data(response.data.data)
                    NotyfService.showMessage("success", `Welcome back ${response.data.username}`);
                    logout(true)
                } else {
                    displaySign(true);
                    NotyfService.showMessage("error", "Invalid username or password. Please sign up.");
                }
            } catch (error) {
                NotyfService.showMessage("error", "An error occurred while logging in.");
            }
        } else if (/^[a-zA-Z0-9]+$/.test(user) && pass.length >= 8 && isSignUp) {
            var response = await import_user({ username: user, password: pass, data: data.history.docx.versions }, "insert");
            if (response.status == 201) {
                NotyfService.showMessage("success", `Welcome to QeGen user ${user}`);
                response = await import_user({ username: user }, "select")
                sessionStorage.setItem("user", JSON.stringify(response.data) || user)

                logout(true)
            } else {
                NotyfService.showMessage("error", " user exists.");
            }
        }
        else {
            NotyfService.showMessage("error", "Invalid username or password.");
        }
    }

    function check() {
        if (sessionStorage.getItem('user')) {
            update_data()
            return
        }
        displaySign(true);
        NotyfService.showMessage('error', "User not found. Please sign up.");
        return false;
    }

    function update_data() {
        NotyfService.showMessage('loading', "saving Generated data", true)
        const response = import_user({ id: JSON.parse(sessionStorage.getItem('user')).id, data: data.history.docx.versions }, "update")
        if (response) {
            NotyfService.showMessage('success', "Generated Data saved ")
            return
        }
        NotyfService.showMessage('error', "Generated data was not saved")

    }
    function logout(value = false) {
        if (value == true) {
            document.getElementById('login').style.display = "none"
            document.getElementById('loginlink').style.display = "none"
            document.getElementById('logout').style.display = "block"
            return
        }

        document.getElementById('loginlink').style.display = "block"
        document.getElementById('logout').style.display = "none"
        sessionStorage.removeItem('user')
        NotyfService.showMessage("info", "You loged out successfuly")

    }

    document.getElementById('login_sign').addEventListener('click', function (e) {
        e.preventDefault();
        displaySign(!isSignUp);
    });

    function update_inside_data(versionToCheck) {
        // const versionExists = data.history.docx.versions.some(
        //     version => JSON.stringify(version) === JSON.stringify(versionToCheck)
        // );
        versionToCheck = JSON.parse(versionToCheck)
        if (versionToCheck) {
            versionToCheck.push(data.history.docx.versions)
            data.history.docx.versions = versionToCheck;
            data.displayVersions()
            open_generated_plane()
        }
    }

    function open_generated_plane() {
        data.displayVersions();
        document.getElementById('slide-panel').classList.add('show')
        document.getElementById('toggle-btn').classList.add('pushed')
    }


    document.getElementById('login_user').addEventListener('click', login);
    document.getElementById('save_data').addEventListener('click', check);
    document.getElementById('logout').addEventListener('click', logout)

});

