document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const resultDiv = document.getElementById('result');
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const userInput = document.getElementById('user_input').value;
      const style = document.getElementById('style_choice').value;
      
      fetch('/api/generate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ user_input: userInput, style: style })
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          resultDiv.textContent = data.error;
          resultDiv.style.color = 'red';
        } else {
          resultDiv.textContent = data.result;
          resultDiv.style.color = 'black';
        }
      })
      .catch(err => {
        resultDiv.textContent = "An unexpected error occurred.";
        resultDiv.style.color = 'red';
      });
    });
  });