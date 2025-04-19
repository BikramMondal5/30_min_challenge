const formDetails = document.getElementById('form-details');
const captchaSection = document.getElementById('captcha-section');
const nextBtn = document.getElementById('next-btn');
const bug = document.getElementById('bug');
const bugMessage = document.getElementById('bug-message');
const captchaInput = document.getElementById('captcha-input');
const submitBtn = document.getElementById('submit-btn');
const form = document.getElementById('signup-form');
const successMessage = document.getElementById('success-message');

// Audio contexts for sound effects
let audioContext = null;
let happySound = null;
let angrySound = null;

// Initialize Web Audio API
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Create happy sound (cheerful beeps)
        function createHappySound() {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime + 0.1); // C5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2); // E5
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.3); // G5

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.4);
        }

        // Create angry sound (low growl)
        function createAngrySound() {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            const distortion = audioContext.createWaveShaper();

            function makeDistortionCurve(amount) {
                const k = amount;
                const samples = 44100;
                const curve = new Float32Array(samples);
                for (let i = 0; i < samples; ++i) {
                    const x = (i * 2) / samples - 1;
                    curve[i] = (3 + k) * x * 20 * Math.PI * Math.PI / (Math.PI + k * Math.abs(x) * 20);
                }
                return curve;
            }

            distortion.curve = makeDistortionCurve(50);
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.connect(distortion);
            distortion.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
        }

        happySound = createHappySound;
        angrySound = createAngrySound;
    } catch (e) {
        console.error('Web Audio API is not supported in this browser:', e);
    }
}

// Initialize audio on user interaction
document.addEventListener('click', function () {
    if (!audioContext) initAudio();
}, { once: true });

let isBugHappy = false;

// Show the bug captcha section when the Next button is clicked
nextBtn.addEventListener('click', function () {
    // Check if all required fields in the first section are filled
    const inputs = formDetails.querySelectorAll('input[required]');
    let allFilled = true;

    inputs.forEach(input => {
        if (!input.value) {
            allFilled = false;
            input.style.borderColor = '#ff4444';
        } else {
            input.style.borderColor = '';
        }
    });

    if (allFilled) {
        formDetails.style.display = 'none';
        captchaSection.style.display = 'block';
        submitBtn.style.display = 'block';
    } else {
        alert('Please fill in all required fields.');
    }
});

captchaInput.addEventListener('input', checkBugHappiness);
submitBtn.addEventListener('mouseover', moveButtonIfSad);
form.addEventListener('submit', handleSubmit);

function checkBugHappiness() {
    const input = captchaInput.value.trim();

    // Check if the input matches "you're a bug"
    if (input.toLowerCase() === "you're a bug" ||
        input.toLowerCase() === "youre a bug") {
        makeBugAngry();
        return;
    }

    // Check for the specific phrase that makes the bug happy
    if (input.toLowerCase() === "you're a bug but i'll treat you as feature" ||
        input.toLowerCase() === "youre a bug but ill treat you as feature") {
        makeBugHappy();
        return;
    }

    // Otherwise, keep the bug sad
    if (input.length >= 3 && !bug.classList.contains('angry-bug')) {
        makeBugSad();
    }
}

function makeBugHappy() {
    bug.classList.remove('sad-bug');
    bug.classList.remove('angry-bug');
    bug.classList.add('happy-bug');
    bugMessage.textContent = "I'm happy now. Thank you!";
    isBugHappy = true;
    submitBtn.classList.remove('elusive');

    // Play happy sound
    if (happySound) {
        happySound();
    }
}

function makeBugSad() {
    bug.classList.remove('happy-bug');
    bug.classList.remove('angry-bug');
    bug.classList.add('sad-bug');
    bugMessage.textContent = "That doesn't make me happy. Try the magic words!";
    isBugHappy = false;
    submitBtn.classList.add('elusive');
}

function makeBugAngry() {
    bug.classList.remove('happy-bug');
    bug.classList.remove('sad-bug');
    bug.classList.add('angry-bug');
    bugMessage.textContent = "HOW DARE YOU! I'm NOT just a bug!";
    isBugHappy = false;
    submitBtn.classList.add('elusive');

    // Play angry sound
    if (angrySound) {
        angrySound();
    }
}

function moveButtonIfSad(event) {
    if (!isBugHappy) {
        const button = event.target;
        const container = button.parentElement;
        const containerRect = container.getBoundingClientRect();

        // Calculate new position within the form container
        let newX = Math.random() * (containerRect.width - button.offsetWidth);
        let newY = Math.random() * (containerRect.height - button.offsetHeight - 150);

        // Keep the button within bounds
        newX = Math.max(0, Math.min(newX, containerRect.width - button.offsetWidth));
        newY = Math.max(0, Math.min(newY, containerRect.height - button.offsetHeight - 150));

        // Apply the new position
        button.style.transform = `translate(${newX - button.offsetLeft}px, ${newY}px)`;

        // Reset position after a short delay (so it doesn't infinitely move)
        setTimeout(() => {
            if (!isBugHappy) {
                button.style.transform = '';
            }
        }, 500);
    }
}

function handleSubmit(event) {
    event.preventDefault();

    if (!isBugHappy) {
        bugMessage.textContent = "Please make me happy before submitting!";
    } else {
        // Show success message
        captchaSection.style.display = 'none';
        successMessage.style.display = 'block';

        // Here you would normally submit the form data to your server
        console.log("Form submitted successfully!");
    }
}
