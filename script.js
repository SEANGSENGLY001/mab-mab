// Global variables
let currentQuizQuestion = 0;
let quizScore = 0;
let countdownInterval;
let siteData = null;
const CACHE_VERSION_KEY = 'birthdayWebsiteCacheVersion';
const CACHE_DATA_KEY = 'birthdayWebsiteData';
const CACHE_TIMESTAMP_KEY = 'birthdayWebsiteLastUpdate';
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes in milliseconds

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', async function() {
    await loadWebsiteData();
    initializeWebsite();
    startDataRefreshInterval();
});

// Load website data with cache management
async function loadWebsiteData() {
    try {
        // Check if we should use cached data
        const cachedData = await getCachedData();
        if (cachedData) {
            siteData = cachedData;
            console.log('Using cached data');
            return;
        }

        // Fetch fresh data from Firebase
        await fetchAndUpdateData();
    } catch (error) {
        console.error('Error loading website data:', error);
        // Fallback to local data if available
        if (websiteData) {
            siteData = websiteData;
            console.log('Using local fallback data');
        }
    }
}

// Check and retrieve cached data if valid
async function getCachedData() {
    const lastUpdate = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    const cachedVersion = localStorage.getItem(CACHE_VERSION_KEY);
    const cachedData = localStorage.getItem(CACHE_DATA_KEY);
    
    if (!lastUpdate || !cachedData) return null;
    
    // Check if cache is still fresh
    const now = Date.now();
    const isCacheFresh = (now - parseInt(lastUpdate)) < CACHE_MAX_AGE;
    
    if (isCacheFresh) {
        try {
            // Get current version from Firebase
            const currentVersion = await FirebaseDB.getDataVersion();
            if (currentVersion === cachedVersion) {
                return JSON.parse(cachedData);
            }
        } catch (error) {
            console.error('Error checking data version:', error);
        }
    }
    
    return null;
}

// Fetch fresh data from Firebase and update cache
async function fetchAndUpdateData() {
    if (typeof FirebaseDB === 'undefined') {
        throw new Error('Firebase DB not available');
    }
    
    // Fetch fresh data
    const freshData = await FirebaseDB.getAllData();
    const currentVersion = await FirebaseDB.getDataVersion();
    
    if (!freshData) {
        throw new Error('No data received from Firebase');
    }
    
    // Update cache
    localStorage.setItem(CACHE_DATA_KEY, JSON.stringify(freshData));
    localStorage.setItem(CACHE_VERSION_KEY, currentVersion);
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    
    siteData = freshData;
    console.log('Data updated from Firebase');
    
    // Update UI if website is already initialized
    if (document.getElementById('page-title')) {
        updateContentFromData();
    }
}

