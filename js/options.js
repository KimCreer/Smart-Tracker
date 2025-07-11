document.addEventListener('DOMContentLoaded', () => {
    const trackingIntervalInput = document.getElementById('trackingInterval');
    const saveButton = document.getElementById('saveSettings');

    // Load settings from Chrome storage
    const loadSettings = () => {
        chrome.storage.sync.get(['trackingInterval'], (result) => {
            if (chrome.runtime.lastError) {
                console.error('Error loading settings:', chrome.runtime.lastError);
                alert('Failed to load settings. Please try again.');
                return;
            }
            trackingIntervalInput.value = result.trackingInterval || 5; // Default to 5 if not set
        });
    };

    // Save settings to Chrome storage
    const saveSettings = () => {
        const trackingInterval = trackingIntervalInput.value;

        // Validate input
        if (isNaN(trackingInterval) || trackingInterval <= 0) {
            alert('Please enter a valid positive number for the tracking interval.');
            return;
        }

        chrome.storage.sync.set({ trackingInterval: parseInt(trackingInterval, 10) }, () => {
            if (chrome.runtime.lastError) {
                console.error('Error saving settings:', chrome.runtime.lastError);
                alert('Failed to save settings. Please try again.');
                return;
            }
            alert('Settings saved successfully');
        });
    };

    // Load settings when the page is ready
    loadSettings();

    // Set up event listener for save button
    saveButton.addEventListener('click', saveSettings);
});
