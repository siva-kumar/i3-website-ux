const loadingOverlay = document.getElementById('loadingOverlayWrapper');
loadingOverlay.classList.remove('d-flex');
loadingOverlay.style.display = 'none';

function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

const faqs = document.querySelectorAll('.faq-item');

faqs.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const toggle = item.querySelector('.faq-toggle');

    question.addEventListener('click', () => {
        faqs.forEach(faq => {
            if (faq !== item) {
                faq.querySelector('.faq-answer').style.display = 'none';
                faq.querySelector('.faq-toggle').textContent = '+';
            }
        });

        if (answer.style.display === 'block') {
            answer.style.display = 'none';
            toggle.textContent = '+';
        } else {
            answer.style.display = 'block';
            toggle.textContent = '−';
        }
    });
});

class ContentSlider {
    constructor(sliderElement) {
        this.container = sliderElement;
        this.interval = parseInt(sliderElement.dataset.interval, 10) || 2500;
        this.tabs = sliderElement.querySelectorAll('.tab-btn');
        this.slides = sliderElement.querySelectorAll('.slide');
        this.dots = sliderElement.querySelectorAll('.dot');
        this.currentIndex = 0;
        this.timer = null;

        const slide = document.getElementById('slide-1');
        if (slide) {
            const height = slide.offsetHeight;

            this.slides.forEach(slide => {
                slide.style.height = height + 'px';
            });
        }

        this.tabs.forEach(tab => tab.addEventListener('click', () => {
            this.stopAutoSlide();
            this.showSlide(parseInt(tab.dataset.index));
            //this.startAutoSlide();
        }));

        this.dots.forEach(dot => dot.addEventListener('click', () => {
            this.stopAutoSlide();
            this.showSlide(parseInt(dot.dataset.index));
            //this.startAutoSlide();
        }));

        this.startAutoSlide();
    }

    showSlide(index) {
        this.slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
        this.tabs.forEach((tab, i) => tab.classList.toggle('active', i === index));
        this.dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
        this.currentIndex = index;
    }

    startAutoSlide() {
        this.timer = setInterval(() => {
            this.currentIndex = (this.currentIndex + 1) % this.slides.length;
            this.showSlide(this.currentIndex);
        }, this.interval);
    }

    stopAutoSlide() {
        clearInterval(this.timer);
    }
}

function validateForm() {
    let isValid = true;
    const alphaRegex = /^[A-Za-z]+$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const inputs = form.querySelectorAll('input, textarea');

    inputs.forEach(input => {
        const value = input.value.trim();
        input.classList.remove('is-invalid');

        if ((input.id === 'firstName' || input.id === 'lastName') && !alphaRegex.test(value)) {
            input.classList.add('is-invalid');
            isValid = false;
        }

        if (input.id === 'email' && (!value || !emailPattern.test(value))) {
            input.classList.add('is-invalid');
            isValid = false;
        }

        if (input.id === 'message' && !value) {
            input.classList.add('is-invalid');
            isValid = false;
        }

        if (!value && (input.id === 'firstName' || input.id === 'lastName' || input.id === 'email' || input.id === 'message')) {
            input.classList.add('is-invalid');
            isValid = false;
        }
    });

    return isValid;
}

const form = document.getElementById('contact-form');

form.addEventListener('submit', function (e) {
    e.preventDefault();

    const isValid = validateForm();
    successMessage.innerHTML = '';

    if (isValid) {
        const loadingOverlay = document.getElementById('loadingOverlayWrapper');
        loadingOverlay.classList.add('d-flex');
        loadingOverlay.style.display = 'block';

        const formData = {
            firstname: document.getElementById('firstName').value,
            lastname: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
        };

        fetch('http://localhost:5000/api/enquiry', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(async response => {
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Something went wrong');
                }

                const loadingOverlay = document.getElementById('loadingOverlayWrapper');
                loadingOverlay.classList.remove('d-flex');
                loadingOverlay.style.display = 'none';

                return data;
            })
            .then(data => {
                successMessage.innerHTML = `<div id="successAlert" class="alert alert-success">Enquiry successfully submitted!</div>`;
                autoDismissAlert("successAlert");
                form.reset();
            })
            .catch(error => {
                successMessage.innerHTML = `<div id="errorAlert" class="alert alert-danger">${error.message}</div>`;
                autoDismissAlert("errorAlert");
            });

        setTimeout(() => {
            successMessage.innerHTML = "";
        }, 5000);
    }
});

form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('keyup', function () {
        validateForm();
    });
});

const voiceButton = document.getElementById('voiceButton');
const voiceBtnIcon = document.getElementById('voiceBtnIcon');

let isPaused = false;
let sentences = [];
let speechIndex = 0;
let selectedVoice = null;
let activeSectionId = null;

// Load voice options
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {
        if (!selectedVoice) {
            const voices = speechSynthesis.getVoices();
            selectedVoice = voices.find(voice => voice.lang === 'en-US') || voices[0];
        }
    };
}

// Toggle TTS on button click
voiceButton.addEventListener('click', () => {
    if (voiceBtnIcon.classList.contains('fa-volume-xmark')) {
        voiceBtnIcon.classList.remove('fa-volume-xmark');
        voiceBtnIcon.classList.add('fa-volume-high');
        startVoice();
    } else {
        voiceBtnIcon.classList.remove('fa-volume-high');
        voiceBtnIcon.classList.add('fa-volume-xmark');
        pauseVoice();
    }
});

function pauseVoice() {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
        speechSynthesis.pause();
        isPaused = true;
    }
}

