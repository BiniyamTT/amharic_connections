import random

from flask import Flask, render_template, request, jsonify, session
from flask_session import Session
from datetime import datetime

from words import words

# Create the app instance
app = Flask(__name__)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Get and format today's date
date = datetime.today().strftime('%B %d, %Y')

#Define Global Variables
ATTEMPTS_MADE = []
ATTEMPTS_CORRECT = 0
ATTEMPTS_LEFT = 4


# Capitalize and Randomize word order
word_list = [word['word'] for word in words]
random.seed(88)
random.shuffle(word_list)

def get_attempts_left():
    global ATTEMPTS_LEFT
    return ATTEMPTS_LEFT

def lose_attempt():
    global ATTEMPTS_LEFT
    ATTEMPTS_LEFT -= 1
    return ATTEMPTS_LEFT

def is_attempt_repeated(s_words):
    global ATTEMPTS_MADE
    for attempt in ATTEMPTS_MADE:
        if set(attempt) == set(s_words):
            return True
    return False

def reset():
    global ATTEMPTS_LEFT, ATTEMPTS_CORRECT, ATTEMPTS_MADE
    ATTEMPTS_MADE = []
    ATTEMPTS_CORRECT = 0
    ATTEMPTS_LEFT = 4


@app.route("/")
def landing():
   return render_template("landing.html", date=date)

@app.route("/gameplay")
def index():
    reset()
    return render_template("index.html", words=word_list, date=date)


@app.route('/get_attempts_left')
def get_attempts():
    return jsonify({'attempts_left': get_attempts_left()})

@app.route("/check", methods=['POST'])
def check():
    global ATTEMPTS_MADE, ATTEMPTS_CORRECT
    print (ATTEMPTS_CORRECT)
    print (ATTEMPTS_MADE)
    
    # Receive the set of four words submitted from the frontend
    s_words = None
    s_words = request.json['submittedWords']
    print(s_words)
    s_values = []
    cat = []
    
    if is_attempt_repeated(s_words) == True: 
        print('REPEAT ATTEMPT')
        return jsonify({'result': 'attempt_made',
                        'value': None,
                        'attempts_left': get_attempts_left(),
                        'submitted_words': None,
                        'category':None
                        })
    else:
        for s_word in s_words:
            for word in words:
                if s_word == word['word']:
                    s_values.append(word['value'])
                    cat.append(word['category'])
                    break
                
        ATTEMPTS_MADE.append(s_words)
        print (ATTEMPTS_MADE)
        
        
        # Check if all four words have identical values
        # i.e. CORRECT ATTEMPT 
        if len(set(s_values)) == 1:
            print('CORRECT ATTEMPT')
            ATTEMPTS_CORRECT = ATTEMPTS_CORRECT + 1
            if ATTEMPTS_CORRECT != 4 :
                return jsonify({'result': 'right', 
                                'value': s_values[0], 
                                'attempts_left': get_attempts_left(), 
                                'submitted_words': s_words, 
                                'category':cat[0]
                                })
            else:
                return jsonify({'result': 'game_won',
                                'value': s_values[0], 
                                'attempts_left': get_attempts_left(),
                                'submitted_words': s_words,
                                'category':cat[0]
                                })
                
        
        # Check if only one word has a different value
        # i.e ONE AWAY ATTEMPT
        elif len(set(s_values)) == 2 and (s_values.count(s_values[0]) == 3 or s_values.count(s_values[1]) == 3):
            if get_attempts_left() == 1:  # Check if it's the last attempt
                print('GAMEOVER')
                return jsonify({'result': 'gameover',
                                'value': None, 
                                'attempts_left': 0,
                                'submitted_words': None, 
                                'category':None})
            else:
                lose_attempt()
                print('ONE AWAY')
                return jsonify({'result': 'one-off',
                                'value': None, 
                                'attempts_left': get_attempts_left(),
                                'submitted_words': None, 
                                'category':None})


        # More than one word has different values
        # i.e INCORRECT ATTEMPT
        else:
            if get_attempts_left() == 1:  # Check if it's the last attempt
                print('GAMEOVER')
                return jsonify({'result': 'gameover',
                                'value': None, 
                                'attempts_left': 0,
                                'submitted_words': None, 
                                'category':None})
            else:
                lose_attempt()
                print('WRONG')
                return jsonify({'result': 'wrong',
                                'value': None, 
                                'attempts_left': get_attempts_left(),
                                'submitted_words': None, 
                                'category':None})

@app.route("/resultbuilder")
def result_builder():
    print('inside result builder')
    global ATTEMPTS_MADE
    result_rows =[]
    row=[]
    if len(ATTEMPTS_MADE) == 4:
        message = 'Perfect!'
    elif len(ATTEMPTS_MADE) == 5:
        message = 'Great!'
    elif len(ATTEMPTS_MADE) == 6:
        message = 'Solid!'
    elif len(ATTEMPTS_MADE) == 7:
        message = 'Phew!'
    
    for attempt in ATTEMPTS_MADE:
        for attempt_word in attempt:
            for word in words:
                if attempt_word == word['word']:
                    row.append(word['value'])
                    break
        result_rows.append(row)
        row = []
        
    return jsonify({'message': message, 
                    'result':result_rows
                    })