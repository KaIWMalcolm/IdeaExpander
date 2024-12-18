from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return "Hello, World! This is the home page."

if __name__ == '__main__':
    # Run the Flask development server
    app.run(debug=True)