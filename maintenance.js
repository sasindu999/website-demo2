// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAqkBoMYwOt05xFDxyOSq86HLOoS5H_7mI",
    authDomain: "myweb-34b05.firebaseapp.com",
    projectId: "myweb-34b05",
    storageBucket: "myweb-34b05.firebasestorage.app",
    messagingSenderId: "G-258FZVWGRZ",
    appId: "1:483598535729:web:5477af7d53f0aa201c9910"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Create particles
const particlesContainer = document.getElementById('particles');
for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.width = Math.random() * 5 + 2 + 'px';
    particle.style.height = particle.style.width;
    particle.style.animationDelay = Math.random() * 15 + 's';
    particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
    particlesContainer.appendChild(particle);
}

// Progress percentage animation
let percentage = 0;
const percentageElement = document.getElementById('percentage');

const percentageInterval = setInterval(() => {
    percentage += 1;
    percentageElement.textContent = percentage + '%';
    
    if (percentage >= 100) {
        percentage = 0;
    }
}, 30);

// Auth state observer
auth.onAuthStateChanged(user => {
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    
    if (user) {
        userInfo.style.display = 'flex';
        userName.textContent = user.displayName || user.email;
    } else {
        // If not logged in, redirect to home
        window.location.href = 'index.html';
    }
});

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', function() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Logout error:', error);
        alert('Error logging out. Please try again.');
    });
});