// Main application JavaScript

// Form validation helpers
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateUsername(username) {
    // Username for MCP endpoint - alphanumeric, dash, underscore only
    const re = /^[a-zA-Z0-9_-]+$/;
    return re.test(username) && username.length >= 3 && username.length <= 20;
}

function validatePassword(password) {
    return password.length >= 8;
}

// Show/hide loading state
function setLoading(formElement, isLoading) {
    const submitBtn = formElement.querySelector('button[type="submit"]');
    const inputs = formElement.querySelectorAll('input');
    
    if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        submitBtn.classList.add('loading');
        inputs.forEach(input => input.disabled = true);
    } else {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.originalText || 'Submit';
        submitBtn.classList.remove('loading');
        inputs.forEach(input => input.disabled = false);
    }
}

// Show error message
function showError(element, message) {
    clearError(element);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.textContent = message;
    element.parentNode.appendChild(errorDiv);
    element.classList.add('border-red-500');
}

// Clear error message
function clearError(element) {
    const errorDiv = element.parentNode.querySelector('.form-error');
    if (errorDiv) {
        errorDiv.remove();
    }
    element.classList.remove('border-red-500');
}

// Real-time form validation
document.addEventListener('DOMContentLoaded', function() {
    // Email validation
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                showError(this, 'Please enter a valid email address');
            } else {
                clearError(this);
            }
        });
    });
    
    // Username validation
    const usernameInputs = document.querySelectorAll('input[name="username"]');
    usernameInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !validateUsername(this.value)) {
                showError(this, 'Username must be 3-20 characters, letters, numbers, dash, or underscore only');
            } else {
                clearError(this);
            }
        });
    });
    
    // Password validation
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        if (input.name === 'password') {
            input.addEventListener('blur', function() {
                if (this.value && !validatePassword(this.value)) {
                    showError(this, 'Password must be at least 8 characters long');
                } else {
                    clearError(this);
                }
            });
        }
    });
    
    // Password confirmation
    const confirmPasswordInputs = document.querySelectorAll('input[name="confirmPassword"]');
    confirmPasswordInputs.forEach(input => {
        input.addEventListener('blur', function() {
            const passwordInput = document.querySelector('input[name="password"]');
            if (this.value && passwordInput && this.value !== passwordInput.value) {
                showError(this, 'Passwords do not match');
            } else {
                clearError(this);
            }
        });
    });
    
    // Form submission handling
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn && !submitBtn.dataset.originalText) {
            submitBtn.dataset.originalText = submitBtn.textContent;
        }
        
        form.addEventListener('submit', function(e) {
            setLoading(this, true);
            // Form will submit normally, loading state will show during processing
        });
    });
});

// Flash message handling
function showFlashMessage(message, type = 'info') {
    const flashDiv = document.createElement('div');
    flashDiv.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
        type === 'error' ? 'bg-red-600' : 
        type === 'success' ? 'bg-green-600' : 
        'bg-blue-600'
    }`;
    flashDiv.textContent = message;
    
    document.body.appendChild(flashDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        flashDiv.remove();
    }, 5000);
    
    // Click to dismiss
    flashDiv.addEventListener('click', () => {
        flashDiv.remove();
    });
}