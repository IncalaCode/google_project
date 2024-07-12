const container = document.getElementById('display_list');
const annotationsList = document.getElementById('annotationsList');
const penTool = document.getElementById('penTool');
const highlightbtn = document.querySelector("#highlightchooesbut");
const errors = document.querySelector("#errors");

let selectedRange = null;
let penActive = false;
let currentSpan = null;
let popupVisible = false; // Track if the popup is currently visible

container.addEventListener("mouseup", selectableTextAreaMouseUp);

penTool.addEventListener('click', () => {
    penActive = !penActive;
    penTool.style.backgroundColor = penActive ? '#e0e0e0' : '';
    container.style.cursor = penActive ? 'crosshair' : 'text';
});

highlightbtn.addEventListener('click', () => {
    if (selectedRange) {
        try {
            const span = document.createElement('span');
            span.className = 'highlight ';
            span.dataset.fullText = selectedRange.toString(); // Store the full text

            selectedRange.surroundContents(span);

            span.dataset.annotation = ""; // Initialize data-annotation attribute
            span.dataset.collapsed = "true"; // Initialize collapsed state
            span.innerHTML = `<span class="collapsed-text">${span.dataset.fullText.slice(0, 10)}...</span>`; // Show initial text with ellipsis

            const iconButton = document.createElement('button');
            iconButton.className = 'btn btn-sm btn-info ml-2';
            iconButton.innerHTML = '<i class="fas fa-caret-down"></i>';
            iconButton.addEventListener('click', (event) => {
                toggleSpan(span);
                event.stopPropagation();
                scrollToSpan(span);
            });

            span.appendChild(iconButton);

            span.addEventListener('mouseover', (event) => {
                currentSpan = span;
                showPopup(event, span);
            });
            span.addEventListener('mouseout', () => {
                hidePopup();
            });

            span.addEventListener('click', () => {
                toggleSpan(span);
                scrollToSpan(span);
            });

            selectedRange = null;
            highlightbtn.style.display = 'none';

        } catch (error) {
            showError("You can't highlight both highlighted and unhighlighted text.", 'warning', highlightbtn);
        }
    }
});

function toggleSpan(span) {
    const isCollapsed = span.dataset.collapsed === "true";
    if (isCollapsed) {
        span.dataset.collapsed = "false";
        span.innerHTML = span.dataset.fullText; // Show full text
    } else {
        span.dataset.collapsed = "true";
        span.innerHTML = `<span class="collapsed-text">${span.dataset.fullText.slice(0, 10)}...</span>`; // Show collapsed text
    }

    // Re-add the icon button after toggling
    const iconButton = document.createElement('button');
    iconButton.className = 'btn btn-sm btn-info ml-2';
    iconButton.innerHTML = isCollapsed ? '<i class="fas fa-caret-down"></i>' : '<i class="fas fa-caret-up"></i>';
    iconButton.addEventListener('click', (event) => {
        toggleSpan(span);
        event.stopPropagation();
        scrollToSpan(span);
    });
    span.appendChild(iconButton);
}

function scrollToSpan(span) {
    span.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
}

function showError(error, type, where) {
    where.style.display = 'none';
    errors.classList.add(type);
    errors.innerHTML = error;
}

document.addEventListener("mousedown", documentMouseDown);

function selectableTextAreaMouseUp(event) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        selectedRange = selection.getRangeAt(0);
        setTimeout(() => {
            const selectedText = selection.toString().trim();
            if (selectedText.length) {
                const x = event.pageX;
                const y = event.pageY;
                const highlightBtnWidth = Number(getComputedStyle(highlightbtn).width.slice(0, -2));
                const highlightBtnHeight = Number(getComputedStyle(highlightbtn).height.slice(0, -2));

                highlightbtn.style.left = `${x - highlightBtnWidth * 0.5}px`;
                highlightbtn.style.top = `${y - highlightBtnHeight * 1.25}px`;
                highlightbtn.style.display = "block";
                highlightbtn.classList.add("btnEntrance");
            }
        }, 0);
    }
}

