import random

from flask import Flask, render_template, request, jsonify
from datetime import datetime

app = Flask(__name__)

# Define words with their associated values
words = [
    {'word': 'አህያ', 'value': 0, 'category':'የቤት እንስሳት'},
    {'word': 'ውሻ', 'value': 0, 'category':'የቤት እንስሳት'},
    {'word': 'ፍየል', 'value': 0, 'category':'የቤት እንስሳት'},
    {'word': 'በሬ', 'value': 0, 'category':'የቤት እንስሳት'},
    {'word': 'ንጉስ', 'value': 1, 'category':'የቼዝ መጫወቻዎች'},
    {'word': 'ንግስት', 'value': 1, 'category':'የቼዝ መጫወቻዎች'},
    {'word': 'ወታደር', 'value': 1, 'category':'የቼዝ መጫወቻዎች'},
    {'word': 'ፈረስ', 'value': 1, 'category':'የቼዝ መጫወቻዎች'},
    {'word': 'ላሊበላ', 'value': 2, 'category':'ታሪካዊ መዳረሻዎች'},
    {'word': 'ሀረር', 'value': 2, 'category':'ታሪካዊ መዳረሻዎች'},
    {'word': 'ጅማ', 'value': 2, 'category':'ታሪካዊ መዳረሻዎች'},
    {'word': 'ጎንደር', 'value': 2, 'category':'ታሪካዊ መዳረሻዎች'},
    {'word': 'አክሱም', 'value': 3, 'category':'ሀውልቶች'},
    {'word': 'ምኒልክ', 'value': 3, 'category':'ሀውልቶች'},
    {'word': 'ሰማዕታት', 'value': 3, 'category':'ሀውልቶች'},
    {'word': 'ትግላችን', 'value': 3, 'category':'ሀውልቶች'},
]

# Define the maximum number of attempts
MAX_ATTEMPTS = 4

# Initialize attempts left
attempts_left = MAX_ATTEMPTS


# Capitalize and Randomize word order
word_list = [word['word'] for word in words]
uppercase_words = [word.upper() for word in word_list]
random.seed(42)
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
            if word['word'] == submitted_word['word'].lower():
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
    elif len(set(submitted_values)) == 2:
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
