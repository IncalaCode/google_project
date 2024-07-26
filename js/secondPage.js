// // code to accept the uploaded file from index.html and insert that file into the file upload from of this page on load
// window.onload = function () {
//   const fileUploadInput = document.getElementById('import_file');
//   const uploadedFile = localStorage.getItem('uploadedFile');
//   if (uploadedFile) {
//     const uploadedFileBlob = JSON.parse(uploadedFile);
//     const file = new File([uploadedFileBlob], 'uploadedFile', { type: uploadedFileBlob.type });
//     const fileList = [file];
//     fileUploadInput.files = fileList;
//   }
// }



// form multiplee Selection

// const form = document.forms['second_page'];
// const successPage = '1.html';
// const failurePage = '2.html';

// form.onsubmit = e => {
//   e.preventDefault(); // disable form submission

//   let formValues = Object.fromEntries(new FormData(form)); // get form inputs

//   // determine redirect based on form values
//   let redirectPage = (formValues.answerq === 'a' && formValues.answerw === 'a' && formValues.answere === 'a') ? successPage : failurePage;

//   console.log(redirectPage);
//   setTimeout(console.clear, 2500);
// };


document.addEventListener('DOMContentLoaded', () => {
  const panel = document.getElementById('panel');
  const toggleButton = document.getElementById('toggleButton');
  toggleButton.innerHTML = '<i class="fas fa-angle-double-down"></i>';

  toggleButton.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) {
      toggleButton.innerHTML = '<i class="fas fa-angle-double-up"></i>';
    } else {
      toggleButton.innerHTML = '<i class="fas fa-angle-double-down"></i>';
    }
    toggleButton.classList.toggle('top');
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const panel = document.getElementById('slide-panel');
  const toggleBtn = document.getElementById('toggle-btn');
  const yesBtn = document.querySelector('.yes-btn');
  const noBtn = document.querySelector('.no-btn');

  function togglePanel() {
    panel.classList.toggle('show');
    toggleBtn.classList.toggle('pushed');
    toggleBtn.innerHTML = panel.classList.contains('show') ? ' <i style="font-size:24px" class="fas">&#xf105;</i>' : '<i class="fas fa-angle-left"></i>';
  }

  toggleBtn.addEventListener('click', togglePanel);

});