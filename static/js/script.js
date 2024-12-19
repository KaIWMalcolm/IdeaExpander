// Wait until the DOM is fully loaded before executing JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Element references for various parts of the UI
    const form = document.querySelector('form'); // Form for submitting user input
    const userInput = document.getElementById('user_input'); // Textarea for user input
    const styleSelect = document.getElementById('style_choice'); // Dropdown menu for style choice
    const resultBox = document.getElementById('result_box'); // Container for displaying generated results
    const resultText = document.getElementById('result_text'); // Text content of the result box
    const backButton = document.getElementById('back_btn'); // Button to go back from result display
    const themeSelector = document.getElementById('theme_selector'); // Dropdown for theme selection
    const recentHistory = document.getElementById('recent-history'); // Container for displaying recent history
    const expandedHistory = document.getElementById('expanded-history'); // Container for expanded history details

    // Initialize the local history from localStorage or as an empty array if none exists
    let localHistory = JSON.parse(localStorage.getItem('ideaHistory')) || [];

    /**
     * Save the current prompt and its result to the local history.
     * Maintains a maximum of 10 entries in the history.
     */
    const saveToHistory = (input, result) => {
        if (localHistory.length >= 10) {
            localHistory.shift(); // Remove the oldest entry if history exceeds 10 items
        }
        localHistory.push({ input, result }); // Add the new entry
        localStorage.setItem('ideaHistory', JSON.stringify(localHistory)); // Save updated history to localStorage
        updateHistoryUI(); // Update the history display
    };

    /**
     * Update the history display in the UI.
     * Displays the most recent prompts at the top.
     */
    const updateHistoryUI = () => {
        recentHistory.innerHTML = ''; // Clear the existing display

        // Display the most recent prompts (reversed order)
        localHistory
            .slice() // Create a copy of the history array
            .reverse() // Reverse the array for most recent first
            .forEach((entry, index) => {
                const button = document.createElement('button'); // Create a button for each history item
                button.classList.add('history-button'); // Add styling class
                button.textContent = `${entry.input}`; // Display the prompt text
                button.addEventListener('click', () => toggleExpandedHistory(localHistory.length - 1 - index)); // Add click event for expanded history
                recentHistory.appendChild(button); // Add the button to the history container
            });
    };

    /**
     * Toggle the visibility of the expanded history view.
     * Displays detailed input and result for a selected history item.
     */
    const toggleExpandedHistory = (index) => {
        if (expandedHistory.style.display === 'block') {
            expandedHistory.style.display = 'none'; // Hide if already visible
            expandedHistory.innerHTML = ''; // Clear content
        } else {
            expandedHistory.style.display = 'block'; // Show the expanded view
            expandedHistory.innerHTML = `
                <strong>Prompt:</strong> ${localHistory[index].input}<br>
                <strong>Result:</strong> ${localHistory[index].result}
            `; // Populate with selected history details
        }
    };

    /**
     * Set the theme for the website based on user selection.
     */
    function setTheme(theme) {
        const root = document.documentElement; // Reference to the root element for CSS variables
        root.setAttribute('data-theme', theme); // Apply the theme to the root element
        localStorage.setItem('theme', theme); // Save the selected theme to localStorage
    }

    // Initialize the theme selector dropdown
    if (themeSelector) {
        themeSelector.addEventListener('change', (e) => {
            setTheme(e.target.value); // Update the theme on selection change
        });
        const savedTheme = localStorage.getItem('theme') || 'light'; // Load saved theme or default to 'light'
        themeSelector.value = savedTheme; // Set the dropdown value
        setTheme(savedTheme); // Apply the theme
    }

    // Ensure required elements exist before adding idea generation logic
    if (userInput && styleSelect && resultBox && resultText && backButton) {
        resultBox.classList.add('hidden'); // Initially hide the result box

        /**
         * Simulate typing effect when displaying generated results.
         */
        const typeText = (element, text, speed = 30) => {
            element.textContent = ''; // Clear existing content
            let index = 0;
            const type = () => {
                if (index < text.length) {
                    element.textContent += text[index++]; // Append next character
                    setTimeout(type, speed); // Delay before next character
                }
            };
            type(); // Start typing
        };

        // Add event listener for form submission
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault(); // Prevent default form submission
                const inputValue = userInput.value.trim(); // Get trimmed user input
                const styleValue = styleSelect.value; // Get selected style

                if (!inputValue) {
                    alert('Please provide some input before generating ideas.'); // Warn if input is empty
                    return;
                }

                // Show loading state in the result box
                resultText.textContent = 'Generating your idea...';
                resultBox.classList.remove('hidden'); // Show the result box
                resultBox.classList.add('show-result'); // Add animation class

                try {
                    // Send the input to the server for processing
                    const response = await fetch(form.action, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({
                            'user_input': inputValue,
                            'style_choice': styleValue
                        })
                    });

                    const text = await response.text(); // Get the response text
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(text, 'text/html'); // Parse HTML response
                    const resultDiv = doc.querySelector('#result'); // Find the result div

                    if (resultDiv) {
                        const resultContent = resultDiv.textContent.trim(); // Get the generated result
                        typeText(resultText, resultContent, 10); // Display with typing effect
                        saveToHistory(inputValue, resultContent); // Save to history
                    } else {
                        resultText.textContent = 'No result returned.'; // Handle empty result
                    }
                } catch (err) {
                    console.error(err); // Log any errors
                    resultText.textContent = 'An error occurred while generating the idea. Please try again.'; // Display error message
                }
            });
        }

        // Add event listener for the back button
        backButton.addEventListener('click', () => {
            resultBox.classList.remove('show-result'); // Hide the result box
            resultBox.classList.add('hidden'); // Reset visibility
            userInput.value = ''; // Clear the input
            resultText.textContent = ''; // Clear the result text
        });
    } else {
        console.log("This page does not have the idea generation form."); // Log for non-idea pages
    }

    // Initialize the history display on page load
    updateHistoryUI();
});

// Toggle the visibility of the navigation menu on smaller screens
document.querySelector('.menu-toggle').addEventListener('click', () => {
    const nav = document.querySelector('nav'); // Reference the nav element
    nav.classList.toggle('show'); // Add or remove the 'show' class
});