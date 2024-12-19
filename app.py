from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from flask_mail import Mail, Message
import openai
import os

app = Flask(__name__)

# Configure Flask-Mail for sending emails via Gmail's SMTP server
app.config['MAIL_SERVER'] = 'smtp.gmail.com'  # Gmail's SMTP server
app.config['MAIL_PORT'] = 587  # Port for STARTTLS
app.config['MAIL_USERNAME'] = 'kmchopshop@gmail.com'  # Sender email address
app.config['MAIL_PASSWORD'] = 'gzyu smux nwcu taff'  # App-specific password for Gmail
app.config['MAIL_USE_TLS'] = True  # Use STARTTLS for security
app.config['MAIL_USE_SSL'] = False  # Do not use SSL
MAIL_DEFAULT_SENDER = app.config['MAIL_USERNAME']  # Default sender for outgoing emails
mail = Mail(app)  # Initialize Flask-Mail with the app

# Load environment variables from .env file
load_dotenv()
openai.api_key = os.environ.get("OPENAI_API_KEY")  # Set the OpenAI API key from environment

# Route for the home page
@app.route('/')
def home():
    return render_template('home.html')  # Render the home.html template

# Route for the about page
@app.route('/about')
def about():
    return render_template('about.html')  # Render the about.html template

# Route for the Idea Tool, handles both GET and POST requests
@app.route('/idea-tool', methods=['GET', 'POST'])
def idea_tool():
    if request.method == 'GET':
        return render_template('idea_tool.html')  # Render the idea tool page for GET requests

    # Retrieve user input and style choice from the form submission
    user_input = request.form.get('user_input')
    style = request.form.get('style_choice', 'default')  # Default style if not provided

    # Validate input: ensure user input is not empty
    if not user_input or user_input.strip() == '':
        error_message = "Please provide some input before generating ideas."
        return render_template('idea_tool.html', error=error_message)

    # Determine the OpenAI temperature and style instructions based on the chosen style
    if style == 'writing prompt':
        chosen_temperature = 1.0
        style_instructions = (
            "The user wants a writing prompt. Be highly imaginative and vivid. "
            "Emphasize creative storytelling..."
        )
    elif style == 'business/product idea':
        chosen_temperature = 0.3
        style_instructions = (
            "The user wants a business or product idea. Focus on clarity, marketability..."
        )
    else:
        chosen_temperature = 0.7
        style_instructions = (
            "The user wants a balanced expansion of their idea..."
        )

    try:
        # Call OpenAI's ChatCompletion endpoint to generate an expanded idea
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # Model to use
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a versatile assistant that expands user ideas..."
                    )
                },
                {
                    "role": "user",
                    "content": (
                        f"The user has provided an initial idea and wants it expanded in the style: '{style}'.\n\n"
                        f"{style_instructions}\n\n"
                        f"Original idea:\n{user_input}\n\n"
                        "Your expanded idea should:\n"
                        "- Add depth, context, improvements\n"
                        "- Include examples\n"
                        "- Logical flow\n"
                        "Conclude with summary/next steps."
                    )
                }
            ],
            max_tokens=4096,  # Maximum number of tokens in the response
            temperature=chosen_temperature  # Controls the randomness of the output
        )

        # Extract the generated text from the response
        expanded_idea = response.choices[0].message['content'].strip()

        # Render the idea tool page with the generated result
        return render_template('idea_tool.html', original=user_input, result=expanded_idea, selected_style=style)
    except Exception as e:
        # Handle any exceptions during the API call
        print("Error occurred:", e)
        error_message = "An error occurred while generating the idea. Please try again."
        return render_template('idea_tool.html', error=error_message)

# Route for the contact form, handles both GET and POST requests
@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'GET':
        print("Contact page accessed with GET")
        return render_template('contact.html')  # Render the contact page for GET requests

    print("Contact form submitted (POST).")
    email = request.form.get('email')  # Get the user's email
    message = request.form.get('message')  # Get the user's message
    
    print(f"Email received: {email}")
    print(f"Message received: {message}")

    # Validate input: ensure both email and message are provided
    if not email or not message:
        print("Missing email or message.")
        return render_template('contact.html', error="Please provide both email and message.")

    # Create an email message object using Flask-Mail
    msg = Message(
        'New Contact Form Submission',
        sender=app.config['MAIL_USERNAME'],  # Sender email
        recipients=['kmchopshop@gmail.com']  # Recipient email
    )
    msg.body = f"Message from {email}:\n\n{message}"  # Set the email body

    try:
        print("Attempting to send email...")
        mail.send(msg)  # Send the email
        print("Email sent successfully.")
        return render_template('contact.html', success="Thank you for contacting us!")  # Success message
    except Exception as e:
        # Handle any errors during the email sending process
        print("Error sending mail:", e)
        return render_template('contact.html', error="An error occurred while sending your message. Please try again later.")

# API endpoint for generating ideas via POST requests
@app.route('/api/generate', methods=['POST'])
def api_generate():
    data = request.get_json()  # Parse the incoming JSON request
    user_input = data.get('user_input', '')  # Get user input
    style = data.get('style', 'creative')  # Get style, default to 'creative'

    # Validate input: ensure user input is not empty
    if not user_input.strip():
        return jsonify({"error": "Please provide some input"}), 400

    try:
        # Create a prompt for OpenAI to expand the idea
        prompt = f"Expand this idea in a {style} style:\n{user_input}"
        response = openai.Completion.create(
            engine="text-davinci-003",  # OpenAI engine to use
            prompt=prompt,
            max_tokens=150  # Limit the number of tokens in the response
        )
        expanded_idea = response.choices[0].text.strip()  # Extract the response text
        return jsonify({"result": expanded_idea})  # Return the result as JSON
    except Exception:
        # Handle any errors during the API call
        return jsonify({"error": "API error, please try again"}), 500

# Run the Flask application
if __name__ == '__main__':
    app.run(debug=True)  # Enable debug mode for development
