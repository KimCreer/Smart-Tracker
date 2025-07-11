// Function to initialize and render the chart
function renderChart(data) {
    const ctx = document.getElementById('dataChart')?.getContext('2d');

    if (!ctx) {
        console.error('Chart context not found.');
        return;
    }

    // Destroy existing chart if it exists
    if (window.participationChart) {
        window.participationChart.destroy();
    }

    window.participationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.participantNames || [],
            datasets: [
                {
                    label: 'Raised Hands',
                    data: data.raisedHands || [],
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Total Microphone Time (s)',
                    data: data.micTimes || [],
                    backgroundColor: 'rgba(255, 159, 64, 0.6)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Participants',
                        font: {
                            weight: 'bold'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Count / Time (s)',
                        font: {
                            weight: 'bold'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#fff',
                    borderWidth: 1,
                    callbacks: {
                        label: (tooltipItem) => {
                            const label = tooltipItem.dataset.label;
                            const value = tooltipItem.raw;
                            if (label.includes('Time')) {
                                const minutes = Math.floor(value / 60);
                                const seconds = Math.floor(value % 60);
                                return `${label}: ${minutes}m ${seconds}s`;
                            } else {
                                return `${label}: ${value}`;
                            }
                        }
                    }
                }
            }
        }
    });
}

// Function to initialize and render the camera time chart
function renderCameraChart(data) {
    const ctx = document.getElementById('cameraTimeChart')?.getContext('2d');

    if (!ctx) {
        console.error('Camera chart context not found.');
        return;
    }

    // Destroy existing chart if it exists
    if (window.cameraChart) {
        window.cameraChart.destroy();
    }

    window.cameraChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.participantNames || [],
            datasets: [
                {
                    label: 'Total Camera Time (s)',
                    data: data.cameraTimes || [],
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Participants',
                        font: {
                            weight: 'bold'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Time (s)',
                        font: {
                            weight: 'bold'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#fff',
                    borderWidth: 1,
                    callbacks: {
                        label: (tooltipItem) => {
                            const label = tooltipItem.dataset.label;
                            const value = tooltipItem.raw;
                            const minutes = Math.floor(value / 60);
                            const seconds = Math.floor(value % 60);
                            return `${label}: ${minutes}m ${seconds}s`;
                        }
                    }
                }
            }
        }
    });
}

