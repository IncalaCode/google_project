
import { showBotMessage } from "./generatequestion.js";

let mode = '';
let answers = {};
let currentQuestionIndex = 0;

class Counter {
    static count = 0;
}

export function startMode(selectedMode) {
    document.getElementById('prev').addEventListener('click', showPreviousCard);
    document.getElementById('next').addEventListener('click', showNextCard);
    document.getElementById('showanswer').addEventListener('click', submitAllAnswers);

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
    Counter.count++;

    const card = document.createElement('div');
    card.classList.add('card', 'mb-4', 'quiz-card');
    card.dataset.resultId = `result-${Counter.count}`;;
    card.dataset.drawerId = `drawer-${Counter.count}`;;

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

    const btnRow = document.createElement('div');
    btnRow.classList.add('btn-row');
    btnRow.id = `question-${Counter.count}`;
    if (cardType === 'trueFalse') {
        createTrueFalseButtons(btnRow, title, answer);
    } else if (cardType === 'multipleChoice') {
        createMultipleChoiceButtons(btnRow, title, answer, options);
    } else if (cardType === 'shortAnswer') {
        createShortAnswerInput(btnRow, title, answer);
    } else if (cardType === 'essay') {
        createEssayInput(btnRow, title, answer);
    }
    cardBody.appendChild(btnRow);

    const drawer = createDrawer(answer, explanation, `drawer-${Counter.count}`);
    cardBody.appendChild(drawer);

    const cardFooter = document.createElement('div');
    cardFooter.classList.add('card-footer');

    const resultDiv = document.createElement('div');
    resultDiv.classList.add('result');
    resultDiv.id = `result-${Counter.count}`;
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

    document.getElementById('card-container').appendChild(card);
}

function createTrueFalseButtons(btnRow, title, correctAnswer) {
    const options = ['True', 'False'];
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.classList.add('btn', option === 'True' ? 'btn-primary' : 'btn-danger', 'btn-column');
        btn.textContent = option;
        btn.setAttribute('data-answer', option.toLowerCase());
        btn.addEventListener('click', () => submitAnswer('trueFalse', title, btn.getAttribute('data-answer'), btnRow.id));
        btnRow.appendChild(btn);
    });
}

function createMultipleChoiceButtons(btnRow, title, correctAnswer, options) {
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.classList.add('btn', 'btn-primary', 'btn-column');
        btn.textContent = option;
        btn.setAttribute('data-answer', option);
        btn.addEventListener('click', () => submitAnswer('multipleChoice', title, btn.getAttribute('data-answer'), btnRow.id));
        btnRow.appendChild(btn);
    });
}

function createShortAnswerInput(btnRow, title, correctAnswer) {
    const input = document.createElement('input');
    input.type = 'text';
    input.classList.add('form-control', 'question-input');
    input.setAttribute('data-answer', correctAnswer);
    input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            submitAnswer('shortAnswer', title, input.value, btnRow.id);
        }
    });
    btnRow.appendChild(input);
}

function createEssayInput(btnRow, title, correctAnswer) {
    const textarea = document.createElement('textarea');
    textarea.classList.add('form-control', 'question-input');
    textarea.rows = 4;
    textarea.setAttribute('data-answer', correctAnswer);
    textarea.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            submitAnswer('essay', title, textarea.value, btnRow.id);
        }
    });
    btnRow.appendChild(textarea);
}

function createDrawer(answer, explanation, id) {
    const drawer = document.createElement('div');
    drawer.classList.add('drawer');
    drawer.id = id;

    const drawerContent = document.createElement('div');
    drawerContent.classList.add('drawer-content');
    drawerContent.id = "openall"
    drawerContent.innerHTML = `<strong>Answer:</strong> ${answer}<br><strong>Explanation:</strong> ${explanation}`;
    drawer.appendChild(drawerContent);

    return drawer;
}

function submitAnswer(questionType, title, userAnswer, id) {
    // Use the correct ID format for resultDiv and drawer
    const resultDiv = document.getElementById(`result-${id.replace(/^question-/, '')}`);
    const drawer = document.getElementById(`drawer-${id.replace(/^question-/, '')}`);

    if (!resultDiv || !drawer) {
        console.error(`Elements with IDs result-${id.replace(/^question-/, '')} or drawer-${id.replace(/^question-/, '')} not found.`);
        return;
    }

    const correctAnswer = document.querySelector(`#${id} [data-answer]`).getAttribute('data-answer');

    if (mode === 'quiz') {
        showAnswer(questionType, title, userAnswer, correctAnswer, resultDiv, drawer);
    } else {
        resultDiv.textContent = 'Answer submitted.';
        checkAllAnswered();
    }
}

function showAnswer(questionType, title, userAnswer, correctAnswer, resultDiv, drawer) {
    if (questionType === 'trueFalse' || questionType === 'multipleChoice') {
        resultDiv.textContent = userAnswer === correctAnswer ? 'Correct!' : 'Incorrect.';
    } else {
        const similarity = calculateCosineSimilarity(userAnswer, correctAnswer);
        resultDiv.textContent = similarity > 0.7 ? 'Correct!' : 'Incorrect.';
    }
    drawer.classList.add('open');
}

function checkAllAnswered() {
    if (mode === 'test' || mode === 'exam') {
        const allInputs = document.querySelectorAll('.question-input');
        const allAnswered = Array.from(allInputs).every(input => input.value.trim() !== '');
        document.querySelector('.submit-btn').style.display = allAnswered ? 'block' : 'none';
    }
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
    if (currentQuestionIndex < cards.length - 1) {
        currentQuestionIndex++;
        cards.forEach((card, index) => {
            card.style.display = index === currentQuestionIndex ? 'block' : 'none';
        });
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
        const id = input.parentElement.id;
        const title = document.querySelector(`#${id} .card-header h5`).textContent;
        answers[title] = input.value;
    });
    showAllAnswers();
}

function showAllAnswers() {
    const cards = document.querySelectorAll('.quiz-card');
    cards.forEach(card => {
        const title = card.querySelector('.card-header h5').textContent.trim();
        const questionType = getQuestionType(title);

        // Use data attributes to get result and drawer elements
        const resultDivId = card.dataset.resultId;
        const drawerId = card.dataset.drawerId;

        const resultDiv = document.getElementById(resultDivId);
        const drawer = document.getElementById(drawerId);

        if (!resultDiv || !drawer) {
            console.error(`Elements with IDs ${resultDivId} or ${drawerId} not found.`);
            return;
        }

        drawer.classList.add('open')

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


// card.querySelectorAll('.call').forEach(function (button) {
//     button.addEventListener('click', function () {
//         const card = this.closest('.card');
//         const cardTitle = card.querySelector('.card-header h5').textContent;
//         const cardText = card.querySelector('.card-text').textContent;
//         showBotMessage(`questin_type "${cardTitle}": \nQuestion: ${cardText} explain  it to me  `)
//         alert(`Call functionality for card "${cardTitle}": \nQuestion: ${cardText} `);
//     });
// });



