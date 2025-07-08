// Admin Panel JavaScript
let currentData = JSON.parse(JSON.stringify(websiteData)); // Deep copy of original data

// Firebase configuration (same as main site)
const firebaseConfig = {
  apiKey: "AIzaSyAr1jsAaqTk1ZlffhQ85pLLCj34ZXqt2s4",
  authDomain: "heng-thida-db.firebaseapp.com",
  databaseURL: "https://heng-thida-db-default-rtdb.firebaseio.com/",
  projectId: "heng-thida-db",
  storageBucket: "heng-thida-db.firebasestorage.app",
  messagingSenderId: "850113003119",
  appId: "1:850113003119:web:d6f64500987bf0b076979a"
};

// Initialize Firebase for admin panel
function initializeAdminFirebase() {
  try {
    if (typeof firebase === 'undefined') {
      console.error('Firebase SDK not loaded. Please include Firebase scripts.');
      return false;
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    
    console.log('Admin Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return false;
  }
}

// Load data from Firebase
async function loadDataFromFirebase() {
  try {
    if (typeof FirebaseDB === 'undefined') {
      // Fallback to direct Firebase database call
      const database = firebase.database();
      const snapshot = await database.ref('websiteData').once('value');
      const firebaseData = snapshot.val();
      
      if (firebaseData) {
        currentData = firebaseData;
        console.log('Data loaded from Firebase');
        showStatus('Data loaded from Firebase successfully!', 'success');
      } else {
        console.log('No data in Firebase, using default data');
        showStatus('Using default data - no Firebase data found', 'info');
      }
    } else {
      // Use FirebaseDB helper
      const firebaseData = await FirebaseDB.loadWebsiteData();
      if (firebaseData) {
        currentData = firebaseData;
        console.log('Data loaded from Firebase');
        showStatus('Data loaded from Firebase successfully!', 'success');
      } else {
        console.log('No data in Firebase, using default data');
        showStatus('Using default data - no Firebase data found', 'info');
      }
    }
    
    populateAllForms();
  } catch (error) {
    console.error('Error loading data from Firebase:', error);
    showStatus('Error loading data from Firebase: ' + error.message, 'error');
    populateAllForms(); // Still populate with default data
  }
}

// Save data to Firebase
async function saveDataToFirebase() {
  try {
    if (typeof FirebaseDB === 'undefined') {
      // Fallback to direct Firebase database call
      const database = firebase.database();
      await database.ref('websiteData').set(currentData);
    } else {
      // Use FirebaseDB helper
      await FirebaseDB.saveWebsiteData(currentData);
    }
    console.log('Data saved to Firebase successfully');
    showStatus('Data saved to Firebase successfully!', 'success');
    return true;
  } catch (error) {
    console.error('Error saving data to Firebase:', error);
    showStatus('Error saving to Firebase: ' + error.message, 'error');
    return false;
  }
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase first
    setTimeout(() => {
        const firebaseInitialized = initializeAdminFirebase();
        if (firebaseInitialized) {
            loadDataFromFirebase();
        } else {
            loadDataFromStorage();
            populateAllForms();
        }
    }, 1000);
    
    setupEventListeners();
});

// Load data from localStorage if available
function loadDataFromStorage() {
    const savedData = localStorage.getItem('birthdayWebsiteData');
    if (savedData) {
        try {
            currentData = JSON.parse(savedData);
        } catch (e) {
            console.error('Error loading saved data:', e);
            showStatus('Error loading saved data. Using defaults.', 'error');
        }
    }
}

// Save data to localStorage
function saveDataToStorage() {
    try {
        localStorage.setItem('birthdayWebsiteData', JSON.stringify(currentData));
        return true;
    } catch (e) {
        console.error('Error saving data:', e);
        showStatus('Error saving data to browser storage.', 'error');
        return false;
    }
}

// Tab switching
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Add active class to clicked nav tab
    event.target.classList.add('active');
}

// Populate all forms with current data
function populateAllForms() {
    populatePersonalForm();
    populateMessageForm();
    populateGalleryForm();
    populateTimelineForm();
    populateSurprisesForm();
    populateQuizForm();
    populateSettingsForm();
}