// Function to update participant list
function updateParticipantList(participants) {
    const container = document.getElementById('participant-list-container');
    if (!container) return;

    // Add filter dropdown if it doesn't exist
    let filterContainer = document.getElementById('participant-filter-container');
    if (!filterContainer) {
        filterContainer = document.createElement('div');
        filterContainer.id = 'participant-filter-container';
        filterContainer.className = 'filter-container';
        
        const filterLabel = document.createElement('span');
        filterLabel.className = 'filter-label';
        filterLabel.textContent = 'Filter by:';
        
        const filterSelect = document.createElement('select');
        filterSelect.id = 'participant-status-filter';
        filterSelect.className = 'status-filter';
        
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'All Participants';
        
        const activeOption = document.createElement('option');
        activeOption.value = 'active';
        activeOption.textContent = 'Active';
        
        const inactiveOption = document.createElement('option');
        inactiveOption.value = 'inactive';
        inactiveOption.textContent = 'Inactive';
        
        filterSelect.appendChild(allOption);
        filterSelect.appendChild(activeOption);
        filterSelect.appendChild(inactiveOption);
        
        filterContainer.appendChild(filterLabel);
        filterContainer.appendChild(filterSelect);
        container.parentElement.insertBefore(filterContainer, container);
        
        // Add event listener for filter change
        filterSelect.addEventListener('change', handleStatusFilterChange);
    }

    container.innerHTML = '';

    if (!participants || participants.length === 0) {
        container.innerHTML = '<div class="no-data">No participants available</div>';
        return;
    }

    participants.forEach(participant => {
        const item = document.createElement('div');
        item.className = 'participant-item';
        
        // Add active/inactive status class
        const isActive = participant.hasMic || participant.hasHandRaised || 
                        (participant.micTime && participant.micTime !== '0m 0s');
        item.classList.add(isActive ? 'active' : 'inactive');
        
        const info = document.createElement('div');
        info.className = 'participant-info';
        
        const name = document.createElement('span');
        name.className = 'participant-name';
        name.textContent = participant.name || 'Unknown';

        const details = document.createElement('div');
        details.className = 'participant-details';

        // Add mic time
        const micTime = document.createElement('div');
        micTime.className = 'participant-detail';
        micTime.innerHTML = `<i class="fas fa-microphone"></i> ${participant.micTime}`;
        details.appendChild(micTime);

        // Add session time
        const sessionTime = document.createElement('div');
        sessionTime.className = 'participant-detail';
        sessionTime.innerHTML = `<i class="fas fa-clock"></i> ${participant.sessionTime}`;
        details.appendChild(sessionTime);

        // Add hand raise count
        const handRaises = document.createElement('div');
        handRaises.className = 'participant-detail';
        handRaises.innerHTML = `<i class="fas fa-hand-paper"></i> ${participant.handRaiseCount || 0} raises`;
        details.appendChild(handRaises);

        // Add attendance rate
        const attendanceRate = document.createElement('div');
        attendanceRate.className = `attendance-rate ${getAttendanceRateClass(participant.attendanceRate)}`;
        attendanceRate.textContent = `${participant.attendanceRate}%`;
        details.appendChild(attendanceRate);

        info.appendChild(name);
        info.appendChild(details);
        item.appendChild(info);

        const status = document.createElement('div');
        status.className = 'participant-status';

        if (participant.hasMic) {
            const micIcon = document.createElement('i');
            micIcon.className = `fas fa-microphone status-icon ${participant.hasMic ? 'active' : 'inactive'}`;
            status.appendChild(micIcon);
        }

        if (participant.hasHandRaised) {
            const handIcon = document.createElement('i');
            handIcon.className = `fas fa-hand-paper status-icon ${participant.hasHandRaised ? 'active' : 'inactive'}`;
            status.appendChild(handIcon);
        }

        item.appendChild(status);
        container.appendChild(item);
    });
}

// Function to update participants with camera on list
function updateCameraParticipantList(cameraParticipants) {
    const container = document.getElementById('camera-participant-list-container');
    if (!container) return;

    // Add filter dropdown if it doesn't exist
    let filterContainer = document.getElementById('camera-participant-filter-container');
    if (!filterContainer) {
        filterContainer = document.createElement('div');
        filterContainer.id = 'camera-participant-filter-container';
        filterContainer.className = 'filter-container';
        
        const filterLabel = document.createElement('span');
        filterLabel.className = 'filter-label';
        filterLabel.textContent = 'Filter by:';
        
        const filterSelect = document.createElement('select');
        filterSelect.id = 'camera-participant-status-filter';
        filterSelect.className = 'status-filter';
        
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'All Camera Participants';
        
        const activeOption = document.createElement('option');
        activeOption.value = 'active';
        activeOption.textContent = 'Active';
        
        const inactiveOption = document.createElement('option');
        inactiveOption.value = 'inactive';
        inactiveOption.textContent = 'Inactive';
        
        filterSelect.appendChild(allOption);
        filterSelect.appendChild(activeOption);
        filterSelect.appendChild(inactiveOption);
        
        filterContainer.appendChild(filterLabel);
        filterContainer.appendChild(filterSelect);
        container.parentElement.insertBefore(filterContainer, container);
        
        // Add event listener for filter change
        filterSelect.addEventListener('change', handleCameraStatusFilterChange);
    }

    container.innerHTML = '';

    if (!cameraParticipants || cameraParticipants.length === 0) {
        container.innerHTML = '<div class="no-data">No participants with camera on</div>';
        return;
    }

    cameraParticipants.forEach(participant => {
        const item = document.createElement('div');
        item.className = 'participant-item';
        
        // Add active/inactive status class
        const isActive = participant.cameraTime && participant.cameraTime !== '0m 0s';
        item.classList.add(isActive ? 'active' : 'inactive');
        
        const info = document.createElement('div');
        info.className = 'participant-info';
        
        const name = document.createElement('span');
        name.className = 'participant-name';
        name.textContent = participant.name || 'Unknown';

        const details = document.createElement('div');
        details.className = 'participant-details';

        // Add camera time
        const cameraTime = document.createElement('div');
        cameraTime.className = 'participant-detail';
        cameraTime.innerHTML = `<i class="fas fa-video"></i> ${participant.cameraTime}`;
        details.appendChild(cameraTime);

        info.appendChild(name);
        info.appendChild(details);
        item.appendChild(info);

        // Add status icon for camera (always active in this list)
        const status = document.createElement('div');
        status.className = 'participant-status';
        const cameraIcon = document.createElement('i');
        cameraIcon.className = `fas fa-video status-icon active`;
        status.appendChild(cameraIcon);

        item.appendChild(status);
        container.appendChild(item);
    });
}

