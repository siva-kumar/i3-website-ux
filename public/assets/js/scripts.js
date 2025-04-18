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

                return data;
            })
            .then(data => {
                successMessage.innerHTML = `<div class="alert alert-success">Enquiry successfully submitted! ✅</div>`;
                form.reset();
            })
            .catch(error => {
                successMessage.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
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