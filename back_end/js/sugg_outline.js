import { ai } from "./generatequestion.js";

document.addEventListener('DOMContentLoaded', load);

function load() {
    const input = document.querySelector('.suggestions');
    const suggestionList = document.getElementById('suggestion-list');
    const loader = document.getElementById('loader');
    let currentIndex = -1; // To keep track of the current active suggestion
    let debounceTimeout;

    function showLoader() {
        loader.style.display = 'block';
    }

    function hideLoader() {
        loader.style.display = 'none';
    }

    function fetchSuggestions(query) {
        return new Promise(async (resolve, reject) => {
            try {
                // Fetch suggestions asynchronously
                const aiSuggestions = await ai.get_suggestion(query);
                // Resolve the promise with the filtered suggestions
                resolve(aiSuggestions);
            } catch (error) {
                // In case of an error, reject the promise
                reject(error);
            }
        });
    }

    async function showSuggestions() {
        showLoader();
        const query = input.value;
        if (query.length < 3) {
            hideLoader();
            suggestionList.innerHTML = '';
            suggestionList.style.display = 'none';
            return;
        }
        try {
            const suggestions = await fetchSuggestions(query);

            // Check if suggestions is null or undefined
            if (!Array.isArray(suggestions)) {
                throw new Error('Suggestions is not an array');
            }

            suggestionList.innerHTML = '';
            currentIndex = -1; // Reset current index when new suggestions are shown

            if (suggestions.length > 0) {
                suggestions.forEach(suggestion => {
                    const listItem = document.createElement('li');
                    listItem.className = 'list-group-item list-group-item-action';
                    listItem.innerHTML = `<span>${suggestion.word}</span><a href="${suggestion.reference}" target="_blank" class="reference-link">Reference</a>`;
                    listItem.addEventListener('click', () => {
                        input.value = suggestion.word;
                        suggestionList.innerHTML = '';
                        suggestionList.style.display = 'none';
                    });
                    suggestionList.appendChild(listItem);
                });
                suggestionList.style.display = 'block';
            } else {
                const notFoundItem = document.createElement('li');
                notFoundItem.className = 'list-group-item';
                notFoundItem.textContent = 'No suggestions found';
                suggestionList.appendChild(notFoundItem);
                suggestionList.style.display = 'block';
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);

            // Display "No suggestions found" in case of error
            suggestionList.innerHTML = '';
            const notFoundItem = document.createElement('li');
            notFoundItem.className = 'list-group-item';
            notFoundItem.textContent = 'No suggestions found';
            suggestionList.appendChild(notFoundItem);
            suggestionList.style.display = 'block';
        }
        hideLoader();
    }


    function handleNavigation(e) {
        const items = suggestionList.getElementsByTagName('li');
        if (items.length === 0) return;

        if (e.key === 'ArrowDown') {
            if (currentIndex < items.length - 1) {
                currentIndex++;
            } else {
                currentIndex = 0;
            }
        } else if (e.key === 'ArrowUp') {
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = items.length - 1;
            }
        } else if (e.key === 'Enter' && currentIndex >= 0) {
            items[currentIndex].click();
        }

        for (let i = 0; i < items.length; i++) {
            items[i].classList.remove('active');
        }

        if (currentIndex >= 0 && currentIndex < items.length) {
            items[currentIndex].classList.add('active');
        }
    }

    input.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
            handleNavigation(e);
            return;
        }
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(showSuggestions, 700);
    });

    input.addEventListener('blur', () => {
        setTimeout(() => {
            suggestionList.style.display = 'none';
            hideLoader();
        }, 200); // Delay to allow click on suggestion
    });

    input.addEventListener('focus', () => {
        if (input.value.length > 0) {
            showSuggestions();
        }
    });
}