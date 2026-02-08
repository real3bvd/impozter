/* ================================
   IMPOZTOR WORD GAME - MAIN APP
   ================================ */

// Game State
const gameState = {
    players: [],
    playerOrder: [],
    impostorIndices: [],
    secretWord: null,
    currentCategory: null,
    currentPlayerIndex: 0,
    phase: 'setup', // setup, reveal, discussion, voting, results
    votes: {},
    timerSeconds: 180,
    timerRunning: false,
    timerInterval: null
};

// Word data (loaded from JSON)
let wordData = null;

// DOM Elements
const elements = {
    // Screens
    welcomeScreen: document.getElementById('welcome-screen'),
    setupScreen: document.getElementById('setup-screen'),
    revealScreen: document.getElementById('reveal-screen'),
    discussionScreen: document.getElementById('discussion-screen'),
    votingScreen: document.getElementById('voting-screen'),
    resultsScreen: document.getElementById('results-screen'),

    // Setup
    playerCount: document.getElementById('player-count'),
    playerNamesContainer: document.getElementById('player-names-container'),
    categorySelect: document.getElementById('category-select'),
    impostorCount: document.getElementById('impostor-count'),
    shuffleOrder: document.getElementById('shuffle-order'),
    startGameBtn: document.getElementById('start-game-btn'),

    // Reveal
    passCard: document.getElementById('pass-card'),
    currentPlayerName: document.getElementById('current-player-name'),
    readyBtn: document.getElementById('ready-btn'),
    roleCardContainer: document.getElementById('role-card-container'),
    roleCard: document.getElementById('role-card'),
    roleIcon: document.getElementById('role-icon'),
    roleText: document.getElementById('role-text'),
    wordDisplay: document.getElementById('word-display'),
    nextPlayerBtn: document.getElementById('next-player-btn'),
    progressFill: document.getElementById('progress-fill'),
    currentIndex: document.getElementById('current-index'),
    totalPlayers: document.getElementById('total-players'),

    // Discussion
    timerMinutes: document.getElementById('timer-minutes'),
    timerSeconds: document.getElementById('timer-seconds'),
    timerDecrease: document.getElementById('timer-decrease'),
    timerIncrease: document.getElementById('timer-increase'),
    timerToggle: document.getElementById('timer-toggle'),
    skipDiscussionBtn: document.getElementById('skip-discussion-btn'),

    // Voting
    votingOptions: document.getElementById('voting-options'),
    votesCast: document.getElementById('votes-cast'),
    votesTotal: document.getElementById('votes-total'),

    // Results
    resultWord: document.getElementById('result-word'),
    impostorsList: document.getElementById('impostors-list'),
    votingResults: document.getElementById('voting-results'),
    playAgainBtn: document.getElementById('play-again-btn'),
    newGameBtn: document.getElementById('new-game-btn'),

    // Header
    soundToggle: document.getElementById('sound-toggle'),
    langToggle: document.getElementById('lang-toggle'),

    // Welcome
    playBtn: document.getElementById('play-btn')
};

// Card flip controller
let cardFlipController = null;

/* --------------------------------
   Initialization
   -------------------------------- */
async function init() {
    // Initialize language
    window.i18n.initLanguage();

    // Initialize theme
    initTheme();

    // Load word data
    await loadWordData();

    // Setup event listeners
    setupEventListeners();

    // Generate initial player name inputs
    updatePlayerNameInputs();

    // Initialize number buttons
    setupNumberInputs();
}

/**
 * Load word data from JSON
 */
async function loadWordData() {
    try {
        // Add timestamp to prevent caching
        const response = await fetch('data/words.json?v=' + Date.now());
        wordData = await response.json();
        populateCategories();
    } catch (error) {
        console.error('Error loading word data:', error);
        // Use fallback data
        wordData = getFallbackWordData();
        populateCategories();
    }
}

/**
 * Get fallback word data in case JSON fails to load
 */
