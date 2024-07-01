// code to accept the uploaded file from index.html and insert that file into the file upload from of this page on load
window.onload = function() {
  const fileUploadInput = document.getElementById('import_file');
  const uploadedFile = localStorage.getItem('uploadedFile');
  if (uploadedFile) {
    const uploadedFileBlob = JSON.parse(uploadedFile);
    const file = new File([uploadedFileBlob], 'uploadedFile', {type: uploadedFileBlob.type});
    const fileList = [file];
    fileUploadInput.files = fileList;
  }
}



// form multiplee Selection

const form = document.forms['second_page'];
const successPage = '1.html';
const failurePage = '2.html';

form.onsubmit = e => {
    e.preventDefault(); // disable form submission

    let formValues = Object.fromEntries(new FormData(form)); // get form inputs

    // determine redirect based on form values
    let redirectPage = (formValues.answerq === 'a' && formValues.answerw === 'a' && formValues.answere === 'a') ? successPage : failurePage;

    console.log(redirectPage);
    setTimeout(console.clear, 2500);
};


// ....
// -const
// -  myForm = document.forms['second_page']
// -, x = '1.html'
// -, y = '2.html'
// -  ; 
// -myForm.onsubmit = e =>
// -  {
// -  e.preventDefault(); // disable submit
// -  
// -  let val = Object.fromEntries(new FormData(myForm)); // get inputs
// - 
// -  // window.location =
// -  let window_location = (val.answerq === 'a' 
// -                      && val.answerw === 'a' 
// -                      && val.answere === 'a'
// -                        ) ? x : y ;
// -                    
// -  console.log( window_location );
// -  setTimeout( console.clear, 2500 );
// -  }


// document.getElementById('collapseBtn').addEventListener('click', function() {
//   const collapsibleElements = document.getElementById('collapsible').querySelectorAll('*');
//   collapsibleElements.forEach(element => {
//     element.style.visibility = 'hidden';
//   });
//   document.getElementById('collapsible').classList.toggle('collapse');
// });