// Personal Information Form
function populatePersonalForm() {
    document.getElementById('girlfriend-name').value = currentData.personal.girlfriendName;
    document.getElementById('your-name').value = currentData.personal.yourName;
    document.getElementById('relationship-start').value = currentData.personal.relationshipStart;
    document.getElementById('special-date').value = currentData.personal.specialEventDate;
    document.getElementById('website-title').value = currentData.personal.websiteTitle;
}

// Message Form
function populateMessageForm() {
    document.getElementById('message-title').value = currentData.message.title;
    document.getElementById('message-content').value = currentData.message.content;
    updateMessagePreview();
}

// Gallery Form
function populateGalleryForm() {
    const container = document.getElementById('gallery-items');
    container.innerHTML = '';
    
    currentData.gallery.forEach((item, index) => {
        const galleryItem = createGalleryItemForm(item, index);
        container.appendChild(galleryItem);
    });
}

function createGalleryItemForm(item, index) {
    const div = document.createElement('div');
    div.className = 'gallery-admin-item';
    div.innerHTML = `
        <img src="${item.image}" alt="Gallery item ${index + 1}" onerror="this.src='https://picsum.photos/300/200?random=${index + 10}'">
        <div class="form-group">
            <label>Image URL</label>
            <input type="url" value="${item.image}" onchange="updateGalleryItem(${index}, 'image', this.value)">
        </div>
        <div class="form-group">
            <label>Caption</label>
            <input type="text" value="${item.caption}" onchange="updateGalleryItem(${index}, 'caption', this.value)">
        </div>
        <div class="form-group">
            <label>Date</label>
            <input type="date" value="${item.date}" onchange="updateGalleryItem(${index}, 'date', this.value)">
        </div>
        <button class="btn btn-danger" onclick="removeGalleryItem(${index})">
            <i class="fas fa-trash"></i> Remove
        </button>
    `;
    return div;
}

// Timeline Form
function populateTimelineForm() {
    const container = document.getElementById('timeline-items');
    container.innerHTML = '';
    
    currentData.timeline.forEach((item, index) => {
        const timelineItem = createTimelineItemForm(item, index);
        container.appendChild(timelineItem);
    });
}

function createTimelineItemForm(item, index) {
    const div = document.createElement('div');
    div.className = 'timeline-admin-item';
    div.innerHTML = `
        <div class="form-group">
            <label>Date/Period</label>
            <input type="text" value="${item.date}" onchange="updateTimelineItem(${index}, 'date', this.value)">
        </div>
        <div class="form-group">
            <label>Title</label>
            <input type="text" value="${item.title}" onchange="updateTimelineItem(${index}, 'title', this.value)">
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea rows="3" onchange="updateTimelineItem(${index}, 'description', this.value)">${item.description}</textarea>
        </div>
        <button class="btn btn-danger" onclick="removeTimelineItem(${index})">
            <i class="fas fa-trash"></i> Remove
        </button>
    `;
    return div;
}

// Surprises Form
function populateSurprisesForm() {
    const container = document.getElementById('surprise-items');
    container.innerHTML = '';
    
    currentData.surprises.forEach((item, index) => {
        const surpriseItem = createSurpriseItemForm(item, index);
        container.appendChild(surpriseItem);
    });
}

function createSurpriseItemForm(item, index) {
    const icons = ['🎁', '💌', '🎵', '📸', '🌟', '💎', '🎉', '💕', '🌹', '🍰', '🎈', '✨'];
    
    const div = document.createElement('div');
    div.className = 'surprise-admin-item';
    div.innerHTML = `
        <div class="form-group">
            <label>Icon</label>
            <div class="surprise-icon-picker">
                ${icons.map(icon => `
                    <div class="icon-option ${item.icon === icon ? 'selected' : ''}" 
                         onclick="updateSurpriseItem(${index}, 'icon', '${icon}'); selectIcon(this)">${icon}</div>
                `).join('')}
            </div>
        </div>
        <div class="form-group">
            <label>Title</label>
            <input type="text" value="${item.title}" onchange="updateSurpriseItem(${index}, 'title', this.value)">
        </div>
        <div class="form-group">
            <label>Hint Text</label>
            <input type="text" value="${item.hint}" onchange="updateSurpriseItem(${index}, 'hint', this.value)">
        </div>
        <div class="form-group">
            <label>Surprise Content</label>
            <textarea rows="3" onchange="updateSurpriseItem(${index}, 'content', this.value)">${item.content}</textarea>
        </div>
        <button class="btn btn-danger" onclick="removeSurpriseItem(${index})">
            <i class="fas fa-trash"></i> Remove
        </button>
    `;
    return div;
}

