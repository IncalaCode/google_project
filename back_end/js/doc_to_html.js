import import_ai from "./connect_to_ai.js";
import { Tag } from "./classification.js";
import { display_list } from "./display_list.js";


// Add event listener for file drop
document.getElementById("import_file").addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        console.log('File name:', file.name);
        console.log('File size:', file.size);
        console.log('File type:', file.type);

        try {
            let result;
            switch (file.type) {
                case "application/pdf":
                    result = await pdf_convert(file); // Assuming pdf_convert() is defined
                    break;
                case "application/vnd.ms-powerpoint":
                    result = await ppt_convert(file); // Assuming ppt_convert() is defined
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
        }
    }
});

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

// Placeholder functions for document conversion
async function pdf_convert(file) {
    // Implement PDF conversion logic
    throw new Error("pdf_convert function is not implemented");
}

async function ppt_convert(file) {
    // Implement PowerPoint conversion logic
    throw new Error("ppt_convert function is not implemented");
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
        await con_img_ai(imgTags[0], convert_img);
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