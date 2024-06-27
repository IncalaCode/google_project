import import_ai from './connect_to_ai.js';

class GeneratedText {
    constructor() {
        this.question_type = {
            t_f: [],
            match: [],
            choose: [],
            short_answer: [],
            essay: []
        };

        // Data to be sent to the database
        this.info = {
            question_mode: {
                exam: [],
                quiz: [],
                essay: [],
                test: [],
            },
            docx: {
                full_doc: null,
                focus_points: [],
            }
        };

        // To store the history of the info generation
        this.history = [];

        // Fetch span elements once and store
        this.spanElements = Array.from(document.getElementById('display_list').childNodes)
            .filter(element => element.nodeName === "SPAN");
    }

    // Method to add rules for generating questions
    addrule(type, minWords, maxWords, difficulty) {
        this.info.question_mode[type].push({ minWords, maxWords, difficulty });
    }

    // Method to generate questions based on rules
    generateQuestions(numQuestions, difficulty, mode) {
        const selectedSpans = this.spanElements.filter(element => {
            const textContent = element.textContent.trim();
            const wordCount = textContent.split(/\s+/).length;

            const modeCheckbox = document.getElementById(`mode${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
            if (modeCheckbox.checked) {
                const modeDifficulty = modeCheckbox.dataset.difficulty;
                const modeMinWords = parseInt(modeCheckbox.dataset.minWords, 10);
                const modeMaxWords = parseInt(modeCheckbox.dataset.maxWords, 10);
                return wordCount >= modeMinWords && wordCount <= modeMaxWords && modeDifficulty === difficulty;
            }
            return false;
        }).slice(0, numQuestions);

        selectedSpans.forEach(element => {
            const textContent = element.textContent.trim();
            const wordCount = textContent.split(/\s+/).length;

            this.info.docx.focus_points.push({
                text: textContent,
                wordCount: wordCount,
                gen_question: Math.floor(wordCount / 30)
            });
        });

        // Add generated questions to the respective mode in info.question_mode
        this.info.question_mode[mode].push({
            question_type: this.question_type[mode],
            difficulty: difficulty
        });

        console.log(this.info); // For debugging purposes, remove it in production

        // Send data to your AI module or server
        import_ai.generateQuestions(this.info.docx.focus_points)
            .then(response => {
                console.log(response);
                // Handle the response (e.g., display the questions)
            })
            .catch(error => {
                showMessage('error', `Error generating questions: ${error}`);
            });
    }

    // Method to save the current state
    save() {

        this.history.push({ info: { ...this.info } });
        console.log('Current state saved:', state); // For debugging purposes
    }
}

// Function to retrieve user inputs and apply rules dynamically
function getUserInputsAndApplyRules(data) {
    const difficulty = document.getElementById('difficulty').value;
    const numQuestions = parseInt(document.getElementById('numQuestions').value, 10);
    const mode = document.querySelector('input[name="questionMode"]:checked').value;

    const modeCheckbox = document.getElementById(`mode${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
    if (modeCheckbox) {
        const modeMinWords = parseInt(modeCheckbox.dataset.minWords, 10);
        const modeMaxWords = parseInt(modeCheckbox.dataset.maxWords, 10);
        const modeDifficulty = modeCheckbox.dataset.difficulty;

        // Determine question type based on mode and difficulty
        if (difficulty) {
            data.addrule(mode, modeMinWords, modeMaxWords, difficulty);
        }
        else {
            data.addrule(mode, modeMinWords, modeMaxWords, modeDifficulty);
        }
    }

    return { numQuestions, difficulty, mode };
}

document.getElementById('generatequestion').addEventListener('click', () => {
    try {
        const data = new GeneratedText();
        data.info.docx.full_doc = document.getElementById('display_list').innerHTML;

        const { numQuestions, difficulty, mode } = getUserInputsAndApplyRules(data);

        data.generateQuestions(numQuestions, difficulty, mode);
        data.save(); // Save the state after generating questions
    } catch (error) {
        showMessage('warning', "Insert a proper docx or pdf");
    }
});

function showMessage(type, message) {
    // Implement showMessage logic to display messages to the user
    console.log(`${type}: ${message}`);
}
