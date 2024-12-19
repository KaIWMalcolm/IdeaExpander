from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from flask_mail import Mail, Message
import openai
import os

app = Flask(__name__)

# Gmail SMTP configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USERNAME'] = 'kmchopshop@gmail.com'  # Your Gmail address
app.config['MAIL_PASSWORD'] = 'gzyu smux nwcu taff'    # Your Gmail App Password
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
MAIL_DEFAULT_SENDER = app.config['MAIL_USERNAME']
mail = Mail(app)

load_dotenv()  # Load environment variables from .env
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route('/')
def home():
    return render_template('home.html')  # Home page

@app.route('/about')
def about():
    return render_template('about.html')  # About page

@app.route('/idea-tool', methods=['GET', 'POST'])
def idea_tool():
    if request.method == 'GET':
        return render_template('idea_tool.html')

    user_input = request.form.get('user_input')
    style = request.form.get('style_choice', 'default')

    if not user_input or user_input.strip() == '':
        error_message = "Please provide some input before generating ideas."
        return render_template('idea_tool.html', error=error_message)

    # Decide temperature and style instructions
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
        # Call the OpenAI ChatCompletion endpoint
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
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
            max_tokens=4096,
            temperature=chosen_temperature
        )

        expanded_idea = response.choices[0].message['content'].strip()

        return render_template('idea_tool.html', original=user_input, result=expanded_idea, selected_style=style)
    except Exception as e:
        print("Error occurred:", e)
        error_message = "An error occurred while generating the idea. Please try again."
        return render_template('idea_tool.html', error=error_message)

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'GET':
        print("Contact page accessed with GET")
        return render_template('contact.html')

    print("Contact form submitted (POST).")
    email = request.form.get('email')
    message = request.form.get('message')
    
    print(f"Email received: {email}")
    print(f"Message received: {message}")

    if not email or not message:
        print("Missing email or message.")
        return render_template('contact.html', error="Please provide both email and message.")

    msg = Message(
        'New Contact Form Submission',
        sender=app.config['MAIL_USERNAME'],
        recipients=['kmchopshop@gmail.com']
    )
    msg.body = f"Message from {email}:\n\n{message}"

    try:
        print("Attempting to send email...")
        mail.send(msg)
        print("Email sent successfully.")
        return render_template('contact.html', success="Thank you for contacting us!")
    except Exception as e:
        print("Error sending mail:", e)
        return render_template('contact.html', error="An error occurred while sending your message. Please try again later.")
    
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

if __name__ == '__main__':
    app.run(debug=True)