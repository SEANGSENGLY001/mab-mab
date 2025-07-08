// Firebase Configuration and Initialization
// This file handles Firebase setup and Realtime Database connection

// Import Firebase modules (will be loaded from CDN)
// Note: Make sure to include Firebase SDK scripts in your HTML

const firebaseConfig = {
  apiKey: "AIzaSyAr1jsAaqTk1ZlffhQ85pLLCj34ZXqt2s4",
  authDomain: "heng-thida-db.firebaseapp.com",
  databaseURL: "https://heng-thida-db-default-rtdb.firebaseio.com/",
  projectId: "heng-thida-db",
  storageBucket: "heng-thida-db.firebasestorage.app",
  messagingSenderId: "850113003119",
  appId: "1:850113003119:web:d6f64500987bf0b076979a"
};

// Initialize Firebase
let app;
let database;

// Initialize Firebase when the page loads
function initializeFirebase() {
  try {
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined') {
      console.error('Firebase SDK not loaded. Please include Firebase scripts in your HTML.');
      return false;
    }

    // Initialize Firebase
    app = firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    
    console.log('Firebase initialized successfully');
    console.log('Database URL:', firebaseConfig.databaseURL);
    return true;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return false;
  }
}

// Firebase Database Helper Functions
const FirebaseDB = {
  // Save website data to Firebase
  saveWebsiteData: async function(data) {
    try {
      if (!database) {
        console.error('Firebase database not initialized');
        return false;
      }

      const ref = database.ref('websiteData');
      await ref.set(data);
      console.log('Website data saved to Firebase successfully');
      return true;
    } catch (error) {
      console.error('Error saving data to Firebase:', error);
      return false;
    }
  },

  // Load website data from Firebase
  loadWebsiteData: async function() {
    try {
      if (!database) {
        console.error('Firebase database not initialized');
        return null;
      }

      const ref = database.ref('websiteData');
      const snapshot = await ref.once('value');
      const data = snapshot.val();
      
      if (data) {
        console.log('Website data loaded from Firebase successfully');
        return data;
      } else {
        console.log('No data found in Firebase');
        return null;
      }
    } catch (error) {
      console.error('Error loading data from Firebase:', error);
      return null;
    }
  },

  // Save quiz results
  saveQuizResult: async function(score, totalQuestions, timestamp = null) {
    try {
      if (!database) {
        console.error('Firebase database not initialized');
        return false;
      }

      const quizResult = {
        score: score,
        totalQuestions: totalQuestions,
        timestamp: timestamp || firebase.database.ServerValue.TIMESTAMP,
        percentage: Math.round((score / totalQuestions) * 100)
      };

      const ref = database.ref('quizResults').push();
      await ref.set(quizResult);
      console.log('Quiz result saved to Firebase');
      return true;
    } catch (error) {
      console.error('Error saving quiz result:', error);
      return false;
    }
  },

  // Get all quiz results
  getQuizResults: async function() {
    try {
      if (!database) {
        console.error('Firebase database not initialized');
        return [];
      }

      const ref = database.ref('quizResults');
      const snapshot = await ref.orderByChild('timestamp').once('value');
      const results = [];
      
      snapshot.forEach(child => {
        results.push({
          id: child.key,
          ...child.val()
        });
      });

      return results.reverse(); // Most recent first
    } catch (error) {
      console.error('Error getting quiz results:', error);
      return [];
    }
  },

  // Get quiz data (questions and configuration)
  getQuizData: async function() {
    try {
      if (!database) {
        console.error('Firebase database not initialized');
        return null;
      }

      const ref = database.ref('websiteData/quiz');
      const snapshot = await ref.once('value');
      return snapshot.val();
    } catch (error) {
      console.error('Error getting quiz data:', error);
      return null;
    }
  },

  // Save visitor count
  incrementVisitorCount: async function() {
    try {
      if (!database) {
        console.error('Firebase database not initialized');
        return false;
      }

      const ref = database.ref('analytics/visitorCount');
      await ref.transaction((currentCount) => {
        return (currentCount || 0) + 1;
      });
      
      console.log('Visitor count incremented');
      return true;
    } catch (error) {
      console.error('Error incrementing visitor count:', error);
      return false;
    }
  },

  // Get visitor count
  getVisitorCount: async function() {
    try {
      if (!database) {
        console.error('Firebase database not initialized');
        return 0;
      }

      const ref = database.ref('analytics/visitorCount');
      const snapshot = await ref.once('value');
      return snapshot.val() || 0;
    } catch (error) {
      console.error('Error getting visitor count:', error);
      return 0;
    }
  },

  // Save gallery interactions
  saveGalleryInteraction: async function(imageIndex, caption) {
    try {
      if (!database) {
        console.error('Firebase database not initialized');
        return false;
      }

      const interaction = {
        imageIndex: imageIndex,
        caption: caption,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      };

      const ref = database.ref('interactions/gallery').push();
      await ref.set(interaction);
      return true;
    } catch (error) {
      console.error('Error saving gallery interaction:', error);
      return false;
    }
  },

  // Save surprise card reveals
  saveSurpriseReveal: async function(surpriseIndex, title) {
    try {
      if (!database) {
        console.error('Firebase database not initialized');
        return false;
      }

      const reveal = {
        surpriseIndex: surpriseIndex,
        title: title,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      };

      const ref = database.ref('interactions/surprises').push();
      await ref.set(reveal);
      return true;
    } catch (error) {
      console.error('Error saving surprise reveal:', error);
      return false;
    }
  },

  // Listen for real-time data changes
  onDataChange: function(path, callback) {
    try {
      if (!database) {
        console.error('Firebase database not initialized');
        return null;
      }

      const ref = database.ref(path);
      ref.on('value', callback);
      return ref;
    } catch (error) {
      console.error('Error setting up data listener:', error);
      return null;
    }
  },

  // Remove data listener
  offDataChange: function(ref) {
    try {
      if (ref) {
        ref.off();
      }
    } catch (error) {
      console.error('Error removing data listener:', error);
    }
  }
};

// Note: Firebase initialization is now handled by script.js to avoid conflicts
// This ensures proper order of operations and prevents race conditions

// Export for use in other files
if (typeof window !== 'undefined') {
  window.FirebaseDB = FirebaseDB;
  window.initializeFirebase = initializeFirebase;
}
