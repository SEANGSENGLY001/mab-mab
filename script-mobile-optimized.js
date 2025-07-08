// Mobile-Optimized JavaScript for Birthday Website
// Focused on performance, reduced complexity, and mobile-first approach

// Global variables - minimized for better memory usage
let currentQuizQuestion = 0;
let quizScore = 0;
let countdownInterval;
let siteData = null;

// Performance optimized constants
const CACHE_VERSION_KEY = 'birthdayWebsiteCacheVersion';
const CACHE_DATA_KEY = 'birthdayWebsiteData';
const CACHE_TIMESTAMP_KEY = 'birthdayWebsiteLastUpdate';
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

// Throttle function for performance optimization
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounce function for performance optimization
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// DOM Content Loaded - Optimized
document.addEventListener('DOMContentLoaded', async function() {
    // Show loading indicator for better UX
    showLoadingState();
    
    try {
        // Initialize core features first (non-blocking)
        initializeCoreFeatures();
        
        // Load data asynchronously
        await loadWebsiteData();
        
        // Initialize remaining features
        await initializeWebsite();
        
        // Hide loading indicator
        hideLoadingState();
        
        // Start background tasks
        startBackgroundTasks();
        
        // Auto scroll to music section on page reload
        setTimeout(() => {
            const musicSection = document.getElementById('music');
            if (musicSection) {
                musicSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 500); // Small delay to ensure page is fully loaded
    } catch (error) {
        console.error('Error initializing website:', error);
        hideLoadingState();
        showErrorFallback();
    }
});

// Show loading state
function showLoadingState() {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0.5';
        heroContent.innerHTML += '<div id="loading-indicator" style="margin-top: 2rem; color: var(--primary-color); font-size: 1rem;">Loading... ✨</div>';
    }
}

// Hide loading state
function hideLoadingState() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '1';
    }
}

// Show error fallback
function showErrorFallback() {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.innerHTML = `
            <h1>Happy Birthday! 💕</h1>
            <p>Something went wrong, but the celebration continues!</p>
            <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
        `;
    }
}

// Initialize core features (navigation, basic interactions)
function initializeCoreFeatures() {
    setupNavigation();
    setupBasicScrolling();
}

// Initialize background tasks
function startBackgroundTasks() {
    // Only start heavy features after everything is loaded
    requestIdleCallback(() => {
        if (siteData) {
            createSimpleAnimations();
            startDataRefreshInterval();
        }
    });
}

