

// export function display_list(convertfile) {
//     const displayListElement = document.getElementById('display_list');
//     displayListElement.innerHTML = '';  // Clear any existing content

//     convertfile[0].forEach(element => {
//         switch (element.tag) {
//             case "strong":
//                 displayStrong(element, displayListElement);
//                 break;
//             case "p":
//                 displayParagraph(element, displayListElement);
//                 break;
//             case "normal_tag":
//                 displayNormalTag(element, displayListElement);
//                 break;
//             default:
//                 displayNormalTag(element, displayListElement);
//                 break;
//         }
//     });
// }

// function displayParagraph(element, container) {
//     const p = document.createElement('p');
//     p.innerHTML = element.text;  // Assuming `element.content` contains the text content
//     p.classList.add('hover-shadow', 'p-2', 'my-2', 'bg-light', 'border', 'rounded', 'fade-in');
//     container.appendChild(p);
// }

// function displayNormalTag(element, container) {
//     const span = document.createElement('span');
//     span.innerHTML = element.text;  // Assuming `element.content  ` contains the text content
//     span.classList.add('hover-shadow', 'p-2', 'my-2', 'bg-light', 'border', 'rounded', 'd-block', 'fade-in');
//     container.appendChild(span);
// }

// function displayStrong(element, container) {
//     const strong = document.createElement('p');
//     strong.innerHTML = element.text;  // Assuming `element.content` contains the text content
//     strong.classList.add('hover-shadow', 'p-2', 'my-2', 'bg-light', 'border', 'rounded', 'd-block', 'fade-in');
//     container.appendChild(strong);
// }


// function parseContent(text) {
//     const lines = text ? text.match(/[\.\n\n?]+/) ? text.split(/[\.\n\n?]+/) : [text] : [];
//     const elements = [];

//     if (lines.length > 0) {
//         lines.forEach(line => {

//         });

//     } else {
//         elements = [text]
//     }


//     return elements;
// }
// function parseContent(text) {
//     // Split the text by newlines to separate paragraphs
//     const lines = text ? text.split(/[.?\n(\n\n)]+/) : [];
//     let elements = ""

//     if (lines.length > 0) {
//         lines.forEach(line => {

//             if (line.length > 0) {
//                 // Create a paragraph element
//                 elements += (line) + "<br>";
//             }
//         });
//     } else {
//         elements = text;
//     }

//     return elements;
// }





export function display_list(convertfile) {
    const displayListElement = document.getElementById('display_list');
    displayListElement.innerHTML = '';  // Clear any existing content

    displayListElement.appendChild(code_display(convertfile));


}

function code_display(value) {
    const code_tag = document.createElement('code')
    code_tag.innerHTML = value
    code_tag.classList.add('fade-in', "main_display")
    return code_tag

}


///for the search bar ok 
// Initialize variables to track highlighted elements and current index
let highlightedElements = [];
let currentHighlightIndex = -1;

// Function to highlight and scroll to the next or previous occurrence
function highlightAndScroll(direction) {
    // Remove previous highlighted class
    highlightedElements.forEach(el => el.classList.remove('highlighted'));

    // Select the whole paragraph
    let ob = new Mark(document.querySelector(".main_display"));

    // First unmark the highlighted word or letter
    ob.unmark();

    // Get the highlight color
    let color = document.getElementById('highlight_color').value;

    // Add a temporary style tag for the highlight color
    let style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `.highlight { background-color: ${color}; }`;
    document.head.appendChild(style);

    // Highlight letter or word with options
    ob.mark(document.getElementById("search_word_bar").value, {
        className: 'highlight',
        ignoreJoiners: true, // Ignore certain characters when searching
        separateWordSearch: true, // Treat each word separately
        each: function (element) {
            // Add to highlighted elements array
            highlightedElements.push(element);
        },
        done: function () {
            if (highlightedElements.length > 0) {
                // Update current highlight index based on direction
                if (direction === 'next') {
                    currentHighlightIndex = (currentHighlightIndex + 1) % highlightedElements.length;
                } else if (direction === 'previous') {
                    currentHighlightIndex = (currentHighlightIndex - 1 + highlightedElements.length) % highlightedElements.length;
                }

                // Scroll to the current highlighted element
                let currentElement = highlightedElements[currentHighlightIndex];
                currentElement.classList.add('highlighted');
                currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
}

// Event listener for input in search bar
document.getElementById('search_word_bar').addEventListener('input', () => {
    highlightedElements = [];
    currentHighlightIndex = -1;
    highlightAndScroll('next'); // Highlight and scroll to next occurrence by default
});


