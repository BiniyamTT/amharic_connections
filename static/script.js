// Define global DOM objects
let gameBoard;
let gameCards;
let deselectAllBtn;
let submitBtn;
let shuffleBtn;
let mistakeCounter;
let viewResultBtn;

function customAlert(message) {
    var alertDiv = document.getElementById('customAlert');
    alertDiv.innerText = message;
    alertDiv.style.display = 'block';
    setTimeout(function() {
        alertDiv.style.display = 'none';
    }, 1500); // Display for 1.5 second
}

function getActiveCardsCount(){
    return (document.querySelectorAll('.gamecard.active').length);
};

function getActiveGameCards(){
    return (document.querySelectorAll('.gamecard.active'));
};

function getGameCards(){
    return (document.querySelectorAll('.gamecard'));
};

function attempts_left() {
    return fetch('/get_attempts_left', {
      method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
      console.log(data.attempts_left);
      return data.attempts_left;
    })
    .catch(error => {
      console.error('Error fetching attempts left:', error);
    });
  }

function toggleDeselectAllBtn(){
    if (getActiveCardsCount() > 0){
        deselectAllBtn.removeAttribute('disabled');
    }
    else{
        deselectAllBtn.setAttribute('disabled','disabled');
    }
};

function toggleSubmitBtn(){
    if (getActiveCardsCount() === 4) {
        submitBtn.removeAttribute('disabled');
        submitBtn.classList.add('submitbtn');
    } else {
        submitBtn.classList.remove('submitbtn');
        submitBtn.setAttribute('disabled', 'disabled');
    }
};

function updateMistakesCounter() {
    attempts_left()
    .then(attemptsLeft => {
      console.log('From UMC Function'); 
      console.log(attemptsLeft); 
  
      if (attemptsLeft) {
        // Clear existing circles and add new ones
        mistakeCounter.innerHTML = '';
        for (let i = 0; i < attemptsLeft; i++) {
          mistakeCounter.innerHTML += '<i class="misscircle fa-solid fa-circle"></i>';
        }
      } else {
        // Remove last circle with animation
        const lastCircle = mistakeCounter.lastElementChild;
        if (lastCircle) {
          lastCircle.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 500,
            easing: 'ease-out'
          }).onfinish = () => mistakeCounter.removeChild(lastCircle);
        }
      }
    })
    .catch(error => {
      console.error('Error fetching attempts left:', error);
    });
  }

function deselectAll(){
    getActiveGameCards().forEach(element => {
        element.classList.remove('active');
    });
    toggleDeselectAllBtn();
    toggleSubmitBtn();
};

function shuffle(array){
    // Save active card words in a list (a), remove active class.
    let a = [];
    let gameCards = getGameCards();
    getActiveGameCards().forEach(card => {
        a.push(card.textContent.trim());
        card.classList.remove('active');
    });
    // Fisher-Yates Shuffle (Pick random and swap indices)
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i].innerHTML, array[j].innerHTML] = [array[j].innerHTML, array[i].innerHTML];
    }
    // Reapply active class to selected words after shuffling
    for (let i = 0; i < gameCards.length; i++) {
        if (a.includes(gameCards[i].textContent.trim())) {
            gameCards[i].classList.add('active');
        }
    }
    return array;
};

function animateShakeX(){
    let a = getActiveGameCards()
    a.forEach(function(element) {
        element.classList.add('animate__animated', 'animate__shakeX');
    });
    a[0].addEventListener('animationend', () => {
        a.forEach(function(element) {
            element.classList.remove('animate__animated', 'animate__shakeX');
        });
    });
};

function animateShakeY(){
    let a = getActiveGameCards()
    a.forEach(function(element) {
        element.classList.add('animate__animated', 'animate__shakeY');
    });
    a[0].addEventListener('animationend', () => {
        a.forEach(function(element) {
            element.classList.remove('animate__animated', 'animate__shakeY');
        });
    });
};

function submitWords(){
    // Extract the word from each selected card
    let words = [];
    getActiveGameCards().forEach(element => {
        words.push(element.textContent.trim());
    });
    // Disable the submit button while the request is being made
    submitBtn.setAttribute('disabled', 'disabled');
    // Send an AJAX request to the server
    fetch('/check', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ submittedWords: words })
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response from the server
        handleCheckResponse(data);
    })
    .catch(error => {
        console.error('Error in app.py:', error);
    })
    .finally(() => {
        deselectAll()
    });
};

