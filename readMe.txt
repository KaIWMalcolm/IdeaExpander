Overview
Idea Expander is a Flask-based web application that helps users transform initial ideas into more detailed concepts. The app integrates with the OpenAI API to generate expanded ideas and provides a user-friendly interface. It also features multiple themes, a responsive layout for mobile devices, and a simple contact form.

Features
Idea Generator: Enter a brief idea or prompt, choose a style (default, writing prompt, business/product idea), and generate a more elaborate concept.
Theming: Easily switch between multiple themes (light, dark, mango, avocado, sunset, ocean).
Responsive Design: Adjusts to various screen sizes, includes a hamburger menu on mobile devices.
Contact Form: Users can submit a message and email address to receive more information or support.
History Tracking: View and expand recent history of generated ideas.

Setup and Installation
Clone the repository:

git clone https://github.com/your-username/your-repo.git
cd your-repo

Create and Activate a Virtual Environment:
python3 -m venv venv
venv\Scripts\activate

Install Dependencies:
pip install -r requirements.txt

Set up .env file:
touch .env

Open the file and then put in your OPENAI API key:
OPENAI_API_KEY=YOURKEY

Set up email service in app.py:
app.config['MAIL_SERVER'] = 'smtp.gmail.com'  # Example Gmail's SMTP server
app.config['MAIL_PORT'] = 587  # Exampel Port for STARTTLS
app.config['MAIL_USERNAME'] = 'YOUR_EMAIL'  # Sender email address
app.config['MAIL_PASSWORD'] = 'YOUR PASSWORD'  # App-specific password for Gmail
recipients=['YOUR_EMAIL']  # Recipient email