// Optimized data loading with better error handling
async function loadWebsiteData() {
    try {
        // Check cache first
        const cachedData = getCachedData();
        if (cachedData) {
            siteData = cachedData;
            console.log('Using cached data');
            return;
        }

        // Try Firebase if available
        if (typeof FirebaseDB !== 'undefined') {
            try {
                const firebaseData = await Promise.race([
                    FirebaseDB.loadWebsiteData(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase timeout')), 5000))
                ]);
                
                if (firebaseData) {
                    siteData = firebaseData;
                    updateCache(firebaseData);
                    console.log('Loaded data from Firebase');
                    return;
                }
            } catch (firebaseError) {
                console.warn('Firebase load failed:', firebaseError);
            }
        }

        // Fallback to local data
        if (typeof websiteData !== 'undefined' && websiteData) {
            siteData = websiteData;
            console.log('Using local fallback data');
        } else {
            // Create minimal fallback
            siteData = createMinimalFallbackData();
            console.log('Using minimal fallback data');
        }
    } catch (error) {
        console.error('Error loading website data:', error);
        siteData = createMinimalFallbackData();
    }
}

// Get cached data with validation
function getCachedData() {
    try {
        const lastUpdate = localStorage.getItem(CACHE_TIMESTAMP_KEY);
        const cachedData = localStorage.getItem(CACHE_DATA_KEY);
        
        if (!lastUpdate || !cachedData) return null;
        
        const now = Date.now();
        const isCacheFresh = (now - parseInt(lastUpdate)) < CACHE_MAX_AGE;
        
        if (isCacheFresh) {
            return JSON.parse(cachedData);
        }
    } catch (error) {
        console.error('Error reading cache:', error);
    }
    return null;
}

// Update cache with error handling
function updateCache(data) {
    try {
        localStorage.setItem(CACHE_DATA_KEY, JSON.stringify(data));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
        console.error('Error updating cache:', error);
    }
}

// Create minimal fallback data
function createMinimalFallbackData() {
    return {
        personal: {
            websiteTitle: 'Happy Birthday! 💕',
            girlfriendName: 'Beautiful',
            specialEventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
        },
        hero: {
            greeting: 'Happy Birthday',
            subtitle: 'Today is all about celebrating you!',
            primaryButtonText: 'Start',
            secondaryButtonText: 'Message'
        },
        message: {
            title: 'A Special Message',
            content: 'You are amazing and loved! 💕'
        },
        gallery: [],
        timeline: [],
        countdown: {
            title: 'Countdown',
            subtitle: 'Something special is coming...'
        },
        surprises: [],
        quiz: {
            title: 'Fun Quiz',
            subtitle: 'Test your knowledge',
            questions: [],
            completionMessage: {
                title: 'Well done!',
                message: 'Thanks for playing! 💕'
            }
        }
    };
}

// Start periodic data refresh (less frequent for mobile)
function startDataRefreshInterval() {
    // Check for updates less frequently on mobile to save battery
    const isMobile = window.innerWidth <= 768;
    const refreshInterval = isMobile ? CACHE_MAX_AGE * 2 : CACHE_MAX_AGE;
    
    setInterval(async () => {
        try {
            if (document.visibilityState === 'visible') {
                await fetchAndUpdateData();
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    }, refreshInterval);
}

// Optimized website initialization
async function initializeWebsite() {
    if (!siteData) {
        console.error('No site data available');
        return;
    }

    // Update content first (most important)
    updateContentFromData();
    
    // Initialize features progressively
    await initializeFeatures();
}

// Progressive feature initialization
async function initializeFeatures() {
    const features = [
        () => setupTimeline(),
        () => setupSurprises(),
        () => setupQuiz(),
        () => startCountdown(),
        () => setupScrollAnimations()
    ];

    // Initialize features with small delays to prevent blocking
    for (let i = 0; i < features.length; i++) {
        try {
            features[i]();
            // Small delay between features to prevent blocking
            if (i < features.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        } catch (error) {
            console.error(`Error initializing feature ${i}:`, error);
        }
    }
}

// Update content from data - optimized
function updateContentFromData() {
    try {
        // Batch DOM updates to prevent layout thrashing
        const updates = [
            () => updateElement('title', siteData.personal.websiteTitle),
            () => updateElement('#hero-greeting', siteData.hero.greeting),
            () => updateElement('#hero-name', siteData.personal.girlfriendName + '!'),
            () => updateElement('#hero-subtitle', siteData.hero.subtitle),
            () => updateElement('#hero-btn-primary', siteData.hero.primaryButtonText),
            () => updateElement('#hero-btn-secondary', siteData.hero.secondaryButtonText),
            () => updateElement('#message-title', siteData.message.title),
            () => updateElement('#message-content', siteData.message.content.replace(/\n/g, '<br>'), true),
            () => updateElement('#countdown-title', siteData.countdown.title),
            () => updateElement('#countdown-subtitle', siteData.countdown.subtitle),
            () => updateElement('#quiz-title-display', siteData.quiz.title),
            () => updateElement('#quiz-subtitle-display', siteData.quiz.subtitle)
        ];

        // Execute updates in a batch
        updates.forEach(update => {
            try {
                update();
            } catch (error) {
                console.warn('Error in content update:', error);
            }
        });

        // Update gallery if data exists
        if (siteData.gallery && siteData.gallery.length > 0) {
            updateGalleryFromData();
        }

        console.log('Content updated successfully');
    } catch (error) {
        console.error('Error updating content:', error);
    }
}

// Helper function to update DOM elements safely
function updateElement(selector, content, isHTML = false) {
    const element = selector.startsWith('#') || selector.startsWith('.') 
        ? document.querySelector(selector) 
        : document.getElementById(selector);
    
    if (element) {
        if (isHTML) {
            element.innerHTML = content;
        } else {
            element.textContent = content;
        }
    }
}

// Optimized navigation setup
function setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!hamburger || !navMenu) return;

    // Hamburger menu toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking links
    navMenu.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Basic scroll setup (lightweight)
function setupBasicScrolling() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
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
}

// Simple animations (mobile-optimized)
function createSimpleAnimations() {
    // Only create animations if user hasn't disabled them
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    // Simple floating hearts (fewer elements for mobile)
    createFloatingHearts();
}

// Optimized floating hearts
function createFloatingHearts() {
    const heartsContainer = document.querySelector('.floating-hearts');
    if (!heartsContainer) return;
    
    const hearts = ['💕', '💖', '💗'];
    const isMobile = window.innerWidth <= 768;
    const interval = isMobile ? 4000 : 2000; // Less frequent on mobile
    const maxHearts = isMobile ? 3 : 6; // Fewer hearts on mobile
    
    let heartCount = 0;
    
    const createHeart = () => {
        if (heartCount >= maxHearts) return;
        
        const heart = document.createElement('div');
        heart.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.cssText = `
            position: absolute;
            left: ${Math.random() * 100}%;
            font-size: ${Math.random() * 10 + 15}px;
            opacity: 0.7;
            pointer-events: none;
            animation: floatUp 4s ease-out forwards;
            z-index: 1;
        `;
        
        heartsContainer.appendChild(heart);
        heartCount++;
        
        setTimeout(() => {
            if (heart.parentNode) {
                heart.remove();
                heartCount--;
            }
        }, 4000);
    };
    
    setInterval(createHeart, interval);
}

// Update gallery with lazy loading
function updateGalleryFromData() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid || !siteData.gallery.length) return;

    galleryGrid.innerHTML = '';

    siteData.gallery.forEach((item, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.setAttribute('data-index', index);

        // Create placeholder with lazy loading
        const img = document.createElement('img');
        img.alt = `Memory ${index + 1}`;
        img.loading = 'lazy'; // Native lazy loading
        
        // Set up intersection observer for images
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.src = item.image;
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(img);
        
        // Error handling
        img.onerror = function() {
            this.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.style.cssText = `
                width: 100%;
                height: 250px;
                background: var(--gradient-primary);
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
        
        // Simple click handler (no complex lightbox for mobile optimization)
        galleryItem.addEventListener('click', () => {
            // For mobile, just open image in new tab
            window.open(item.image, '_blank');
            
            // Save interaction if Firebase is available
            if (typeof FirebaseDB !== 'undefined') {
                FirebaseDB.saveGalleryInteraction(index, item.caption).catch(console.error);
            }
        });

        galleryGrid.appendChild(galleryItem);
    });
}

// Setup timeline (simplified)
function setupTimeline() {
    const timeline = document.querySelector('.timeline');
    if (!timeline || !siteData.timeline.length) return;

    timeline.innerHTML = '';

    siteData.timeline.forEach((item) => {
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

// Setup surprise cards (simplified)
function setupSurprises() {
    const surprisesGrid = document.querySelector('.surprises-grid');
    if (!surprisesGrid || !siteData.surprises.length) return;

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
            
            // Save reveal if Firebase is available
            if (typeof FirebaseDB !== 'undefined') {
                FirebaseDB.saveSurpriseReveal(index, surprise.title).catch(console.error);
            }
        });

        surprisesGrid.appendChild(card);
    });
}

// Setup quiz (simplified)
function setupQuiz() {
    const quizContainer = document.querySelector('.quiz-container');
    if (!quizContainer || !siteData.quiz.questions.length) return;

    const questions = siteData.quiz.questions;

    let quizHTML = '<div class="quiz-progress"><div class="quiz-progress-bar"></div></div>';

    questions.forEach((q, index) => {
        quizHTML += `
            <div class="quiz-question ${index === 0 ? 'active' : ''}" data-question="${index}">
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
    setupQuizEventListeners(questions);
    updateQuizProgress();
}

// Setup quiz event listeners (optimized)
function setupQuizEventListeners(questions) {
    const quizContainer = document.querySelector('.quiz-container');
    
    // Use event delegation for better performance
    quizContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('quiz-option')) {
            handleQuizOptionClick(e.target, questions);
        } else if (e.target.classList.contains('quiz-next')) {
            handleQuizNextClick();
        }
    });
}