function removeSolvedGameCards(){
    getActiveGameCards().forEach(element => {
        element.classList.add('animate__animated', 'animate__fadeOutUp');
        setTimeout(() => {
            element.remove();
        }, 700);
    });
};

function insertSolvedCard(submittedWords, category, value){
    // Create a new div element for the solved card
    let solvedCardDiv = document.createElement('div');
    solvedCardDiv.classList.add('animate__animated','animate__fadeInUp','solvedcard','solvedcardText','col-span-4','abyssinica-sil-regular');
    if(value === 0){
        solvedCardDiv.style.backgroundColor = '#f9df6d';
    } else if (value === 1){
        solvedCardDiv.style.backgroundColor = '#a0c35a';
    } else if (value === 2){
        solvedCardDiv.style.backgroundColor = '#b0c4ef';
    }else{
        solvedCardDiv.style.backgroundColor = '#ba81c5';
    }
    

    // Create div elements for category and words
    let categoryDiv = document.createElement('div');
    let wordsDiv = document.createElement('div');


    // Set text content for category and words
    categoryDiv.textContent = category;
    wordsDiv.textContent = submittedWords.map(word => word).join('፣');

    // Append category and words divs to solved card div
    solvedCardDiv.appendChild(categoryDiv);
    solvedCardDiv.appendChild(wordsDiv);

    // Get the solved category element
    let solvedCategory = document.getElementById('solvedCategory');
    solvedCategory.style.display = 'grid';

    // Append the solved card to the solved category
    solvedCategory.appendChild(solvedCardDiv);
}

function solveGame() {
    getGameCards().forEach(function(card){
        card.remove();
    })
    
    let solvedCategory = document.getElementById('solvedCategory');
    solvedCategory.replaceChildren();

    fetch('/solvegame', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        for(let i = 0; i < data.length; i++) {
            insertSolvedCard(data[i]['word_list'], data[i]['category'], data[i]['value']);
        }

    })
    .catch(error => {
        console.error('Error in solveGame():', error);
    });
}

function handleCheckResponse(data){
    // Extract result and value from the data
    const { result, value, attempts_left, submitted_words, category } = data;
    if (result === 'right') {
        removeSolvedGameCards();
        setTimeout(() => {
            insertSolvedCard(submitted_words, category, value);
        },200);
        
    } else if (result === 'attempt_made'){
        customAlert("Attempt Repeated");

    } else if (result === 'one-off') {
        animateShakeX();
        setTimeout(() => {
            customAlert("One Away...");
            updateMistakesCounter();
        }, 600);
        
    } else if (result === 'wrong') {
        // Handle 'wrong' response
        animateShakeX();
        setTimeout(() => {
            updateMistakesCounter();
        }, 600);
    } else if (result == 'gameover') {
        animateShakeX();
        setTimeout(() => {
            deselectAll();
            updateMistakesCounter();
            setupResult('')
            customAlert("Game Over");
            solveGame();
            setTimeout(() => {
                showResult();
            }, 2000);
        }, 600);    
    } else if (result == 'game_won') {
        removeSolvedGameCards();
        setTimeout(() => {
            insertSolvedCard(submitted_words, category, value);
            setTimeout(() => {
                showResult();
            }, 2000);
        },200);
        
    }
};

function setupResult(message){
    let endMessage = document.getElementById('endMessage');
    
    endMessage.textContent = message;
    shuffleBtn.style.display ='none';
    deselectAllBtn.style.display = 'none';
    submitBtn.style.display = 'none';
    viewResultBtn.style.display = 'none'


}

function checkShowResult() {
    console.log('Inside checkshowresult')
    fetch('/gameplay', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        if (data.showResult) {
            console.log('checkshowresult = true, returning')
            return true;
        }
    })
    .catch(error => {
        console.error('Error in index():', error);
    });
}

