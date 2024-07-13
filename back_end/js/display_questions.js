
import { showBotMessage } from "./generatequestion.js";

// Function to create the combined matching card
function createCombinedMatchingCard(cardBody, matchingQuestions) {
    const matchContainer = document.createElement('div');
    matchContainer.classList.add('match-container');

    const questionsList = matchingQuestions.map(q => q.text.question);
    const answersList = matchingQuestions.map(q => q.text.answer);

    const combinedList = [...questionsList, ...answersList];

    combinedList.forEach((item, index) => {
        const p = document.createElement('p');
        p.innerHTML = `${index + 1}. ${item}`;
        matchContainer.appendChild(p);
    });

    cardBody.appendChild(matchContainer);

    // Event listener for the match container
    matchContainer.addEventListener('click', function () {
        alert('Here are the answers and explanations for this matching question:');
        matchingQuestions.forEach((q, index) => {
            alert(`Q${index + 1}: ${q.text.question}\nA${index + 1}: ${q.text.answer}\nExplanation: ${q.text.explanation}`);
        });
    });
}

// Original functions to create cards
function createTrueFalseCard(cardBody) {
    const trueBtn = document.createElement('button');
    trueBtn.classList.add('btn', 'btn-primary', 'true-false-btn', 'mr-2');
    trueBtn.setAttribute('data-answer', 'true');
    trueBtn.textContent = 'True';
    cardBody.appendChild(trueBtn);

    const falseBtn = document.createElement('button');
    falseBtn.classList.add('btn', 'btn-danger', 'true-false-btn', 'mr-2');
    falseBtn.setAttribute('data-answer', 'false');
    falseBtn.textContent = 'False';
    cardBody.appendChild(falseBtn);
}

function createMultipleChoiceCard(cardBody, options, cardTitle) {
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.classList.add('btn', 'btn-primary', 'multiple-choice-btn', 'mr-2');
        btn.textContent = option;
        cardBody.appendChild(btn);

        // Event listener for multiple choice buttons
        btn.addEventListener('click', function () {
            alert(`Card "${cardTitle}": You selected "${option}"`);
        });
    });
}

function createShortAnswerCard(cardBody) {
    const shortAnswerContainer = document.createElement('div');
    shortAnswerContainer.classList.add('short-answer-container');
    const input = document.createElement('input');
    input.classList.add('form-control', 'mb-2', 'short-answer-input');
    input.setAttribute('placeholder', 'Your answer');
    shortAnswerContainer.appendChild(input);
    cardBody.appendChild(shortAnswerContainer);
}

function createEssayCard(cardBody) {
    const essayContainer = document.createElement('div');
    essayContainer.classList.add('essay-container');
    const textarea = document.createElement('textarea');
    textarea.classList.add('form-control', 'mb-2', 'essay-textarea');
    textarea.setAttribute('rows', '6');
    textarea.setAttribute('placeholder', 'Write your essay here...');
    essayContainer.appendChild(textarea);
    cardBody.appendChild(essayContainer);
}

export default function createCard(cardType, title, question, options) {
    const card = document.createElement('div');
    card.classList.add('card', 'mb-4');

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

    switch (cardType) {
        case 'trueFalse':
            createTrueFalseCard(cardBody);
            break;
        case 'multipleChoice':
            createMultipleChoiceCard(cardBody, options, title);
            break;
        case 'matching':
            createCombinedMatchingCard(cardBody, options);
            break;
        case 'shortAnswer':
            createShortAnswerCard(cardBody);
            break;
        case 'essay':
            createEssayCard(cardBody);
            break;
        default:
            console.error(`Unknown card type: ${cardType}`);
            return;
    }

    const cardFooter = document.createElement('div');
    cardFooter.classList.add('card-footer');

    const footerIcons = document.createElement('div');
    footerIcons.classList.add('footer-icons');
    footerIcons.innerHTML = `
        <i class="fas fa-redo-alt reset-btn"></i>
        <i class="fas fa-robot call"></i>
    `;

    cardFooter.appendChild(footerIcons);
    card.appendChild(cardBody);
    card.appendChild(cardFooter);

    document.getElementById('card-container').appendChild(card);

    // Add event listeners
    if (cardType === 'trueFalse') {
        card.querySelectorAll('.true-false-btn').forEach(function (button) {
            button.addEventListener('click', function () {
                alert(`Card "${title}": You selected "${this.getAttribute('data-answer')}"`);
            });
        });
    } else if (cardType === 'shortAnswer') {
        card.querySelectorAll('.short-answer-input').forEach(function (input) {
            input.addEventListener('blur', function () {
                alert(`Card "${title}": Your answer is "${this.value}"`);
            });
        });
    }

    card.querySelectorAll('.reset-btn').forEach(function (button) {
        button.addEventListener('click', function () {
            var card = this.closest('.card');
            card.querySelectorAll('button').forEach(function (btn) {
                btn.classList.remove('btn-success');
                btn.classList.add('btn-primary');
            });
            card.querySelectorAll('input').forEach(function (input) {
                input.value = '';
            });
            card.querySelectorAll('textarea').forEach(function (textarea) {
                textarea.value = '';
            });
        });
    });

    card.querySelectorAll('.call').forEach(function (button) {
        button.addEventListener('click', function () {
            const card = this.closest('.card');
            const cardTitle = card.querySelector('.card-header h5').textContent;
            const cardText = card.querySelector('.card-text').textContent;
            showBotMessage(`questin_type "${cardTitle}": \nQuestion: ${cardText} explain  it to me  `)
            alert(`Call functionality for card "${cardTitle}": \nQuestion: ${cardText} `);
        });
    });
}
