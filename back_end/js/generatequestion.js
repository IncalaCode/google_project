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
                exam: [],
                quiz: [],
                essay: [],
                test: [],
            },
            docx: {
                full_doc: null,
                focus_points: [],
                lastClassifiedText: null // Store last classified text to check for changes
            }
        };

        this.converted_data = null;
        this.history = [];
    }

    classifyWords(text) {
        const wordLimits = {
            t_f: 5,
            match: 10,
            choose: 20,
            short_answer: 30,
            essay: 50
        };

        const words = text.split(/\s+/); // Split by any whitespace character

        let currentQuestionType = 't_f';
        let currentWords = [];

        words.forEach(word => {
            currentWords.push(word);
            if (currentWords.length >= wordLimits[currentQuestionType]) {
                const spanText = currentWords.join(' ');
                this.info.docx.focus_points.push({ text: spanText, type: currentQuestionType });
                this.question_type[currentQuestionType].push(spanText);
                currentWords = [];

                if (this.question_type[currentQuestionType].length >= 1) {
                    switch (currentQuestionType) {
                        case 't_f':
                            currentQuestionType = 'match';
                            break;
                        case 'match':
                            currentQuestionType = 'choose';
                            break;
                        case 'choose':
                            currentQuestionType = 'short_answer';
                            break;
                        case 'short_answer':
                            currentQuestionType = 'essay';
                            break;
                        default:
                            currentQuestionType = 't_f';
                            break;
                    }
                }
            }
        });

        if (currentWords.length > 0 && this.question_type[currentQuestionType].length < 1) {
            const spanText = currentWords.join(' ');
            this.info.docx.focus_points.push({ text: spanText, type: currentQuestionType });
            this.question_type[currentQuestionType].push(spanText);
        }
    }

    // Method to check if the document spans have changed
    hasDocumentChanged(newText) {
        if (newText !== this.info.docx.lastClassifiedText) {
            this.info.docx.lastClassifiedText = newText;
            return true;
        }
        return false;
    }

    addrule(questionMode, minWords, maxWords, difficulty) {
        const fullDoc = this.info.docx.full_doc;
        if (!fullDoc) {
            showMessage('error', 'No document content available for classification.');
            return;
        }

        // Check if the document content has changed before reclassifying
        if (!this.hasDocumentChanged(fullDoc)) {
            showMessage('info', 'Document content unchanged. Skipping reclassification.');
            return;
        }

        // Perform classification if document content has changed
        this.classifyWords(fullDoc);
    }

    generateQuestions(numQuestions, difficulty, mode, selectedTypes) {
        let totalQuestions = numQuestions;
        let remainingQuestions = numQuestions;

        // Calculate proportional distribution of questions among selected types
        const typeCounts = {};
        selectedTypes.forEach(type => {
            typeCounts[type] = this.question_type[type].length;
        });

        // Ensure there are questions available for all selected types
        let typesWithQuestions = selectedTypes.filter(type => typeCounts[type] > 0);

        while (remainingQuestions > 0 && typesWithQuestions.length > 0) {
            typesWithQuestions.forEach(type => {
                const typeCount = typeCounts[type];
                if (typeCount > 0 && remainingQuestions > 0) {
                    const questionsPerType = Math.ceil((typeCount / numQuestions) * totalQuestions);
                    const questionsToAdd = Math.min(questionsPerType, remainingQuestions);

                    const selectedQuestions = this.question_type[type].slice(0, questionsToAdd);
                    selectedQuestions.forEach(question => {
                        this.info.question_mode[mode].push({ text: question, type: type });
                    });

                    // Remove added questions from original array
                    this.question_type[type] = this.question_type[type].slice(questionsToAdd);
                    remainingQuestions -= questionsToAdd;
                }
            });

            // Update typesWithQuestions to exclude types with no more questions
            typesWithQuestions = selectedTypes.filter(type => this.question_type[type].length > 0);
        }
    }


    save() {
        this.history.push({ info: { ...this.info } });
        console.log('Current state saved:', this.history);
    }
}

function getUserInputsAndApplyRules(data) {
    const difficulty = document.getElementById('difficulty').value;
    const numQuestions = parseInt(document.getElementById('numQuestions').value, 10);
    const modeElement = document.querySelector('input[name="questionMode"]:checked');

    if (!modeElement) {
        showMessage('warning', 'Please select a question mode.');
        return null;
    }

    const mode = modeElement.value;
    const selectedTypes = [];
    document.querySelectorAll('.form-check-input:checked').forEach(checkbox => {
        selectedTypes.push(checkbox.value);
    });

    const modeCheckbox = document.getElementById(`mode${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
    if (modeCheckbox) {
        const modeMinWords = parseInt(modeCheckbox.dataset.minWords, 10);
        const modeMaxWords = parseInt(modeCheckbox.dataset.maxWords, 10);
        const modeDifficulty = modeCheckbox.dataset.difficulty;

        if (difficulty) {
            data.addrule(mode, modeMinWords, modeMaxWords, difficulty);
        } else {
            data.addrule(mode, modeMinWords, modeMaxWords, modeDifficulty);
        }
    }

    return { numQuestions, difficulty, mode, selectedTypes };
}

document.getElementById('generatequestion').addEventListener('click', () => {
    try {
        const data = new GeneratedText();
        data.info.docx.full_doc = document.getElementById('display_list').innerText.trim(); // Use innerText for text content

        const userInput = getUserInputsAndApplyRules(data);
        if (!userInput) return;

        const { numQuestions, difficulty, mode, selectedTypes } = userInput;

        data.generateQuestions(numQuestions, difficulty, mode, selectedTypes);
        data.save();

        displayGeneratedQuestions(data.info.question_mode[mode]);
    } catch (error) {
        showMessage('warning', "Insert a proper docx or pdf");
    }
});

function showMessage(type, message) {
    console.log(`${type}: ${message}`);
}

function displayGeneratedQuestions(questions) {
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