// Start periodic data refresh
function startDataRefreshInterval() {
    // Check for updates every 5 minutes
    setInterval(async () => {
        try {
            await fetchAndUpdateData();
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    }, CACHE_MAX_AGE);
}

// Initialize all website features
function initializeWebsite() {
    updateContentFromData();
    setupNavigation();
    createStarryNight();
    createFloatingHearts();
    createConfetti();
    setupTimeline();
    setupSurprises();
    setupQuiz();
    startCountdown();
    setupScrollAnimations();
}

// Update all content from data
function updateContentFromData() {
    // Update page title
    document.getElementById('page-title').textContent = siteData.personal.websiteTitle;

    // Update hero section
    document.getElementById('hero-greeting').textContent = siteData.hero.greeting;
    document.getElementById('hero-name').textContent = siteData.personal.girlfriendName + '!';
    document.getElementById('hero-subtitle').textContent = siteData.hero.subtitle;
    document.getElementById('hero-btn-primary').textContent = siteData.hero.primaryButtonText;
    document.getElementById('hero-btn-secondary').textContent = siteData.hero.secondaryButtonText;

    // Update message section
    document.getElementById('message-title').textContent = siteData.message.title;
    document.getElementById('message-content').innerHTML = siteData.message.content.replace(/\n/g, '<br>');

    // Update gallery
    updateGalleryFromData();

    // Update countdown section
    document.getElementById('countdown-title').textContent = siteData.countdown.title;
    document.getElementById('countdown-subtitle').textContent = siteData.countdown.subtitle;

    // Update quiz section
    document.getElementById('quiz-title-display').textContent = siteData.quiz.title;
    document.getElementById('quiz-subtitle-display').textContent = siteData.quiz.subtitle;
}

// Navigation functionality
function setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Create floating hearts animation
function createFloatingHearts() {
    const heartsContainer = document.querySelector('.floating-hearts');
    if (!heartsContainer) return;
    
    const hearts = ['💕', '💖', '💗', '💝', '💘', '💞'];
    
    setInterval(() => {
        const heart = document.createElement('div');
        heart.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.position = 'absolute';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.fontSize = (Math.random() * 20 + 15) + 'px';
        heart.style.opacity = '0.7';
        heart.style.pointerEvents = 'none';
        heart.style.animation = `floatUp 4s ease-out forwards`;
        
        heartsContainer.appendChild(heart);
        
        setTimeout(() => {
            heart.remove();
        }, 4000);
    }, 2000);
}

// Create starry night background with stars, moon, and floating hearts
function createStarryNight() {
    const heroBackground = document.querySelector('.hero-background');
    if (!heroBackground) {
        console.error('Hero background not found!');
        return;
    }

    console.log('Hero background found:', heroBackground); // Debug log

    // Create stars layer
    const starsLayer = document.createElement('div');
    starsLayer.className = 'stars';
    
    // Generate romantic stars with different sizes
    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Create different sized stars for variety
        const size = Math.random();
        if (size < 0.6) {
            star.classList.add('small');
        } else if (size < 0.9) {
            star.classList.add('medium');
        } else {
            star.classList.add('large');
        }
        
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 6 + 's';
        star.style.animationDuration = (Math.random() * 3 + 3) + 's';
        starsLayer.appendChild(star);
    }

    // Create romantic moon with sparkles
    const moon = document.createElement('div');
    moon.className = 'moon';
    
    // Add some debug styling to make sure it's visible
    moon.style.display = 'block';
    moon.style.visibility = 'visible';
    
    // Temporary test styling to make sure moon is visible
    moon.style.position = 'absolute';
    moon.style.top = '10%';
    moon.style.right = '15%';
    moon.style.width = '100px';
    moon.style.height = '100px';
    moon.style.backgroundColor = 'white';
    moon.style.borderRadius = '50%';
    moon.style.zIndex = '100';
    moon.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.8)';
    
    // Add sparkles around the moon
    for (let i = 0; i < 4; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'moon-sparkle';
        moon.appendChild(sparkle);
    }
    
    console.log('Moon created:', moon); // Debug log

    // Create night hearts layer
    const nightHeartsLayer = document.createElement('div');
    nightHeartsLayer.className = 'night-hearts';
    
    // Create floating romantic night hearts
    setInterval(() => {
        if (nightHeartsLayer.children.length < 6) {
            const heart = document.createElement('div');
            heart.className = 'night-heart';
            const heartEmojis = ['💕', '💖', '💗', '✨', '🌟', '💫'];
            heart.innerHTML = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
            heart.style.left = Math.random() * 100 + '%';
            heart.style.animationDuration = (Math.random() * 4 + 6) + 's';
            heart.style.animationDelay = Math.random() * 3 + 's';
            heart.style.fontSize = (Math.random() * 10 + 15) + 'px';
            nightHeartsLayer.appendChild(heart);
            
            setTimeout(() => {
                if (heart.parentNode) {
                    heart.remove();
                }
            }, 10000);
        }
    }, 2000);

    // Create romantic shooting stars
    setInterval(() => {
        if (Math.random() < 0.4) { // 40% chance every interval
            const shootingStar = document.createElement('div');
            shootingStar.className = 'shooting-star';
            // Start from random position in the top-left area for diagonal movement
            shootingStar.style.top = Math.random() * 30 + '%'; // Top 30% of screen
            shootingStar.style.left = '-200px'; // Start off-screen to the left
            shootingStar.style.animationDuration = (Math.random() * 3 + 5) + 's'; // 5-8 seconds
            starsLayer.appendChild(shootingStar);
            
            setTimeout(() => {
                if (shootingStar.parentNode) {
                    shootingStar.remove();
                }
            }, 12000);
        }
    }, 4000);

    // Create constellation effect - connect nearby stars
    setTimeout(() => {
        createConstellations(starsLayer);
    }, 1000);

    // Append all layers to hero background
    heroBackground.appendChild(starsLayer);
    heroBackground.appendChild(moon);
    heroBackground.appendChild(nightHeartsLayer);
    
    console.log('All elements appended to hero background');
    console.log('Hero background children:', heroBackground.children.length);
}