// Handle quiz option click
function handleQuizOptionClick(option, questions) {
    const questionDiv = option.closest('.quiz-question');
    const questionIndex = parseInt(questionDiv.dataset.question);
    const selectedOption = parseInt(option.dataset.option);
    
    // Remove previous selections
    questionDiv.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Mark this option as selected
    option.classList.add('selected');
    
    // Check if answer is correct
    if (selectedOption === questions[questionIndex].correct) {
        quizScore++;
    }
    
    // Show next button
    const nextButton = questionDiv.querySelector('.quiz-next');
    if (nextButton) {
        nextButton.style.display = 'block';
    }
}

// Handle quiz next click
function handleQuizNextClick() {
    const currentQuestion = document.querySelector('.quiz-question.active');
    if (!currentQuestion) return;
    
    currentQuestion.classList.remove('active');
    currentQuestion.style.display = 'none';
    
    currentQuizQuestion++;
    
    const questions = document.querySelectorAll('.quiz-question');
    
    if (currentQuizQuestion < questions.length) {
        const nextQuestion = questions[currentQuizQuestion];
        if (nextQuestion) {
            nextQuestion.style.display = 'block';
            nextQuestion.classList.add('active');
            updateQuizProgress();
        }
    } else {
        showQuizResult();
    }
}

