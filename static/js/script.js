document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const userInput = document.getElementById('user_input');
    const styleSelect = document.getElementById('style_choice');
    const resultBox = document.getElementById('result_box');
    const resultText = document.getElementById('result_text');
    const backButton = document.getElementById('back_btn');
    const themeSelector = document.getElementById('theme_selector');

    // Ensure the result box is hidden on page load
    resultBox.classList.add('hidden');

    // Function to simulate typing effect
    const typeText = (element, text, speed = 50) => {
        element.textContent = '';
        let index = 0;

        const type = () => {
            if (index < text.length) {
                element.textContent += text[index];
                index++;
                setTimeout(type, speed);
            }
        };

        type();
    };

    // Form submission handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputValue = userInput.value.trim();
        const styleValue = styleSelect.value;

        if (!inputValue) {
            alert('Please provide some input before generating ideas.');
            return;
        }

        // Show the result box immediately
        resultText.textContent = 'Generating your idea...';
        resultBox.classList.remove('hidden');
        resultBox.classList.add('show-result');

        try {
            // Submit data to /idea-tool using URL-encoded form data
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
            const resultDiv = doc.querySelector('#result'); // Hidden div containing the expanded idea

            if (resultDiv) {
                // Apply typing effect to the result text
                typeText(resultText, resultDiv.textContent, 30); // Typing speed is 30ms per character
            } else {
                resultText.textContent = 'No result returned.';
            }
        } catch (err) {
            console.error(err);
            resultText.textContent = 'An error occurred while generating the idea. Please try again.';
        }
    });

    // Handle back button functionality
    backButton.addEventListener('click', () => {
        resultBox.classList.remove('show-result');
        resultBox.classList.add('hidden');
        userInput.value = ''; // Clear the textarea for new input
        resultText.textContent = ''; // Clear the result text
    });

    // Function to switch themes
    const setTheme = (theme) => {
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    };

    // Theme selector handler
    themeSelector.addEventListener('change', (e) => {
        setTheme(e.target.value);
    });

    // Load the saved theme on page load
    const savedTheme = localStorage.getItem('theme') || 'light';
    themeSelector.value = savedTheme;
    setTheme(savedTheme);
});
