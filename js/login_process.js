document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login-form');
    const emailInput = document.getElementById('email');
    const submitButton = document.querySelector('.btn-next');
    const formContainer = document.querySelector('.login-card');

    let verificationCode = null;

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            if (!verificationCode) {
                // Step 1: Email submission triggers code request
                const email = emailInput.value.trim();
                if (validateEmail(email)) {
                    requestVerificationCode(email);
                } else {
                    alert('Please enter a valid email address.');
                }
            } else {
                // Step 2: Verify the code
                const enteredCode = document.getElementById('code').value.trim();
                verifyCode(enteredCode);
            }
        });
    }

    // Validate email format
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Request verification code (simulate backend request)
    function requestVerificationCode(email) {
        // Simulate a backend request for sending the code
        console.log(`Requesting verification code for email: ${email}`);

        // Generate a random 6-digit code
        verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`Verification Code (for testing): ${verificationCode}`);

        // Notify user (Replace with actual email sending in production)
        alert(`A verification code has been sent to ${email}.`);

        // Transition to code entry step
        renderCodeEntryStep();
    }

    // Verify the entered code
    function verifyCode(enteredCode) {
        if (enteredCode === verificationCode) {
            alert('Login successful!');
            window.location.href = 'dashboard.html'; // Redirect to the dashboard
        } else {
            alert('Invalid verification code. Please try again.');
        }
    }

    // Render the code entry step
    function renderCodeEntryStep() {
        formContainer.innerHTML = `
            <h1 class="title">Enter Verification Code</h1>
            <p class="subtitle">A code has been sent to your email. Please enter it below:</p>
            <form action="verify_code_process.php" method="POST" class="login-form">
                <label for="code">Verification Code</label>
                <input type="text" id="code" name="code" placeholder="Enter the 6-digit code" required>
                <button type="submit" class="btn-next">Verify</button>
            </form>
        `;
    }
});
