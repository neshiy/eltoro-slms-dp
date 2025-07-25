// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get the login form
    const loginForm = document.getElementById('login-form');
    
    // Add submit event listener to the form
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember').checked;
            
            // Validate form
            if (!username || !password) {
                alert('Please enter both username and password');
                return;
            }
            
            // In a real application, you would send these credentials to a server for authentication
            console.log('Login attempt:', { username, password, rememberMe });
            
            // For demo purposes, we'll just redirect to the dashboard
            // In a real application, this would only happen after successful authentication
            loginSuccess();
        });
    }
    
    // Add click event listener to the forgot password link
    const forgotPasswordLink = document.querySelector('.forgot-password a');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // In a real application, you would implement password recovery here
            alert('Password recovery functionality would be implemented here.');
        });
    }
});

// Function to handle successful login
function loginSuccess() {
    // In a real application, you might store the authentication token in localStorage or sessionStorage
    if (document.getElementById('remember').checked) {
        // If "Remember me" is checked, store in localStorage (persists even after browser close)
        localStorage.setItem('isLoggedIn', 'true');
    } else {
        // Otherwise, store in sessionStorage (cleared when browser is closed)
        sessionStorage.setItem('isLoggedIn', 'true');
    }
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
}

// Check if user is already logged in
function checkLoginStatus() {
    // In a real application, you would validate the authentication token with the server
    if (localStorage.getItem('isLoggedIn') === 'true' || sessionStorage.getItem('isLoggedIn') === 'true') {
        // If user is already logged in, redirect to dashboard
        window.location.href = 'dashboard.html';
    }
}

// Check login status when page loads
checkLoginStatus();