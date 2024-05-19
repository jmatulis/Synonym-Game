document.addEventListener('DOMContentLoaded', () => {
    const dailyWordContainer = document.getElementById('daily-word-container');
    const synonymsContainer = document.getElementById('synonyms-container');
    const guessInput = document.getElementById('guess-input');
    const errorMessage = document.getElementById('error-message');
    const popupMessage = document.getElementById('popup-message');
    const refreshButton = document.getElementById('refresh-button');
    let guessed = new Set();
    let synonyms = [];
    const layerCharacterLimit = 15; // Define the character limit for each layer
    const dailyWordKey = 'dailyWord';
    const guessedKey = 'guessedWords';
    const gameWonKey = 'gameWon';

    function loadDailyWord() {
        fetch('/daily_word')
            .then(response => response.json())
            .then(data => {
                const dailyWord = data.daily_word;
                synonyms = data.synonyms.map(s => s.toLowerCase());
                dailyWordContainer.textContent = `Daily Word: ${dailyWord.charAt(0).toUpperCase() + dailyWord.slice(1)}`;
                const layers = organizeIntoLayers(synonyms, layerCharacterLimit);
                renderSynonyms(layers);

                const savedDailyWord = localStorage.getItem(dailyWordKey);
                const savedGuessedWords = JSON.parse(localStorage.getItem(guessedKey));
                const gameWon = localStorage.getItem(gameWonKey) === 'true';

                if (savedDailyWord === dailyWord) {
                    if (savedGuessedWords) {
                        savedGuessedWords.forEach(guess => guessed.add(guess));
                        updateSynonyms();
                    }
                    if (gameWon) {
                        showWinMessage();
                    }
                } else {
                    resetGame();
                }

                localStorage.setItem(dailyWordKey, dailyWord);
            });
    }

    function resetGame() {
        guessed.clear();
        guessInput.value = '';
        errorMessage.textContent = '';
        localStorage.removeItem(guessedKey);
        localStorage.removeItem(gameWonKey);
        hideWinMessage();
    }

    function showWinMessage() {
        errorMessage.textContent = '';
        document.getElementById('guess-container').style.display = 'none';
        popupMessage.classList.remove('hidden');
        popupMessage.style.display = 'block';
    }

    function hideWinMessage() {
        document.getElementById('guess-container').style.display = 'block';
        popupMessage.classList.add('hidden');
        popupMessage.style.display = 'none';
    }

    refreshButton.addEventListener('click', () => {
        resetGame();
        loadDailyWord();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            submitGuess();
        } else if (event.key === 'Backspace') {
            guessInput.value = guessInput.value.slice(0, -1);
        } else if (event.key.length === 1 && event.key.match(/[a-z]/i)) {
            guessInput.value += event.key.toUpperCase();
        }
    });

    document.querySelectorAll('.quordle-key').forEach(key => {
        key.addEventListener('click', () => {
            const letter = key.querySelector('.quordle-box-content').textContent.trim();
            if (letter === '') return;
            if (key.classList.contains('backspace-key')) {
                if (guessInput.value.length > 0) {
                    guessInput.value = guessInput.value.slice(0, -1);
                }
            } else if (key.classList.contains('enter-key')) {
                if (guessInput.value.length > 0) {
                    submitGuess();
                }
            } else {
                guessInput.value += letter;
            }
        });
    });

    function submitGuess() {
        const guess = guessInput.value.trim().toLowerCase();
        if (!guess) return;

        fetch('/guess', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ guess }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.result === 'correct' || data.result === 'win') {
                guessed.add(data.guess.toLowerCase());
                localStorage.setItem(guessedKey, JSON.stringify([...guessed]));
                updateSynonyms();

                errorMessage.textContent = '';
                if (guessed.size === synonyms.length && [...guessed].every(g => synonyms.includes(g))) {
                    localStorage.setItem(gameWonKey, 'true');
                    showWinMessage();
                }
                guessInput.value = '';
            } else {
                errorMessage.textContent = 'Incorrect guess. Try again!';
                errorMessage.style.color = 'red';
                guessInput.classList.add('shake');
                setTimeout(() => {
                    guessInput.classList.remove('shake');
                    guessInput.value = '';
                }, 500);
            }
        })
        .catch(() => {
            errorMessage.textContent = 'Incorrect guess. Try again!';
            errorMessage.style.color = 'red';
            guessInput.classList.add('shake');
            setTimeout(() => {
                guessInput.classList.remove('shake');
                guessInput.value = '';
            }, 500);
        });
    }

    function updateSynonyms() {
        document.querySelectorAll('.synonym').forEach(synonymElement => {
            const synonym = synonymElement.dataset.synonym.toLowerCase();
            if (guessed.has(synonym)) {
                synonymElement.textContent = synonym.toUpperCase();
            }
        });
    }

    function organizeIntoLayers(synonyms, charLimit) {
        const layers = [];
        let currentLayer = [];
        let currentLength = 0;

        synonyms.forEach(synonym => {
            const capitalizedSynonym = synonym.toUpperCase();
            if (currentLength + capitalizedSynonym.length > charLimit) {
                layers.push(currentLayer);
                currentLayer = [];
                currentLength = 0;
            }
            currentLayer.push(capitalizedSynonym);
            currentLength += capitalizedSynonym.length;
        });

        if (currentLayer.length > 0) {
            layers.push(currentLayer);
        }

        return layers;
    }

    function renderSynonyms(layers) {
        synonymsContainer.innerHTML = ''; // Clear any existing content
        layers.forEach(layer => {
            const layerContainer = document.createElement('div');
            layerContainer.classList.add('layer');
            layer.forEach(synonym => {
                const synonymElement = document.createElement('div');
                synonymElement.classList.add('synonym');
                synonymElement.dataset.synonym = synonym;
                synonymElement.textContent = '_ '.repeat(synonym.length);
                layerContainer.appendChild(synonymElement);
            });
            synonymsContainer.appendChild(layerContainer);
        });
    }

    loadDailyWord();
});