// Function to get attendance rate class
function getAttendanceRateClass(rate) {
    const numRate = parseFloat(rate);
    if (numRate >= 75) return 'high';
    if (numRate >= 50) return 'medium';
    return 'low';
}

// Function to update statistics
function updateStats(data) {
    const stats = {
        totalParticipants: data.participantNames?.length || 0,
        totalHandRaises: data.raisedHands?.reduce((a, b) => a + b, 0) || 0,
        activeCameras: data.activeCameras?.filter(cam => cam > 0).length || 0
    };

    document.getElementById('total-participants').textContent = stats.totalParticipants;
    document.getElementById('total-hand-raises').textContent = stats.totalHandRaises;
    document.getElementById('active-cameras').textContent = stats.activeCameras;
}

// Function to load participation data from Chrome storage and render it in the popup
function loadData() {
    chrome.storage.local.get(['participantStates', 'loggedParticipants', 'userInfo'], (result) => {
        if (chrome.runtime.lastError) {
            console.error('Error loading data:', chrome.runtime.lastError);
            showFeedback('Failed to load data. Please try again.');
            return;
        }

        const participantStates = result.participantStates || {};
        const loggedParticipants = result.loggedParticipants || {};
        
        // Filter participants for the 'Active Participants' list
        const activeParticipantsData = Object.values(participantStates).map(participant => {
             const sessionTime = participant.totalSessionTime || 0;

             return {
                 name: participant.name || 'Unknown',
                 hasMic: participant.hasMic || false,
                 hasHandRaised: participant.handRaiseCount > 0,
                 micTime: formatTime(participant.mic?.totalTime || 0),
                 sessionTime: formatTime(sessionTime),
                 attendanceRate: calculateAttendanceRate(participant),
                 handRaiseCount: participant.handRaiseCount || 0
             };
         });

         // Filter participants for the 'Participants with Camera On' list
         const cameraParticipantsList = Object.values(loggedParticipants).map(participant => {
              const cameraTime = participant.totalCameraTime || 0;

              return {
                  name: participant.name || 'Unknown',
                  cameraTime: formatTime(cameraTime)
              };
         });

        // Calculate total statistics (for the stats cards)
        const allParticipants = Object.values(participantStates); // Use all participants for total counts
        const totalHandRaises = allParticipants.reduce((sum, p) => sum + (p.handRaiseCount || 0), 0);
        const totalMicTime = allParticipants.reduce((sum, p) => sum + (p.mic?.totalTime || 0), 0);
        const averageMicTime = allParticipants.length > 0 ? totalMicTime / allParticipants.length : 0;
        const activeCamerasCount = Object.values(loggedParticipants).length; // Count from loggedParticipants for active cameras

        // Update stats display
        document.getElementById('total-participants').textContent = allParticipants.length;
        document.getElementById('total-hand-raises').textContent = totalHandRaises;
        document.getElementById('average-mic-time').textContent = formatTime(averageMicTime);
        document.getElementById('active-cameras').textContent = activeCamerasCount;

        // Prepare data for chart (using all participants for overview)
        const chartData = {
            participantNames: allParticipants.map(p => p.name || 'Unknown'),
            raisedHands: allParticipants.map(p => p.handRaiseCount || 0), // Ensure handRaiseCount is used
            micTimes: allParticipants.map(p => (p.mic?.totalTime || 0) / 1000) // Get total time in seconds
        };

        renderChart(chartData);
        
        // Prepare data for camera chart (using loggedParticipants)
        const cameraChartData = {
             participantNames: Object.values(loggedParticipants).map(p => p.name || 'Unknown'),
             cameraTimes: Object.values(loggedParticipants).map(p => (p.totalCameraTime || 0) / 1000) // Get total time in seconds from loggedParticipants
        };

        renderCameraChart(cameraChartData);

        // Update participant lists
        updateParticipantList(activeParticipantsData);
        updateCameraParticipantList(cameraParticipantsList);

        // Update user info if available
        if (result.userInfo) {
            updateProfile(result.userInfo);
        } else {
            updateProfile(null); // Reset profile if no user info
        }

         // Re-attach search event listeners after updating the list containers
         setupSearchListeners();
    });
}