function getFallbackWordData() {
    return {
        categories: [
            {
                id: 'animals',
                name: { ar: 'الحيوانات', en: 'Animals' },
                words: [
                    { ar: 'أسد', en: 'Lion' },
                    { ar: 'فيل', en: 'Elephant' },
                    { ar: 'زرافة', en: 'Giraffe' },
                    { ar: 'قرد', en: 'Monkey' },
                    { ar: 'دب', en: 'Bear' },
                    { ar: 'نمر', en: 'Tiger' },
                    { ar: 'ثعلب', en: 'Fox' },
                    { ar: 'أرنب', en: 'Rabbit' }
                ]
            },
            {
                id: 'food',
                name: { ar: 'الطعام', en: 'Food' },
                words: [
                    { ar: 'بيتزا', en: 'Pizza' },
                    { ar: 'برجر', en: 'Burger' },
                    { ar: 'سوشي', en: 'Sushi' },
                    { ar: 'باستا', en: 'Pasta' },
                    { ar: 'شاورما', en: 'Shawarma' },
                    { ar: 'فلافل', en: 'Falafel' },
                    { ar: 'كباب', en: 'Kebab' },
                    { ar: 'تاكو', en: 'Taco' }
                ]
            },
            {
                id: 'places',
                name: { ar: 'الأماكن', en: 'Places' },
                words: [
                    { ar: 'مطار', en: 'Airport' },
                    { ar: 'مستشفى', en: 'Hospital' },
                    { ar: 'مدرسة', en: 'School' },
                    { ar: 'سينما', en: 'Cinema' },
                    { ar: 'مطعم', en: 'Restaurant' },
                    { ar: 'شاطئ', en: 'Beach' },
                    { ar: 'جبل', en: 'Mountain' },
                    { ar: 'متحف', en: 'Museum' }
                ]
            },
            {
                id: 'jobs',
                name: { ar: 'المهن', en: 'Jobs' },
                words: [
                    { ar: 'طبيب', en: 'Doctor' },
                    { ar: 'مهندس', en: 'Engineer' },
                    { ar: 'معلم', en: 'Teacher' },
                    { ar: 'طباخ', en: 'Chef' },
                    { ar: 'شرطي', en: 'Police Officer' },
                    { ar: 'رائد فضاء', en: 'Astronaut' },
                    { ar: 'طيار', en: 'Pilot' },
                    { ar: 'صحفي', en: 'Journalist' }
                ]
            }
        ]
    };
}

/**
 * Populate category dropdown
 */
function populateCategories() {
    const lang = window.i18n.getCurrentLanguage();
    elements.categorySelect.innerHTML = '';

    wordData.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name[lang];
        elements.categorySelect.appendChild(option);
    });
}

/**
 * Initialize theme - always dark mode
 */
function initTheme() {
    document.documentElement.setAttribute('data-theme', 'dark');
}

/* --------------------------------
   Event Listeners
   -------------------------------- */
function setupEventListeners() {
    // Header controls
    elements.soundToggle.addEventListener('click', () => window.gameAudio.toggle());
    elements.langToggle.addEventListener('click', () => {
        window.i18n.toggleLanguage();
        populateCategories();
        updatePlayerNameInputs();
    });

    // Setup screen
    elements.startGameBtn.addEventListener('click', startGame);
    elements.playerCount.addEventListener('change', updatePlayerNameInputs);

    // Welcome screen
    elements.playBtn.addEventListener('click', () => {
        switchScreen('setup');
        window.gameAudio.play('click');
    });

    // Reveal screen
    elements.readyBtn.addEventListener('click', showRoleCard);
    elements.nextPlayerBtn.addEventListener('click', nextPlayer);

    // Discussion screen
    elements.timerDecrease.addEventListener('click', () => adjustTimer(-30));
    elements.timerIncrease.addEventListener('click', () => adjustTimer(30));
    elements.timerToggle.addEventListener('click', toggleTimer);
    elements.skipDiscussionBtn.addEventListener('click', startVotingPhase);

    // Results screen
    elements.playAgainBtn.addEventListener('click', playAgain);
    elements.newGameBtn.addEventListener('click', newGame);

    // Language change event
    window.addEventListener('languageChanged', () => {
        populateCategories();
        if (gameState.phase === 'reveal') {
            updateRevealScreen();
        }
    });
}

/**
 * Setup number input increment/decrement buttons
 */