// Create romantic constellation connections
function createConstellations(starsLayer) {
    const stars = starsLayer.querySelectorAll('.star');
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = '0.3';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const ctx = canvas.getContext('2d');
    starsLayer.appendChild(canvas);
    
    function drawConstellations() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(255, 182, 193, 0.4)';
        ctx.lineWidth = 1;
        
        const starPositions = Array.from(stars).map(star => {
            const rect = star.getBoundingClientRect();
            return {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2 - window.scrollY
            };
        });
        
        // Draw connections between nearby stars
        for (let i = 0; i < starPositions.length; i++) {
            for (let j = i + 1; j < starPositions.length; j++) {
                const distance = Math.sqrt(
                    Math.pow(starPositions[i].x - starPositions[j].x, 2) +
                    Math.pow(starPositions[i].y - starPositions[j].y, 2)
                );
                
                if (distance < 150 && Math.random() < 0.1) {
                    ctx.beginPath();
                    ctx.moveTo(starPositions[i].x, starPositions[i].y);
                    ctx.lineTo(starPositions[j].x, starPositions[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    // Update constellations periodically
    setInterval(drawConstellations, 5000);
    drawConstellations();
}

// Create confetti animation
function createConfetti() {
    const confettiContainer = document.querySelector('.confetti-container');
    if (!confettiContainer) return;
    
    const colors = ['#ff69b4', '#ff1493', '#ffd700', '#ff6347', '#98fb98'];
    
    function createConfettiPiece() {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.borderRadius = '50%';
        confetti.style.animation = `confettiFall ${Math.random() * 3 + 2}s linear forwards`;
        
        confettiContainer.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
    
    // Create confetti burst on page load
    for (let i = 0; i < 50; i++) {
        setTimeout(createConfettiPiece, i * 100);
    }
}

// Update gallery from data
function updateGalleryFromData() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;

    galleryGrid.innerHTML = '';

    siteData.gallery.forEach((item, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.setAttribute('data-caption', item.caption);

        // Create a fallback image if the original fails
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = `Memory ${index + 1}`;
        img.onerror = function() {
            // Create a colored placeholder div if image fails
            this.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.style.cssText = `
                width: 100%;
                height: 250px;
                background: linear-gradient(135deg, #ff69b4, #ff1493);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1.2rem;
                font-weight: 600;
                text-align: center;
            `;
            placeholder.innerHTML = `📸<br>Memory ${index + 1}`;
            this.parentNode.insertBefore(placeholder, this);
        };

        galleryItem.innerHTML = `
            <div class="gallery-overlay">
                <p>${item.caption}</p>
            </div>
        `;
        galleryItem.insertBefore(img, galleryItem.firstChild);
        galleryItem.addEventListener('click', () => {
            // Save gallery interaction to Firebase
            if (typeof FirebaseDB !== 'undefined') {
                FirebaseDB.saveGalleryInteraction(index, item.caption);
            }
        });

        galleryGrid.appendChild(galleryItem);
    });
}

// Setup timeline with data
function setupTimeline() {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;

    timeline.innerHTML = '';

    siteData.timeline.forEach((item, index) => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        timelineItem.innerHTML = `
            <div class="timeline-content">
                <div class="timeline-date">${item.date}</div>
                <h3 class="timeline-title">${item.title}</h3>
                <p class="timeline-description">${item.description}</p>
            </div>
        `;
        timeline.appendChild(timelineItem);
    });
}

// Setup surprise cards
function setupSurprises() {
    const surprisesGrid = document.querySelector('.surprises-grid');
    if (!surprisesGrid) return;

    surprisesGrid.innerHTML = '';

    siteData.surprises.forEach((surprise, index) => {
        const card = document.createElement('div');
        card.className = 'surprise-card';
        card.innerHTML = `
            <span class="surprise-icon">${surprise.icon}</span>
            <h3 class="surprise-title">${surprise.title}</h3>
            <p class="surprise-hint">${surprise.hint}</p>
            <div class="surprise-content">
                <p>${surprise.content}</p>
            </div>
        `;

        card.addEventListener('click', () => {
            card.classList.add('revealed');
            
            // Save surprise reveal to Firebase
            if (typeof FirebaseDB !== 'undefined') {
                FirebaseDB.saveSurpriseReveal(index, surprise.title);
            }
            
            // Add celebration effect
            createCelebrationEffect(card);
        });

        surprisesGrid.appendChild(card);
    });
}

// Setup quiz
function setupQuiz() {
    const quizContainer = document.querySelector('.quiz-container');
    if (!quizContainer) return;

    const questions = siteData.quiz.questions;

    let quizHTML = '<div class="quiz-progress"><div class="quiz-progress-bar"></div></div>';

    questions.forEach((q, index) => {
        quizHTML += `
            <div class="quiz-question ${index === 0 ? 'active' : ''}" data-question="${index}" style="display: ${index === 0 ? 'block' : 'none'};">
                <h3 class="question-text">${q.question}</h3>
                <div class="quiz-options">
                    ${q.options.map((option, optIndex) =>
                        `<div class="quiz-option" data-option="${optIndex}">${option}</div>`
                    ).join('')}
                </div>
                <button class="btn btn-primary quiz-next" style="display: none;">Next Question</button>
            </div>
        `;
    });

    quizHTML += `
        <div class="quiz-result">
            <div class="quiz-score"></div>
            <h3>${siteData.quiz.completionMessage.title}</h3>
            <p>${siteData.quiz.completionMessage.message}</p>
            <button class="btn btn-primary" onclick="restartQuiz()">Take Quiz Again</button>
        </div>
    `;

    quizContainer.innerHTML = quizHTML;

    // Add event listeners for quiz
    setupQuizEventListeners(questions);
    
    // Initialize progress bar
    updateQuizProgress();
}

// Setup quiz event listeners
function setupQuizEventListeners(questions) {
    const options = document.querySelectorAll('.quiz-option');
    const nextButtons = document.querySelectorAll('.quiz-next');
    
    options.forEach(option => {
        option.addEventListener('click', function() {
            const questionDiv = this.closest('.quiz-question');
            const questionIndex = parseInt(questionDiv.dataset.question);
            const selectedOption = parseInt(this.dataset.option);
            
            // Remove previous selections
            questionDiv.querySelectorAll('.quiz-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Mark this option as selected
            this.classList.add('selected');
            
            // Check if answer is correct
            if (selectedOption === questions[questionIndex].correct) {
                quizScore++;
            }
            
            // Show next button
            questionDiv.querySelector('.quiz-next').style.display = 'block';
        });
    });
    
    nextButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            const currentQuestion = document.querySelector('.quiz-question.active');
            currentQuestion.classList.remove('active');
            currentQuestion.style.display = 'none'; // Hide current question
            
            currentQuizQuestion++;
            
            // Check if there are more questions
            if (currentQuizQuestion < questions.length) {
                // Show next question
                const nextQuestion = document.querySelectorAll('.quiz-question')[currentQuizQuestion];
                if (nextQuestion) {
                    nextQuestion.style.display = 'block'; // Show next question
                    nextQuestion.classList.add('active');
                    updateQuizProgress();
                }
            } else {
                // All questions completed, show result
                showQuizResult();
            }
        });
    });
}

// Update quiz progress
function updateQuizProgress() {
    const progressBar = document.querySelector('.quiz-progress-bar');
    const totalQuestions = siteData.quiz.questions.length;
    const progress = ((currentQuizQuestion + 1) / totalQuestions) * 100;
    progressBar.style.width = progress + '%';
}

// Show quiz result
function showQuizResult() {
    const quizResult = document.querySelector('.quiz-result');
    const scoreElement = document.querySelector('.quiz-score');
    const totalQuestions = siteData.quiz.questions.length;
    
    scoreElement.textContent = `${quizScore}/${totalQuestions}`;
    quizResult.classList.add('show');
    
    // Save quiz result to Firebase
    if (typeof FirebaseDB !== 'undefined') {
        FirebaseDB.saveQuizResult(quizScore, totalQuestions);
    }
    
    // Hide all questions
    document.querySelectorAll('.quiz-question').forEach(q => {
        q.style.display = 'none';
    });
    
    document.querySelector('.quiz-progress').style.display = 'none';
    
    // Scroll to quiz result
    setTimeout(() => {
        quizResult.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }, 100);
}

// Restart quiz
async function restartQuiz() {
    currentQuizQuestion = 0;
    quizScore = 0;
    
    // Hide quiz result
    const quizResult = document.querySelector('.quiz-result');
    quizResult.classList.remove('show');
    
    // Show progress bar
    const progressBar = document.querySelector('.quiz-progress');
    progressBar.style.display = 'block';
    
    // Update quiz with latest data from database
    if (typeof FirebaseDB !== 'undefined') {
        try {
            const latestData = await FirebaseDB.getQuizData();
            if (latestData && latestData.questions) {
                siteData.quiz.questions = latestData.questions;
                setupQuiz(); // Reinitialize quiz with new data
                return; // Exit since setupQuiz handles everything else
            }
        } catch (error) {
            console.error('Error loading quiz data:', error);
        }
    }
    
    // Fallback if no database or error occurs
    // Reset all questions - only show the first one
    document.querySelectorAll('.quiz-question').forEach((q, index) => {
        q.classList.remove('active');
        
        if (index === 0) {
            // Show and activate only the first question
            q.style.display = 'block';
            q.classList.add('active');
        } else {
            // Hide all other questions
            q.style.display = 'none';
        }
        
        // Clear all selections
        q.querySelectorAll('.quiz-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Hide next button
        const nextBtn = q.querySelector('.quiz-next');
        if (nextBtn) {
            nextBtn.style.display = 'none';
        }
    });
    
    // Reset progress bar
    updateQuizProgress();
    
    // Scroll back to first question
    setTimeout(() => {
        const firstQuestion = document.querySelector('.quiz-question.active');
        if (firstQuestion) {
            firstQuestion.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, 100);
}

// Countdown timer
function startCountdown() {
    // Set target date from data
    const targetDate = new Date(siteData.personal.specialEventDate);
    
    countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate.getTime() - now;
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        
        if (distance < 0) {
            clearInterval(countdownInterval);
            document.querySelector('.countdown-timer').innerHTML = '<h2>🎉 The special day is here! 🎉</h2>';
        }
    }, 1000);
}

// Hero section functions
function startSurprise() {
    // Create a burst of confetti
    const confettiContainer = document.querySelector('.confetti-container');
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            createConfettiPiece();
        }, i * 50);
    }
    
    // Scroll to message section
    document.getElementById('message').scrollIntoView({
        behavior: 'smooth'
    });
}

