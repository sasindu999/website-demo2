// ========================
// FIREBASE CONFIGURATION
// ========================
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

// ========================
// EMAILJS CONFIGURATION
// ========================
emailjs.init("uuSSWER-Oh7S4OsL6");

const EMAILJS_SERVICE_ID = "service_qiojb9c";
const EMAILJS_VERIFICATION_TEMPLATE_ID = "template_f98rieb";
const EMAILJS_CONTACT_TEMPLATE_ID = "template_r09bmvf";

// ========================
// EMAIL VERIFICATION SYSTEM
// ========================
let generatedCode = '';
let userEmail = '';
let codeExpiryTime = null;
let resendTimer = null;

// Generate 6-digit code
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validate email format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Send verification code
document.getElementById('email-verification-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('user-email');
    const email = emailInput.value.trim();
    const button = this.querySelector('button');
    const messageDiv = document.getElementById('form-message');
    
    if (!validateEmail(email)) {
        messageDiv.textContent = '✗ Please enter a valid email address!';
        messageDiv.className = 'form-message error';
        return;
    }
    
    button.textContent = 'Sending...';
    button.disabled = true;
    messageDiv.textContent = '';
    
    // Generate new code
    generatedCode = generateVerificationCode();
    userEmail = email;
    codeExpiryTime = Date.now() + (5 * 60 * 1000); // 5 minutes expiry
    
    // Send code via EmailJS
    const templateParams = {
        to_email: email,
        verification_code: generatedCode,
        expiry_time: '5 minutes'
    };
    
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_VERIFICATION_TEMPLATE_ID, templateParams)
        .then(function(response) {
            console.log('Verification code sent!', response.status);
            
            // Show code verification step
            document.getElementById('email-step').style.display = 'none';
            document.getElementById('code-step').style.display = 'block';
            document.getElementById('display-email').textContent = email;
            
            // Start countdown timer
            startResendTimer();
            
            messageDiv.textContent = '✓ Verification code sent! Check your email.';
            messageDiv.className = 'form-message success';
            
        }, function(error) {
            console.log('FAILED...', error);
            messageDiv.textContent = '✗ Failed to send code. Please try again.';
            messageDiv.className = 'form-message error';
        })
        .finally(() => {
            button.textContent = 'Send Verification Code';
            button.disabled = false;
        });
});

// Change email button
document.getElementById('changeEmailBtn').addEventListener('click', function() {
    document.getElementById('code-step').style.display = 'none';
    document.getElementById('email-step').style.display = 'block';
    document.getElementById('form-message').textContent = '';
    clearResendTimer();
    
    // Clear code inputs
    const codeInputs = document.querySelectorAll('.code-input');
    codeInputs.forEach(input => input.value = '');
});

// Code input auto-focus
const codeInputs = document.querySelectorAll('.code-input');
codeInputs.forEach((input, index) => {
    input.addEventListener('input', function(e) {
        if (this.value.length === 1 && index < codeInputs.length - 1) {
            codeInputs[index + 1].focus();
        }
    });
    
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace' && this.value === '' && index > 0) {
            codeInputs[index - 1].focus();
        }
    });
    
    // Only allow numbers
    input.addEventListener('keypress', function(e) {
        if (!/[0-9]/.test(e.key)) {
            e.preventDefault();
        }
    });
});