function setupNumberInputs() {
    document.querySelectorAll('.number-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const input = document.getElementById(targetId);
            const currentValue = parseInt(input.value);
            const min = parseInt(input.min);
            const max = parseInt(input.max);

            if (btn.classList.contains('plus') && currentValue < max) {
                input.value = currentValue + 1;
            } else if (btn.classList.contains('minus') && currentValue > min) {
                input.value = currentValue - 1;
            }

            // Trigger change event
            input.dispatchEvent(new Event('change'));

            // Update impostor max based on player count
            if (targetId === 'player-count') {
                updateImpostorMax();
            }

            window.gameAudio.play('click');
        });
    });
}

/**
 * Update maximum impostor count based on player count
 */
function updateImpostorMax() {
    const playerCount = parseInt(elements.playerCount.value);
    const maxImpostors = Math.floor(playerCount / 2) - 1;
    elements.impostorCount.max = Math.max(1, maxImpostors);

    if (parseInt(elements.impostorCount.value) > maxImpostors) {
        elements.impostorCount.value = Math.max(1, maxImpostors);
    }
}

/**
 * Update player name input fields
 */
function updatePlayerNameInputs() {
    const count = parseInt(elements.playerCount.value);
    const lang = window.i18n.getCurrentLanguage();
    const placeholder = window.i18n.t('playerPlaceholder');

    elements.playerNamesContainer.innerHTML = '';

    for (let i = 0; i < count; i++) {
        const div = document.createElement('div');
        div.className = 'player-name-input';
        div.innerHTML = `
            <span>${i + 1}.</span>
            <input type="text" 
                   class="player-name" 
                   placeholder="${placeholder} ${i + 1}" 
                   data-i18n-placeholder="playerPlaceholder"
                   maxlength="20"
                   autocomplete="off">
        `;
        elements.playerNamesContainer.appendChild(div);
    }

    updateImpostorMax();
}

/* --------------------------------
   Game Flow
   -------------------------------- */

/**
 * Start the game
 */
function startGame() {
    // Collect player names
    const nameInputs = document.querySelectorAll('.player-name');
    const players = [];

    nameInputs.forEach((input, index) => {
        const name = input.value.trim() || `${window.i18n.t('playerPlaceholder')} ${index + 1}`;
        players.push({ name, index });
    });

    // Get settings
    const categoryId = elements.categorySelect.value;
    const impostorCount = parseInt(elements.impostorCount.value);
    const shouldShuffle = elements.shuffleOrder.checked;

    // Setup game state
    gameState.players = players;
    gameState.playerOrder = shouldShuffle ? shuffleArray([...players]) : [...players];
    gameState.currentPlayerIndex = 0;
    gameState.currentCategory = wordData.categories.find(c => c.id === categoryId);

    // Select random word
    const words = gameState.currentCategory.words;
    gameState.secretWord = words[Math.floor(Math.random() * words.length)];

    // Assign impostors randomly
    const indices = [...Array(players.length).keys()];
    shuffleArray(indices);
    gameState.impostorIndices = indices.slice(0, impostorCount);

    // Reset votes
    gameState.votes = {};

    // Start reveal phase
    gameState.phase = 'reveal';
    switchScreen('reveal');
    updateRevealScreen();

    window.gameAudio.play('success');
}

/**
 * Update the reveal screen for current player
 */
function updateRevealScreen() {
    const playerIndex = gameState.currentPlayerIndex;
    const player = gameState.playerOrder[playerIndex];

    // Update player name display
    elements.currentPlayerName.textContent = player.name;

    // Update progress
    elements.currentIndex.textContent = playerIndex + 1;
    elements.totalPlayers.textContent = gameState.playerOrder.length;
    elements.progressFill.style.width = `${((playerIndex + 1) / gameState.playerOrder.length) * 100}%`;

    // Show pass card, hide role card
    elements.passCard.classList.remove('hidden');
    elements.roleCardContainer.classList.add('hidden');
    elements.nextPlayerBtn.classList.add('hidden');

    // Reset card flip
    if (cardFlipController) {
        cardFlipController.reset();
    }
}

/**
 * Show the role card for current player
 */
