document.addEventListener('DOMContentLoaded', () => {
    const googleLoginButton = document.getElementById('google-login-button');
    
    // Event listener for Google login button click
    googleLoginButton.addEventListener('click', () => {
        handleGoogleLogin();
    });
});

// Function to initiate Google Login and handle OAuth flow
function handleGoogleLogin() {
    // Launch Google OAuth web flow
    chrome.identity.launchWebAuthFlow(
        {
            url: `https://accounts.google.com/o/oauth2/auth?client_id=433023796706-a8kt3pllaaapl1td9prfnt7gfd08g1rn.apps.googleusercontent.com&redirect_uri=https://${chrome.runtime.id}.chromiumapp.org&response_type=token&scope=profile email&prompt=select_account`,
            interactive: true
        },
        (redirectUrl) => {
            if (redirectUrl) {
                // Extract the access token from the URL fragment
                const token = new URL(redirectUrl).hash.match(/access_token=([^&]*)/)[1];
                console.log("Access Token:", token);

                // Fetch user information using the access token
                fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
                    headers: { Authorization: `Bearer ${token}` }
                })
                .then((response) => response.json()) // Parse JSON response
                .then((userInfo) => {
                    console.log("User Info:", userInfo);
                    
                    // Store user information in Chrome local storage
                    chrome.storage.local.set({ userInfo: userInfo }, () => {
                        console.log("User info saved to local storage.");
                    });

                    // Redirect to the dashboard after successful login
                    window.location.href = "dashboard.html"; // Redirect to your main dashboard page URL
                })
                .catch((error) => {
                    console.error("Failed to fetch user info:", error);
                });
            } else {
                console.error("OAuth flow failed or was canceled.");
            }
        }
    );
}
