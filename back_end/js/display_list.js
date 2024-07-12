

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


import NotyfService from './message.shower.js';


export async function display_list(convertfile, gen) {
    // to it is commplted and showed

    if (gen) NotyfService.dismiss('success', 'Processing completed!');

    const displayListElement = document.getElementById('display_list');
    displayListElement.innerHTML = '';
    displayListElement.classList.add('fade-in', "main_display")// Clear any existing content

    displayListElement.innerHTML = convertfile;


    // for selecting the selectable place 




}





///for the search bar ok 
// Event listener for input in search bar
document.getElementById('search_word_bar').addEventListener('input', () => {

    // currrent use 
    let current = 0
    // Select the whole paragraph
    var ob = new Mark(document.querySelector(".main_display"));

    // First unmark the highlighted word or letter
    ob.unmark();

    // Get the highlight color
    var color = document.getElementById('highlight_color').value;

    // Add a temporary style tag for the highlight color
    var style = document.createElement('style');
    style.innerHTML = `.highlight { background-color: ${color}; }`;
    document.head.appendChild(style);

    // Highlight letter or word
    ob.mark(document.getElementById("search_word_bar").value, {
        className: 'highlight',

        done: function () {
            // Get all highlighted elements
            var highlightedElements = document.querySelectorAll('.highlight');

            // Scroll to the first highlighted element
            if (highlightedElements.length > 0) {
                highlightedElements[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });

    // for the down button
    document.getElementById('down_btn').addEventListener('click', () => {
        // Get all highlighted elements
        var highlightedElements = document.querySelectorAll('.highlight');

        if (current == highlightedElements.length - 1) {
            alert("you reached the end of search")
        }

        // Scroll to the first highlighted element
        if (highlightedElements.length > 0 && current < highlightedElements.length - 1) {
            highlightedElements[current + 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
            current++
        }
    })

    // for the up button
    document.getElementById('up_btn').addEventListener('click', () => {
        // Get all highlighted elements
        var highlightedElements = document.querySelectorAll('.highlight');

        if (current == 0) {
            alert("you reached the frist of search")
        }
        // Scroll to the first highlighted element
        if (highlightedElements.length > 0 && current > 0) {
            highlightedElements[current - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
            current--
        }
    })
});


// document.getElementById('display_list').addEventListener('mouseup', () => {
//     const selectedTextArea = document.getElementById('selected_place');
//     const selection = window.getSelection();
//     if (selection.toString().trim() !== '') {
//         markInstance.unmark({
//             done: function () {
//                 markInstance.mark(selection.toString(), {
//                     className: 'mark',
//                     done: function () {
//                         selectedTextArea.value = selection.toString();
//                     }
//                 });
//             }
//         });
//     }
// });
