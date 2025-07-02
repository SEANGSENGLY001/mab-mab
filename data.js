// Website Data Configuration
// This file contains all the customizable content for the birthday website

const websiteData = {
    // Personal Information
    personal: {
        girlfriendName: "Beautiful",
        yourName: "Your devoted partner",
        relationshipStart: "2023-01-15", // YYYY-MM-DD format
        specialEventDate: "2024-08-15", // Birthday or special event date
        websiteTitle: "Happy Birthday, Beautiful! 💕"
    },

    // Hero Section
    hero: {
        greeting: "Happy Birthday",
        subtitle: "Today is all about celebrating the most amazing person in my life",
        primaryButtonText: "Start the Surprise",
        secondaryButtonText: "Read My Message"
    },

    // Personal Message
    message: {
        title: "A Message From My Heart",
        content: `My dearest love,

Today marks another year of your incredible journey, and I feel so blessed to be part of it. You bring light to every room you enter, joy to every moment we share, and love to every corner of my heart.

This website is my small way of celebrating you and all the beautiful memories we've created together. Every photo, every moment, every surprise here represents just a fraction of how much you mean to me.

Happy Birthday, my love. Here's to many more adventures together! 💕

With all my love,
Your devoted partner`
    },

    // Photo Gallery
    gallery: [
        {
            image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23ff69b4'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='white' font-size='20' font-family='Arial'%3E📸 Memory 1%3C/text%3E%3C/svg%3E",
            caption: "Our first adventure together",
            date: "2023-01-20"
        },
        {
            image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23ff1493'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='white' font-size='20' font-family='Arial'%3E🌅 Memory 2%3C/text%3E%3C/svg%3E",
            caption: "That perfect sunset",
            date: "2023-02-14"
        },
        {
            image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23ff69b4'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='white' font-size='20' font-family='Arial'%3E😂 Memory 3%3C/text%3E%3C/svg%3E",
            caption: "Laughing until our stomachs hurt",
            date: "2023-03-10"
        },
        {
            image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23ff1493'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='white' font-size='20' font-family='Arial'%3E💃 Memory 4%3C/text%3E%3C/svg%3E",
            caption: "Dancing in the kitchen",
            date: "2023-04-05"
        },
        {
            image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23ff69b4'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='white' font-size='20' font-family='Arial'%3E🍿 Memory 5%3C/text%3E%3C/svg%3E",
            caption: "Our cozy movie nights",
            date: "2023-05-12"
        },
        {
            image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23ff1493'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='white' font-size='20' font-family='Arial'%3E🗺️ Memory 6%3C/text%3E%3C/svg%3E",
            caption: "Exploring new places together",
            date: "2023-06-18"
        }
    ],

    // Timeline Events
    timeline: [
        {
            date: "January 2023",
            title: "First Meeting",
            description: "The day our eyes first met and I knew something special was beginning."
        },
        {
            date: "March 2023",
            title: "First Date",
            description: "Coffee turned into hours of conversation. I never wanted it to end."
        },
        {
            date: "June 2023",
            title: "First Adventure",
            description: "Our first trip together - creating memories that would last forever."
        },
        {
            date: "September 2023",
            title: "Moving In Together",
            description: "Making our house a home, together."
        },
        {
            date: "December 2023",
            title: "First Christmas",
            description: "Celebrating our first holiday season as a couple."
        }
    ],

    // Countdown Section
    countdown: {
        title: "Countdown to Something Special",
        subtitle: "The excitement is building...",
        eventName: "Our Special Day"
    },

    // Surprise Cards
    surprises: [
        {
            icon: "🎁",
            title: "Surprise Gift",
            hint: "Click to reveal your special gift!",
            content: "A romantic dinner reservation at your favorite restaurant this weekend! 🍽️✨"
        },
        {
            icon: "💌",
            title: "Love Letter",
            hint: "A message from my heart",
            content: "You are the sunshine in my cloudy days, the melody in my silence, and the love of my life. 💕"
        },
        {
            icon: "🎵",
            title: "Our Song",
            hint: "The soundtrack to our love",
            content: "I've created a playlist of all the songs that remind me of you. Check your Spotify! 🎶"
        },
        {
            icon: "📸",
            title: "Memory Book",
            hint: "A collection of our moments",
            content: "I'm creating a photo album of all our adventures. Can't wait to fill it with more memories! 📚"
        },
        {
            icon: "🌟",
            title: "Future Plans",
            hint: "Dreams we'll make reality",
            content: "I've been planning our next adventure... Paris in the spring? 🗼"
        },
        {
            icon: "💎",
            title: "Special Surprise",
            hint: "Something sparkly awaits...",
            content: "Check your jewelry box tonight... there might be something new waiting for you! ✨"
        }
    ],

    // Quiz Questions
    quiz: {
        title: "How Well Do You Know Us?",
        subtitle: "A fun little quiz about our relationship",
        questions: [
            {
                question: "What was the first movie we watched together?",
                options: ["The Notebook", "Titanic", "La La Land", "Pride and Prejudice"],
                correct: 2
            },
            {
                question: "What's my favorite thing about you?",
                options: ["Your smile", "Your laugh", "Your kindness", "Everything"],
                correct: 3
            },
            {
                question: "Where was our first kiss?",
                options: ["In the park", "At the coffee shop", "Under the stars", "In the rain"],
                correct: 2
            },
            {
                question: "What's our favorite activity together?",
                options: ["Cooking", "Dancing", "Traveling", "Cuddling and watching movies"],
                correct: 3
            },
            {
                question: "What do I love most about our relationship?",
                options: ["How we laugh together", "How we support each other", "How we dream together", "All of the above"],
                correct: 3
            }
        ],
        completionMessage: {
            title: "You know us so well!",
            message: "Thank you for being the most amazing partner. Every day with you is a gift! 💕"
        }
    },

    // Color Theme (optional customization)
    theme: {
        primaryColor: "#ff69b4",
        secondaryColor: "#ff1493",
        accentColor: "#ffd700"
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = websiteData;
}