// Function to show feedback message
function showFeedback(message, duration = 3000) {
    const feedback = document.getElementById('feedback-message');
    if (!feedback) return;

    feedback.textContent = message;
    feedback.classList.add('visible');

    setTimeout(() => {
        feedback.classList.remove('visible');
    }, duration);
}

// Function to handle Google Login
function handleGoogleLogin() {
    chrome.identity.launchWebAuthFlow(
        {
            url: `https://accounts.google.com/o/oauth2/auth?client_id=433023796706-a8kt3pllaaapl1td9prfnt7gfd08g1rn.apps.googleusercontent.com&redirect_uri=https://${chrome.runtime.id}.chromiumapp.org&response_type=token&scope=profile email`,
            interactive: true
        },
        (redirectUrl) => {
            if (redirectUrl) {
                const token = new URL(redirectUrl).hash.match(/access_token=([^&]*)/)[1];
                console.log("Access Token:", token);

                // Fetch user info
                fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
                    headers: { Authorization: `Bearer ${token}` }
                })
                    .then((response) => response.json())
                    .then((userInfo) => {
                        console.log("User Info:", userInfo);
                        chrome.storage.local.set({ userInfo: userInfo });
                        updateProfile(userInfo);
                        showFeedback('Login successful!');
                    })
                    .catch(error => {
                        console.error('Login error:', error);
                        showFeedback('Login failed. Please try again.');
                    });
            } else {
                console.error("OAuth failed or was canceled.");
                showFeedback('Login canceled.');
            }
        }
    );
}

// Function to update profile UI
function updateProfile(userInfo) {
    const profilePic = document.getElementById('profile-pic');
    const userName = document.getElementById('user-name');
    const actionButton = document.getElementById('action-button');
    const actionButtonText = document.getElementById('action-button-text');
    const actionButtonIcon = actionButton.querySelector('i');

    if (userInfo) {
        // User is logged in
        if (profilePic) profilePic.src = userInfo.picture;
        if (userName) userName.textContent = userInfo.name;
        
        // Update button to show dashboard
        if (actionButton) {
            actionButton.className = 'action-button dashboard-button';
            actionButtonIcon.className = 'fas fa-chart-bar';
            if (actionButtonText) actionButtonText.textContent = 'Open Dashboard';
        }
    } else {
        // User is logged out
        if (profilePic) profilePic.src = '';
        if (userName) userName.textContent = '';
        
        // Update button to show login
        if (actionButton) {
            actionButton.className = 'action-button google-login';
            actionButtonIcon.className = 'fab fa-google';
            if (actionButtonText) actionButtonText.textContent = 'Login with Google';
        }
    }
}

