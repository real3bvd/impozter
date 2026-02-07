/* ================================
   IMPOZTOR WORD GAME - ANIMATIONS
   ================================ */

/**
 * Card flip animation controller
 */
class CardFlipController {
    constructor(cardElement) {
        this.card = cardElement;
        this.isFlipped = false;
        this.isAnimating = false;
        this.swipeThreshold = 50;
        this.startY = 0;
        this.currentY = 0;

        this.init();
    }

    init() {
        // Touch events for mobile swipe
        this.card.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        this.card.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
        this.card.addEventListener('touchend', this.handleTouchEnd.bind(this));

        // Click event for desktop
        this.card.addEventListener('click', this.handleClick.bind(this));
    }

    handleTouchStart(e) {
        if (this.isFlipped || this.isAnimating) return;
        this.startY = e.touches[0].clientY;
    }

    handleTouchMove(e) {
        if (this.isFlipped || this.isAnimating) return;
        this.currentY = e.touches[0].clientY;

        const diff = this.startY - this.currentY;

        // Add visual feedback for swipe
        if (diff > 0) {
            const rotation = Math.min(diff / 5, 15);
            this.card.style.transform = `rotateX(${rotation}deg)`;
        }
    }

    handleTouchEnd(e) {
        if (this.isFlipped || this.isAnimating) return;

        const diff = this.startY - this.currentY;
        this.card.style.transform = '';

        if (diff > this.swipeThreshold) {
            this.flip();
        }
    }

    handleClick(e) {
        if (this.isFlipped || this.isAnimating) return;
        this.flip();
    }

    flip() {
        if (this.isAnimating) return;

        this.isAnimating = true;
        this.isFlipped = true;
        this.card.classList.add('flipped');

        // Play sound if enabled
        if (window.gameAudio) {
            window.gameAudio.play('flip');
        }

        // Dispatch event
        this.card.dispatchEvent(new CustomEvent('cardFlipped'));

        setTimeout(() => {
            this.isAnimating = false;
        }, 600);
    }

    reset() {
        this.isFlipped = false;
        this.isAnimating = false;
        this.card.classList.remove('flipped');
        this.card.style.transform = '';
    }

    destroy() {
        this.card.removeEventListener('touchstart', this.handleTouchStart);
        this.card.removeEventListener('touchmove', this.handleTouchMove);
        this.card.removeEventListener('touchend', this.handleTouchEnd);
        this.card.removeEventListener('click', this.handleClick);
    }
}

/**
 * Screen transition animations
 */
const screenTransitions = {
    fadeIn(element, duration = 300) {
        return new Promise(resolve => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.classList.add('active');

            requestAnimationFrame(() => {
                element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';

                setTimeout(() => {
                    element.style.transition = '';
                    resolve();
                }, duration);
            });
        });
    },

    fadeOut(element, duration = 300) {
        return new Promise(resolve => {
            element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
            element.style.opacity = '0';
            element.style.transform = 'translateY(-20px)';

            setTimeout(() => {
                element.classList.remove('active');
                element.style.transition = '';
                element.style.opacity = '';
                element.style.transform = '';
                resolve();
            }, duration);
        });
    },

    async switchScreen(fromScreen, toScreen) {
        await this.fadeOut(fromScreen);
        await this.fadeIn(toScreen);
    }
};

/**
 * Button press animation
 */
function addButtonPressEffect(button) {
    button.addEventListener('touchstart', () => {
        button.style.transform = 'scale(0.95)';
    }, { passive: true });

    button.addEventListener('touchend', () => {
        button.style.transform = '';
    });
}

/**
 * Shake animation for errors
 */
function shake(element) {
    element.style.animation = 'none';
    element.offsetHeight; // Trigger reflow
    element.style.animation = 'shake 0.5s ease';
}

// Add shake keyframes dynamically
const shakeStyles = document.createElement('style');
shakeStyles.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-10px); }
        40% { transform: translateX(10px); }
        60% { transform: translateX(-10px); }
        80% { transform: translateX(10px); }
    }
`;
document.head.appendChild(shakeStyles);

/**
 * Confetti effect for results
 */
function createConfetti() {
    const colors = ['#6c5ce7', '#a29bfe', '#00d9a5', '#ffd93d', '#ff6b6b'];
    const container = document.createElement('div');
    container.className = 'confetti-container';
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
        overflow: hidden;
    `;

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: absolute;
            width: ${Math.random() * 10 + 5}px;
            height: ${Math.random() * 10 + 5}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}%;
            top: -20px;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            animation: confettiFall ${Math.random() * 2 + 2}s linear forwards;
            animation-delay: ${Math.random() * 0.5}s;
        `;
        container.appendChild(confetti);
    }

    const confettiStyles = document.createElement('style');
    confettiStyles.textContent = `
        @keyframes confettiFall {
            to {
                top: 100%;
                transform: rotate(${Math.random() * 720}deg) translateX(${Math.random() * 200 - 100}px);
            }
        }
    `;
    document.head.appendChild(confettiStyles);
    document.body.appendChild(container);

    setTimeout(() => {
        container.remove();
        confettiStyles.remove();
    }, 3000);
}

/**
 * Audio controller for game sounds
 */
class GameAudio {
    constructor() {
        this.enabled = true;
        this.sounds = {};
        this.init();
    }

    init() {
        // Check saved preference
        const savedPref = localStorage.getItem('impoztor-game-sound');
        this.enabled = savedPref !== 'off';
        this.updateUI();

        // Create audio context on user interaction
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        }, { once: true });
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('impoztor-game-sound', this.enabled ? 'on' : 'off');
        this.updateUI();
    }

    updateUI() {
        document.body.setAttribute('data-sound', this.enabled ? 'on' : 'off');
    }

    play(soundName) {
        if (!this.enabled || !this.audioContext) return;

        // Generate simple sounds using Web Audio API
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        switch (soundName) {
            case 'flip':
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.2);
                break;

            case 'click':
                oscillator.frequency.value = 600;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.1);
                break;

            case 'success':
                oscillator.frequency.value = 523.25; // C5
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                oscillator.start();
                oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.2); // G5
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
                oscillator.stop(this.audioContext.currentTime + 0.4);
                break;

            case 'timer':
                oscillator.frequency.value = 440;
                oscillator.type = 'square';
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.1);
                break;
        }
    }
}

// Initialize audio
window.gameAudio = new GameAudio();

// Export animation utilities
window.animations = {
    CardFlipController,
    screenTransitions,
    addButtonPressEffect,
    shake,
    createConfetti
};