function startVoice() {
    if (isVideoAudioPlaying()) {
        return;
    }

    if (speechSynthesis.paused) {
        speechSynthesis.resume();
        isPaused = false;
        return;
    }

    let sectionId = getCurrentSection();
    activeSectionId = sectionId;

    const parentElement = document.getElementById(sectionId);
    const elements = parentElement.querySelectorAll(".text-to-speech");

    let fullText = "";
    elements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.display !== 'none' && style.visibility !== 'hidden') {
            fullText += el.textContent.trim() + " ";
        }
    });

    fullText = fullText.trim();
    if (!fullText) {
        console.warn("No text found to speak.");
        return;
    }

    if (sentences.length === 0) {
        elements.forEach(el => {
            const text = el.textContent.trim();
            if (text) {
                sentences.push(text);
            }
        });
    }

    if (!selectedVoice) {
        const voices = speechSynthesis.getVoices();
        selectedVoice = voices.find(voice => voice.lang === 'en-US') || voices[0];
    }

    function speakNext() {
        if (getCurrentSection() !== activeSectionId) {
            speechSynthesis.cancel();
            resetSpeech();
            return;
        }

        if (speechIndex >= sentences.length) {
            resetSpeech();
            return;
        }

        const utterance = new SpeechSynthesisUtterance(sentences[speechIndex]);
        utterance.voice = selectedVoice;
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onend = () => {
            if (!isPaused) {
                speechIndex++;
                speakNext();
            }
        };

        speechSynthesis.speak(utterance);
    }

    speechSynthesis.cancel();
    isPaused = false;
    speakNext();
}

function resetSpeech() {
    speechIndex = 0;
    sentences = [];
    isPaused = false;
    activeSectionId = null;

    voiceBtnIcon.classList.remove('fa-volume-high');
    voiceBtnIcon.classList.add('fa-volume-xmark');
}

// Cancel speech on page unload
window.onbeforeunload = () => {
    speechSynthesis.cancel();
};

// Stop speech when scrolling to a different section
window.addEventListener('scroll', () => {
    if (activeSectionId && getCurrentSection() !== activeSectionId) {
        speechSynthesis.cancel();
        resetSpeech();
    }
});

// To check if video audio is playing
function isVideoAudioPlaying() {
    const videos = document.querySelectorAll('video');
    for (let video of videos) {
        if (!video.paused && !video.muted && video.readyState >= 2 && video.volume > 0) {
            return true;
        }
    }
    return false;
}


// Check if speech is playing
function isSpeechPlaying() {
    return speechSynthesis.speaking && !speechSynthesis.paused;
}

// Determine which section the voice button is over
function getCurrentSection() {
    const button = document.getElementById("voiceButton");
    const buttonRect = button.getBoundingClientRect();
    const centerX = buttonRect.left + buttonRect.width / 2;
    const centerY = buttonRect.top + buttonRect.height / 2;

    button.style.pointerEvents = "none";
    const element = document.elementFromPoint(centerX, centerY);
    const section = element?.closest("section");
    button.style.pointerEvents = "auto";

    return section ? section.id : null;
}

function autoDismissAlert(alertId, timeout = 2000) {
    const alert = document.getElementById(alertId);
    if (alert) {
        setTimeout(() => {
            alert.classList.add("fade-out");
            setTimeout(() => {
                alert.style.display = "none";
            }, 500); // Wait for fade transition
        }, timeout);
    }
}

/********Chat bot *********/
const toggleBtn = document.getElementById("chatbot-toggle");
const chatbotWindow = document.getElementById("chatbot-window");
const minimizeBtn = document.getElementById("minimize-chat");
const sendBtn = document.getElementById("chat-send");
const chatInput = document.getElementById("chat-input");
const chatBody = document.getElementById("chatbot-body");

toggleBtn.addEventListener("click", () => {
    chatbotWindow.style.display = "flex";
    toggleBtn.style.display = "none";
});

minimizeBtn.addEventListener("click", () => {
    chatbotWindow.style.display = "none";
    toggleBtn.style.display = "block";
});

sendBtn.addEventListener("click", () => {
    const userMsg = chatInput.value.trim();
    if (userMsg !== "") {
        appendMessage("You", userMsg, "chat-user");
        respondToMessage(userMsg);
        chatInput.value = "";
    }
});

function appendMessage(sender, message, className) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("chat-message", className);
    msgDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function respondToMessage(userMsg) {
    let botResponse = "I'm still learning it.";
    if (userMsg.toLowerCase().includes("hello") || userMsg.toLowerCase().includes("hi") || userMsg.toLowerCase().includes("hey")) {
        botResponse = "Hello! How can I assist you today?";
    } else if (userMsg.toLowerCase().includes("help")) {
        botResponse = "Sure, I'm here to help. Please describe your issue.";
    } else if (userMsg.toLowerCase().includes("what you do") || userMsg.toLowerCase().includes("what you build")) {
        botResponse = "We Build Systems That Endure and Deliver Value.";
    } else if (userMsg.toLowerCase().includes("what we build") || userMsg.toLowerCase().includes("how we build")) {
        botResponse = "Solutions designed to drive efficiency and empower growth.";
    } else if (userMsg.toLowerCase().includes("who we work") || userMsg.toLowerCase().includes("how you work")) {
        botResponse = "Business leaders, operators, founders and project managers";
    } else if (userMsg.toLowerCase().includes("AI") || userMsg.toLowerCase().includes("Agents")) {
        botResponse = "AI agents automate tasks and boost productivity by up to 50%. ";
    }
    setTimeout(() => {
        appendMessage("Bot", botResponse, "chat-bot");
    }, 600);
}