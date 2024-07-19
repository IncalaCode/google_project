
import { showBotMessage } from "./generatequestion.js";

let mode = '';
let answers = {};
const totalQuestions = 4;
let currentQuestionIndex = 0;

export function startMode(selectedMode) {


    document.getElementById('prev').addEventListener('click', showPreviousCard())
    document.getElementById('next').addEventListener('click', showNextCard())
    document.getElementById('showanswer').addEventListener('click', submitAllAnswers())


    mode = selectedMode;
    document.getElementById('card-container').innerHTML = '';
    document.querySelector('.submit-btn').style.display = (mode === 'test' || mode === 'exam') ? 'block' : 'none';
    currentQuestionIndex = 0;
    answers = {};
    if (mode === 'quiz') {
        showNextCard();
        document.querySelector('.prev-btn').style.display = 'block';
        document.querySelector('.next-btn').style.display = 'block';
    } else {
        showAllCards();
        document.querySelector('.prev-btn').style.display = 'none';
        document.querySelector('.next-btn').style.display = 'none';
    }
}

export function createCard(cardType, title, question, answer, explanation, options) {
    const card = document.createElement('div');
    card.classList.add('card', 'mb-4', 'quiz-card');

    const cardHeader = document.createElement('div');
    cardHeader.classList.add('card-header');
    cardHeader.innerHTML = `<h5>${title}</h5>`;
    card.appendChild(cardHeader);

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    const cardText = document.createElement('p');
    cardText.classList.add('card-text');
    cardText.textContent = question;
    cardBody.appendChild(cardText);

    if (cardType === 'trueFalse' || cardType === 'multipleChoice') {
        const btnRow = document.createElement('div');
        btnRow.classList.add('btn-row');
        if (cardType === 'trueFalse') {
            createTrueFalseButtons(btnRow, title, answer);
        } else if (cardType === 'multipleChoice') {
            createMultipleChoiceButtons(btnRow, title, answer, options);
        }
        cardBody.appendChild(btnRow);
    } else if (cardType === 'shortAnswer') {
        const input = document.createElement('input');
        input.type = 'text';
        input.classList.add('form-control', 'question-input');
        input.id = `input-${title}`;
        input.setAttribute('data-answer', answer);
        input.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                submitAnswer('shortAnswer', title, input.value);
            }
        });
        cardBody.appendChild(input);
    } else if (cardType === 'essay') {
        const textarea = document.createElement('textarea');
        textarea.classList.add('form-control', 'question-input');
        textarea.rows = 4;
        textarea.id = `textarea-${title}`;
        textarea.setAttribute('data-answer', answer);
        textarea.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                submitAnswer('essay', title, textarea.value);
            }
        });
        cardBody.appendChild(textarea);
    }

    const drawer = document.createElement('div');
    drawer.classList.add('drawer');
    drawer.id = `drawer-${title}`;

    const drawerContent = document.createElement('div');
    drawerContent.classList.add('drawer-content');
    drawerContent.innerHTML = `<strong>Answer:</strong> ${answer}<br><strong>Explanation:</strong> ${explanation}`;
    drawer.appendChild(drawerContent);

    cardBody.appendChild(drawer);

    const cardFooter = document.createElement('div');
    cardFooter.classList.add('card-footer');

    const resultDiv = document.createElement('div');
    resultDiv.classList.add('result');
    resultDiv.id = `result-${title}`;
    cardFooter.appendChild(resultDiv);

    const footerIcons = document.createElement('div');
    footerIcons.classList.add('footer-icons');
    footerIcons.innerHTML =
        '<i class="fas fa-redo-alt reset-btn"></i>' +
        '<i class="fas fa-robot call"></i>';
    cardFooter.appendChild(footerIcons);

    card.appendChild(cardBody);
    card.appendChild(cardFooter);

    card.querySelectorAll('.call').forEach(function (button) {
        button.addEventListener('click', function () {
            const card = this.closest('.card');
            const cardTitle = card.querySelector('.card-header h5').textContent;
            const cardText = card.querySelector('.card-text').textContent;
            showBotMessage(`questin_type "${cardTitle}": \nQuestion: ${cardText} explain  it to me  `)
            alert(`Call functionality for card "${cardTitle}": \nQuestion: ${cardText} `);
        });
    });

    document.getElementById('card_container').appendChild(card);
}

function createTrueFalseButtons(btnRow, title, correctAnswer) {
    const trueBtn = document.createElement('button');
    trueBtn.classList.add('btn', 'btn-primary', 'btn-column');
    trueBtn.setAttribute('data-answer', 'true');
    trueBtn.textContent = 'True';
    btnRow.appendChild(trueBtn);

    const falseBtn = document.createElement('button');
    falseBtn.classList.add('btn', 'btn-danger', 'btn-column');
    falseBtn.setAttribute('data-answer', 'false');
    falseBtn.textContent = 'False';
    btnRow.appendChild(falseBtn);

    [trueBtn, falseBtn].forEach(btn => {
        btn.addEventListener('click', function () {
            submitAnswer('trueFalse', title, btn.getAttribute('data-answer'));
        });
    });
}

function createMultipleChoiceButtons(btnRow, title, correctAnswer, options) {
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.classList.add('btn', 'btn-primary', 'btn-column');
        btn.textContent = option;
        btn.setAttribute('data-answer', option);
        btnRow.appendChild(btn);

        btn.addEventListener('click', function () {
            submitAnswer('multipleChoice', title, btn.getAttribute('data-answer'));
        });
    });
}

