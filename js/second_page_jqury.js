$(document).ready(function () {
    var $leftSidebar = $('#left_side_slider');
    var $chatPopup = $('#chatPopup');
    var $chatBackdrop = $('#chatbutton');

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
        if (!$(e.target).closest('#left_side_slider').length && !$(e.target).is('#toggleLeftSidebar')) {
            if ($leftSidebar.hasClass('show')) {
                toggleLeftSidebar();
            }
        }
        if (!$(e.target).closest('.popup').length && !$(e.target).is('#chatbutton')) {
            $chatPopup.hide();
            $chatBackdrop.show();
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






// text animation

const elts = {
    text1: document.getElementById("text1"),
    text2: document.getElementById("text2")
  };
  
  const texts = [
    "Generate Question",
    "Take Quizes",
    "Summerize Texts",
    "Create",
    "Powerd By",
    "GEMINI AI",
    // "a Love",
    // ":)",
    // "by @GevStack"
  ];
  
  const morphTime = 1;
  const cooldownTime = 0.5;
  
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
  
  
  // chat bot by robera
  function openChat() {
    document.getElementById("chatPopup").style.display = "flex";
  }
  
  function closeChat() {
    document.getElementById("chatPopup").style.display = "none";
  }
  
  function sendMessage() {
    const userInput = document.getElementById("userInput").value;
    if (userInput.trim() !== "") {
        const chatMessages = document.getElementById("chatMessages");
        const newMessage = document.createElement("div");
        newMessage.className = "user-message";
        newMessage.textContent = userInput;
        chatMessages.appendChild(newMessage);
        document.getElementById("userInput").value = "";
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }
  

  
  