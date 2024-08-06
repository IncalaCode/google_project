
import { showBotMessage } from "./generatequestion.js";
import NotyfService from "./message.shower.js";

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
    card.dataset.drawerId = `drawer-${Counter.count}`;
    card.dataset.correctAnswer = answer

    const cardHeader = document.createElement('div');
    cardHeader.classList.add('card-header');
    cardHeader.innerHTML = `<h5>${title}</h5> ${title == "Essay Question" || title == "Short Answer Question" ? '<h6>("Enter to submit the answer")<h6>' : ''}`;
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
        createTrueFalseButtons(card, btnRow, title,);
    } else if (cardType === 'multipleChoice') {
        createMultipleChoiceButtons(card, btnRow, title, options);
    } else if (cardType === 'shortAnswer') {
        createShortAnswerInput(card, btnRow, title,);
    } else if (cardType === 'essay') {
        createEssayInput(card, btnRow, title,);
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
        // '<i class="fas fa-redo-alt reset-btn"></i>' +
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

function createTrueFalseButtons(card, btnRow, title) {
    const options = ['True', 'False'];
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.classList.add('btn', option === 'True' ? 'btn-primary' : 'btn-danger', 'btn-column');
        btn.textContent = option;
        btn.addEventListener('click', () => submitAnswer(card, 'trueFalse', title, btnRow.id, option));
        btnRow.appendChild(btn);
    });
}

function createMultipleChoiceButtons(card, btnRow, title, options) {
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.classList.add('btn', 'btn-primary', 'btn-column');
        btn.textContent = option;
        btn.addEventListener('click', () => submitAnswer(card, 'multipleChoice', title, btnRow.id, option));
        btnRow.appendChild(btn);
    });
}

function createShortAnswerInput(card, btnRow, title, correctAnswer) {
    const input = document.createElement('input');
    input.type = 'text';
    input.classList.add('form-control', 'question-input');
    input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            submitAnswer(card, 'shortAnswer', title, btnRow.id, input.value);
        }
    });
    btnRow.appendChild(input);
}

function createEssayInput(card, btnRow, title, correctAnswer) {
    const textarea = document.createElement('textarea');
    textarea.classList.add('form-control', 'question-input');
    textarea.rows = 4;
    textarea.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            submitAnswer(card, 'essay', title, btnRow.id, textarea.value);
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
    drawerContent.innerHTML = `<strong> Answer:</strong> ${answer} <br><strong>Explanation:</strong> ${explanation}`;
    drawer.appendChild(drawerContent);

    return drawer;
}

function submitAnswer(card, questionType, title, id, userAnswer) {
    // Use the correct ID format for resultDiv and drawer
    const resultDiv = document.getElementById(`result-${id.replace(/^question-/, '')}`);
    const drawer = document.getElementById(`drawer-${id.replace(/^question-/, '')}`);

    if (!resultDiv || !drawer) {
        console.error(`Elements with IDs result-${id.replace(/^question-/, '')} or drawer-${id.replace(/^question-/, '')} not found.`);
        return;
    }

    const correctAnswer = card.dataset.correctAnswer
    // userAnswer = document.querySelector(`#${id} [data-answer]`)

    if (mode === 'quiz') {
        showAnswer(questionType, title, userAnswer, correctAnswer, resultDiv, drawer);
    } else {
        resultDiv.textContent = 'Answer submitted.';
        card.dataset.userAnswer = userAnswer
    }
}

function showAnswer(questionType, title, userAnswer, correctAnswer, resultDiv, drawer) {
    if (questionType === 'trueFalse' || questionType === 'multipleChoice') {
        const userAnswerLower = userAnswer.trim().toLowerCase();
        const correctAnswerLower = correctAnswer.trim().toLowerCase();

        // Ensure that empty string and "false" are not considered the same
        if (userAnswerLower === correctAnswerLower && userAnswer !== "" && correctAnswer !== "") {
            resultDiv.textContent = 'Correct!';
        } else {
            resultDiv.textContent = 'Incorrect.';
        }
    } else {
        const similarity = calculateCosineSimilarity(userAnswer, correctAnswer);
        resultDiv.textContent = similarity > 0.7 ? 'Correct!' : 'Incorrect.';
    }
    drawer.classList.add('open');
}

// function checkAllAnswered(cards) {
//     if (mode === 'test' || mode === 'exam') {
//         cards.forEach((card, index) => {
//             if (!card.dataset.userAnswer) {

//             }
//         })
//         return true
//     }
// }

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
        cards.map((card, index) => {
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
    const cards = document.querySelectorAll('.quiz-card');
    showAllAnswers(cards);
    if (mode == 'test') {
        NotyfService.showMessage('info', "Test Mode Was ON")
    }
}


function showAllAnswers(cards) {

    cards.forEach((card, index) => {
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



        const correctAnswer = card.dataset.correctAnswer
        const userAnswer = card.dataset.userAnswer;
        console.log(userAnswer)
        if (!userAnswer && mode == "exam") {
            return NotyfService.showMessage("warning", `answer  questions ${index + 1} befor submit `, false, false)
        }
        else {
            showAnswer(questionType, title, userAnswer || "", correctAnswer, resultDiv, drawer);
            drawer.classList.add('open')
        }

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



