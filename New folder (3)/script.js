document.getElementById('convertButton').addEventListener('click', () => {
    const fileInput = document.getElementById('pdfFile');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a PDF file first.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const pdfData = event.target.result;

        pdfjsLib.getDocument({ data: pdfData }).promise.then(pdf => {
            let textPromises = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                textPromises.push(pdf.getPage(i).then(page => {
                    return page.getTextContent().then(textContent => {
                        return textContent.items.map(item => item.str).join(' ');
                    });
                }));
            }

            Promise.all(textPromises).then(texts => {
                const docText = texts.join('\n\n');
                const blob = new Blob([docText], { type: 'application/msword' });
                const url = URL.createObjectURL(blob);

                const downloadLink = document.getElementById('downloadLink');
                downloadLink.href = url;
                downloadLink.download = 'converted.doc';
                downloadLink.style.display = 'block';
                downloadLink.textContent = 'Download DOC';
            });
        });
    };

    reader.readAsArrayBuffer(file);
});

// Include pdf.js library
const pdfjsLibScript = document.createElement('script');
pdfjsLibScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.min.js';
pdfjsLibScript.onload = () => {
    console.log('pdf.js loaded');
};
document.head.appendChild(pdfjsLibScript);
