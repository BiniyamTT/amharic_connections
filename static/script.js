function customAlert(message) {
    var alertDiv = document.getElementById('customAlert');
    alertDiv.innerText = message;
    alertDiv.style.display = 'block';
    setTimeout(function() {
        alertDiv.style.display = 'none';
    }, 1500); // Display for 1.5 second
}

function updateDeselectButton() {
    let activeGameCardsCount = document.querySelectorAll('.gamecard.active').length;
    let deselectButton = document.getElementById('deselect');
    if (activeGameCardsCount > 0) {
        deselectButton.removeAttribute('disabled');
    } else {
        deselectButton.setAttribute('disabled', 'disabled');
    }
}

function updateSubmitButton() {
    let activeGameCardsCount = document.querySelectorAll('.gamecard.active').length;
    let submitButton = document.getElementById('submit');
    if (activeGameCardsCount === 4) {
        submitButton.removeAttribute('disabled');
        submitButton.classList.add('submitbtn');
    } else {
        submitButton.classList.remove('submitbtn');
        submitButton.setAttribute('disabled', 'disabled');
        
    }
}

function shuffle(array) {
    console.log('inside shuffle function');
    console.log(array);
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i].innerHTML, array[j].innerHTML] = [array[j].innerHTML, array[i].innerHTML];
    }
    return array;
}

function deselectAll() {
    let deselectButton = document.getElementById('deselect');
    let activeGameCards = document.querySelectorAll('.gamecard.active');
    for (let i = 0; i < activeGameCards.length; i++) {
        activeGameCards[i].classList.remove('active');
    }
    updateDeselectButton();
    updateSubmitButton();
}

// Function to update the mistakes counter
function updateMistakesCounter(attempts_left) {
    const mistakeCounter = document.getElementById('mistakeCounter');

    // Clear existing circles only if attempts_left is 4 (initial setup)
    if (attempts_left === 4) {
        mistakeCounter.innerHTML = '';

        // Add four circles initially
        for (let i = 0; i < 4; i++) {
            const circlei = document.createElement('i');
            circlei.classList.add('misscircle','fa-solid', 'fa-circle');
            mistakeCounter.appendChild(circlei);
        }
    } else {
        // If attempts_left is not 4, remove the last circle with animation
        const lastCircle = mistakeCounter.lastChild;
        lastCircle.style.animation = 'zoomOut 0.5s forwards'; // Apply the animation
        setTimeout(() => {
            mistakeCounter.removeChild(lastCircle);
        }, 500); // Remove the circle after the animation duration (in milliseconds)
    }
}

function animateShakeX() {
    console.log('InsideShakeX')
    let selectedcards = document.querySelectorAll('.gamecard.active');
    selectedcards.forEach(function(card) {
        card.classList.add('animate__animated', 'animate__shakeX');
    });
    selectedcards[0].addEventListener('animationend', () => {
        selectedcards.forEach(function(card) {
            card.classList.remove('animate__animated', 'animate__shakeX');
        });
    });
}

function animateShakeY() {
    console.log('InsideShakeY')
    let selectedcards = document.querySelectorAll('.gamecard.active');
    selectedcards.forEach(function(card) {
        card.classList.add('animate__animated', 'animate__shakeY');
    });
    selectedcards[0].addEventListener('animationend', () => {
        selectedcards.forEach(function(card) {
            card.classList.remove('animate__animated', 'animate__shakeY');
        });
    });
}

function removeSelectedWordsFromBoard() {
    // Get the selected words
    let selectedWords = document.querySelectorAll('.gamecard.active');

    // Remove the entire div element for each selected word
    selectedWords.forEach(word => {
        word.classList.add('animate__animated', 'animate__fadeOutUp');
        setTimeout(() => {
            word.remove();
        }, 600);
    });
}

function insertSolvedCard(submittedWords, category, value) {
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



function submitWords() {
    // Get the selected words
    let selectedWords = document.querySelectorAll('.gamecard.active');

    // Extract the word and value for each selected word
    let submittedWords = [];
    selectedWords.forEach(word => {
        submittedWords.push(word.textContent.trim());
    });
    console.log(submittedWords)
    // Disable the submit button while the request is being made
    document.getElementById('submit').setAttribute('disabled', 'disabled');

    // Send an AJAX request to the server
    fetch('/check', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ submittedWords: submittedWords })
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
        // Re-enable the submit button after the request is complete
        //document.getElementById('submit').removeAttribute('disabled');
        deselectAll()
    });
}

