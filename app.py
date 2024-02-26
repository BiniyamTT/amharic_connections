import random

from flask import Flask, render_template, request, jsonify
from datetime import datetime

app = Flask(__name__)

# Define words with their associated values
words = [
    {'word': 'apple', 'value': 0, 'category':'fruits'},
    {'word': 'orange', 'value': 0, 'category':'fruits'},
    {'word': 'banana', 'value': 0, 'category':'fruits'},
    {'word': 'grape', 'value': 0, 'category':'fruits'},
    {'word': 'dog', 'value': 1, 'category':'animals'},
    {'word': 'cat', 'value': 1, 'category':'animals'},
    {'word': 'bird', 'value': 1, 'category':'animals'},
    {'word': 'fish', 'value': 1, 'category':'animals'},
    {'word': 'book', 'value': 2, 'category':'things'},
    {'word': 'wrench', 'value': 2, 'category':'things'},
    {'word': 'mouse', 'value': 2, 'category':'things'},
    {'word': 'tripod', 'value': 2, 'category':'things'},
    {'word': 'beautiful', 'value': 3, 'category':'adjectives'},
    {'word': 'smart', 'value': 3, 'category':'adjectives'},
    {'word': 'tall', 'value': 3, 'category':'adjectives'},
    {'word': 'rich', 'value': 3, 'category':'adjectives'},
]

# Define the maximum number of attempts
MAX_ATTEMPTS = 4

# Initialize attempts left
attempts_left = MAX_ATTEMPTS


# Randomize word order
random.seed(42)
random.shuffle(words)

# Get and format today's date
date = datetime.today().strftime('%B %d, %Y')

@app.route("/")
def index():
    return render_template("index.html", words=words, date=date)

@app.route("/check", methods=['POST'])
def check():   
    global attempts_left  # Declare attempts_left as global variable
    print('inside check')
    print(attempts_left)
    
    # Receive the set of four words submitted from the frontend
    submitted_words = request.json['submittedWords']
    
    # Extract the values and categories of the submitted words
    submitted_values = []
    category = []
    for submitted_word in submitted_words:
        for word in words:
            if word['word'] == submitted_word['word']:
                submitted_values.append(word['value'])
                category.append(word['category'])
                break
  
    # Check if all four words have identical values
    if len(set(submitted_values)) == 1:
        value = submitted_values[0]  # Get the common value
        category = category[0]  # Get the common value
        print(attempts_left)
        return jsonify({'result': 'right', 'value': value, 'attempts_left': attempts_left, 'submitted_words': submitted_words})
    
    # Check if only one word has a different value
    elif len(set(submitted_values)) == 2:
        # Decrease attempts left by one
        attempts_left -= 1
        print(attempts_left)
        return jsonify({'result': 'one-off', 'value': None, 'attempts_left': attempts_left, 'submitted_words': None})
    
    # More than one word has different values
    else:
        # Decrease attempts left by one
        attempts_left -= 1
        print(attempts_left)
        return jsonify({'result': 'wrong', 'value': None, 'attempts_left': attempts_left, 'submitted_words': None})
