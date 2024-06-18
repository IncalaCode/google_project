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

    var img_replaced_file = img_replaced_file(convertfile);

    console.log(convertfile)//remove it 
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
function img_replaced_file() {

}

function pdf_convert(file) {

}
// for temp return 
function ppt_convert(file) {

}


