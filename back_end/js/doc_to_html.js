

import import_ai from "./connect_to_ai.js";
import Tag from "./classification.js"

/// for addEventListener for file drop
document.getElementById("import_file").addEventListener('change', async (file) => {
    file = file.target.files[0] || [];
    if (file) {
        // Log the file details (remove in production)
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

        try {
            const convertfile = await convertToHtml(result);
            init(convertfile);
        } catch (error) {
            console.error("Error converting file to HTML:", error);
            alert("Error converting file to HTML"); // Handle error appropriately
        }
    }
})




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

// Function to replace <img> tags with their src as text nodes
function img_replaced(htmlContent) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(htmlContent, 'text/html');

    // Get all <img> tags in the document
    var imgTags = doc.getElementsByTagName('img');

    // Iterate over each <img> tag and replace it with its src as text content
    Array.from(imgTags).forEach(function (imgTag) {
        var srcText = document.createTextNode(imgTag.src);
        imgTag.parentNode.replaceChild(srcText, imgTag);
    });

    // Return the updated document as HTML string
    return doc;
}


// Placeholder functions for document conversion
function pdf_convert(file) {
    // Implement PDF conversion logic
}

function ppt_convert(file) {
    // Implement PowerPoint conversion logic
}



/////////////////////////////////////////////////////////////////////////////////////////////////
// Function to initialize and check conversion results
function init(convertfile) {
    if (!convertfile[1].type) {
        return alert("The file is not supported or try again");
    }

    var tag = new Tag()

    convertfile[0] = img_replaced(convertfile[0]);
    console.log(convertfile[0].body);
    convertfile[0] = tag.classify_tag(convertfile[0].body);

    console.log(convertfile[0]);
    document.write(JSON.stringify(convertfile[0]))// Log the modified HTML (remove in production)


    // var res = new import_ai();
    // res.text_gen().then((text) => {
    //     console.log("Generated text:", text);
    //     alert("All safe"); // Placeholder alert, remove it when finished
    // }).catch((error) => {
    //     console.error("Error generating text:", error);
    //     alert("Error generating text"); // Handle error appropriately
    // });
}