function scrollToMessage() {
    document.getElementById('message').scrollIntoView({
        behavior: 'smooth'
    });
}

// Create celebration effect for surprise cards
function createCelebrationEffect(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.width = '6px';
        particle.style.height = '6px';
        particle.style.backgroundColor = '#ff69b4';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        
        const angle = (i / 20) * Math.PI * 2;
        const velocity = 100 + Math.random() * 50;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        particle.style.animation = `explode 1s ease-out forwards`;
        particle.style.setProperty('--vx', vx + 'px');
        particle.style.setProperty('--vy', vy + 'px');
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}

// Scroll animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    document.querySelectorAll('.gallery-item, .timeline-item, .surprise-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Setup hero section scroll parallax
    setupHeroScrollParallax();
}

// Hero section scroll parallax effect with smooth interpolation
function setupHeroScrollParallax() {
    const hero = document.querySelector('.hero');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    if (!hero) return;
    
    // Add click event to scroll indicator
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const nextSection = document.querySelector('#message');
            if (nextSection) {
                nextSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
    
    let currentProgress = 0;
    let targetProgress = 0;
    let animationFrameId = null;
    
    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const heroHeight = hero.offsetHeight;
        targetProgress = Math.min(scrolled / heroHeight, 1);
        
        // Smoothly interpolate the scroll progress
        if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(animate);
        }
    }
    
    function animate() {
        // Smooth interpolation between current and target progress
        currentProgress = lerp(currentProgress, targetProgress, 0.1);
        
        // Update CSS custom property for smooth transitions
        hero.style.setProperty('--scroll-progress', currentProgress);
        
        // Add/remove scrolled class based on progress
        if (currentProgress > 0) {
            hero.classList.add('scrolled');
        } else {
            hero.classList.remove('scrolled');
        }
        
        // Update scroll indicator visibility
        if (scrollIndicator) {
            if (currentProgress > 0.1) {
                scrollIndicator.classList.add('fade-out');
            } else {
                scrollIndicator.classList.remove('fade-out');
            }
        }
        
        // Continue animation if not close enough to target
        if (Math.abs(currentProgress - targetProgress) > 0.001) {
            animationFrameId = requestAnimationFrame(animate);
        } else {
            animationFrameId = null;
        }
    }
    
    // Throttled scroll event listener for better performance
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateParallax();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
    
    // Update on resize with debouncing
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateParallax, 100);
    });
    
    // Initial update
    updateParallax();
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0.7;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
        }
    }
    
    @keyframes confettiFall {
        0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
    
    @keyframes explode {
        0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(var(--vx), var(--vy)) scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
