document.addEventListener("DOMContentLoaded", function () {
    var content = document.getElementById('display_list');

    new TextHighlighter(content, {
        color: 'yellow',
        onBeforeHighlight: function (range) {
            // Check if the range is inside a collapsible div
            var parent = range.commonAncestorContainer;
            while (parent) {
                if (parent.classList && parent.classList.contains('collapse')) {
                    return false;
                }
                parent = parent.parentNode;
            }
            return window.confirm('Selected text: ' + range + '\nReally highlight?');
        },
        onAfterHighlight: function (range, highlights) {
            window.alert('Created ' + highlights.length + ' highlight(s): ' + highlights.map(function (h) {
                return '"' + h.innerText + '"';
            }).join(', '));

            let index = 0

            highlights.forEach(function (highlight) {
                // Create a collapsible section inside the highlighted text
                var highlightContainer = document.createElement('div');
                highlightContainer.classList.add('highlight-container', 'card');

                var cardHeader = document.createElement('div');
                cardHeader.classList.add('card-header');
                cardHeader.innerHTML = `
                    <h5 class="mb-0" style="font-size: 12px; text-align: left;">
                        <span class="btn-link">${highlight.textContent.substring(0, 10).trim()}...</span>
                    </h5>
                `;

                var btnGroup = document.createElement('div');
                btnGroup.classList.add('btn-group');

                var removeButton = document.createElement('button');
                removeButton.classList.add('btn', 'btn-danger', 'btn-sm', 'btn-remove');
                removeButton.innerText = 'Remove';
                removeButton.addEventListener('click', function () {
                    var cardBodyText = highlightContainer.querySelector('.card-body').textContent;
                    var textNode = document.createTextNode(cardBodyText);
                    highlightContainer.replaceWith(textNode);
                });

                var collapseButton = document.createElement('button');
                collapseButton.classList.add('btn', 'btn-info', 'btn-sm', 'btn-collapse');
                collapseButton.innerText = '+';
                collapseButton.setAttribute('data-bs-toggle', 'collapse');
                collapseButton.setAttribute('data-bs-target', `#collapse-${index}`);

                btnGroup.appendChild(collapseButton);
                btnGroup.appendChild(removeButton);
                cardHeader.appendChild(btnGroup);

                var collapseSection = document.createElement('div');
                collapseSection.classList.add('collapse');
                collapseSection.id = `collapse-${index}`;
                collapseSection.innerHTML = `<div class="card-body">${highlight.innerHTML}</div>`;

                ///to incres the index
                index++;

                highlightContainer.appendChild(cardHeader);
                highlightContainer.appendChild(collapseSection);

                highlight.replaceWith(highlightContainer);

            });
        },
    });
});


// for the dsiplaying the search 
document.addEventListener('DOMContentLoaded', () => {
    let menu = document.querySelector(".menu");
    let button = document.querySelector(".menu__button");
    toggleMenu = () => {
        menu.classList.toggle("open");
    }
    button.addEventListener("click", function () {

        toggleMenu();
    });

}
)