// Verify code
document.getElementById('code-verification-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const messageDiv = document.getElementById('form-message');
    const button = this.querySelector('button[type="submit"]');
    
    // Get entered code
    let enteredCode = '';
    codeInputs.forEach(input => {
        enteredCode += input.value;
    });
    
    // Check if code is complete
    if (enteredCode.length !== 6) {
        messageDiv.textContent = '✗ Please enter the complete 6-digit code!';
        messageDiv.className = 'form-message error';
        return;
    }
    
    // Check expiry
    if (Date.now() > codeExpiryTime) {
        messageDiv.textContent = '✗ Code expired! Please request a new code.';
        messageDiv.className = 'form-message error';
        return;
    }
    
    button.textContent = 'Verifying...';
    button.disabled = true;
    
    // Verify code
    if (enteredCode === generatedCode) {
        messageDiv.textContent = '✓ Email verified successfully!';
        messageDiv.className = 'form-message success';
        
        setTimeout(() => {
            // Show contact form
            document.getElementById('code-step').style.display = 'none';
            document.getElementById('contact-step').style.display = 'block';
            document.getElementById('verified-email').textContent = userEmail;
            messageDiv.textContent = '';
            clearResendTimer();
        }, 1500);
    } else {
        messageDiv.textContent = '✗ Invalid code! Please try again.';
        messageDiv.className = 'form-message error';
        
        // Clear inputs
        codeInputs.forEach(input => input.value = '');
        codeInputs[0].focus();
    }
    
    button.textContent = 'Verify Code';
    button.disabled = false;
});

// Resend code
document.getElementById('resendBtn').addEventListener('click', function() {
    const messageDiv = document.getElementById('form-message');
    const button = this;
    
    button.textContent = 'Sending...';
    button.disabled = true;
    
    // Generate new code
    generatedCode = generateVerificationCode();
    codeExpiryTime = Date.now() + (5 * 60 * 1000);
    
    const templateParams = {
        to_email: userEmail,
        verification_code: generatedCode,
        expiry_time: '5 minutes'
    };
    
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_VERIFICATION_TEMPLATE_ID, templateParams)
        .then(function(response) {
            messageDiv.textContent = '✓ New code sent!';
            messageDiv.className = 'form-message success';
            
            // Clear previous inputs
            codeInputs.forEach(input => input.value = '');
            codeInputs[0].focus();
            
            // Restart timer
            startResendTimer();
            
        }, function(error) {
            messageDiv.textContent = '✗ Failed to resend code.';
            messageDiv.className = 'form-message error';
        })
        .finally(() => {
            button.textContent = 'Resend Code';
        });
});

// Resend timer
function startResendTimer() {
    let timeLeft = 60;
    const resendBtn = document.getElementById('resendBtn');
    const timerText = document.getElementById('timer-text');
    
    resendBtn.disabled = true;
    
    resendTimer = setInterval(() => {
        timeLeft--;
        timerText.textContent = `⏱️ Request new code in ${timeLeft}s`;
        
        if (timeLeft <= 0) {
            clearResendTimer();
            resendBtn.disabled = false;
            timerText.textContent = '';
        }
    }, 1000);
}

function clearResendTimer() {
    if (resendTimer) {
        clearInterval(resendTimer);
        resendTimer = null;
    }
}

// ========================
// CONTACT FORM (After Verification)
// ========================
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const button = this.querySelector('button');
    const messageDiv = document.getElementById('form-message');
    const originalText = button.textContent;
    
    button.textContent = 'Sending...';
    button.disabled = true;
    messageDiv.textContent = '';
    
    const templateParams = {
        from_name: this.querySelector('[name="from_name"]').value,
        from_email: userEmail,
        message: this.querySelector('[name="message"]').value,
        reply_to: userEmail
    };
    
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_CONTACT_TEMPLATE_ID, templateParams)
        .then(function(response) {
            console.log('SUCCESS!', response.status);
            
            messageDiv.textContent = '✓ Message sent successfully! We will reply to ' + userEmail;
            messageDiv.className = 'form-message success';
            document.getElementById('contact-form').reset();
            
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
            }, 3000);
            
        }, function(error) {
            console.log('FAILED...', error);
            messageDiv.textContent = '✗ Failed to send message. Please try again.';
            messageDiv.className = 'form-message error';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
            }, 3000);
        });
});

// ========================
// PARTICLES
// ========================
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

// ========================
// SMOOTH SCROLL
// ========================
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ========================
// ACTIVE NAV LINK
// ========================
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});

