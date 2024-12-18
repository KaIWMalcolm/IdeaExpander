document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const userInput = document.getElementById('user_input');
    const styleSelect = document.getElementById('style_choice');
    let responseContainer = document.getElementById('response_container');
    
    if (!responseContainer) {
      responseContainer = document.createElement('div');
      responseContainer.id = 'response_container';
      form.insertAdjacentElement('afterend', responseContainer);
    }
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const inputValue = userInput.value.trim();
      const styleValue = styleSelect.value;
  
      if (!inputValue) {
        responseContainer.innerHTML = '<div class="error">Please provide some input before generating ideas.</div>';
        return;
      }
  
      // Show loading message
      responseContainer.innerHTML = '<div>Loading...</div>';
  
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
        const errorDiv = doc.querySelector('.error');
        const resultDiv = doc.querySelector('#result'); // hidden div containing the expanded idea
  
        responseContainer.innerHTML = ''; // Clear loading text
  
        if (errorDiv) {
          // If there's an error, show it
          responseContainer.appendChild(errorDiv.cloneNode(true));
        } else if (resultDiv) {
          // Set the textarea value to the expanded idea
          userInput.value = resultDiv.textContent;
        } else {
          responseContainer.innerHTML = '<div>No result returned.</div>';
        }
  
      } catch (err) {
        console.error(err);
        responseContainer.innerHTML = '<div class="error">An error occurred while generating the idea. Please try again.</div>';
      }
    });
  });