// Quiz Form
function populateQuizForm() {
    document.getElementById('quiz-title').value = currentData.quiz.title;
    document.getElementById('quiz-subtitle').value = currentData.quiz.subtitle;
    document.getElementById('completion-title').value = currentData.quiz.completionMessage.title;
    document.getElementById('completion-message').value = currentData.quiz.completionMessage.message;
    
    const container = document.getElementById('quiz-questions');
    container.innerHTML = '';
    
    currentData.quiz.questions.forEach((item, index) => {
        const questionItem = createQuizQuestionForm(item, index);
        container.appendChild(questionItem);
    });
}

function createQuizQuestionForm(item, index) {
    const div = document.createElement('div');
    div.className = 'quiz-admin-item';
    div.innerHTML = `
        <div class="form-group">
            <label>Question</label>
            <input type="text" value="${item.question}" onchange="updateQuizQuestion(${index}, 'question', this.value)">
        </div>
        <div class="form-group">
            <label>Answer Options</label>
            <div class="quiz-options-admin">
                ${item.options.map((option, optIndex) => `
                    <div class="quiz-option-admin">
                        <input type="radio" name="correct-${index}" ${item.correct === optIndex ? 'checked' : ''} 
                               onchange="updateQuizQuestion(${index}, 'correct', ${optIndex})">
                        <input type="text" value="${option}" 
                               onchange="updateQuizOption(${index}, ${optIndex}, this.value)">
                    </div>
                `).join('')}
            </div>
        </div>
        <button class="btn btn-danger" onclick="removeQuizQuestion(${index})">
            <i class="fas fa-trash"></i> Remove
        </button>
    `;
    return div;
}

// Settings Form
function populateSettingsForm() {
    document.getElementById('primary-color').value = currentData.theme.primaryColor;
    document.getElementById('secondary-color').value = currentData.theme.secondaryColor;
    document.getElementById('accent-color').value = currentData.theme.accentColor;
}

// Update functions
function updatePersonalData() {
    currentData.personal.girlfriendName = document.getElementById('girlfriend-name').value;
    currentData.personal.yourName = document.getElementById('your-name').value;
    currentData.personal.relationshipStart = document.getElementById('relationship-start').value;
    currentData.personal.specialEventDate = document.getElementById('special-date').value;
    currentData.personal.websiteTitle = document.getElementById('website-title').value;
}

function updateMessageData() {
    currentData.message.title = document.getElementById('message-title').value;
    currentData.message.content = document.getElementById('message-content').value;
    updateMessagePreview();
}

function updateMessagePreview() {
    const preview = document.getElementById('message-preview');
    const content = document.getElementById('message-content').value;
    preview.textContent = content;
}

function updateGalleryItem(index, field, value) {
    currentData.gallery[index][field] = value;
    if (field === 'image') {
        // Update the preview image
        const img = event.target.closest('.gallery-admin-item').querySelector('img');
        img.src = value;
    }
}

function updateTimelineItem(index, field, value) {
    currentData.timeline[index][field] = value;
}

function updateSurpriseItem(index, field, value) {
    currentData.surprises[index][field] = value;
}

function updateQuizQuestion(index, field, value) {
    currentData.quiz.questions[index][field] = value;
}

function updateQuizOption(index, optionIndex, value) {
    currentData.quiz.questions[index].options[optionIndex] = value;
}

// Add/Remove functions
function addGalleryItem() {
    const newItem = {
        image: `https://picsum.photos/400/300?random=${Date.now()}`,
        caption: 'New memory caption',
        date: new Date().toISOString().split('T')[0]
    };
    currentData.gallery.push(newItem);
    populateGalleryForm();
}