function showRoleCard() {
    const player = gameState.playerOrder[gameState.currentPlayerIndex];
    const isImpostor = gameState.impostorIndices.includes(player.index);
    const lang = window.i18n.getCurrentLanguage();

    // Setup role card content
    if (isImpostor) {
        elements.roleIcon.textContent = '[!SPY!]';
        elements.roleText.textContent = window.i18n.t('youAreImpostor');
        elements.wordDisplay.textContent = '[???]';
        elements.wordDisplay.classList.add('impostor');
    } else {
        elements.roleIcon.textContent = '[WORD]';
        elements.roleText.textContent = window.i18n.t('yourWord');
        elements.wordDisplay.textContent = gameState.secretWord[lang];
        elements.wordDisplay.classList.remove('impostor');
    }

    // Show role card container
    elements.passCard.classList.add('hidden');
    elements.roleCardContainer.classList.remove('hidden');

    // Initialize card flip controller
    if (cardFlipController) {
        cardFlipController.destroy();
    }
    cardFlipController = new window.animations.CardFlipController(elements.roleCard);

    // Listen for card flip
    elements.roleCard.addEventListener('cardFlipped', onCardFlipped, { once: true });

    window.gameAudio.play('click');
}

/**
 * Handle card flipped event
 */
function onCardFlipped() {
    // Show next player button after a short delay
    setTimeout(() => {
        elements.nextPlayerBtn.classList.remove('hidden');
    }, 500);
}

/**
 * Move to next player
 */
function nextPlayer() {
    gameState.currentPlayerIndex++;

    if (gameState.currentPlayerIndex >= gameState.playerOrder.length) {
        // All players have seen their roles
        startDiscussionPhase();
    } else {
        updateRevealScreen();
    }

    window.gameAudio.play('click');
}

/**
 * Start the discussion phase
 */
function startDiscussionPhase() {
    gameState.phase = 'discussion';
    gameState.timerSeconds = 180; // 3 minutes
    gameState.timerRunning = false;

    switchScreen('discussion');
    updateTimerDisplay();
    startTimer();

    window.gameAudio.play('success');
}

/**
 * Update timer display
 */
function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timerSeconds / 60);
    const seconds = gameState.timerSeconds % 60;
    elements.timerMinutes.textContent = String(minutes).padStart(2, '0');
    elements.timerSeconds.textContent = String(seconds).padStart(2, '0');
}

/**
 * Start the timer
 */
function startTimer() {
    gameState.timerRunning = true;
    elements.timerToggle.textContent = window.i18n.t('pause');

    gameState.timerInterval = setInterval(() => {
        if (gameState.timerSeconds > 0) {
            gameState.timerSeconds--;
            updateTimerDisplay();

            if (gameState.timerSeconds <= 10 && gameState.timerSeconds > 0) {
                window.gameAudio.play('timer');
            }
        } else {
            stopTimer();
            startVotingPhase();
        }
    }, 1000);
}

/**
 * Stop the timer
 */
function stopTimer() {
    gameState.timerRunning = false;
    elements.timerToggle.textContent = window.i18n.t('resume');
    clearInterval(gameState.timerInterval);
}

/**
 * Toggle timer pause/resume
 */
function toggleTimer() {
    if (gameState.timerRunning) {
        stopTimer();
    } else {
        startTimer();
    }
}

/**
 * Adjust timer by seconds
 */
function adjustTimer(seconds) {
    gameState.timerSeconds = Math.max(0, gameState.timerSeconds + seconds);
    updateTimerDisplay();
    window.gameAudio.play('click');
}

/**
 * Start the voting phase
 */
function startVotingPhase() {
    stopTimer();
    gameState.phase = 'voting';
    gameState.votes = {};
    gameState.currentPlayerIndex = 0;

    // Build voting options
    elements.votingOptions.innerHTML = '';
    gameState.players.forEach((player, index) => {
        const btn = document.createElement('button');
        btn.className = 'vote-btn';
        btn.dataset.playerIndex = index;
        btn.innerHTML = `
            <span class="name">${player.name}</span>
            <span class="vote-count">0</span>
        `;
        btn.addEventListener('click', () => castVote(index));
        elements.votingOptions.appendChild(btn);
    });

    // Update vote counts
    elements.votesCast.textContent = '0';
    elements.votesTotal.textContent = gameState.players.length;

    switchScreen('voting');
    showVotingForPlayer();

    window.gameAudio.play('success');
}

