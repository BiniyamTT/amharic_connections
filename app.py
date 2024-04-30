import os
import random
import redis

from flask import Flask, render_template, redirect, request, jsonify, session, url_for
from flask_session import Session
from datetime import datetime

from words import words as WORDS

# Create the app instance
app = Flask(__name__)

# Details on the Secret Key: https://flask.palletsprojects.com/en/3.0.x/config/#SECRET_KEY
# NOTE: The secret key is used to cryptographically-sign the cookies used for storing
#       the session identifier.
app.secret_key = os.getenv('SECRET_KEY', default='BAD_SECRET_KEY')

# Configure Redis for storing the session data on the server-side
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_REDIS'] = redis.from_url('redis://127.0.0.1:6379')

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Create and initialize the Flask-Session object AFTER `app` has been configured
server_session = Session(app)

# Get and format today's date
date = datetime.today().strftime('%B %d, %Y')

# Capitalize and Randomize word order
word_list = [word['word'] for word in WORDS]
random.seed(88)
random.shuffle(word_list)

def initialize_session():
    session['GAME_STATE'] = None
    session['ATTEMPTS_MADE'] = []
    session['ATTEMPTS_CORRECT'] = 0
    session['CORRECT_VALUES'] = []
    session['ATTEMPTS_LEFT'] = 4

def get_attempts_left():
    if 'ATTEMPTS_LEFT' in session:
        return session['ATTEMPTS_LEFT']
    else:
        return (4)

def lose_attempt():
    session['ATTEMPTS_LEFT'] -= 1
    return session['ATTEMPTS_LEFT']

def is_attempt_repeated(s_words):
    for attempt in session['ATTEMPTS_MADE']:
        if set(attempt) == set(s_words):
            return True
    return False

def get_words_from_value(values):
    word_list = []
    for value in values:
        for word in WORDS:
            if word['value'] == value:
                word_list.append(word['word'])
    return word_list

def get_solver_data(values):
    solverdata = []
    for value in values:
        valist = [value]
        data = {}
        for word in WORDS:
            if word['value'] == value:
                category = word['category']               
            data['category'] = category
        data['value'] = value
        data['submittedWords'] = get_words_from_value(valist)
        solverdata.append(data)
    print('*****************')
    print(solverdata)
    print('*****************')
    return solverdata

def get_result_values():
    print(session['CORRECT_VALUES'])
    solved_values = []
    not_solved_values = [0,1,2,3]
    for value in session['CORRECT_VALUES']:
        solved_values.append(value)
        not_solved_values.remove(value)
    for value in list(not_solved_values):
        solved_values.append(value)
    print('result values:')
    print(solved_values)  
        
    return(solved_values)

def get_category_from_word(word):
    for w in WORDS:
        if w['word'] == word:
            return w['category']

def get_value_from_word(word):
    for w in WORDS:
        if w['word'] == word:
            return w['value']

@app.route("/")
def landing():
    return render_template("landing.html", date=date)

@app.route("/get_game_state")
def get_game_state():
    if 'ATTEMPTS_MADE' not in session:
        initialize_session()
        print( "Just initialized session:")
        print(jsonify({'game_state':session['GAME_STATE']}))
        return jsonify({'game_state':session['GAME_STATE']})
    else:
        if (session['ATTEMPTS_CORRECT'] == 4 or session['ATTEMPTS_LEFT']  == 0):
            session['GAMESTATE'] = 0
            return jsonify({'game_state':session['GAME_STATE']})
        else:
            
            session['GAMESTATE'] = 1
            return jsonify({'game_state':session['GAME_STATE']})
        
@app.route("/get_game_data")
def get_game_data():
    if len(session['CORRECT_VALUES']) > 0:
        word_list = get_words_from_value(session['CORRECT_VALUES'])
        return jsonify({'removeWords': word_list, 
                        'solveFrom':get_solver_data(session['CORRECT_VALUES'])
                    })
    else:
        return jsonify({'removeWords': [], 
                        'solveFrom':{'submittedWords': [],
                                    'category':'',
                                    'value':''
                                    }
                    })
        
@app.route("/gameplay")
def index():   
    return render_template("index.html", words=word_list, date=date)

@app.route('/get_attempts_left')
def get_attempts():
    return jsonify({'attempts_left': get_attempts_left()})

@app.route("/check", methods=['POST'])
def check():
    print (session['ATTEMPTS_CORRECT'])
    print (session['ATTEMPTS_MADE'])
    
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
            for word in WORDS:
                if s_word == word['word']:
                    s_values.append(word['value'])
                    cat.append(word['category'])
                    break
                
        session['ATTEMPTS_MADE'].append(s_words)
        session['GAME_STATE'] = 1
        print (session['ATTEMPTS_MADE'])
        
        
        # Check if all four words have identical values
        # i.e. CORRECT ATTEMPT 
        if len(set(s_values)) == 1:
            print('CORRECT ATTEMPT')
            session['ATTEMPTS_CORRECT'] = session['ATTEMPTS_CORRECT'] + 1
            if session['ATTEMPTS_CORRECT'] != 4 :
                session['CORRECT_VALUES'].append(s_values[0])
                return jsonify({'result': 'right', 
                                'value': s_values[0], 
                                'attempts_left': get_attempts_left(), 
                                'submitted_words': s_words, 
                                'category':cat[0]
                                })
            else:
                session['CORRECT_VALUES'].append(s_values[0])
                session['GAME_STATE'] = 0
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
                lose_attempt()
                print('GAMEOVER')
                session['GAME_STATE'] = 0
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
                lose_attempt()
                print('GAMEOVER')
                session['GAME_STATE'] = 0
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

@app.route('/solvegame')
def solve_game():
    print('inside solve game function')
    results = []
    result_values = get_result_values()      
    
    for value in result_values:
        result_dict = {}
        result_dict['value'] = value
        category = ''
        word_list = []
        for word in WORDS:
            if word['value'] == value:
                word_list.append(word['word'])
                category = word['category']
        result_dict['word_list'] = word_list
        result_dict['category'] = category
        results.append(result_dict)
    print(results)
    return jsonify(results)

@app.route("/resultbuilder")
def result_builder():
    print('inside result builder')
    result_rows =[]
    row=[]
    if len(session['ATTEMPTS_MADE']) == 4 and len(session['CORRECT_VALUES']) == 4:
        message = 'Perfect!'
    elif len(session['ATTEMPTS_MADE']) == 5 and len(session['CORRECT_VALUES']) == 4:
        message = 'Great!'
    elif len(session['ATTEMPTS_MADE']) == 6 and len(session['CORRECT_VALUES']) == 4:
        message = 'Solid!'
    elif len(session['ATTEMPTS_MADE']) == 7 and len(session['CORRECT_VALUES']) == 4:
        message = 'Phew!'
    else:
        message = 'Next Time!'
    
    for attempt in session['ATTEMPTS_MADE']:
        for attempt_word in attempt:
            for word in WORDS:
                if attempt_word == word['word']:
                    row.append(word['value'])
                    break
        result_rows.append(row)
        row = []
        
    return jsonify({'message': message, 
                    'result':result_rows
                    })
    
if __name__ == "__main__":
    app.run(debug=True)