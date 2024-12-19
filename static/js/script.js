document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const userInput = document.getElementById('user_input');
    const styleSelect = document.getElementById('style_choice');
    const resultBox = document.getElementById('result_box');
    const resultText = document.getElementById('result_text');
    const backButton = document.getElementById('back_btn');
    const themeSelector = document.getElementById('theme_selector');
    const recentHistory = document.getElementById('recent-history'); // Container for history
    const expandedHistory = document.getElementById('expanded-history'); // Expanded history box

    // Array to store local history
    let localHistory = JSON.parse(localStorage.getItem('ideaHistory')) || [];

    // Function to save the current generation to local history
    const saveToHistory = (input, result) => {
        if (localHistory.length >= 10) {
            localHistory.shift(); // Remove the oldest history if we have 10
        }
        localHistory.push({ input, result });
        localStorage.setItem('ideaHistory', JSON.stringify(localHistory));
        updateHistoryUI();
    };

    // Function to update the history UI
    const updateHistoryUI = () => {
        recentHistory.innerHTML = ''; // Clear the current history display
    
        // Display the most recent prompts at the top
        localHistory
            .slice() // Create a copy of the localHistory array
            .reverse() // Reverse the order for top-down display
            .forEach((entry, index) => {
                const button = document.createElement('button');
                button.classList.add('history-button');
                button.textContent = `${entry.input}`;
                button.addEventListener('click', () => toggleExpandedHistory(localHistory.length - 1 - index));
                recentHistory.appendChild(button);
            });
    };

    // Function to toggle expanded history visibility
    const toggleExpandedHistory = (index) => {
        if (expandedHistory.style.display === 'block') {
            expandedHistory.style.display = 'none';
            expandedHistory.innerHTML = '';
        } else {
            expandedHistory.style.display = 'block';
            expandedHistory.innerHTML = `
                <strong>Prompt:</strong> ${localHistory[index].input}<br>
                <strong>Result:</strong> ${localHistory[index].result}
            `;
        }
    };

    // Ensure themeSelector checks
    if (themeSelector) {
        themeSelector.addEventListener('change', (e) => {
            setTheme(e.target.value);
        });
        const savedTheme = localStorage.getItem('theme') || 'light';
        themeSelector.value = savedTheme;
        setTheme(savedTheme);
    }

    // Only run the idea generation logic if those elements exist
    if (userInput && styleSelect && resultBox && resultText && backButton) {
        resultBox.classList.add('hidden');

        const typeText = (element, text, speed = 30) => {
            element.textContent = '';
            let index = 0;
            const type = () => {
                if (index < text.length) {
                    element.textContent += text[index++];
                    setTimeout(type, speed);
                }
            };
            type();
        };

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const inputValue = userInput.value.trim();
                const styleValue = styleSelect.value;

                if (!inputValue) {
                    alert('Please provide some input before generating ideas.');
                    return;
                }

                resultText.textContent = 'Generating your idea...';
                resultBox.classList.remove('hidden');
                resultBox.classList.add('show-result');

                try {
                    const response = await fetch(form.action, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({
                            'user_input': inputValue,
                            'style_choice': styleValue
                        })
                    });

                    const text = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(text, 'text/html');
                    const resultDiv = doc.querySelector('#result');

                    if (resultDiv) {
                        const resultContent = resultDiv.textContent.trim();
                        typeText(resultText, resultContent, 10);
                        saveToHistory(inputValue, resultContent); // Save to local history
                    } else {
                        resultText.textContent = 'No result returned.';
                    }
                } catch (err) {
                    console.error(err);
                    resultText.textContent = 'An error occurred while generating the idea. Please try again.';
                }
            });
        }

        backButton.addEventListener('click', () => {
            resultBox.classList.remove('show-result');
            resultBox.classList.add('hidden');
            userInput.value = '';
            resultText.textContent = '';
        });
    } else {
        console.log("This page does not have the idea generation form.");
    }

    function setTheme(theme) {
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    // Initialize the history UI
    updateHistoryUI();
});

document.querySelector('.menu-toggle').addEventListener('click', () => {
    const nav = document.querySelector('nav');
    nav.classList.toggle('show');
});