from flask import Flask, render_template, request, jsonify
import openai
import os

app = Flask(__name__)

# Set your OpenAI API key (ensure this is kept secret and not committed to public repos)
openai.api_key = os.getenv("OPENAI_API_KEY")  # Or hardcode temporarily for testing

@app.route('/')
def home():
    return render_template('home.html')  # Your Home page template

@app.route('/about')
def about():
    return render_template('about.html')  # Your About page template

@app.route('/idea-tool', methods=['GET', 'POST'])
def idea_tool():
    # If GET request, just show the page with the form
    if request.method == 'GET':
        return render_template('idea_tool.html')

    # If POST request, process form submission
    user_input = request.form.get('user_input')
    style = request.form.get('style_choice', 'creative')  # Default to 'creative' if not specified

    if not user_input or user_input.strip() == '':
        # Handle empty input error
        error_message = "Please provide some input before generating ideas."
        return render_template('idea_tool.html', error=error_message)

    # Call OpenAI API with user input and style
    try:
        prompt = f"Expand this idea in a {style} style:\n{user_input}"
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=prompt,
            max_tokens=150
        )
        expanded_idea = response.choices[0].text.strip()
        return render_template('idea_tool.html', original=user_input, result=expanded_idea, selected_style=style)

    except Exception as e:
        # Handle API error (e.g., rate limits, invalid key)
        error_message = "An error occurred while generating the idea. Please try again."
        return render_template('idea_tool.html', error=error_message)

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    # If GET request, show contact form
    if request.method == 'GET':
        return render_template('contact.html')
    
    # If POST, handle submission (e.g., send email or store in DB)
    # For now, just return a success message:
    user_message = request.form.get('message')
    user_email = request.form.get('email')
    if not user_message or not user_email:
        return render_template('contact.html', error="Please provide both email and message.")
    
    # Here you could implement email sending or DB storage.
    # We’ll just simulate a success response:
    return render_template('contact.html', success="Thank you for contacting us!")

if __name__ == '__main__':
    app.run(debug=True)

    
@app.route('/api/generate', methods=['POST'])
def api_generate():
    data = request.get_json()
    user_input = data.get('user_input', '')
    style = data.get('style', 'creative')

    if not user_input.strip():
        return jsonify({"error": "Please provide some input"}), 400

    try:
        prompt = f"Expand this idea in a {style} style:\n{user_input}"
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=prompt,
            max_tokens=150
        )
        expanded_idea = response.choices[0].text.strip()
        return jsonify({"result": expanded_idea})
    except Exception:
        return jsonify({"error": "API error, please try again"}), 500