function showResult() {
    let fieldSection = document.getElementById('field');
    let resultSection = document.getElementById('result');
    let resultRow = document.getElementById('resultRows');
    let mistakesSection = document.getElementById('mistakes');
    let gameControlsSection = document.getElementById('gameControls');

    resultSection.style.display = 'block';
    fieldSection.style.display = 'none';
    mistakesSection.style.display = 'none';
    gameControlsSection.style.display = 'none';
    fetch('/resultbuilder', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response from the server
        console.log(data)
        const {message, result} = data;
        console.log(message)
        console.log(result)
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
}



function handleCheckResponse(data) {
    // Extract result and value from the data
    const { result, value, attempts_left, submitted_words, category } = data;
    if (result === 'right') {
        // Handle 'right' response
        // Remove the selected words from the game board
        removeSelectedWordsFromBoard();
        // Insert a new solved card with the submitted words
        insertSolvedCard(submitted_words, category, value);
    } else if (result === 'already_attempted'){
        customAlert("Attempt Repeated");

    } else if (result === 'one-off') {
        // Handle 'one-off' response
        animateShakeX();
        setTimeout(() => {
            customAlert("One Off");
            updateMistakesCounter(attempts_left);
        }, 600);
        
    } else if (result === 'wrong') {
        // Handle 'wrong' response
        animateShakeX();
        setTimeout(() => {
            updateMistakesCounter(attempts_left);
        }, 600);
    } else if (result == 'gameover') {
        animateShakeX();
        setTimeout(() => {
            deselectAll();
            customAlert("Game Over");
            updateMistakesCounter(attempts_left);
        }, 600);    
    } else if (result == 'game_won') {
        removeSelectedWordsFromBoard();
        insertSolvedCard(submitted_words, category, value)
        setTimeout(() => {
            showResult();
        }, 2000);
    }
}


window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    let gameCards = document.getElementsByClassName('gamecard');
    let deselectButton = document.getElementById('deselect');
    let submitButton = document.getElementById('submit');
    let shuffleButton = document.getElementById('shuffle');

    let attempts_left = 4;
    console.log(attempts_left)
    updateMistakesCounter(attempts_left)

    window.addEventListener('load', function() {
        // Send an HTTP GET request to the Flask backend
        fetch('/reset-attempts', {
            method: 'GET'
        });
    });

    //Selection of cards - Toggle on and off
    if (gameCards.length > 0) {
        for (let i = 0; i < gameCards.length; i++) {
            gameCards[i].addEventListener('click', function() {
                let activeGameCardsCount = document.querySelectorAll('.gamecard.active').length;
                if (activeGameCardsCount < 4 || this.classList.contains('active')) {
                    this.classList.toggle('active');
                    updateDeselectButton(); 
                    updateSubmitButton(); // Since the deselect button must become active depending on selection of game cards
                }                        
            });
        }
    }
    
    //Deselect button function when clicked
    deselectButton.addEventListener('click', function() {
        deselectAll()
        updateDeselectButton();
        updateSubmitButton();
    });

    // Shuffle button function when clicked
    shuffleButton.addEventListener('click', function() {
        // Get text content of selected words and remove active class
        let selectedWords = [];
        let activeGameCards = document.querySelectorAll('.gamecard.active');
        let gameCards = document.getElementsByClassName('gamecard');
        let gameCardsArray = Array.from(gameCards);
        let showHelpBtn = document.getElementById('showHelpBtn');
        let hideHelpBtn = document.getElementById('hideHelpBtn');
        let backPuzzleBtn = document.getElementById('backPuzzleBtn');
        activeGameCards.forEach(card => {
            selectedWords.push(card.textContent.trim());
            card.classList.remove('active');
        });
        console.log('Selected Words');
        console.log(selectedWords);

        // Shuffle the cards       
        shuffle(gameCardsArray);    

        // Reapply active class to selected words after shuffling
        for (let i = 0; i < gameCards.length; i++) {
            if (selectedWords.includes(gameCards[i].textContent.trim())) {
                gameCards[i].classList.add('active');
            }
        }
        // Update button states
        updateDeselectButton();
        updateSubmitButton();
    });

    // Add an event listener to the submit button
    submitButton.addEventListener('click', function() {
        animateShakeY();
        setTimeout(submitWords, 1000);
    });

    hideHelpBtn.addEventListener( 'click', function() {
        console.log('Hide help button clicked')
        let helpSection = document.getElementById('help');
        let fieldSection = document.getElementById('field');
        let mistakesSection = document.getElementById('mistakes');
        let gameControlsSection = document.getElementById('gameControls');

        helpSection.style.display = 'none';
        fieldSection.style.display = 'flex';
        mistakesSection.style.display = 'flex';
        gameControlsSection.style.display = 'flex';
    });

    showHelpBtn.addEventListener( 'click', function() {
        console.log('Show help button clicked')
        let helpSection = document.getElementById('help');
        let fieldSection = document.getElementById('field');
        let mistakesSection = document.getElementById('mistakes');
        let gameControlsSection = document.getElementById('gameControls');

        helpSection.style.display = 'block';
        fieldSection.style.display = 'none';
        mistakesSection.style.display = 'none';
        gameControlsSection.style.display = 'none';
    });

    backPuzzleBtn.addEventListener('click', function() {
        let fieldSection = document.getElementById('field');
        let resultSection = document.getElementById('result');
        resultSection.style.display = 'none';
        fieldSection.style.display = 'flex';
    });

});