// Function to handle action button click
function handleActionButtonClick() {
    chrome.storage.local.get('userInfo', (result) => {
        if (result.userInfo) {
            // User is logged in, open dashboard
            chrome.runtime.openOptionsPage();
        } else {
            // User is not logged in, trigger login
            handleGoogleLogin();
        }
    });
}

// Function to format time
function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
}

// Function to calculate attendance rate
function calculateAttendanceRate(participant) {
    const handRaiseCount = participant.handRaiseCount || 0;
    const micTime = participant.mic && participant.mic.totalTime ? participant.mic.totalTime : 0;
    const sessionTime = participant.totalSessionTime || 0;

    const maxHandRaiseCount = 50;
    const maxMicTime = 180000;
    const maxSessionTime = 3600000;

    const weightHandRaise = 0.3;
    const weightMicTime = 0.4;
    const weightSessionTime = 0.3;

    const normalizedHandRaise = Math.min(handRaiseCount / maxHandRaiseCount, 1) * weightHandRaise;
    const normalizedMicTime = Math.min(micTime / maxMicTime, 1) * weightMicTime;
    const normalizedSessionTime = Math.min(sessionTime / maxSessionTime, 1) * weightSessionTime;

    const attendanceRate = (normalizedHandRaise + normalizedMicTime + normalizedSessionTime) * 100;
    return attendanceRate.toFixed(2);
}

// Function to filter participants by search term and status
function filterParticipants(containerId, searchTerm, statusFilter = 'all') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const items = container.getElementsByClassName('participant-item');
    searchTerm = searchTerm.toLowerCase();
    
    Array.from(items).forEach(item => {
        const name = item.querySelector('.participant-name').textContent.toLowerCase();
        const isActive = item.classList.contains('active');
        const matchesSearch = name.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'active' && isActive) || 
                            (statusFilter === 'inactive' && !isActive);
        
        item.style.display = (matchesSearch && matchesStatus) ? 'flex' : 'none';
    });
}

// Function to handle status filter change
function handleStatusFilterChange(e) {
    const searchTerm = document.getElementById('participant-search')?.value || '';
    filterParticipants('participant-list-container', searchTerm, e.target.value);
}

// Function to handle camera status filter change
function handleCameraStatusFilterChange(e) {
    const searchTerm = document.getElementById('camera-participant-search')?.value || '';
    filterParticipants('camera-participant-list-container', searchTerm, e.target.value);
}

// Function to set up search listeners for both lists
function setupSearchListeners() {
    const activeSearchInput = document.getElementById('participant-search');
    if (activeSearchInput) {
        activeSearchInput.removeEventListener('input', handleActiveSearchInput);
        activeSearchInput.addEventListener('input', handleActiveSearchInput);
    }

    const cameraSearchInput = document.getElementById('camera-participant-search');
    if (cameraSearchInput) {
        cameraSearchInput.removeEventListener('input', handleCameraSearchInput);
        cameraSearchInput.addEventListener('input', handleCameraSearchInput);
    }
}

// Event handler for active participants search input
function handleActiveSearchInput(e) {
    const statusFilter = document.getElementById('participant-status-filter')?.value || 'all';
    filterParticipants('participant-list-container', e.target.value, statusFilter);
}

// Event handler for camera participants search input
function handleCameraSearchInput(e) {
    const statusFilter = document.getElementById('camera-participant-status-filter')?.value || 'all';
    filterParticipants('camera-participant-list-container', e.target.value, statusFilter);
}

// Initialize the popup
document.addEventListener('DOMContentLoaded', () => {
    // Load initial data
    loadData();

    // Set up event listeners for action button
    document.getElementById('action-button')?.addEventListener('click', handleActionButtonClick);

    // Set up search functionality
    setupSearchListeners(); // Initial setup of search listeners

    // Set up periodic refresh
    setInterval(loadData, 5000); // Refresh every 5 seconds
});