function submitAnswer(questionType, title, userAnswer) {
    const card = document.querySelector(`#${questionType === 'trueFalse' || questionType === 'multipleChoice' ? 'card_container' : 'card_container'} .quiz-card:nth-child(${currentQuestionIndex + 1})`);
    const correctAnswer = card.querySelector(`[data-answer]`).getAttribute('data-answer');
    const resultDiv = document.getElementById(`result-${title}`);
    const drawer = document.getElementById(`drawer-${title}`);

    if (mode === 'quiz') {
        showAnswer(questionType, title, userAnswer, correctAnswer, resultDiv, drawer);
    } else {
        resultDiv.textContent = 'Answer submitted.';
        checkAllAnswered();
    }
}

function checkAllAnswered() {
    if (mode === 'test' || mode === 'exam') {
        const allInputs = document.querySelectorAll('.question-input');
        const allAnswered = Array.from(allInputs).every(input => input.value.trim() !== '');
        document.querySelector('.submit-btn').style.display = allAnswered ? 'block' : 'none';
    }
}

function showAnswer(questionType, title, userAnswer, correctAnswer, resultDiv, drawer) {
    if (questionType === 'trueFalse' || questionType === 'multipleChoice') {
        resultDiv.textContent = userAnswer === correctAnswer ? 'Correct!' : 'Incorrect.';
    } else if (questionType === 'shortAnswer' || questionType === 'essay') {
        const similarity = calculateCosineSimilarity(userAnswer, correctAnswer);
        resultDiv.textContent = similarity > 0.7 ? 'Correct!' : 'Incorrect.';
    }
    drawer.classList.add('open');
}

function calculateCosineSimilarity(text1, text2) {
    const vectorize = text => {
        const tokens = text.toLowerCase().match(/\w+('\w+)?/g) || [];
        const vector = {};
        tokens.forEach(token => vector[token] = (vector[token] || 0) + 1);
        return vector;
    };

    const dotProduct = (vec1, vec2) => Object.keys(vec1).reduce((sum, key) => sum + (vec1[key] * (vec2[key] || 0)), 0);

    const magnitude = vector => Math.sqrt(Object.values(vector).reduce((sum, value) => sum + (value * value), 0));

    const vec1 = vectorize(text1);
    const vec2 = vectorize(text2);
    const dp = dotProduct(vec1, vec2);
    const mag1 = magnitude(vec1);
    const mag2 = magnitude(vec2);

    return mag1 && mag2 ? dp / (mag1 * mag2) : 0;
}

function showNextCard() {
    const cards = document.querySelectorAll('.quiz-card');
    if (currentQuestionIndex < cards.length) {
        cards.forEach((card, index) => {
            card.style.display = index === currentQuestionIndex ? 'block' : 'none';
        });
        currentQuestionIndex++;
    }
}

function showPreviousCard() {
    const cards = document.querySelectorAll('.quiz-card');
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        cards.forEach((card, index) => {
            card.style.display = index === currentQuestionIndex ? 'block' : 'none';
        });
    }
}

function showAllCards() {
    const cards = document.querySelectorAll('.quiz-card');
    cards.forEach(card => {
        card.style.display = 'block';
    });
}

function submitAllAnswers() {
    const allInputs = document.querySelectorAll('.question-input');
    allInputs.forEach(input => {
        const title = input.id.replace(/^input-|^textarea-/, '');
        answers[title] = input.value;
    });
    showAllAnswers();
}

function showAllAnswers() {
    const cards = document.querySelectorAll('.quiz-card');
    cards.forEach(card => {
        const title = card.querySelector('.card-header h5').textContent;
        const questionType = getQuestionType(title);
        const resultDiv = document.getElementById(`result-${title}`);
        const drawer = document.getElementById(`drawer-${title}`);
        const correctAnswer = card.querySelector(`[data-answer]`).getAttribute('data-answer');
        const userAnswer = answers[title];
        showAnswer(questionType, title, userAnswer, correctAnswer, resultDiv, drawer);
    });
}

function getQuestionType(title) {
    if (title.includes('True/False')) return 'trueFalse';
    if (title.includes('Multiple Choice')) return 'multipleChoice';
    if (title.includes('Short Answer')) return 'shortAnswer';
    if (title.includes('Essay')) return 'essay';
    return '';
}

function createCards() {
    createCard('trueFalse', 'Question 1: True/False', 'The sky is blue.', 'True', 'The sky is blue on a clear day due to scattering of light.');
    createCard('multipleChoice', 'Question 2: Multiple Choice', 'What is the capital of France?', 'C. Paris', 'Paris is the capital and largest city of France.', ['A. Berlin', 'B. Madrid', 'C. Paris', 'D. Rome']);
    createCard('shortAnswer', 'Question 3: Short Answer', 'What is 2 + 2?', '4', 'The sum of 2 and 2 is 4.');
    createCard('essay', 'Question 4: Essay', 'Describe the impact of technology on education.', 'N/A', 'Essay explanation here.');
}


// card.querySelectorAll('.call').forEach(function (button) {
//     button.addEventListener('click', function () {
//         const card = this.closest('.card');
//         const cardTitle = card.querySelector('.card-header h5').textContent;
//         const cardText = card.querySelector('.card-text').textContent;
//         showBotMessage(`questin_type "${cardTitle}": \nQuestion: ${cardText} explain  it to me  `)
//         alert(`Call functionality for card "${cardTitle}": \nQuestion: ${cardText} `);
//     });
// });



