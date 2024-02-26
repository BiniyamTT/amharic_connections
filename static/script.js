function shuffle(array) {
    console.log('inside shuffle function');
    console.log(array);
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i].innerHTML, array[j].innerHTML] = [array[j].innerHTML, array[i].innerHTML];
    }
    return array;
}

// Function to update the mistakes counter
function updateMistakesCounter(attempts_left) {
    const mistakeCounter = document.getElementById('mistakeCounter');
    mistakeCounter.innerHTML = ''; // Clear existing circles

    // Add circles based on the attempts left
    for (let i = 0; i < attempts_left; i++) {
        const circleSpan = document.createElement('span');
        circleSpan.classList.add('material-symbols-outlined', 'filled');
        circleSpan.textContent = 'circle'; // You may need to update this to use an appropriate icon or symbol
        mistakeCounter.appendChild(circleSpan);
    }
}

function removeSelectedWordsFromBoard() {
    // Get the selected words
    let selectedWords = document.querySelectorAll('.gamecard.active');

    // Remove the entire div element for each selected word
    selectedWords.forEach(word => {
        word.remove();
    });
}

function insertSolvedCard(submittedWords, category, value) {
    // Create a new div element for the solved card
    let solvedCardDiv = document.createElement('div');
    solvedCardDiv.classList.add('solvedcard', 'solvedcardText', 'col-span-4');
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
    wordsDiv.textContent = submittedWords.map(word => word.word).join(', ');

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
        submittedWords.push({ word: word.textContent.trim(), value: parseInt(word.dataset.value) });
    });

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
        console.error('Error:', error);
    })
    .finally(() => {
        // Re-enable the submit button after the request is complete
        document.getElementById('submit').removeAttribute('disabled');
    });
}

function handleCheckResponse(data) {
    // Extract result and value from the data
    const { result, value, attempts_left, submitted_words, category } = data;
    console.log('Attempts Left:', attempts_left);

    // Do something based on the result received from the server
    console.log('inside handleCheckResponse');

    if (result === 'right') {
        // Handle 'right' response
        console.log('Right');
        console.log('Value:', value);
        console.log('Attempts Left:', attempts_left);
        console.log('Category:', category);
        // Remove the selected words from the game board
        removeSelectedWordsFromBoard();
        // Insert a new solved card with the submitted words
        insertSolvedCard(submitted_words, category, value);
    } else if (result === 'one-off') {
        // Handle 'one-off' response
        console.log('One-off');
        console.log('Value:', value);
        console.log('Attempts Left:', attempts_left);
        updateMistakesCounter(attempts_left)
    } else if (result === 'wrong') {
        // Handle 'wrong' response
        console.log('Wrong');
        console.log('Value:', value);
        console.log('Attempts Left:', attempts_left);
        updateMistakesCounter(attempts_left)
    }
}


window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    let gameCards = document.getElementsByClassName('gamecard');
    let deselectButton = document.getElementById('deselect');
    let submitButton = document.getElementById('submit');
    let shuffleButton = document.getElementById('shuffle');
    let attempts_left = 4;
    console.log('Game Start Attempts Left:', attempts_left);
    updateMistakesCounter(attempts_left)
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
        let activeGameCards = document.querySelectorAll('.gamecard.active');
        for (let i = 0; i < activeGameCards.length; i++) {
            activeGameCards[i].classList.remove('active');
        }
        updateDeselectButton();
        updateSubmitButton();
    });

    function updateDeselectButton() {
        let activeGameCardsCount = document.querySelectorAll('.gamecard.active').length;
        if (activeGameCardsCount > 0) {
            deselectButton.removeAttribute('disabled');
        } else {
            deselectButton.setAttribute('disabled', 'disabled');
        }
    }

    function updateSubmitButton() {
        let activeGameCardsCount = document.querySelectorAll('.gamecard.active').length;
        if (activeGameCardsCount === 4) {
            submitButton.removeAttribute('disabled');
            submitButton.classList.add('submitbtn');
        } else {
            submitButton.setAttribute('disabled', 'disabled');
            submitButton.classList.remove('submitbtn');
        }
    }

    // Shuffle button function when clicked
    shuffleButton.addEventListener('click', function() {
        // Get text content of selected words and remove active class
        let selectedWords = [];
        let activeGameCards = document.querySelectorAll('.gamecard.active');
        let gameCards = document.getElementsByClassName('gamecard');
        let gameCardsArray = Array.from(gameCards);

        activeGameCards.forEach(card => {
            selectedWords.push(card.textContent.trim());
            card.classList.remove('active');
        });
        console.log('Selected Words')
        console.log(selectedWords)

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
        submitWords();
});


});
