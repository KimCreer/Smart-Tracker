document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout-button');
    const switchAccountButton = document.getElementById('switch-account-button');
    
    logoutButton.addEventListener('click', () => {
        // Logout the user
        logout(false);
    });

    switchAccountButton.addEventListener('click', () => {
        // Trigger account switch
        switchAccount();
    });
});

// Function to handle logout
function logout(switchAccount = false) {
    if (switchAccount) {
        // If switching accounts, log out the user and trigger the re-authentication process
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            if (chrome.runtime.lastError) {
                console.error("Error logging out of the current account:", chrome.runtime.lastError);
                return;
            }

            // Clear session data from chrome storage
            chrome.storage.local.clear(() => {
                console.log("Session data cleared");
            });

            // Re-authenticate the user by prompting for account selection
            window.location.href = "index.html"; // Reload the page to trigger re-login or show login screen
        });
    } else {
        // If just logging out (not switching accounts), proceed with the logout logic
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            if (chrome.runtime.lastError) {
                console.error("Error logging out:", chrome.runtime.lastError);
                return;
            }

            // Clear session data from chrome storage
            chrome.storage.local.clear(() => {
                console.log("Session data cleared");
            });

            // Redirect to the login page
            window.location.href = "login.html"; // Replace with your actual login page URL
        });
    }
}

// Function to switch accounts (log out current account and prompt to choose another account)
function switchAccount() {
    // Clear current session and log out user, forcing them to pick another Google account
    chrome.identity.removeCachedAuthToken({ token: null }, () => {
        console.log("User logged out successfully");
    });

    // Now trigger authentication with a new login prompt
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
            console.error("Error during account switch:", chrome.runtime.lastError);
            return;
        }

        // After getting the token, retrieve the user info and save it
        fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then((response) => response.json())
        .then((userInfo) => {
            console.log("New User Info:", userInfo);
            chrome.storage.local.set({ userInfo: userInfo }); // Store new user info

            // Update profile UI with the new user information
            updateProfile(userInfo);
        })
        .catch(console.error);
    });
}

// Function to update profile UI with new user info
function updateProfile(userInfo) {
    const profilePic = document.getElementById('profile-pic');
    const userName = document.getElementById('user-name');

    if (userInfo.picture) {
        profilePic.src = userInfo.picture;
    }
    if (userInfo.name) {
        userName.textContent = `Hello, ${userInfo.name}`;
    }
}
