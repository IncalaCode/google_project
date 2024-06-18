// Function to convert a document to HTML
function convertToHtml(arrayBuffer) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const arrayBuffer = reader.result;
            mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
                .then((resultObject) => {
                    const result = resultObject.value;
                    resolve([result, { type: result ? true : false }]); // Assuming type: true is a placeholder for some condition
                })
                .catch((error) => {
                    reject(error);
                });
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsArrayBuffer(arrayBuffer);
    });
}

// Function to initialize and check conversion results
function init(convertfile) {


    if (!convertfile[1].type) {
        return alert("The file is not supported or try again");
    }

    convertfile[0] = img_replaced_file(convertfile[0]);

    console.log(convertfile[0])//remove it 
    alert("All safe");  // Placeholder alert, remove it when finished
}


// Function to handle file import from the user
async function import_file(file) {
    file = file.files[0] || [];
    if (file) {
        // Log the file details (remove these lines in production)
        console.log('File name:', file.name);
        console.log('File size:', file.size);
        console.log('File type:', file.type);

        let result;
        if (file.type === "application/pdf") {
            result = pdf_convert(file);  // Assuming pdf_convert() function is defined elsewhere
        } else if (file.type === "application/vnd.ms-powerpoint") {
            result = ppt_convert(file);  // Assuming ppt_convert() function is defined elsewhere
        } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            result = file;
        } else {
            return alert("The document is not supported. Error 1");
        }

        init(await convertToHtml(result));
    }
}

// img to string 
function img_replaced_file(htmlContent) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(htmlContent, 'text/html');

    // Get all <img> tags in the document
    var imgTags = doc.getElementsByTagName('img');

    // Iterate over each <img> tag and replace it with its src
    Array.from(imgTags).forEach(function (imgTag) {


        var srcText = document.createTextNode(imgTag.src);
        // here the ai will cook to change the img to string
        imgTag.parentNode.replaceChild(srcText, imgTag);
    });

    return doc
}

function pdf_convert(file) {

}
// for temp return 
function ppt_convert(file) {

}


function change_imgto_string() {

}


const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI("AIzaSyDTYPNXHwNE5nA5-uHRnBhS_mCXJSoDHXQ");

async function run() {
    // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Write a story about a magic backpack."

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
}

run();