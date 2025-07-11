// === Extension Lifecycle Management ===

// Triggered when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
    console.log('Smart Attendance Tracker Installed');
});

// Triggered when tabs are updated (navigated or reloaded)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url?.includes('https://meet.google.com')) {
        scriptManager.checkAndInjectScript(tabId);
        scriptManager.testConnection(tabId);
    }
});

// Save participant data to Firestore
async function saveParticipantData(data) {
    try {
        const docRef = doc(db, "participants", `participant-${Date.now()}`);
        await setDoc(docRef, data);
        console.log("Participant data saved:", data);
    } catch (error) {
        console.error("Error saving participant data to Firestore:", error);
    }
}

// === Script Management ===
const scriptManager = {
    injectedTabs: new Set(),

    // Check if the content script is already running and inject if not
    checkAndInjectScript(tabId) {
        if (this.injectedTabs.has(tabId)) {
            console.log(`Content script already injected in tab ${tabId}`);
            return;
        }

        chrome.scripting.executeScript(
            { target: { tabId }, func: () => window.hasCombinedContentScriptInitialized || false },
            (results) => {
                if (chrome.runtime.lastError) {
                    this.logError(`Error checking content script in tab ${tabId}:`, chrome.runtime.lastError.message);
                    return;
                }

                const isInjected = results?.[0]?.result;
                if (!isInjected) {
                    this.injectContentScript(tabId);
                    this.injectedTabs.add(tabId);
                }
            }
        );
    },

    // Inject the content script
    injectContentScript(tabId) {
        chrome.scripting.executeScript(
            { target: { tabId }, files: ['js/content.js'] },
            () => {
                if (chrome.runtime.lastError) {
                    this.logError(`Error injecting content script in tab ${tabId}:`, chrome.runtime.lastError.message);
                } else {
                    console.log(`Content script injected successfully in tab ${tabId}.`);
                    this.sendStartTrackingMessage(tabId);
                }
            }
        );
    },

    // Test connection with the content script
    testConnection(tabId) {
        chrome.tabs.sendMessage(tabId, { message: 'testConnection' }, (response) => {
            if (chrome.runtime.lastError) {
                this.logError(`Error testing connection with tab ${tabId}:`, chrome.runtime.lastError.message);
            } else {
                console.log(`Content script in tab ${tabId} responded:`, response);
            }
        });
    },

    // Send a message to the content script to start tracking
    sendStartTrackingMessage(tabId) {
        chrome.tabs.sendMessage(tabId, { message: 'runTracking' }, (response) => {
            if (chrome.runtime.lastError) {
                this.logError(`Error sending start tracking message to tab ${tabId}:`, chrome.runtime.lastError.message);
            } else {
                console.log(`Start tracking message sent to tab ${tabId}. Response:`, response);
            }
        });
    },

    // Centralized error logging
    logError(message, error) {
        console.error(message, error);
    },
};

// === API Manager ===
const apiManager = {
    async callLocalhostAPI(endpoint, method = 'GET', data = null) {
        const url = `http://localhost/${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const result = await response.json();
            console.log('API Response:', result);
            return result;
        } catch (error) {
            console.error('Error during API call:', error);
        }
    },
};

// === Messaging ===
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        if (message.action === 'fetchData') {
            // Fetch participant activity data from storage
            chrome.storage.local.get('participantActivity', async (result) => {
                if (chrome.runtime.lastError) {
                    scriptManager.logError('Error fetching data from storage:', chrome.runtime.lastError.message);
                    sendResponse({ error: chrome.runtime.lastError.message });
                } else {
                    const data = result.participantActivity || {};
                    console.log('Fetched participant activity data:', data);

                    // Save to Firestore
                    saveParticipantData(data);

                    // Send data to the local XAMPP API
                    await apiManager.callLocalhostAPI('api/participant', 'POST', data);

                    sendResponse({ data });
                }
            });
            return true; // Keep the channel open for async response
        }

        if (message.type === 'updateData') {
            console.log('Update data message received:', message.data);
            // Add update logic if necessary
        }
    } catch (error) {
        scriptManager.logError('Error handling message:', error.message);
        sendResponse({ error: error.message });
    }
});

// === Error Handling ===

// Clean up injectedTabs when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
    if (scriptManager.injectedTabs.has(tabId)) {
        scriptManager.injectedTabs.delete(tabId);
        console.log(`Cleaned up tab ${tabId} from injectedTabs set.`);
    }
});

// Optional: Add debug logs for testing and development
console.debug = (message, ...args) => {
    if (chrome.runtime.getManifest().version_name === 'development') {
        console.log(`DEBUG: ${message}`, ...args);
    }
};


