import import_ai from "./connect_to_ai.js";
import { Tag } from "./classification.js";
import { display_list } from "./display_list.js";
import { generate, scrollToElementById } from "./generatequestion.js";
import NotyfService from './message.shower.js';


// form the input text to generate
document.getElementById('inputText').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {

        GetTxtGenrate(e.target.value, true);

    }
});


// form the input text to generate
document.getElementById('text_imoprt').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        scrollToElementById('start-guide')
        GetTxtGenrate(e.target.value, false);

    }
});


async function GetTxtGenrate(value, gen) {
    NotyfService.showMessage('loading', ' while preparing input wacth our start giude video :) ', true)
    var temp = new import_ai()
    temp.genrateDox(value).then(data => {
        display_list(data, gen)
        return gen || generate()
    })
}

document.getElementById('file_import').addEventListener('change', (e) => {
    if (!e.target.files.length) {
        NotyfService.showMessage('warning', "Drag or click to upload a file ;)", false);
        return;
    }

    // Simulated progress check
    let progressInterval = setInterval(() => {
        // wait for the display it in list
        const vlaue = document.getElementById('display_list').getAttribute('data-type')

        if (parseInt(vlaue)) {
            clearInterval(progressInterval);
            generate()
        }
    }, 100);
});


document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
    const dropZoneElement = inputElement.closest(".drop-zone");

    dropZoneElement.addEventListener("click", (e) => {
        inputElement.click();
    });

    inputElement.addEventListener("change", (e) => {
        if (inputElement.files.length) {
            updateThumbnail(dropZoneElement, inputElement.files[0]);
        }
    });

    dropZoneElement.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZoneElement.classList.add("drop-zone--over");
    });

    ["dragleave", "dragend"].forEach((type) => {
        dropZoneElement.addEventListener(type, (e) => {
            dropZoneElement.classList.remove("drop-zone--over");
        });
    });

    dropZoneElement.addEventListener("drop", (e) => {
        e.preventDefault();

        if (e.dataTransfer.files.length) {
            inputElement.files = e.dataTransfer.files;
            updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
        }

        dropZoneElement.classList.remove("drop-zone--over");
    });
});

/**
 * Updates the thumbnail on a drop zone element.
 *
 * @param {HTMLElement} dropZoneElement
 * @param {File} file
 */
function updateThumbnail(dropZoneElement, file) {
    let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

    // First time - remove the prompt
    if (dropZoneElement.querySelector(".drop-zone__prompt")) {
        dropZoneElement.querySelector(".drop-zone__prompt").remove();
    }

    // First time - there is no thumbnail element, so lets create it
    if (!thumbnailElement) {
        thumbnailElement = document.createElement("div");
        thumbnailElement.classList.add("drop-zone__thumb");
        dropZoneElement.appendChild(thumbnailElement);
    }



    thumbnailElement.dataset.label = file.name;
    thumbnailElement.style.backgroundImage = null;

    //then send it to handel the file
    file_handler(file)
}


// Add event listener for file drop
async function file_handler(file) {

    // to start the dox race

    NotyfService.showMessage("loading", "Processing the imported document ;)", true);
    scrollToElementById('start-guide')

    if (file) {
        console.log('File name:', file.name);
        console.log('File size:', file.size);
        console.log('File type:', file.type);

        try {
            let result;
            switch (file.type) {
                case "application/pdf":
                    result = await convertPdfToDoc(file); // Assuming pdf_convert() is defined
                    return display_list(result)
                    break;
                case "application/vnd.ms-powerpoint":
                    result = await ppt_convert(file); // Assuming ppt_convert() is defined
                    return NotyfService.showMessage('error', "power point is not allowed for momment")
                    break;
                case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                    result = file;
                    break;
                default:
                    alert("The document is not supported. Error 1");
                    return;
            }

            const convertedFile = await convertToHtml(result);
            await init(convertedFile);
        } catch (error) {
            console.error("Error converting file to HTML:", error);
            alert("Error converting file to HTML");
            window.location.reload();

        }
    } else {
        console.log('not passing')
    }
};

// Function to convert a document to HTML
function convertToHtml(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const arrayBuffer = reader.result;
            mammoth.convertToHtml({ arrayBuffer })
                .then((resultObject) => {
                    const result = resultObject.value;
                    resolve([result, { type: !!result }]);
                })
                .catch(reject);
        };

        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// Function to convert PDF to readable text
function convertPdfToDoc(file) {
    return new Promise((resolve, reject) => {
        if (!file) return reject('No file provided.');

        const reader = new FileReader();
        reader.onload = function (event) {
            const pdfData = event.target.result;

            pdfjsLib.getDocument({ data: pdfData }).promise.then(pdf => {
                let textPromises = [];
                for (let i = 1; i <= pdf.numPages; i++) {
                    textPromises.push(pdf.getPage(i).then(page => {
                        return page.getTextContent().then(textContent => {
                            // Join text items into a single paragraph
                            return textContent.items.map(item => item.str).join('');
                        });
                    }));
                }

                Promise.all(textPromises).then(texts => {
                    const docText = texts.map(text => `<div class="paragraph">${text}</div>`).join('');
                    resolve(docText);
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        };

        reader.onerror = function (error) {
            reject(error);
        };

        reader.readAsArrayBuffer(file);
    });
}

async function ppt_convert(file) {
    return 0
}

// Function to initialize and check conversion results
async function init(convertedFile) {
    if (!convertedFile[1].type) {
        alert("The file is not supported or try again");
        return;
    }
    await replaceImagesWithText(convertedFile[0], convertedFile);
}

// Function to replace <img> tags with their src as text nodes
async function replaceImagesWithText(htmlContent, convertedFile) {
    const parser = new DOMParser();
    const tag = new Tag();

    const doc = parser.parseFromString(htmlContent, 'text/html');
    const imgTags = doc.getElementsByTagName('img');
    const convert_img = new import_ai();

    for (let element of imgTags) {
        await con_img_ai(element, convert_img)
    }

    //for unfinshed list with  error hundleing method 
    try {

        for (let element of imgTags) {
            await con_img_ai(element, convert_img)
        }
    } catch (error) {
        console.error("Error processing image:", error);
    }


    console.log(JSON.stringify(convertedFile));

    convertedFile[0] = tag.classify_tag(doc.body.innerHTML);
    console.log(convertedFile[0]);

    // For displaying the list
    display_list(convertedFile);

    console.log(convertedFile);
}

async function con_img_ai(element, convert_img) {
    const srcText = document.createTextNode(element.src);
    const response = await convert_img.img_convert_text(srcText.data);
    srcText.data = "image information [" + response + "]";
    element.parentNode.replaceChild(srcText, element);
}