// ========================
// SKILL BARS ANIMATION
// ========================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const progressBars = entry.target.querySelectorAll('.progress');
            progressBars.forEach(bar => {
                bar.style.width = bar.getAttribute('data-progress') + '%';
            });
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.skill-category').forEach(category => {
    observer.observe(category);
});

// ========================
// LOGIN MODAL
// ========================
const modal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');
const closeBtn = document.querySelector('.close');
const userInfo = document.getElementById('userInfo');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');

loginBtn.onclick = function() {
    modal.style.display = 'block';
}

closeBtn.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// ========================
// TAB SWITCHING
// ========================
const tabButtons = document.querySelectorAll('.tab-btn');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

tabButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        tabButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const tab = this.getAttribute('data-tab');
        if (tab === 'login') {
            loginForm.style.display = 'flex';
            signupForm.style.display = 'none';
        } else {
            loginForm.style.display = 'none';
            signupForm.style.display = 'flex';
        }
        
        document.getElementById('auth-message').textContent = '';
    });
});

// ========================
// AUTH STATE OBSERVER
// ========================
auth.onAuthStateChanged(user => {
    if (user) {
        loginBtn.style.display = 'none';
        userInfo.style.display = 'flex';
        userName.textContent = user.displayName || user.email;
        modal.style.display = 'none';
    } else {
        loginBtn.style.display = 'block';
        userInfo.style.display = 'none';
    }
});

// ========================
// LOGIN FUNCTION
// ========================
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const messageDiv = document.getElementById('auth-message');
    const button = this.querySelector('.auth-btn');
    
    button.textContent = 'Logging in...';
    button.disabled = true;
    messageDiv.textContent = '';
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            messageDiv.textContent = '✓ Login successful!';
            messageDiv.className = 'auth-message success';
            this.reset();
        })
        .catch((error) => {
            messageDiv.textContent = '✗ ' + error.message;
            messageDiv.className = 'auth-message error';
        })
        .finally(() => {
            button.textContent = 'Login';
            button.disabled = false;
        });
});

// ========================
// SIGNUP FUNCTION
// ========================
document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const messageDiv = document.getElementById('auth-message');
    const button = this.querySelector('.auth-btn');
    
    button.textContent = 'Creating account...';
    button.disabled = true;
    messageDiv.textContent = '';
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            return userCredential.user.updateProfile({
                displayName: name
            });
        })
        .then(() => {
            messageDiv.textContent = '✓ Account created successfully!';
            messageDiv.className = 'auth-message success';
            this.reset();
        })
        .catch((error) => {
            messageDiv.textContent = '✗ ' + error.message;
            messageDiv.className = 'auth-message error';
        })
        .finally(() => {
            button.textContent = 'Sign Up';
            button.disabled = false;
        });
});

// ========================
// GOOGLE LOGIN
// ========================
const googleProvider = new firebase.auth.GoogleAuthProvider();

document.getElementById('googleLogin').addEventListener('click', function() {
    const messageDiv = document.getElementById('auth-message');
    messageDiv.textContent = '';
    
    auth.signInWithPopup(googleProvider)
        .then((result) => {
            messageDiv.textContent = '✓ Logged in with Google!';
            messageDiv.className = 'auth-message success';
        })
        .catch((error) => {
            messageDiv.textContent = '✗ ' + error.message;
            messageDiv.className = 'auth-message error';
        });
});

document.getElementById('googleSignup').addEventListener('click', function() {
    const messageDiv = document.getElementById('auth-message');
    messageDiv.textContent = '';
    
    auth.signInWithPopup(googleProvider)
        .then((result) => {
            messageDiv.textContent = '✓ Account created with Google!';
            messageDiv.className = 'auth-message success';
        })
        .catch((error) => {
            messageDiv.textContent = '✗ ' + error.message;
            messageDiv.className = 'auth-message error';
        });
});

// ========================
// LOGOUT
// ========================
logoutBtn.addEventListener('click', function() {
    auth.signOut().then(() => {
        console.log('User signed out');
    }).catch((error) => {
        console.error('Logout error:', error);
    });
});
