$(document).ready(function () {
    var $leftSidebar = $('#left_side_slider');
    var $chatPopup = $('#chatPopup');
    var $chatclose = $('#closeButton')
    var $chatBackdrop = $('#chatbutton');

    $chatclose.click(function () { $chatPopup.hide() })

    // Function to toggle left sidebar
    function toggleLeftSidebar() {
        if ($leftSidebar.hasClass('show')) {
            $leftSidebar.removeClass('show');
            $('.push-content').removeClass('pushed_left');
        } else {
            $leftSidebar.addClass('show');
            $('.push-content').addClass('pushed_left');
        }
    }

    // Toggle left sidebar visibility on icon click
    $('#toggleLeftSidebar').click(function () {
        toggleLeftSidebar();
    });

    // Toggle chat popup
    $('#chatbutton').click(function () {
        $chatPopup.show();
        $chatBackdrop.hide();
    });

    // Close chat popup
    $('#closeButton').click(function () {
        $chatPopup.hide();
        $chatBackdrop.show();
    });

    // Close sidebars and chat popup when clicking outside
    $(document).click(function (e) {

        const is_open = document.getElementById('display_Modal').classList.contains('show')
        if (!is_open) {
            if (!$(e.target).closest('#left_side_slider').length && !$(e.target).is('#toggleLeftSidebar')) {
                if ($leftSidebar.hasClass('show')) {
                    toggleLeftSidebar();
                }
            }
            if (!$(e.target).closest('.popup').length && !$(e.target).is('#chatbutton')) {
                $chatPopup.hide();
                $chatBackdrop.show();
            }
        }

    });

    // Dark mode
    $('#light-mode').click(function () {
        $('body').removeClass('dark-mode');
    });

    $('#dark-mode').click(function () {
        $('body').addClass('dark-mode');
    });
});

document.addEventListener('DOMContentLoaded', function () {
    // Get the modal and button elements
    var modalElement = document.getElementById('display_Modal');
    var openModalButton = document.getElementById('openModalButton');
    var closeModalButton = document.getElementById('closeModalButton');

    // Create a Bootstrap Modal instance
    var modal = new bootstrap.Modal(modalElement);

    // Add event listener to the open modal button
    openModalButton.addEventListener('click', function () {
        modal.show();
    });

    // Add event listener to the close modal button (header close button)
    closeModalButton.addEventListener('click', function () {
        modal.hide();
    });
});






// text animation

const elts = {
    text1: document.getElementById("text1"),
    text2: document.getElementById("text2")
};

const texts = [
    "Welcome! Ready to challenge yourself? Generate a question to get started.",
    "Take quizzes, exams, and tests to assess your knowledge.",
    "Select your topic of interest and explore more.",
    "Generate questions from your chosen topics for focused learning.",
    "Powered by GEMINI AI, providing you with an intelligent learning experience.",
    "Have fun learning and growing!",
    "Developed with 🤖 by @3negas 😊."
];


const morphTime = 2;
const cooldownTime = 3;

let textIndex = texts.length - 1;
let time = new Date();
let morph = 0;
let cooldown = cooldownTime;

elts.text1.textContent = texts[textIndex % texts.length];
elts.text2.textContent = texts[(textIndex + 1) % texts.length];

function doMorph() {
    morph -= cooldown;
    cooldown = 0;

    let fraction = morph / morphTime;

    if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
    }

    setMorph(fraction);
}

function setMorph(fraction) {
    elts.text2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
    elts.text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

    fraction = 1 - fraction;
    elts.text1.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
    elts.text1.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

    elts.text1.textContent = texts[textIndex % texts.length];
    elts.text2.textContent = texts[(textIndex + 1) % texts.length];
}

function doCooldown() {
    morph = 0;

    elts.text2.style.filter = "";
    elts.text2.style.opacity = "100%";

    elts.text1.style.filter = "";
    elts.text1.style.opacity = "0%";
}

function animate() {
    requestAnimationFrame(animate);

    let newTime = new Date();
    let shouldIncrementIndex = cooldown > 0;
    let dt = (newTime - time) / 1000;
    time = newTime;

    cooldown -= dt;

    if (cooldown <= 0) {
        if (shouldIncrementIndex) {
            textIndex++;
        }

        doMorph();
    } else {
        doCooldown();
    }
}

animate();

document.addEventListener('DOMContentLoaded', function() {
    var button = document.querySelectorAll('.choesbutton');

    button.addEventListener('click', function() {
        button.classList.toggle('active');
    });
});




// // chat bot by robera
// function openChat() {
//     document.getElementById("chatPopup").style.display = "flex";
// }

// function closeChat() {
//     document.getElementById("chatPopup").style.display = "none";
// }

// function sendMessage() {
//     const userInput = document.getElementById("userInput").value;
//     if (userInput.trim() !== "") {
//         const chatMessages = document.getElementById("chatMessages");
//         const newMessage = document.createElement("div");
//         newMessage.className = "user-message";
//         newMessage.textContent = userInput;
//         chatMessages.appendChild(newMessage);
//         document.getElementById("userInput").value = "";

//     }
// }
























































































































































































































































window.process = {
    env: {
        api_key: "AIzaSyDTYPNXHwNE5nA5-uHRnBhS_mCXJSoDHXQ",
        db_url: 'https://lxnumuxknannlcrjxocv.supabase.co',
        db_pass: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4bnVtdXhrbmFubmxjcmp4b2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI0NTg2MzQsImV4cCI6MjAzODAzNDYzNH0.KENzD5uQWiw52Qe7mECJyrHm1Bnr46Gv8yqGJwpZH74'
    }
}
