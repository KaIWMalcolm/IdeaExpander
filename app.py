from flask import Flask, render_template, request, jsonify
import openai
import os

app = Flask(__name__)

openai.api_key = "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"

@app.route('/')
def home():
    return render_template('home.html')  # Your Home page template

@app.route('/about')
def about():
    return render_template('about.html')  # Your About page template

@app.route('/idea-tool', methods=['GET', 'POST'])
def idea_tool():
    if request.method == 'GET':
        return render_template('idea_tool.html')

    user_input = request.form.get('user_input')
    style = request.form.get('style_choice', 'default')

    if not user_input or user_input.strip() == '':
        error_message = "Please provide some input before generating ideas."
        return render_template('idea_tool.html', error=error_message)

    # Decide temperature and additional style instructions based on style
    if style == 'writing prompt':
        chosen_temperature = 1.0
        style_instructions = (
            "The user wants a writing prompt. Be highly imaginative and vivid. "
            "Emphasize creative storytelling, descriptive language, and interesting narrative hooks. "
            "Feel free to introduce characters, conflicts, and environments that inspire writing."
        )
    elif style == 'business/product idea':
        chosen_temperature = 0.3
        style_instructions = (
            "The user wants a business or product idea. Focus on clarity, marketability, and practicality. "
            "Emphasize potential target audiences, unique selling points, and actionable steps to implement the idea."
        )
    else:
        # default style
        chosen_temperature = 0.7
        style_instructions = (
            "The user wants a balanced expansion of their idea. Provide depth, context, and improvements "
            "without leaning too heavily into pure creativity or strict professionalism. "
            "Maintain a friendly, explanatory tone and ensure the result feels well-rounded and helpful."
        )

    try:
        # Call the OpenAI ChatCompletion endpoint with style-specific instructions
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a versatile assistant that specializes in taking user-provided ideas and "
                        "expanding them into more thoroughly developed concepts. You consider the user's desired style "
                        "and deliver a polished, detailed, and thoughtful response. Focus on clarity, structure, and depth. "
                        "Offer multiple angles, examples, or next steps. Make sure the resulting idea feels more substantial "
                        "and refined than the original."
                    )
                },
                {
                    "role": "user",
                    "content": (
                        f"The user has provided an initial idea and wants it expanded in the style: '{style}'.\n\n"
                        f"{style_instructions}\n\n"
                        f"Original idea:\n{user_input}\n\n"
                        "Your expanded idea should:\n"
                        "- Add depth, context, and possible improvements or variations.\n"
                        "- Include at least one or two concrete examples or scenarios.\n"
                        "- Provide a logical flow, possibly with sections or steps.\n"
                        "Conclude with a brief summary or actionable next steps."
                    )
                }
            ],
            max_tokens=1500,
            temperature=chosen_temperature
        )

        expanded_idea = response.choices[0].message['content'].strip()

        return render_template(
            'idea_tool.html',
            original=user_input,
            result=expanded_idea,
            selected_style=style
        )

    except Exception as e:
        print("Error occurred:", e)
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