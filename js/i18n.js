/* ================================
   IMPOZTOR WORD GAME - i18n (Internationalization)
   ================================ */

const translations = {
    ar: {
        // Header
        gameTitle: 'IMPOZTOR',

        // Setup Screen
        setupTitle: 'إعداد اللعبة',
        playerCount: 'عدد اللاعبين',
        playerNames: 'أسماء اللاعبين',
        playerPlaceholder: 'اللاعب',
        category: 'اختر الفئة',
        impostorCount: 'عدد الجواسيس',
        shuffleOrder: 'خلط ترتيب اللاعبين',
        startGame: 'ابدأ اللعبة',

        // Reveal Screen
        passTo: 'مرر الجهاز إلى',
        imReady: 'أنا جاهز',
        revealInstruction: 'اسحب أو اضغط للكشف',
        nextPlayer: 'اللاعب التالي',
        yourWord: 'كلمتك هي',
        youAreImpostor: 'أنت الجاسوس!',

        // Discussion Screen
        discussionTime: 'وقت المناقشة',
        pause: 'إيقاف',
        resume: 'استمرار',
        startVoting: 'بدء التصويت',

        // Voting Screen
        votingTitle: 'التصويت',
        votingInstruction: 'من تعتقد أنه الجاسوس؟',
        votesCount: 'الأصوات:',
        confirmVote: 'تأكيد التصويت',

        // Results Screen
        resultsTitle: 'النتائج',
        theWord: 'الكلمة كانت',
        theImpostors: 'الجواسيس',
        votingResults: 'نتائج التصويت',
        playAgain: 'العب مرة أخرى',
        newGame: 'لعبة جديدة',
        votes: 'صوت',

        // Welcome Screen
        welcomeTagline: 'اكتشف الجاسوس بينكم!',
        feature1: '3-15 لاعبين',
        feature2: 'فئات متعددة',
        feature3: 'مناقشة وتصويت',
        playNow: 'العب الآن',

        // Alerts
        enterAllNames: 'الرجاء إدخال جميع أسماء اللاعبين',
        loadError: 'حدث خطأ في تحميل الكلمات'
    },

    en: {
        // Header
        gameTitle: 'IMPOZTOR',

        // Setup Screen
        setupTitle: 'Game Setup',
        playerCount: 'Number of Players',
        playerNames: 'Player Names',
        playerPlaceholder: 'Player',
        category: 'Choose Category',
        impostorCount: 'Number of Impostors',
        shuffleOrder: 'Shuffle Player Order',
        startGame: 'Start Game',

        // Reveal Screen
        passTo: 'Pass device to',
        imReady: "I'm Ready",
        revealInstruction: 'Swipe or tap to reveal',
        nextPlayer: 'Next Player',
        yourWord: 'Your word is',
        youAreImpostor: "You're the Impostor!",

        // Discussion Screen
        discussionTime: 'Discussion Time',
        pause: 'Pause',
        resume: 'Resume',
        startVoting: 'Start Voting',

        // Voting Screen
        votingTitle: 'Voting',
        votingInstruction: 'Who do you think is the impostor?',
        votesCount: 'Votes:',
        confirmVote: 'Confirm Vote',

        // Results Screen
        resultsTitle: 'Results',
        theWord: 'The word was',
        theImpostors: 'The Impostors',
        votingResults: 'Voting Results',
        playAgain: 'Play Again',
        newGame: 'New Game',
        votes: 'votes',

        // Welcome Screen
        welcomeTagline: 'Find the impostor among you!',
        feature1: '3-15 Players',
        feature2: 'Multiple Categories',
        feature3: 'Discuss & Vote',
        playNow: 'Play Now',

        // Alerts
        enterAllNames: 'Please enter all player names',
        loadError: 'Error loading words'
    }
};

// Current language
let currentLanguage = 'ar';

/**
 * Set the language and update all UI elements
 * @param {string} lang - Language code ('ar' or 'en')
 */
function setLanguage(lang) {
    currentLanguage = lang;

    // Update document direction and language
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    // Update placeholder texts
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            element.placeholder = translations[lang][key];
        }
    });

    // Save preference
    localStorage.setItem('impoztor-game-lang', lang);

    // Dispatch event for other components to react
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

/**
 * Get a translation string
 * @param {string} key - Translation key
 * @returns {string} Translated string
 */
function t(key) {
    return translations[currentLanguage][key] || key;
}

/**
 * Get current language
 * @returns {string} Current language code
 */
function getCurrentLanguage() {
    return currentLanguage;
}

/**
 * Toggle between languages
 */
function toggleLanguage() {
    const newLang = currentLanguage === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
}

/**
 * Initialize language from saved preference or default
 */
function initLanguage() {
    const savedLang = localStorage.getItem('impoztor-game-lang');
    const initialLang = savedLang || 'ar'; // Arabic is default
    setLanguage(initialLang);
}

// Export for use in other modules
window.i18n = {
    setLanguage,
    t,
    getCurrentLanguage,
    toggleLanguage,
    initLanguage,
    translations
};
