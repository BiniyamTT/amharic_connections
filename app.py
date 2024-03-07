import random

from flask import Flask, render_template, request, jsonify, session
from flask_session import Session
from datetime import datetime

app = Flask(__name__)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True



# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)


# Define words with their associated values
words = [
    {'word': 'ኮፍያ', 'value': 0, 'category':'የጭንቅላት መሸፈኛዎች'},
    {'word': 'ሻሽ', 'value': 0, 'category':'የጭንቅላት መሸፈኛዎች'},
    {'word': 'ባርኔጣ', 'value': 0, 'category':'የጭንቅላት መሸፈኛዎች'},
    {'word': 'ቆብ', 'value': 0, 'category':'የጭንቅላት መሸፈኛዎች'},
    {'word': 'ትኩሳት', 'value': 1, 'category':'መፃሕፍት'},
    {'word': 'ሠመመን', 'value': 1, 'category':'መፃሕፍት'},
    {'word': 'ልጅነት', 'value': 1, 'category':'መፃሕፍት'},
    {'word': 'መረቅ', 'value': 1, 'category':'መፃሕፍት'},
    {'word': 'እጅ', 'value': 2, 'category':'____ ኳስ'},
    {'word': 'እግር', 'value': 2, 'category':'____ ኳስ'},
    {'word': 'ቅርጫት', 'value': 2, 'category':'____ ኳስ'},
    {'word': 'መረብ', 'value': 2, 'category':'____ ኳስ'},
    {'word': 'አክሊል', 'value': 3, 'category':'ከአረብኛ የተወረሱ ቃላት'},
    {'word': 'ቲማቲም', 'value': 3, 'category':'ከአረብኛ የተወረሱ ቃላት'},
    {'word': 'ባሕር', 'value': 3, 'category':'ከአረብኛ የተወረሱ ቃላት'},
    {'word': 'ስኳር', 'value': 3, 'category':'ከአረብኛ የተወረሱ ቃላት'},
]

@app.route('/reset-attempts', methods=['POST'])
def reset_attempts():
    # Define the maximum number of attempts
    MAX_ATTEMPTS = 4
    # Initialize attempts left
    global attempts_left
    attempts_left = MAX_ATTEMPTS
    
    return('Attempts reset successfully')


# Capitalize and Randomize word order
word_list = [word['word'] for word in words]
uppercase_words = [word.upper() for word in word_list]
random.seed(23)
random.shuffle(uppercase_words)

# Get and format today's date
date = datetime.today().strftime('%B %d, %Y')

@app.route("/")
def index():
   return render_template("index.html", words=uppercase_words, date=date)

@app.route("/check", methods=['POST'])
def check():
    global attempts_left  # Declare attempts_left as global variable
    print('inside check')
    print(attempts_left)
    # Receive the set of four words submitted from the frontend
    submitted_words = request.json['submittedWords']
    # Extract the values and categories of the submitted words
    print(submitted_words)
    submitted_values = []
    category = []
    for submitted_word in submitted_words:
        for word in words:
            if word['word'] == submitted_word.lower():
                submitted_values.append(word['value'])
                category.append(word['category'])
                break

    # Check if all four words have identical values
    if len(set(submitted_values)) == 1:
        value = submitted_values[0]  # Get the common value
        category = category[0].upper()  # Get the common value
        print(attempts_left)
        
        return jsonify({'result': 'right', 'value': value, 'attempts_left': attempts_left, 'submitted_words': submitted_words, 'category':category})
    
    # Check if only one word has a different value
    elif len(set(submitted_values)) == 2 and (submitted_values.count(submitted_values[0]) == 3 or submitted_values.count(submitted_values[1]) == 3):
        if attempts_left == 1:  # Check if it's the last attempt
            return jsonify({'result': 'gameover', 'value': None, 'attempts_left': attempts_left, 'submitted_words': None, 'category':None})
        else:
            attempts_left -= 1
            print(attempts_left)
            return jsonify({'result': 'one-off', 'value': None, 'attempts_left': attempts_left, 'submitted_words': None, 'category':None})
    
    # More than one word has different values
    else:
        if attempts_left == 1:  # Check if it's the last attempt
            return jsonify({'result': 'gameover', 'value': None, 'attempts_left': attempts_left, 'submitted_words': None, 'category':None})
        else:
            attempts_left -= 1
            print(attempts_left)
            return jsonify({'result': 'wrong', 'value': None, 'attempts_left': attempts_left, 'submitted_words': None, 'category':None})
