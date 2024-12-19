document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const userInput = document.getElementById('user_input');
    const styleSelect = document.getElementById('style_choice');
    const resultBox = document.getElementById('result_box');
    const resultText = document.getElementById('result_text');
    const backButton = document.getElementById('back_btn');
    const themeSelector = document.getElementById('theme_selector');

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
        // Idea generation logic here
        resultBox.classList.add('hidden');

        const typeText = (element, text, speed = 50) => {
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
                        typeText(resultText, resultDiv.textContent, 30);
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
        // On pages like contact, user_input and style_choice don't exist.
        // The form can submit normally via HTML without this code interfering.
        console.log("This page does not have the idea generation form.");
    }

    function setTheme(theme) {
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }
});