// Update quiz progress
function updateQuizProgress() {
    const progressBar = document.querySelector('.quiz-progress-bar');
    if (!progressBar || !siteData.quiz.questions.length) return;
    
    const totalQuestions = siteData.quiz.questions.length;
    const progress = ((currentQuizQuestion + 1) / totalQuestions) * 100;
    progressBar.style.width = progress + '%';
}

// Show quiz result
function showQuizResult() {
    const quizResult = document.querySelector('.quiz-result');
    const scoreElement = document.querySelector('.quiz-score');
    
    if (!quizResult || !scoreElement) return;
    
    const totalQuestions = siteData.quiz.questions.length;
    
    scoreElement.textContent = `${quizScore}/${totalQuestions}`;
    quizResult.classList.add('show');
    
    // Save result if Firebase is available
    if (typeof FirebaseDB !== 'undefined') {
        FirebaseDB.saveQuizResult(quizScore, totalQuestions).catch(console.error);
    }
    
    // Hide all questions and progress
    document.querySelectorAll('.quiz-question').forEach(q => {
        q.style.display = 'none';
    });
    
    const progressBar = document.querySelector('.quiz-progress');
    if (progressBar) {
        progressBar.style.display = 'none';
    }
    
    // Scroll to result
    setTimeout(() => {
        quizResult.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }, 100);
}

// Restart quiz
function restartQuiz() {
    currentQuizQuestion = 0;
    quizScore = 0;
    
    const quizResult = document.querySelector('.quiz-result');
    const progressBar = document.querySelector('.quiz-progress');
    
    if (quizResult) {
        quizResult.classList.remove('show');
    }
    
    if (progressBar) {
        progressBar.style.display = 'block';
    }
    
    // Reset all questions
    document.querySelectorAll('.quiz-question').forEach((q, index) => {
        q.classList.remove('active');
        
        if (index === 0) {
            q.style.display = 'block';
            q.classList.add('active');
        } else {
            q.style.display = 'none';
        }
        
        // Clear selections
        q.querySelectorAll('.quiz-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Hide next button
        const nextBtn = q.querySelector('.quiz-next');
        if (nextBtn) {
            nextBtn.style.display = 'none';
        }
    });
    
    updateQuizProgress();
    
    // Scroll to first question
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

// Countdown timer (optimized)
function startCountdown() {
    if (!siteData.personal.specialEventDate) return;
    
    const targetDate = new Date(siteData.personal.specialEventDate);
    
    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = targetDate.getTime() - now;
        
        if (distance < 0) {
            clearInterval(countdownInterval);
            const timer = document.querySelector('.countdown-timer');
            if (timer) {
                timer.innerHTML = '<h2>🎉 The special day is here! 🎉</h2>';
            }
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        updateElement('days', days.toString().padStart(2, '0'));
        updateElement('hours', hours.toString().padStart(2, '0'));
        updateElement('minutes', minutes.toString().padStart(2, '0'));
        updateElement('seconds', seconds.toString().padStart(2, '0'));
    };
    
    updateCountdown(); // Initial update
    countdownInterval = setInterval(updateCountdown, 1000);
}

// Hero section functions
function startSurprise() {
    // Simple scroll to message
    const messageSection = document.getElementById('message');
    if (messageSection) {
        messageSection.scrollIntoView({
            behavior: 'smooth'
        });
    }
}

function scrollToMessage() {
    const messageSection = document.getElementById('message');
    if (messageSection) {
        messageSection.scrollIntoView({
            behavior: 'smooth'
        });
    }
}

// Optimized scroll animations
function setupScrollAnimations() {
    // Use more efficient intersection observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    const elementsToAnimate = document.querySelectorAll('.gallery-item, .timeline-item, .surprise-card');
    elementsToAnimate.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Cleanup function for when page is hidden
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        // Clear timers to save battery
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
    } else if (document.visibilityState === 'visible') {
        // Restart countdown when page becomes visible
        if (siteData && siteData.personal.specialEventDate) {
            startCountdown();
        }
    }
});

// Add CSS animations dynamically (simplified)
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0.7;
        }
        100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Global functions for debugging (optional)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.refreshWebsiteData = async function() {
        console.log('Refreshing data...');
        localStorage.removeItem(CACHE_DATA_KEY);
        localStorage.removeItem(CACHE_TIMESTAMP_KEY);
        location.reload();
    };
    
    window.clearDataCache = function() {
        localStorage.removeItem(CACHE_DATA_KEY);
        localStorage.removeItem(CACHE_TIMESTAMP_KEY);
        console.log('Cache cleared');
    };
}

// Error handling for uncaught errors
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // Could implement error reporting here
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault(); // Prevent the default browser error message
});
