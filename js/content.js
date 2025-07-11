(function () {
    if (!window.hasCombinedContentScriptInitialized) {
        window.hasCombinedContentScriptInitialized = true;

      const utils = {
    formatTime: (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}m ${seconds}s`;
    },

    debounce: (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    },

    isElementVisible: (element) => {
        if (element && element.getBoundingClientRect) {
            const rect = element.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
        }
        return false;
    },

    getMeetingId: () => {
        return window.location.href;
    },

    resetData: () => {
        console.log('New meeting detected. Resetting data...');
        chrome.storage.local.get(['history', 'currentMeetingId'], (result) => {
            const previousHistory = result.history || {};
            const storedMeetingId = result.currentMeetingId;
            
            // Preserve history of previous meetings
            const updatedHistory = { ...previousHistory, [storedMeetingId]: previousHistory[storedMeetingId] || [] };
            
            chrome.storage.local.set({ 
                history: updatedHistory, 
                currentMeetingId: utils.getMeetingId() 
            }, () => {
                console.log('History preserved, and meeting ID updated.');
            });
        });
    }
};

const currentMeetingId = utils.getMeetingId();

chrome.storage.local.get(['currentMeetingId', 'history'], (result) => {
    const storedMeetingId = result.currentMeetingId;
    const history = result.history || {};

    if (storedMeetingId !== currentMeetingId) {
        utils.resetData();
    } else {
        console.log('Meeting ID matches. No reset needed.');
    }

    // Log current history for debugging
    console.log('Current history:', history);
});


        const videoTracking = (() => {
            let loggedParticipants = {}; // Initialize as empty, will load from chrome.storage.local
            const observer = new MutationObserver(utils.debounce(checkParticipants, 300));

            let isTracking = false; // Flag to control tracking state

            // Function to load initial data from storage
            async function loadInitialData() {
                return new Promise((resolve) => {
                    chrome.storage.local.get(['loggedParticipants'], (result) => {
                        loggedParticipants = result.loggedParticipants || {};
                        console.log("Loaded initial loggedParticipants from storage:", loggedParticipants);
                        resolve();
                    });
                });
            }

            function startTracking() {
                if (!isTracking) {
                    isTracking = true;
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true,
                        attributes: true,
                        attributeFilter: ['style', 'class', 'data-*']
                    });
                    console.log("Video tracking started.");
                }
            }

            function stopTracking() {
                if (isTracking) {
                    isTracking = false;
                    observer.disconnect();
                    console.log("Video tracking stopped.");
                }
            }

            function checkParticipants() {
                if (!isTracking) return; // Only track if tracking is enabled

                const groupedElements = {};

                // Group elements by tag
                ["div", "span", "p", "h1", "h2", "h3", "h4", "h5", "h6"].forEach((tag) => {
                    document.querySelectorAll(tag).forEach((el) => {
                        if (isInsidePeoplePanel(el)) return;

                        const ariaHidden = el.getAttribute("aria-hidden") === "true";
                        const hasRoleTooltip = el.getAttribute("role") === "tooltip";
                        const hasHoverState = el.classList.contains("hover");

                        if (el.innerText.trim() && el.children.length === 0 && !ariaHidden && !hasRoleTooltip && !hasHoverState) {
                            const className = el.className || "no-class";
                            if (!groupedElements[className]) groupedElements[className] = [];
                            groupedElements[className].push({
                                element: el,
                                depth: calculateDepth(el),
                            });
                        }
                    });
                });

                Object.entries(groupedElements).forEach(([className, group]) => {
                    if (group.length > 1 && group.every((item) => item.depth === group[0].depth)) {
                        const elements = group.map((item) => item.element);
                        const commonParent = findFirstCommonParent(elements);

                        elements.forEach((element) => {
                            const parentAfterCommon = findParentAfterCommon(element, commonParent);
                            const hasVisibleVideo = checkForVisibleVideo(parentAfterCommon);
                            let participantName = element.innerText.trim();

                            // Improved participant name fallback
                            if (!participantName) {
                                participantName = "No name available";  // Fallback name if not found
                            }

                            if (hasVisibleVideo) {
                                if (!loggedParticipants[participantName]) {
                                    loggedParticipants[participantName] = {
                                        startTime: Date.now(),
                                        totalCameraTime: 0, // Store camera time in minutes
                                        name: participantName,  // Store the name correctly
                                    };
                                    console.log("Participant with active camera:", participantName);
                                } else if (!loggedParticipants[participantName].startTime) {
                                    loggedParticipants[participantName].startTime = Date.now();
                                    console.log(`${participantName}: Camera turned ON again. Previous time is preserved.`);
                                }
                            } else if (loggedParticipants[participantName] && loggedParticipants[participantName].startTime) {
                                const now = Date.now();
                                const sessionTime = now - loggedParticipants[participantName].startTime; // Time in milliseconds
                                loggedParticipants[participantName].totalCameraTime += sessionTime; // Accumulate time in milliseconds
                                console.log(`${participantName}: Camera turned off. Total Camera Time: ${utils.formatTime(loggedParticipants[participantName].totalCameraTime)}`);
                                loggedParticipants[participantName].startTime = null;
                            }

                        });
                    }
                });

                // Store updated data in local storage
                chrome.storage.local.set({ 'loggedParticipants': loggedParticipants }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('Error saving loggedParticipants to chrome.storage.local:', chrome.runtime.lastError);
                    } else {
                        console.log('loggedParticipants saved to chrome.storage.local');
                    }
                });

                // Send updated data to dashboard.js
                chrome.runtime.sendMessage({
                    message: 'updateParticipantData',
                    data: loggedParticipants
                });
            }

            function isInsidePeoplePanel(element) {
                const peoplePanel = document.querySelector('div[role="list"].AE8xFb');
                const isPanelVisible = peoplePanel && window.getComputedStyle(peoplePanel).display !== 'none';
                return isPanelVisible && peoplePanel.contains(element);
            }

            function checkForVisibleVideo(parent) {
                const videos = parent ? parent.getElementsByTagName("video") : [];
                return Array.from(videos).some((video) => video.style.display !== "none" && !video.hidden && video.readyState > 0);
            }

            function calculateDepth(el) {
                let depth = 0;
                while (el.parentElement) {
                    depth++;
                    el = el.parentElement;
                }
                return depth;
            }

            function findFirstCommonParent(elements) {
                const paths = elements.map((el) => {
                    const path = [];
                    while (el) {
                        path.unshift(el);
                        el = el.parentElement;
                    }
                    return path;
                });

                let commonParent = null;
                for (let i = 0; i < paths[0].length; i++) {
                    const current = paths[0][i];
                    if (paths.every((path) => path[i] === current)) {
                        commonParent = current;
                    } else {
                        break;
                    }
                }
                return commonParent;
            }

            function findParentAfterCommon(element, commonParent) {
                let parent = element.parentElement;
                while (parent && parent !== commonParent) {
                    if (parent.parentElement === commonParent) {
                        return parent;
                    }
                    parent = parent.parentElement;
                }
                return null;
            }

            return { startTracking, stopTracking };
        })();
        
const handRaiseTracking = (() => {
    const SELECTORS = {
        participantName: '.zWGUib',
        micIcon: '.JHK7jb.Nep7Ue',
        raisedHandButton: 'button[aria-label*="Lower"]',
        participantContainer: '.cxdMu',
        micOffClass: 'FTMc0c',
    };

    let participantStates = JSON.parse(localStorage.getItem('participantStates')) || {};
    let saveInterval = null;  // Reference for the auto-save interval

    // Add loadInitialData function
    async function loadInitialData() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['participantStates'], (result) => {
                participantStates = result.participantStates || {};
                console.log("Loaded initial participantStates from storage:", participantStates);
                resolve();
            });
        });
    }

    function initializeParticipantState(name) {
        if (!participantStates[name]) {
            participantStates[name] = createNewParticipantState(name);
        }
    }

    function createNewParticipantState(name) {
        return {
            name,
            mic: { on: false, startTime: null, totalTime: 0 },
            isHandRaised: false,
            handRaiseCount: 0,
            handRaisedTimestamp: 0,
            sessionStart: Date.now(),
            totalSessionTime: 0,
            hasLeft: false,
            inactiveSince: null,
        };
    }

    function trackParticipantStates() {
        try {
            const participantElements = document.querySelectorAll(SELECTORS.participantName);
            const activeParticipants = new Set();

            participantElements.forEach((el) => {
                const name = el.textContent.trim().toLowerCase();
                initializeParticipantState(name);

                const container = el.closest(SELECTORS.participantContainer);
                if (!container) return;

                const micOn = utils.isElementVisible(container.querySelector(SELECTORS.micIcon)) &&
                    !container.querySelector(SELECTORS.micIcon)?.classList.contains(SELECTORS.micOffClass);
                updateMicState(name, micOn);

                const isHandRaised = !!container.querySelector(SELECTORS.raisedHandButton);
                updateHandRaiseState(name, isHandRaised);

                activeParticipants.add(name);
            });

            markInactiveParticipants(activeParticipants);
            saveParticipantData(); // Save data after every tracking pass
        } catch (error) {
            console.error('Error tracking participants:', error);
        }
    }

    function updateMicState(name, micOn) {
        const state = participantStates[name];
        if (!state) return;

        const now = Date.now();
        if (micOn !== state.mic.on) {
            if (micOn) {
                state.mic.startTime = now;
                console.log(`${name}: Microphone turned ON`);
            } else if (state.mic.startTime) {
                state.mic.totalTime += now - state.mic.startTime;
                console.log(`${name}: Microphone turned OFF, Total Mic Time: ${utils.formatTime(state.mic.totalTime)}`);
                state.mic.startTime = null;
            }
            state.mic.on = micOn;
        } else if (micOn && state.mic.startTime) {
            // Continuously update mic time if it's on
            state.mic.totalTime += now - state.mic.startTime;
            state.mic.startTime = now; // Update the start time to avoid large jumps
        }
    }

    function updateHandRaiseState(name, isHandRaised) {
        const state = participantStates[name];
        if (!state) return;

        const now = Date.now();
        if (isHandRaised !== state.isHandRaised && (now - state.handRaisedTimestamp > 8000)) {
            state.isHandRaised = isHandRaised;
            state.handRaisedTimestamp = now;

            if (isHandRaised) {
                state.handRaiseCount++;
                console.log(`${name}: Hand Raised - Count: ${state.handRaiseCount}`);
            }
        }
    }

    function markInactiveParticipants(activeParticipants) {
        Object.keys(participantStates).forEach((name) => {
            const state = participantStates[name];
            const now = Date.now();

            if (!activeParticipants.has(name)) {
                if (!state.hasLeft) {
                    state.hasLeft = true;
                    state.inactiveSince = now;
                    state.totalSessionTime += now - state.sessionStart;
                    console.log(`${name} left the meeting. Total session time: ${utils.formatTime(state.totalSessionTime)}`);
                }
            } else if (state.hasLeft) {
                state.hasLeft = false;
                state.sessionStart = now;
                console.log(`${name} rejoined the meeting.`);
            }
        });
    }

    function saveParticipantData() {
        try {
            if (chrome && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ participantStates: participantStates }, function () {
                    if (chrome.runtime.lastError) {
                        console.error('Error saving to chrome.storage.local:', chrome.runtime.lastError);
                    } else {
                        console.log('Participant data saved to chrome.storage.local');
                    }
                });
            } else {
                localStorage.setItem('participantStates', JSON.stringify(participantStates));
                console.log('Fallback: Participant data saved to localStorage');
            }
        } catch (error) {
            console.error('Error saving participant data:', error);
        }
    }

    function observeParticipantChanges() {
        const observer = new MutationObserver(() => {
            trackParticipantStates();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Update startAutoSaving function
    function startAutoSaving() {
        if (!saveInterval) {
            saveInterval = setInterval(trackParticipantStates, 3000);
            console.log('Auto-saving started');
        }
    }

    function stopAutoSaving() {
        if (saveInterval) {
            clearInterval(saveInterval);
            saveInterval = null;
            console.log('Auto-saving stopped');
        }
    }

    return { trackParticipantStates, observeParticipantChanges, startAutoSaving, stopAutoSaving };
})();


function createControlButtons() {
    // Create a toggle button to show/hide the control panel
    const toggleButton = document.createElement('button');
    toggleButton.innerHTML = '&#x25C0;'; // Left arrow icon
    toggleButton.style.position = 'fixed';
    toggleButton.style.top = '20px';
    toggleButton.style.right = '0';
    toggleButton.style.zIndex = 10000;
    toggleButton.style.padding = '10px 15px';
    toggleButton.style.border = 'none';
    toggleButton.style.borderRadius = '5px 0 0 5px';
    toggleButton.style.backgroundColor = '#333';
    toggleButton.style.color = '#fff';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.boxShadow = '0 3px 8px rgba(0, 0, 0, 0.2)';
    toggleButton.style.transition = 'transform 0.3s ease, background-color 0.3s ease';
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.setAttribute('aria-label', 'Open Control Panel');
    toggleButton.title = 'Open Control Panel';

    // Create the control panel container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.position = 'fixed';
    buttonContainer.style.top = '0';
    buttonContainer.style.right = '-300px'; // Initially hidden
    buttonContainer.style.zIndex = 9999;
    buttonContainer.style.height = '100%';
    buttonContainer.style.width = '300px';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.flexDirection = 'column';
    buttonContainer.style.alignItems = 'center';
    buttonContainer.style.gap = '15px';
    buttonContainer.style.padding = '20px';
    buttonContainer.style.backgroundColor = '#17202a';
    buttonContainer.style.borderLeft = '2px solid rgba(0, 0, 0, 0.1)';
    buttonContainer.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
    buttonContainer.style.transition = 'right 0.3s ease';

    // Add a title to the control panel
    const title = document.createElement('h3');
    title.innerText = 'Tracking Controls';
    title.style.margin = '0 0 10px 0';
    title.style.fontSize = '18px';
    title.style.fontWeight = 'bold';
    title.style.color = '#ecf0f1';
    buttonContainer.appendChild(title);

    // Create a status indicator
    const statusIndicator = document.createElement('p');
    statusIndicator.innerText = 'Status: Idle';
    statusIndicator.style.margin = '10px 0';
    statusIndicator.style.fontSize = '14px';
    statusIndicator.style.color = '#666';
    buttonContainer.appendChild(statusIndicator);

    // Create Start and Stop buttons
    const createButton = (text, color) => {
        const button = document.createElement('button');
        button.innerText = text;
        button.style.width = '100%';
        button.style.padding = '12px';
        button.style.fontSize = '16px';
        button.style.fontWeight = 'bold';
        button.style.border = 'none';
        button.style.borderRadius = '6px';
        button.style.backgroundColor = color;
        button.style.color = '#fff';
        button.style.cursor = 'pointer';
        button.style.boxShadow = '0 3px 8px rgba(0, 0, 0, 0.15)';
        button.style.transition = 'background-color 0.3s ease, transform 0.2s ease';
        button.addEventListener('mouseover', () => {
            button.style.transform = 'scale(1.05)';
        });
        button.addEventListener('mouseout', () => {
            button.style.transform = 'scale(1)';
        });
        return button;
    };

    const startButton = createButton('Start Tracking', '#4CAF50');
    const stopButton = createButton('Stop Tracking', '#F44336');

    // Initial button states
    stopButton.disabled = true;
    stopButton.style.opacity = '0.6';
    stopButton.style.cursor = 'not-allowed';

    // Add functionality to the Start and Stop buttons
    startButton.addEventListener('click', () => {
        console.log('Tracking started');
        videoTracking.startTracking();
        handRaiseTracking.observeParticipantChanges();
        handRaiseTracking.startAutoSaving();
        statusIndicator.innerText = 'Status: Tracking Active';
        statusIndicator.style.color = '#4CAF50';
        startButton.disabled = true;
        startButton.style.opacity = '0.6';
        startButton.style.cursor = 'not-allowed';
        stopButton.disabled = false;
        stopButton.style.opacity = '1';
        stopButton.style.cursor = 'pointer';
    });

    stopButton.addEventListener('click', () => {
        console.log('Tracking stopped');
        videoTracking.stopTracking();
        handRaiseTracking.stopAutoSaving();
        statusIndicator.innerText = 'Status: Tracking Stopped';
        statusIndicator.style.color = '#F44336';
        startButton.disabled = false;
        startButton.style.opacity = '1';
        startButton.style.cursor = 'pointer';
        stopButton.disabled = true;
        stopButton.style.opacity = '0.6';
        stopButton.style.cursor = 'not-allowed';
    });

    // Add buttons to the control panel
    buttonContainer.appendChild(startButton);
    buttonContainer.appendChild(stopButton);

    // Instructions Section
    const instructions = document.createElement('div');
    instructions.style.width = '100%';
    instructions.style.marginTop = '0px';
    instructions.style.borderTop = '1px solid rgba(0, 0, 0, 0.1)';
    instructions.style.paddingTop = '3px';

    const instructionsTitle = document.createElement('h4');
    instructionsTitle.innerText = 'How to Use Tracking';
    instructionsTitle.style.fontSize = '16px';
    instructionsTitle.style.fontWeight = 'bold';
    instructionsTitle.style.color = '#ecf0f1';
    instructionsTitle.style.marginBottom = '10px';
    instructions.appendChild(instructionsTitle);

    const steps = [
        'Ensure the Layout is set to Tile Mode for tracking visibility.',
        'Open the Participants panel to track hand raises and microphone usage.',
        'Press "Start Tracking" to begin monitoring participants.',
        'Use "Stop Tracking" to pause monitoring when needed.',
        'Check the status indicator to confirm tracking activity.'
    ];

    steps.forEach((step, index) => {
        const stepTile = document.createElement('div');
        stepTile.style.display = 'flex';
        stepTile.style.alignItems = 'flex-start';
        stepTile.style.marginBottom = '10px';
        stepTile.style.padding = '10px';
        stepTile.style.backgroundColor = '#f9f9f9';
        stepTile.style.border = '1px solid rgba(0, 0, 0, 0.1)';
        stepTile.style.borderRadius = '6px';

        const stepNumber = document.createElement('span');
        stepNumber.innerText = `${index + 1}. `;
        stepNumber.style.fontWeight = 'bold';
        stepNumber.style.marginRight = '5px';
        stepNumber.style.color = '#333';

        const stepText = document.createElement('p');
        stepText.innerText = step;
        stepText.style.margin = '0';
        stepText.style.fontSize = '14px';
        stepText.style.color = '#17202a ';

        stepTile.appendChild(stepNumber);
        stepTile.appendChild(stepText);
        instructions.appendChild(stepTile);
    });

    buttonContainer.appendChild(instructions);

    // Toggle the visibility of the control panel
    toggleButton.addEventListener('click', () => {
        const isOpen = buttonContainer.style.right === '0px';
        buttonContainer.style.right = isOpen ? '-400px' : '0px';
        toggleButton.innerHTML = isOpen ? '&#x25C0;' : '&#x25B6;'; // Toggle arrow direction
        toggleButton.setAttribute('aria-expanded', !isOpen);
        toggleButton.setAttribute('aria-label', isOpen ? 'Open Control Panel' : 'Close Control Panel');
    });

    // Append the toggle button and control panel to the document body
    document.body.appendChild(toggleButton);
    document.body.appendChild(buttonContainer);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.message === 'testConnection') {
        console.log('Received test connection message from background script.');
        sendResponse({ status: 'Connection successful' });
    }
});

videoTracking.startTracking();
handRaiseTracking.observeParticipantChanges();
createControlButtons();


    }
})();
