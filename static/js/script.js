document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user_input');
    const styleChoice = document.getElementById('style_choice');
    const generateBtn = document.getElementById('generate_btn');
    const responseContainer = document.getElementById('response_container');

    generateBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const inputValue = userInput.value.trim();
        const styleValue = styleChoice.value;

        if (!inputValue) {
            responseContainer.innerHTML = '<div class="error">Please provide some input before generating ideas.</div>';
            return;
        }

        // Show loading message
        responseContainer.innerHTML = '<div>Loading...</div>';

        // Send POST request to /idea-tool (same route the form would have submitted to)
        try {
            const response = await fetch('{{ url_for("idea_tool") }}', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    'user_input': inputValue,
                    'style_choice': styleValue
                })
            });

            const text = await response.text();
            // Replace the content of responseContainer with the server-rendered template
            responseContainer.innerHTML = '';

            // Create a temporary DOM parser to extract the result from the returned HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const resultDiv = doc.querySelector('#result');
            const errorDiv = doc.querySelector('.error');

            if (errorDiv) {
                responseContainer.appendChild(errorDiv.cloneNode(true));
            } else if (resultDiv) {
                const heading = document.createElement('h2');
                heading.textContent = 'Expanded Idea:';
                responseContainer.appendChild(heading);

                responseContainer.appendChild(resultDiv.cloneNode(true));
            } else {
                // If no result or error, possibly no output
                responseContainer.innerHTML = '<div>No result returned.</div>';
            }

            // Clear the user’s input
            userInput.value = '';
        } catch (err) {
            console.error(err);
            responseContainer.innerHTML = '<div class="error">An error occurred while generating the idea. Please try again.</div>';
        }
    });
});