/**
 * Show voting screen for current player
 */
function showVotingForPlayer() {
    // Update instruction with current voter's name
    const voter = gameState.players[gameState.currentPlayerIndex];
    const instruction = document.querySelector('.voting-instruction');
    instruction.textContent = `${voter.name}: ${window.i18n.t('votingInstruction')}`;
}

/**
 * Cast a vote
 */
function castVote(votedPlayerIndex) {
    const voterIndex = gameState.currentPlayerIndex;

    // Store vote
    gameState.votes[voterIndex] = votedPlayerIndex;

    // Update vote counts display
    const voteCounts = {};
    Object.values(gameState.votes).forEach(idx => {
        voteCounts[idx] = (voteCounts[idx] || 0) + 1;
    });

    document.querySelectorAll('.vote-btn').forEach((btn, idx) => {
        const count = voteCounts[idx] || 0;
        btn.querySelector('.vote-count').textContent = count;
    });

    // Update votes cast count
    elements.votesCast.textContent = Object.keys(gameState.votes).length;

    // Move to next voter or show results
    gameState.currentPlayerIndex++;

    if (gameState.currentPlayerIndex >= gameState.players.length) {
        // All votes are in
        setTimeout(showResults, 500);
    } else {
        showVotingForPlayer();
    }

    window.gameAudio.play('click');
}

/**
 * Show the results screen
 */
function showResults() {
    gameState.phase = 'results';
    const lang = window.i18n.getCurrentLanguage();

    // Show the word
    elements.resultWord.textContent = gameState.secretWord[lang];

    // Show impostors
    elements.impostorsList.innerHTML = '';
    gameState.impostorIndices.forEach(idx => {
        const player = gameState.players[idx];
        const tag = document.createElement('span');
        tag.className = 'impostor-tag';
        tag.innerHTML = `[SPY] ${player.name}`;
        elements.impostorsList.appendChild(tag);
    });

    // Show voting results
    const voteCounts = {};
    Object.values(gameState.votes).forEach(idx => {
        voteCounts[idx] = (voteCounts[idx] || 0) + 1;
    });

    elements.votingResults.innerHTML = '';

    // Sort by vote count
    const sorted = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);

    sorted.forEach(([playerIdx, count]) => {
        const player = gameState.players[playerIdx];
        const isImpostor = gameState.impostorIndices.includes(parseInt(playerIdx));

        const div = document.createElement('div');
        div.className = 'vote-result-item';
        div.innerHTML = `
            <span class="name">${isImpostor ? '[SPY] ' : ''}${player.name}</span>
            <span class="count">${count} ${window.i18n.t('votes')}</span>
        `;
        elements.votingResults.appendChild(div);
    });

    switchScreen('results');
    window.animations.createConfetti();
    window.gameAudio.play('success');
}

/**
 * Play again with same players
 */
function playAgain() {
    // Keep players, reset game
    gameState.currentPlayerIndex = 0;
    gameState.votes = {};

    // New random word
    const words = gameState.currentCategory.words;
    gameState.secretWord = words[Math.floor(Math.random() * words.length)];

    // New random impostors
    const indices = [...Array(gameState.players.length).keys()];
    shuffleArray(indices);
    gameState.impostorIndices = indices.slice(0, gameState.impostorIndices.length);

    // Shuffle order if enabled
    if (elements.shuffleOrder.checked) {
        gameState.playerOrder = shuffleArray([...gameState.players]);
    }

    // Start reveal phase
    gameState.phase = 'reveal';
    switchScreen('reveal');
    updateRevealScreen();

    window.gameAudio.play('success');
}

/**
 * Start a completely new game
 */
function newGame() {
    gameState.phase = 'setup';
    switchScreen('welcome');
    window.gameAudio.play('click');
}

/* --------------------------------
   Utility Functions
   -------------------------------- */

/**
 * Switch to a different screen
 */
function switchScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Show target screen
    const targetScreen = document.getElementById(`${screenName}-screen`);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

/**
 * Shuffle array in place (Fisher-Yates)
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/* --------------------------------
   Start the app
   -------------------------------- */
document.addEventListener('DOMContentLoaded', init);