function removeGalleryItem(index) {
    if (confirm('Are you sure you want to remove this photo?')) {
        currentData.gallery.splice(index, 1);
        populateGalleryForm();
    }
}

function addTimelineItem() {
    const newItem = {
        date: 'New Date',
        title: 'New Milestone',
        description: 'Description of this special moment...'
    };
    currentData.timeline.push(newItem);
    populateTimelineForm();
}

function removeTimelineItem(index) {
    if (confirm('Are you sure you want to remove this timeline item?')) {
        currentData.timeline.splice(index, 1);
        populateTimelineForm();
    }
}

function addSurpriseItem() {
    const newItem = {
        icon: '🎁',
        title: 'New Surprise',
        hint: 'Click to reveal...',
        content: 'Your surprise content here!'
    };
    currentData.surprises.push(newItem);
    populateSurprisesForm();
}

function removeSurpriseItem(index) {
    if (confirm('Are you sure you want to remove this surprise?')) {
        currentData.surprises.splice(index, 1);
        populateSurprisesForm();
    }
}

function addQuizQuestion() {
    const newQuestion = {
        question: 'New question?',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        correct: 0
    };
    currentData.quiz.questions.push(newQuestion);
    populateQuizForm();
}

function removeQuizQuestion(index) {
    if (confirm('Are you sure you want to remove this question?')) {
        currentData.quiz.questions.splice(index, 1);
        populateQuizForm();
    }
}

// Utility functions
function selectIcon(element) {
    element.parentNode.querySelectorAll('.icon-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    element.classList.add('selected');
}

function saveAllData() {
    // Update all data from forms
    updatePersonalData();
    updateMessageData();
    
    // Update quiz data
    currentData.quiz.title = document.getElementById('quiz-title').value;
    currentData.quiz.subtitle = document.getElementById('quiz-subtitle').value;
    currentData.quiz.completionMessage.title = document.getElementById('completion-title').value;
    currentData.quiz.completionMessage.message = document.getElementById('completion-message').value;
    
    // Update theme
    currentData.theme.primaryColor = document.getElementById('primary-color').value;
    currentData.theme.secondaryColor = document.getElementById('secondary-color').value;
    currentData.theme.accentColor = document.getElementById('accent-color').value;
    
    // Save to localStorage
    saveDataToStorage();
    
    // Save to Firebase
    saveDataToFirebase();
    
    showStatus('All changes saved successfully!', 'success');
}

function updateDataFile() {
    // This would ideally update the data.js file, but since we can't write files from browser,
    // we'll provide instructions to the user
    console.log('Updated data:', currentData);
}

function previewWebsite() {
    // Save current data first
    saveAllData();
    
    // Open the main website in a new tab
    window.open('index.html', '_blank');
}

function exportData() {
    const dataStr = JSON.stringify(currentData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'birthday-website-data.json';
    link.click();
    
    URL.revokeObjectURL(url);
    showStatus('Data exported successfully!', 'success');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            currentData = importedData;
            populateAllForms();
            saveDataToStorage();
            showStatus('Data imported successfully!', 'success');
        } catch (error) {
            showStatus('Error importing data. Please check the file format.', 'error');
        }
    };
    reader.readAsText(file);
}

function showStatus(message, type = 'success') {
    const statusEl = document.getElementById('status-message');
    statusEl.textContent = message;
    statusEl.className = `status-message ${type} show`;
    
    setTimeout(() => {
        statusEl.classList.remove('show');
    }, 3000);
}

// Setup event listeners
function setupEventListeners() {
    // Auto-save on input changes
    document.addEventListener('input', function(e) {
        if (e.target.matches('#message-content')) {
            updateMessagePreview();
        }
    });
    
    // Auto-update personal data
    ['girlfriend-name', 'your-name', 'relationship-start', 'special-date', 'website-title'].forEach(id => {
        document.getElementById(id).addEventListener('input', updatePersonalData);
    });
    
    // Auto-update message data
    ['message-title', 'message-content'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateMessageData);
    });
}