function showResult(){
    let fieldSection = document.getElementById('field');
    let resultSection = document.getElementById('result');
    let resultRow = document.getElementById('resultRows');
    let mistakesSection = document.getElementById('mistakes');

    resultSection.style.display = 'block';
    fieldSection.style.display = 'none';
    mistakesSection.style.display = 'none';

    fetch('/resultbuilder', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response from the server
        const {message, result} = data;
        setupResult(message);
        resultRow.innerHTML = '';
        for(var i = 0; i<result.length; i++){
            let rowDiv = document.createElement('div');
            rowDiv.classList.add('rowno1') 
            for (var j = 0; j< result[i].length; j++) {
                let itemSpan = document.createElement('span'); 
                itemSpan.classList.add('resultColor');
                if (result[i][j] === 0) {
                    itemSpan.style.backgroundColor = '#f9df6d';
                } else if (result[i][j] === 1){
                    itemSpan.style.backgroundColor = '#a0c35a';
                } else if (result[i][j] === 2){
                    itemSpan.style.backgroundColor = '#b0c4ef';
                } else {
                    itemSpan.style.backgroundColor = '#ba81c5';
                }
                console.log('SP-EL: '+itemSpan);
                rowDiv.appendChild(itemSpan);
            };
            console.log('ROWDIV-EL: '+rowDiv);
            resultRow.appendChild(rowDiv);            
        };

    })
    .catch(error => {
        console.error('Error in result_builder():', error);
    });
};

  
window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    // Check if game is already played
    if (checkShowResult() === true) {
        console.log('calling showResult')
        showResult();
    }

    // Assign variables after the DOM has fully loaded
    gameBoard = document.getElementById('gameBoard');
    deselectAllBtn = document.getElementById('deselect');
    submitBtn = document.getElementById('submit');
    shuffleBtn = document.getElementById('shuffle');
    mistakeCounter = document.getElementById('mistakeCounter');

    //Declare and define locally used variables
    let showHelpBtn; 
    let hideHelpBtn;
    let backPuzzleBtn;
    let helpSection;
    let fieldSection;
    let resultSection;
    let mistakesSection;
    let gameControlsSection;

    showHelpBtn = document.getElementById('showHelpBtn');
    hideHelpBtn = document.getElementById('hideHelpBtn');
    backPuzzleBtn = document.getElementById('backPuzzleBtn');
    helpSection = document.getElementById('help');
    fieldSection = document.getElementById('field');
    resultSection = document.getElementById('result');
    mistakesSection = document.getElementById('mistakes');
    gameControlsSection = document.getElementById('gameControls');
    viewResultBtn = document.getElementById('viewResult');

    
    
    //Populate the mistake counter
    updateMistakesCounter();


    //Selection of cards when clicked - Toggle on and off
    gameBoard.addEventListener('click', function(event) {
        if (event.target.classList.contains('gamecard')) {
            if (getActiveCardsCount() < 4 || event.target.classList.contains('active')) {
                event.target.classList.toggle('active');
                toggleDeselectAllBtn();
                toggleSubmitBtn();
            }
        }
    });

    //Shuffle cards when button is clicked
    shuffleBtn.addEventListener('click', function(){
        console.log('Shuffle Clicked');
        shuffle(getGameCards());
    });

    //Deselect All cards when button is clicked
    deselectAllBtn.addEventListener('click', function() {
        deselectAll();
    });

    submitBtn.addEventListener('click', function() {
        animateShakeY();
        setTimeout(submitWords, 600);
    });

    hideHelpBtn.addEventListener( 'click', function() {
        helpSection.style.display = 'none';
        fieldSection.style.display = 'flex';
        mistakesSection.style.display = 'flex';
        gameControlsSection.style.display = 'flex';
    });

    showHelpBtn.addEventListener( 'click', function() {
        helpSection.style.display = 'block';
        fieldSection.style.display = 'none';
        mistakesSection.style.display = 'none';
        gameControlsSection.style.display = 'none';
    });

    backPuzzleBtn.addEventListener('click', function() {
        resultSection.style.display = 'none';
        fieldSection.style.display = 'flex';
        solveGame();
        viewResultBtn.style.display = 'block';
    });

    viewResultBtn.addEventListener('click', function() {
        setupResult('')
        showResult();
    });

});