function documentMouseDown(event) {
    if (event.target.id !== "highlightchooesbut" && getComputedStyle(highlightbtn).display === "block") {
        highlightbtn.style.display = "none";
        highlightbtn.classList.remove("btnEntrance");
        window.getSelection().empty();
    }
}

function addAnnotation(annotation, element) {
    const selectedText = element.textContent;
    const li = document.createElement('li');
    li.textContent = `${selectedText}: ${annotation}`;
    annotationsList.appendChild(li);

    element.addEventListener('click', () => {
        alert(`Annotation: ${annotation}`);
    });
}

function createPopup() {
    // Create the popup container
    const popup = document.createElement('div');
    popup.id = 'popup';
    popup.classList.add('popup', 'popup_display', 'position-fixed', 'bg-light', 'p-3', 'border', 'rounded', 'fade-in');

    // Create the close button
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.classList.add('btn-close', 'float-end');
    closeButton.ariaLabel = 'Close';
    closeButton.addEventListener('click', hidePopup);

    // Create the textarea for input
    const textarea = document.createElement('input');
    textarea.id = 'annotationText';
    textarea.classList.add('form-control', 'my-2');
    textarea.placeholder = 'Add your annotation...';

    // Create the save button
    const saveButton = document.createElement('button');
    saveButton.id = 'saveAnnotation';
    saveButton.classList.add('btn', 'btn-primary', 'me-2');
    saveButton.innerHTML = '<i class="fas fa-save"></i> Save';

    // Create the delete button
    const deleteButton = document.createElement('button');
    deleteButton.id = 'deleteAnnotation';
    deleteButton.classList.add('btn', 'btn-danger');
    deleteButton.innerHTML = '<i class="fas fa-trash"></i> Delete';

    // Append elements to the popup
    popup.appendChild(closeButton);
    popup.appendChild(textarea);
    popup.appendChild(saveButton);
    popup.appendChild(deleteButton);

    // Append the popup to the body
    document.body.appendChild(popup);

    // Add event listener for save button
    saveButton.addEventListener('click', () => {
        if (currentSpan) {
            const annotation = textarea.value;
            currentSpan.dataset.annotation = annotation;
            console.log('Annotation saved:', annotation);
        }
        hidePopup();
    });

    // Add event listener for delete button
    deleteButton.addEventListener('click', () => {
        if (currentSpan) {
            currentSpan.remove();
            currentSpan = null;
            console.log('Annotation deleted');
        }
        hidePopup();
    });

    return popup;
}

function showPopup(event, span) {
    const popup = document.getElementById('popup') || createPopup();
    const textarea = popup.querySelector('#annotationText');

    textarea.value = span.dataset.annotation; // Load existing annotation

    const rect = span.getBoundingClientRect();
    popup.style.left = `${rect.left + window.scrollX - 100}px`; // Position to the left of the span
    popup.style.top = `${rect.top + window.scrollY}px`;

    popup.style.display = 'block';
    popupVisible = true; // Mark popup as visible
}

function hidePopup() {
    if (popupVisible) {
        const popup = document.getElementById('popup');
        if (popup) {
            popup.style.display = 'none';
            popupVisible = false; // Mark popup as hidden
        }
    }
}

document.addEventListener('mousedown', (event) => {
    const popup = document.getElementById('popup');
    if (popup && !popup.contains(event.target) && (!currentSpan || !currentSpan.contains(event.target))) {
        hidePopup();
    }
});

document.addEventListener('mouseover', (event) => {
    const popup = document.getElementById('popup');
    if (popup && currentSpan && (currentSpan.contains(event.target) || popup.contains(event.target))) {
        showPopup(event, currentSpan);
    }
});

document.addEventListener('mouseout', (event) => {
    const popup = document.getElementById('popup');
    if (popup && currentSpan && !currentSpan.contains(event.target) && !popup.contains(event.target)) {
        hidePopup();
    }
});
