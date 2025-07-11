document.addEventListener("DOMContentLoaded", () => {
    const participantTable = document.getElementById("participant-table");
    const cameraParticipantTable = document.getElementById("camera-participant-table");
    const totalParticipants = document.getElementById("total-participants");
    const totalHandRaises = document.getElementById("total-hand-raises");
    const averageMicTime = document.getElementById("average-mic-time");
    const activeCameraParticipants = document.getElementById("active-camera-participants");
    const exportButton = document.getElementById("export-button");

    const cameraTimeChartCtx = document.getElementById("cameraTimeChart").getContext("2d");
    const handRaiseChartCtx = document.getElementById("handRaiseChart").getContext("2d");

    let cameraTimeChart;
    let handRaiseChart;

    // Format time utility function
    function formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}m ${seconds}s`;
    }

    function calculateAttendanceRate(participant) {
        // Metrics from participant
        const handRaiseCount = participant.handRaiseCount || 0;
        const micTime = participant.mic && participant.mic.totalTime ? participant.mic.totalTime : 0;
        const sessionTime = participant.totalSessionTime || 0;

        // Define the expected maximum values for each metric
        const maxHandRaiseCount = 50; // Expected maximum hand raises
        const maxMicTime = 180000; // 3 minutes in milliseconds
        const maxSessionTime = 3600000; // 1 hour in milliseconds

        // Define weights for each metric (total should sum to 1.0)
        const weightHandRaise = 0.3; // 30% weight
        const weightMicTime = 0.4; // 40% weight
        const weightSessionTime = 0.3; // 30% weight

        // Normalize each metric and apply weights
        const normalizedHandRaise = Math.min(handRaiseCount / maxHandRaiseCount, 1) * weightHandRaise;
        const normalizedMicTime = Math.min(micTime / maxMicTime, 1) * weightMicTime;
        const normalizedSessionTime = Math.min(sessionTime / maxSessionTime, 1) * weightSessionTime;

        // Calculate total attendance rate
        const attendanceRate = (normalizedHandRaise + normalizedMicTime + normalizedSessionTime) * 100;

        return attendanceRate.toFixed(2); // Return attendance rate as a percentage (2 decimal places)
    }

function createBarChart(ctx, labels, data, label, backgroundColor) {
    // Generate gradient for default background
    const gradient = ctx.createLinearGradient(0, 0, 0, 400); // Vertical gradient
    gradient.addColorStop(0, "rgba(75, 192, 192, 0.6)");
    gradient.addColorStop(1, "rgba(153, 102, 255, 0.6)");

    // Ensure raw data is passed directly
    const rawData = data.map(value => parseFloat(value)); // Ensure raw seconds are used

    // Calculate Y-axis max dynamically based on data
    const maxYValue = Math.ceil(Math.max(...rawData) / 10) * 10 || 10; // Round up to nearest 10

    return new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels || [], // Participant names
            datasets: [{
                label: label || "Camera Time (seconds)",
                data: rawData, // Use raw data for the bar heights
                backgroundColor: backgroundColor || gradient,
                borderColor: "rgba(0, 123, 255, 0.8)",
                borderWidth: 2,
                hoverBackgroundColor: "rgba(0, 123, 255, 0.6)",
                hoverBorderColor: "rgba(0, 123, 255, 1)"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                    labels: {
                        font: {
                            size: 14,
                            family: "'Helvetica Neue', 'Arial', sans-serif",
                            weight: 'bold',
                        },
                        boxWidth: 20,
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    titleColor: "#fff",
                    bodyColor: "#fff",
                    footerColor: "#fff",
                    borderColor: "#fff",
                    borderWidth: 1,
                    callbacks: {
                        label: function(tooltipItem) {
                            const totalSeconds = rawData.reduce((a, b) => parseFloat(a) + parseFloat(b), 0); // Total raw seconds
                            const currentValue = tooltipItem.raw; // Current bar value in seconds
                            const percentage = totalSeconds > 0
                                ? Math.round((currentValue / totalSeconds) * 100)
                                : 0; // Avoid division by zero

                            // Format time for tooltip
                            const minutes = Math.floor(currentValue / 60);
                            const seconds = currentValue % 60;
                            const formattedTime = `${minutes}m ${seconds}s`;

                            return `${tooltipItem.label || "No name available"}: ${currentValue} seconds (${formattedTime}, ${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            family: "'Helvetica Neue', 'Arial', sans-serif",
                            weight: 'bold',
                        },
                        color: '#333'
                    }
                },
                y: {
                    max: maxYValue, // Dynamically calculated max value
                    ticks: {
                        beginAtZero: true,
                        stepSize: Math.ceil(maxYValue / 5), // Dynamic step size
                        font: {
                            size: 12,
                            family: "'Helvetica Neue', 'Arial', sans-serif",
                            weight: 'bold',
                        },
                        color: '#333'
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: "easeInOutBounce"
            }
        }
    });
}





// Create a pie chart for hand raise distribution
function createPieChart(ctx, labels, data, backgroundColors) {
    return new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors || ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
                borderWidth: 2,
                hoverOffset: 8,
                hoverBorderColor: "#fff",
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            size: 14,
                            family: "'Helvetica Neue', 'Arial', sans-serif",
                            weight: 'bold',
                        },
                        boxWidth: 20,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    titleColor: "#fff",
                    bodyColor: "#fff",
                    footerColor: "#fff",
                    borderColor: "#fff",
                    borderWidth: 1,
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.label + ': ' + tooltipItem.raw + ' units (' + Math.round((tooltipItem.raw / data.reduce((a, b) => a + b, 0)) * 100) + '%)';
                        }
                    }
                },
                datalabels: {
                    display: true,
                    color: "#fff",
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    formatter: (value, context) => {
                        let percentage = Math.round((value / data.reduce((a, b) => a + b, 0)) * 100);
                        return `${value} (${percentage}%)`;
                    }
                }
            },
            animation: {
                duration: 800,
                easing: "easeInOutQuart"
            }
        }
    });
}


    // Function to update the dashboard with new participant data
function updateDashboard(participantStates, loggedParticipants) {
    const participants = Object.values(participantStates);
    const cameraParticipants = Object.values(loggedParticipants);

    // Update summary
    totalParticipants.textContent = participants.length || 0;
    totalHandRaises.textContent = participants.reduce((acc, p) => acc + p.handRaiseCount, 0);
    const totalMicTime = participants.reduce((acc, p) => acc + p.mic.totalTime, 0);
    averageMicTime.textContent = formatTime(totalMicTime / (participants.length || 1));

    activeCameraParticipants.textContent = cameraParticipants.length || 0;

    // Update participant table with session time and attendance rate
    participantTable.innerHTML = "";
    if (participants.length === 0) {
        participantTable.innerHTML = "<tr><td colspan='6'>No data available</td></tr>";
    } else {
        participants.forEach(participant => {
            const name = participant.name || 'No name available';
            const sessionTime = formatTime(participant.totalSessionTime);  // Ensure it's in minutes and seconds
            const attendanceRate = calculateAttendanceRate(participant);  // Calculate attendance rate
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${name}</td>
                <td>${formatTime(participant.mic.totalTime)}</td>
                <td>${participant.handRaiseCount}</td>
                <td>${sessionTime}</td>
                <td>${attendanceRate}%</td> <!-- Added attendance rate -->
            `;
            participantTable.appendChild(row);
        });
    }

    // Update camera participant table
    cameraParticipantTable.innerHTML = "";
    if (cameraParticipants.length === 0) {
        cameraParticipantTable.innerHTML = "<tr><td colspan='2'>No data available</td></tr>";
    } else {
        cameraParticipants.forEach(participant => {
            const name = participant.name || 'No name available';
            // Format the camera time to show minutes and seconds
            const formattedTime = formatTime(participant.totalCameraTime); // Pass the raw time in seconds
 // Convert to milliseconds for formatTime function
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${name}</td>
                <td>${formattedTime}</td>
            `;
            cameraParticipantTable.appendChild(row);
        });
    }

 // Update Camera Time Distribution chart based on loggedParticipants
const cameraNames = cameraParticipants.map(p => p.name || 'No name available');
const cameraTimes = cameraParticipants.map(p => p.totalCameraTime / 1000); // If in ms

if (!cameraTimeChart) {
    cameraTimeChart = createBarChart(cameraTimeChartCtx, cameraNames, cameraTimes, "Camera Time (seconds)", "rgba(75, 192, 192, 0.6)");
} else {
    cameraTimeChart.data.labels = cameraNames;
    cameraTimeChart.data.datasets[0].data = cameraTimes;
    cameraTimeChart.update();
}




    // Update Hand Raise chart
    const handRaises = participants.map(p => p.handRaiseCount);

    if (handRaiseChart) handRaiseChart.destroy();
    handRaiseChart = createPieChart(handRaiseChartCtx, participants.map(p => p.name || 'No name available'), handRaises);
}

function exportToSpreadsheet() {
    const exportButton = document.getElementById("export-button");
    exportButton.disabled = true;
    exportButton.textContent = "Exporting...";

    const timestamp = new Date();
    const formattedTimestamp = timestamp.toISOString().replace(/T/, "_").replace(/\..+/, "").replace(/:/g, "-");
    const fileName = `attendance_${formattedTimestamp}.xlsx`;

    const parseTableData = (selector) => {
        return Array.from(document.querySelectorAll(`${selector} tbody tr`)).map(row =>
            Array.from(row.cells).map(cell => cell.innerText.trim() || null)
        );
    };

    const participantsData = parseTableData("#participant-details");
    const cameraData = parseTableData("#camera-details");

    if (!participantsData.length && !cameraData.length) {
        showFeedback("No data to export.");
        resetExportButton(exportButton);
        return;
    }

    const ACTIVE_THRESHOLD = 75;

    const classifyParticipants = (data) => {
        return data.reduce(
            (result, row) => {
                const name = row[0];
                const nameParts = name.split(' ');
                const swappedName = nameParts.length >= 2
                    ? `${capitalize(nameParts[nameParts.length - 1])} ${nameParts.slice(0, -1).map(capitalize).join(' ')}`
                    : capitalize(name);

                const updatedRow = [swappedName, ...row.slice(1)];

                const attendanceRate = parseFloat(updatedRow[4]?.replace("%", "") || 0);
                const micTime = updatedRow[1]?.match(/\d+/g)?.map(Number).reduce((a, b) => a * 60 + b, 0) || 0;
                const handRaises = parseInt(updatedRow[2] || "0", 10);
                const cameraTime = cameraData.find(camRow => camRow[0] === updatedRow[0])?.[1]?.match(/\d+/g)?.map(Number).reduce((a, b) => a * 60 + b, 0) || 0;

                if (
                    attendanceRate >= ACTIVE_THRESHOLD ||
                    micTime > 0 ||
                    handRaises > 0 ||
                    cameraTime > 0
                ) {
                    result.active.push(updatedRow);
                } else {
                    result.inactive.push(updatedRow);
                }
                return result;
            },
            { active: [], inactive: [] }
        );
    };

    const classifiedParticipants = classifyParticipants(participantsData);
    const activeParticipants = classifiedParticipants.active;
    const inactiveParticipants = classifiedParticipants.inactive;

    const calculateAverage = (data, index) => {
        const totalSeconds = data.reduce((sum, row) => {
            const timeMatch = row[index]?.match(/\d+/g)?.map(Number);
            return sum + (timeMatch ? timeMatch.reduce((a, b) => a * 60 + b, 0) : 0);
        }, 0);
        const avgSeconds = totalSeconds / data.length || 0;
        const minutes = Math.floor(avgSeconds / 60);
        const seconds = Math.floor(avgSeconds % 60);
        return `${minutes}m ${seconds}s`;
    };

    const avgMicTime = calculateAverage(participantsData, 1);
    const avgRaiseHand = calculateAverage(participantsData, 2);
    const avgCameraTime = calculateAverage(cameraData, 1);

    const sessionDuration = 60;

    const cameraRows = cameraData.map(row => {
        const timeMatch = row[1]?.match(/(\d+)m\s*(\d+)?s?/);
        const minutes = parseFloat(timeMatch?.[1] || 0);
        const seconds = parseFloat(timeMatch?.[2] || 0);
        const totalSeconds = minutes * 60 + seconds;
        const cameraTime = `${minutes}m ${seconds}s`;
        const cameraPercentage = ((totalSeconds / (sessionDuration * 60)) * 100).toFixed(2) + "%";
        return [row[0], cameraTime, cameraPercentage];
    });

    const workbook = XLSX.utils.book_new();

    const addSheetWithStyle = (sheetName, header, rows, averages = null) => {
        try {
            const sheetData = [header, ...rows];
            if (averages) {
                sheetData.push(["Averages:", ...averages]);
            }
            const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

            // Define column widths with error handling
            const colWidths = header.map(col => ({ 
                wch: Math.max(
                    col.length, 
                    ...rows.map(row => ((row[header.indexOf(col)] || '').toString().length || 0))
                ) + 2
            }));
            worksheet['!cols'] = colWidths;

            // Add styles: header, zebra striping, borders
            for (let i = 0; i < sheetData.length; i++) {
                for (let j = 0; j < header.length; j++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: i, c: j });
                    if (!worksheet[cellAddress]) continue;
                    // Header row
                    if (i === 0) {
                        worksheet[cellAddress].s = {
                            font: { bold: true, color: { rgb: "FFFFFF" } },
                            fill: { fgColor: { rgb: "007ACC" } },
                            alignment: { horizontal: "center", vertical: "center" },
                            border: {
                                top:    { style: "thin", color: { rgb: "CCCCCC" } },
                                bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                                left:   { style: "thin", color: { rgb: "CCCCCC" } },
                                right:  { style: "thin", color: { rgb: "CCCCCC" } }
                            }
                        };
                    } else {
                        // Alternate row colors
                        const isEven = i % 2 === 0;
                        worksheet[cellAddress].s = {
                            font: { color: { rgb: "000000" } },
                            fill: { fgColor: { rgb: isEven ? "F3F3F3" : "FFFFFF" } },
                            alignment: { horizontal: "center", vertical: "center" },
                            border: {
                                top:    { style: "thin", color: { rgb: "CCCCCC" } },
                                bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                                left:   { style: "thin", color: { rgb: "CCCCCC" } },
                                right:  { style: "thin", color: { rgb: "CCCCCC" } }
                            }
                        };
                    }
                }
            }

            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        } catch (sheetError) {
            console.error('Error creating sheet:', sheetName, sheetError);
        }
    };

    // Add sheets with styling
    addSheetWithStyle("Active Participants", ["Name", "Mic Time", "Hand Raises", "Session Time", "Attendance Rate"], activeParticipants);
    addSheetWithStyle("Inactive Participants", ["Name", "Mic Time", "Hand Raises", "Session Time", "Attendance Rate"], inactiveParticipants);
    addSheetWithStyle("Camera Usage", ["Name", "Camera Time", "Camera Usage (%)"], cameraRows);

    // Add summary sheet
    const totalParticipants = participantsData.length;
    const summaryRows = [
        ["Total Participants", totalParticipants],
        ["Average Mic Time", avgMicTime],
        ["Average Raise Hand Time", avgRaiseHand],
        ["Average Camera Time", avgCameraTime],
        ["Session Duration", `${sessionDuration}m`]
    ];
    addSheetWithStyle("Summary", ["Metric", "Value"], summaryRows);

    // Export the workbook
    XLSX.writeFile(workbook, fileName);

    resetExportButton(exportButton);
    showFeedback("Export successful!");
}

// Function to capitalize the first letter of each word
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function resetExportButton(button) {
    button.disabled = false;
    button.textContent = "Export Data";
}

function showFeedback(message) {
    const feedback = document.getElementById("export-feedback");
    feedback.textContent = message;
    feedback.classList.add("visible");
    setTimeout(() => feedback.classList.remove("visible"), 3000);
}

document.getElementById("export-button").addEventListener("click", exportToSpreadsheet);




// Function to calculate camera percentage
function calculateCameraPercentage(cameraTime, sessionTime) {
    // Ensure cameraTime and sessionTime are valid strings before attempting to parse them
    if (typeof cameraTime !== 'string' || typeof sessionTime !== 'string') {
        return 'N/A';  // Return 'N/A' if either value is not a string
    }

    // Safely parse cameraTime and sessionTime, ensuring fallback to 0 if invalid
    const cameraTimeInSeconds = parseFloat(cameraTime.replace('m', '').replace('s', '').trim()) || 0;
    const sessionTimeInSeconds = parseFloat(sessionTime.replace('m', '').replace('s', '').trim()) || 0;

    if (sessionTimeInSeconds === 0) {
        return 'N/A';  // Avoid division by zero
    }

    return ((cameraTimeInSeconds / sessionTimeInSeconds) * 100).toFixed(2);
}


// Feedback function to notify the user
function showFeedback(message) {
    const feedback = document.getElementById('export-feedback');
    feedback.textContent = message;
    feedback.classList.add('visible');

    // Hide the feedback after 3 seconds
    setTimeout(() => {
        feedback.classList.remove('visible');
    }, 3000);
}

// Add Save button functionality
document.getElementById('save-button').addEventListener('click', () => {
    // Ensure that user is logged in before proceeding
    chrome.storage.local.get('userInfo', (result) => {
        const userId = result.userInfo?.id;

        if (userId) {
            saveToHistory(); // Proceed with saving history if user is logged in
        } else {
            showFeedback('Please log in first.');
        }
    });
});


// Function to save history even when Google Meet resets or page is refreshed
function saveToHistory() {
    const timestamp = new Date();

    // Format the timestamp in local time
    const formattedTimestamp = timestamp.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true, // Use 12-hour format (AM/PM)
    }).replace(',', '').replace(/\//g, '-'); // Format to replace slashes with dashes and remove extra commas

    console.log("Formatted Timestamp:", formattedTimestamp); // This will now show the timestamp in local time

    // Get user info from Chrome storage (after successful login)
    chrome.storage.local.get('userInfo', (result) => {
        const userId = result.userInfo?.id;

        if (!userId) {
            showFeedback('User is not logged in.');
            return;
        }

        // Helper function to parse table data
        const parseTableData = (selector) => {
            return Array.from(document.querySelectorAll(`${selector} tbody tr`)).map(row =>
                Array.from(row.cells).map(cell => cell.innerText.trim() || null)
            );
        };

        // Parse participant and camera data
        const participantsData = parseTableData('#participant-details');
        const cameraData = parseTableData('#camera-details'); // Get camera data

        if (!participantsData.length) {
            showFeedback('No data to save.');
            return;
        }

        // Create a history entry with comprehensive details including camera data
        const historyEntry = {
            timestamp: formattedTimestamp, // Store the formatted timestamp
            participantData: participantsData.map((row, index) => {
                const cameraRow = cameraData[index] || []; // Find corresponding camera data
                const cameraTime = cameraRow[1] || 'N/A'; // Camera Time column
                const cameraPercentage = cameraTime === 'N/A' ? 'N/A' : calculateCameraPercentage(cameraTime, row[3]); // Calculate Camera Percentage

                return {
                    name: row[0], // Participant's name
                    micTime: row[1], // Mic Time column
                    handRaises: row[2], // Hand Raise column
                    sessionTime: row[3], // Session Time column
                    attendanceRate: row[4], // Attendance Rate column
                    cameraTime: cameraTime, // Camera Time column
                    cameraPercentage: cameraPercentage, // Camera Percentage column
                };
            }),
            cameraData: cameraData.map(row => ({
                name: row[0],  // Participant's name
                cameraTime: row[1],  // Camera Time column
                cameraPercentage: row[2], // Camera Percentage column
            })),
            totalParticipants: participantsData.length,
        };

        console.log("History Entry:", historyEntry); // Log the history entry for debugging

        // Save to Chrome storage, using the userId as part of the key to differentiate between accounts
        chrome.storage.local.get(userId, (result) => {
            let historyData = result[userId] || [];

            // Prune older entries if history exceeds 100 entries
            if (historyData.length >= 100) {
                historyData = historyData.slice(-99); // Keep the latest 99 entries
            }

            // Append the new history entry
            historyData.push(historyEntry);

            console.log("History Data Before Saving:", historyData); // Log before saving the data

            // Save updated history data to local storage
            chrome.storage.local.set({ [userId]: historyData }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Failed to save history:", chrome.runtime.lastError);
                    showFeedback('Failed to save history.');
                } else {
                    console.log("History Data Saved:", historyData);
                    renderHistory(userId); // Update the history table immediately for this user
                    showFeedback('Data saved to history.');
                }
            });
        });
    });
}


// Function to render history for the logged-in user
function renderHistory(userId) {
    console.log('Rendering history for user ID:', userId); // Debugging line
    chrome.storage.local.get(userId, (result) => {
        const historyTableBody = document.getElementById('history-table-body');
        if (!historyTableBody) {
            console.error("History table body not found!");
            return;
        }

        const historyData = result[userId] || [];
        console.log('History data for user:', historyData); // Debugging line

        // Clear existing content
        historyTableBody.innerHTML = "";

        if (historyData.length === 0) {
            // Display fallback when no history is available
            historyTableBody.innerHTML = "<tr><td colspan='6' class='no-history'>No history available</td></tr>";
        } else {
            historyData.forEach((entry, index) => {
                const row = document.createElement("tr");
                row.classList.add("history-row");

                const timestamp = entry.timestamp || 'No timestamp available';
                const participantCount = entry.participantData?.length || 0;

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${timestamp}</td>
                    <td>${participantCount}</td>
                    <td>
                        <button class="view-details" data-index="${index}" aria-label="View details">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                    </td>
                    <td>
                        <button class="export-details" data-index="${index}" aria-label="Export details">
                            <i class="fas fa-download"></i> Export
                        </button>
                    </td>
                    <td>
                        <button class="delete-entry" data-index="${index}" aria-label="Delete entry">
                            <i class="fas fa-trash-alt"></i> Delete
                        </button>
                    </td>
                `;

                // Add alternating row colors
                if (index % 2 === 0) {
                    row.style.backgroundColor = "#f9f9f9"; // Light gray for even rows
                } else {
                    row.style.backgroundColor = "#ffffff"; // White for odd rows
                }

                // Add hover effect
                row.addEventListener("mouseover", () => {
                    row.style.backgroundColor = "#e6f7ff"; // Light blue on hover
                });
                row.addEventListener("mouseout", () => {
                    row.style.backgroundColor = index % 2 === 0 ? "#f9f9f9" : "#ffffff";
                });

                // Add click event for "View Details" button
                const detailsButton = row.querySelector(".view-details");
                detailsButton.addEventListener("click", () => {
                    showHistoryDetails(entry);
                });

                // Add click event for "Export" button
                const exportButton = row.querySelector(".export-details");
                exportButton.addEventListener("click", () => {
                    exportEntryToSpreadsheet(entry); // Updated to use spreadsheet export
                });

                // Add click event for "Delete" button to open confirmation modal
                const deleteButton = row.querySelector(".delete-entry");
                deleteButton.addEventListener("click", () => {
                    openDeleteConfirmationModal(userId, index);
                });

                historyTableBody.appendChild(row);
            });
        }

        // Display feedback to the user
        const feedbackElement = document.getElementById('feedback-message');
        if (historyData.length > 0) {
            console.log(`Rendered ${historyData.length} history entries for user ID: ${userId}`);
            feedbackElement.textContent = `Successfully loaded ${historyData.length} history entries.`;
            feedbackElement.classList.add('success');
        } else {
            console.log(`No history entries found for user ID: ${userId}`);
            feedbackElement.textContent = "No history available.";
            feedbackElement.classList.add('warning');
        }

        // Hide the feedback message after 3 seconds
        setTimeout(() => {
            feedbackElement.textContent = "";
            feedbackElement.classList.remove('success', 'warning');
        }, 3000);
    });
}




// Function to open the confirmation modal
function openDeleteConfirmationModal(userId, index) {
    const modal = document.getElementById('delete-modal');
    modal.style.display = 'flex'; // Show the modal

    const confirmButton = document.getElementById('confirm-delete');
    const cancelButton = document.getElementById('cancel-delete');

    // If user confirms, delete the history entry
    confirmButton.onclick = () => {
        deleteHistoryEntry(userId, index);
        modal.style.display = 'none'; // Close the modal
    };

    // If user cancels, close the modal
    cancelButton.onclick = () => {
        modal.style.display = 'none'; // Close the modal
    };
}

// Function to delete a history entry
function deleteHistoryEntry(userId, index) {
    chrome.storage.local.get(userId, (result) => {
        const historyData = result[userId] || [];

        // Remove the entry at the specified index
        historyData.splice(index, 1);

        // Save the updated history back to Chrome storage
        chrome.storage.local.set({ [userId]: historyData }, () => {
            renderHistory(userId); // Update the history table after deletion
            showFeedback('History entry deleted.');
        });
    });
}



// Function to show history details in a modal or alert
function showHistoryDetails(entry) {
    // Calculate summary statistics
    const totalParticipants = entry.participantData.length;
    const convertToSeconds = (timeString) => {
        if (!timeString) return 0;
        const timeParts = timeString.match(/(\d+)m|\d+s/g) || [];
        return timeParts.reduce((total, part) => {
            if (part.includes('m')) return total + parseInt(part) * 60;
            if (part.includes('s')) return total + parseInt(part);
            return total;
        }, 0);
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}m ${remainingSeconds}s`;
    };

    // Calculate totals and averages
    const totalMicTime = entry.participantData.reduce((sum, p) => sum + convertToSeconds(p.micTime), 0);
    const totalHandRaises = entry.participantData.reduce((sum, p) => sum + (parseInt(p.handRaises) || 0), 0);
    const totalCameraTime = entry.participantData.reduce((sum, p) => sum + convertToSeconds(p.cameraTime), 0);
    
    const avgMicTime = totalMicTime / totalParticipants;
    const avgHandRaises = totalHandRaises / totalParticipants;
    const avgCameraTime = totalCameraTime / totalParticipants;
    
    // Calculate active participants
    const ACTIVE_THRESHOLD = 75;
    const activeParticipants = entry.participantData.filter(p => {
        const attendanceRate = parseFloat(p.attendanceRate) || 0;
        const micTime = convertToSeconds(p.micTime);
        const handRaises = parseInt(p.handRaises) || 0;
        const cameraTime = convertToSeconds(p.cameraTime);
        
        return attendanceRate >= ACTIVE_THRESHOLD || micTime > 0 || handRaises > 0 || cameraTime > 0;
    });

    // Create summary section HTML
    const summaryHTML = `
        <div class="summary-section">
            <h3>Session Summary</h3>
            <div class="summary-grid">
                <div class="summary-item">
                    <span class="summary-label">Total Participants:</span>
                    <span class="summary-value">${totalParticipants}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Active Participants:</span>
                    <span class="summary-value">${activeParticipants.length}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Inactive Participants:</span>
                    <span class="summary-value">${totalParticipants - activeParticipants.length}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Total Mic Time:</span>
                    <span class="summary-value">${formatTime(totalMicTime)}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Total Hand Raises:</span>
                    <span class="summary-value">${totalHandRaises}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Total Camera Time:</span>
                    <span class="summary-value">${formatTime(totalCameraTime)}</span>
                </div>
            </div>
        </div>
    `;

    // Participant details
    const participantDetails = entry.participantData.map(
        p => `
            <tr>
                <td>${p.name}</td>
                <td>${p.micTime}</td>
                <td>${p.handRaises}</td>
                <td>${p.sessionTime}</td>
                <td>${p.attendanceRate}</td>
            </tr>
        `
    ).join('');

    // Camera details
    const cameraDetails = (entry.cameraData || []).map(
        c => `
            <tr>
                <td>${c.name}</td>
                <td>${c.cameraTime}</td>
            </tr>
        `
    ).join('');

    const modalContent = `
        <div class="modal-header">
            <h3>History Details</h3>
            <button class="close-modal-btn" aria-label="Close">X</button>
        </div>
        <div class="modal-body">
            <p><strong>Timestamp:</strong> ${entry.timestamp}</p>
            ${summaryHTML}
            <p><strong>Participants (${entry.participantData.length}):</strong></p>
            <table class="participant-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Mic Time</th>
                        <th>Hand Raises</th>
                        <th>Session Time</th>
                        <th>Attendance Rate</th>
                    </tr>
                </thead>
                <tbody>
                    ${participantDetails}
                </tbody>
            </table>

            <p><strong>Camera Data:</strong></p>
            <table class="camera-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Camera Time</th>
                    </tr>
                </thead>
                <tbody>
                    ${cameraDetails}
                </tbody>
            </table>
        </div>
    `;

    // Add styles for the summary section
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .summary-section {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .summary-item {
            background-color: white;
            padding: 12px;
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .summary-label {
            display: block;
            font-weight: bold;
            color: #666;
            margin-bottom: 5px;
        }
        .summary-value {
            display: block;
            font-size: 1.1em;
            color: #333;
        }
    `;
    document.head.appendChild(styleElement);

    const modal = document.getElementById('history-modal');
    const modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = modalContent;

    modal.classList.add('visible');

    // Close modal functionality
    document.querySelector('.close-modal-btn').addEventListener('click', () => {
        modal.classList.remove('visible');
        // Remove the style element when modal is closed
        styleElement.remove();
    });
}



function exportEntryToSpreadsheet(entry) {
    console.log('Starting export for entry:', entry); // Debug logging

    if (!entry || !entry.participantData) {
        console.error('Invalid entry data:', entry);
        showFeedback("Error: Invalid data for export");
        return;
    }

    const timestamp = entry.timestamp ? entry.timestamp.replace(/[:\s]/g, '_') : new Date().toISOString().replace(/[:\s]/g, '_');
    const fileName = `history_${timestamp}.xlsx`;

    const ACTIVE_THRESHOLD = 75;

    // Convert time strings (e.g., "2m 30s") to total seconds
    const convertToSeconds = (timeString) => {
        if (!timeString || timeString === 'N/A') return 0;
        try {
            const timeParts = timeString.match(/(\d+)m|\d+s/g) || [];
            return timeParts.reduce((total, part) => {
                if (part.includes('m')) return total + parseInt(part) * 60;
                if (part.includes('s')) return total + parseInt(part);
                return total;
            }, 0);
        } catch (error) {
            console.error('Error converting time string:', timeString, error);
            return 0;
        }
    };

    // Format time from seconds to readable format
    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds < 0) return 'N/A';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}m ${remainingSeconds}s`;
    };

    // Calculate detailed statistics with error handling
    const calculateDetailedStats = (participants) => {
        if (!Array.isArray(participants)) {
            console.error('Invalid participants data:', participants);
            return null;
        }

        let stats = {
            totalParticipants: participants.length,
            totalMicTime: 0,
            totalHandRaises: 0,
            totalCameraTime: 0,
            totalSessionTime: 0,
            activeParticipants: 0,
            participantsWithMic: 0,
            participantsWithCamera: 0,
            participantsWithHandRaises: 0,
            maxMicTime: 0,
            maxCameraTime: 0,
            maxHandRaises: 0,
            attendanceRates: []
        };

        participants.forEach((p, index) => {
            try {
                // Convert times to seconds with error handling
                const micTime = convertToSeconds(p.micTime);
                const cameraTime = convertToSeconds(p.cameraTime);
                const sessionTime = convertToSeconds(p.sessionTime);
                const handRaises = parseInt(p.handRaises || 0, 10);
                const attendanceRate = parseFloat(p.attendanceRate) || 0;

                // Update totals
                stats.totalMicTime += micTime;
                stats.totalHandRaises += handRaises;
                stats.totalCameraTime += cameraTime;
                stats.totalSessionTime += sessionTime;
                stats.attendanceRates.push(attendanceRate);

                // Update maximums
                stats.maxMicTime = Math.max(stats.maxMicTime, micTime);
                stats.maxCameraTime = Math.max(stats.maxCameraTime, cameraTime);
                stats.maxHandRaises = Math.max(stats.maxHandRaises, handRaises);

                // Count participants with activity
                if (micTime > 0) stats.participantsWithMic++;
                if (cameraTime > 0) stats.participantsWithCamera++;
                if (handRaises > 0) stats.participantsWithHandRaises++;

                // Count active participants
                if (attendanceRate >= ACTIVE_THRESHOLD || micTime > 0 || handRaises > 0 || cameraTime > 0) {
                    stats.activeParticipants++;
                }
            } catch (error) {
                console.error(`Error processing participant ${index}:`, p, error);
            }
        });

        // Calculate averages and percentages with null checks
        const safeDivision = (a, b) => (b > 0 ? a / b : 0);
        
        stats.avgMicTime = safeDivision(stats.totalMicTime, stats.totalParticipants);
        stats.avgHandRaises = safeDivision(stats.totalHandRaises, stats.totalParticipants);
        stats.avgCameraTime = safeDivision(stats.totalCameraTime, stats.totalParticipants);
        stats.avgSessionTime = safeDivision(stats.totalSessionTime, stats.totalParticipants);
        stats.avgAttendanceRate = stats.attendanceRates.length > 0 
            ? stats.attendanceRates.reduce((a, b) => a + b, 0) / stats.attendanceRates.length 
            : 0;

        // Calculate participation percentages
        stats.micParticipationRate = safeDivision(stats.participantsWithMic * 100, stats.totalParticipants);
        stats.cameraParticipationRate = safeDivision(stats.participantsWithCamera * 100, stats.totalParticipants);
        stats.handRaiseParticipationRate = safeDivision(stats.participantsWithHandRaises * 100, stats.totalParticipants);
        stats.activeParticipationRate = safeDivision(stats.activeParticipants * 100, stats.totalParticipants);

        return stats;
    };

    const stats = calculateDetailedStats(entry.participantData);
    if (!stats) {
        showFeedback("Error: Could not calculate statistics");
        return;
    }

    console.log('Calculated statistics:', stats); // Debug logging

    // Add error handling for workbook creation
    try {
        // Initialize workbook
        const workbook = XLSX.utils.book_new();

        // Add summary sheet with error handling
        const addSheetWithStyle = (sheetName, header, rows) => {
            try {
                const sheetData = [header, ...rows];
                const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

                // Define column widths with error handling
                const colWidths = header.map(col => ({ 
                    wch: Math.max(
                        col.length, 
                        ...rows.map(row => ((row[header.indexOf(col)] || '').toString().length || 0))
                    ) + 2
                }));
                worksheet['!cols'] = colWidths;

                // Add styles: header, zebra striping, borders
                for (let i = 0; i < sheetData.length; i++) {
                    for (let j = 0; j < header.length; j++) {
                        const cellAddress = XLSX.utils.encode_cell({ r: i, c: j });
                        if (!worksheet[cellAddress]) continue;
                        // Header row
                        if (i === 0) {
                            worksheet[cellAddress].s = {
                                font: { bold: true, color: { rgb: "FFFFFF" } },
                                fill: { fgColor: { rgb: "007ACC" } },
                                alignment: { horizontal: "center", vertical: "center" },
                                border: {
                                    top:    { style: "thin", color: { rgb: "CCCCCC" } },
                                    bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                                    left:   { style: "thin", color: { rgb: "CCCCCC" } },
                                    right:  { style: "thin", color: { rgb: "CCCCCC" } }
                                }
                            };
                        } else {
                            // Alternate row colors
                            const isEven = i % 2 === 0;
                            worksheet[cellAddress].s = {
                                font: { color: { rgb: "000000" } },
                                fill: { fgColor: { rgb: isEven ? "F3F3F3" : "FFFFFF" } },
                                alignment: { horizontal: "center", vertical: "center" },
                                border: {
                                    top:    { style: "thin", color: { rgb: "CCCCCC" } },
                                    bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                                    left:   { style: "thin", color: { rgb: "CCCCCC" } },
                                    right:  { style: "thin", color: { rgb: "CCCCCC" } }
                                }
                            };
                        }
                    }
                }

                XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
            } catch (sheetError) {
                console.error('Error creating sheet:', sheetName, sheetError);
            }
        };

        // Add the summary sheet
        const summaryRows = [
            ['Export Timestamp', new Date().toLocaleString()],
            ['Session Timestamp', entry.timestamp || 'N/A'],
            ['Total Participants', stats.totalParticipants],
            ['Active Participants', stats.activeParticipants],
            ['Inactive Participants', stats.totalParticipants - stats.activeParticipants],
            ['Active Participation Rate', `${stats.activeParticipationRate.toFixed(1)}%`],
            [''],
            ['Time Statistics'],
            ['Total Session Time', formatTime(stats.totalSessionTime)],
            ['Average Session Time', formatTime(stats.avgSessionTime)],
            ['Maximum Session Time', formatTime(stats.maxMicTime)],
            [''],
            ['Microphone Usage'],
            ['Total Mic Time', formatTime(stats.totalMicTime)],
            ['Average Mic Time', formatTime(stats.avgMicTime)],
            ['Maximum Mic Time', formatTime(stats.maxMicTime)],
            ['Participants with Mic Usage', stats.participantsWithMic],
            ['Mic Participation Rate', `${stats.micParticipationRate.toFixed(1)}%`],
            [''],
            ['Camera Usage'],
            ['Total Camera Time', formatTime(stats.totalCameraTime)],
            ['Average Camera Time', formatTime(stats.avgCameraTime)],
            ['Maximum Camera Time', formatTime(stats.maxCameraTime)],
            ['Participants with Camera', stats.participantsWithCamera],
            ['Camera Participation Rate', `${stats.cameraParticipationRate.toFixed(1)}%`],
            [''],
            ['Hand Raise Statistics'],
            ['Total Hand Raises', stats.totalHandRaises],
            ['Average Hand Raises', stats.avgHandRaises.toFixed(1)],
            ['Maximum Hand Raises', stats.maxHandRaises],
            ['Participants with Hand Raises', stats.participantsWithHandRaises],
            ['Hand Raise Participation Rate', `${stats.handRaiseParticipationRate.toFixed(1)}%`],
            [''],
            ['Attendance Statistics'],
            ['Average Attendance Rate', `${stats.avgAttendanceRate.toFixed(1)}%`],
            ['Minimum Attendance Rate', `${Math.min(...stats.attendanceRates).toFixed(1)}%`],
            ['Maximum Attendance Rate', `${Math.max(...stats.attendanceRates).toFixed(1)}%`]
        ];

        addSheetWithStyle("Summary", ["Metric", "Value"], summaryRows);

        // Add participant details sheet
        const participantHeaders = ["Name", "Mic Time", "Hand Raises", "Session Time", "Attendance Rate", "Camera Time", "Camera %", "Status"];
        const activeRows = [];
        const inactiveRows = [];
        entry.participantData.forEach(p => {
            const attendanceRate = parseFloat(p.attendanceRate) || 0;
            const micTime = convertToSeconds(p.micTime);
            const handRaises = parseInt(p.handRaises || 0, 10);
            const cameraTime = convertToSeconds(p.cameraTime);
            const sessionTime = convertToSeconds(p.sessionTime);
            const cameraPercentage = sessionTime > 0 ? (cameraTime / sessionTime * 100) : 0;
            const status = (attendanceRate >= ACTIVE_THRESHOLD || micTime > 0 || handRaises > 0 || cameraTime > 0) ? 'Active' : 'Inactive';
            const row = [
                p.name || 'Unknown',
                formatTime(micTime),
                handRaises,
                formatTime(sessionTime),
                `${attendanceRate.toFixed(1)}%`,
                formatTime(cameraTime),
                `${cameraPercentage.toFixed(1)}%`,
                status
            ];
            if (status === 'Active') {
                activeRows.push(row);
            } else {
                inactiveRows.push(row);
            }
        });
        // Add Active and Inactive sheets
        addSheetWithStyle("Active Participants", participantHeaders, activeRows);
        addSheetWithStyle("Inactive Participants", participantHeaders, inactiveRows);

        // Export the workbook
        XLSX.writeFile(workbook, fileName);
        showFeedback("Export successful!");
        console.log('Export completed successfully'); // Debug logging
    } catch (error) {
        console.error('Error during export:', error);
        showFeedback("Error during export. Please try again.");
    }
}

// Feedback function to notify the user
function showFeedback(message) {
    const feedback = document.getElementById('export-feedback');
    feedback.textContent = message;
    feedback.classList.add('visible');

    setTimeout(() => feedback.classList.remove('visible'), 3000);
}




// Function to filter history table based on search input
function filterHistoryTable() {
    const searchValue = document.getElementById('history-search-input').value.toLowerCase();
    const rows = document.querySelectorAll('#history-table-body tr');

    rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        const matchesSearch = Array.from(cells).some((cell) =>
            cell.textContent.toLowerCase().includes(searchValue)
        );
        row.style.display = matchesSearch ? '' : 'none';
    });
}

// Event Listener for "Display History" button
document.getElementById('display-history-button').addEventListener('click', () => {
    console.log('Display History button clicked'); // Debugging line

    chrome.storage.local.get('userInfo', (result) => {
        const userId = result.userInfo?.id;
        console.log('User data fetched:', result.userInfo); // Debugging line

        if (userId) {
            console.log('User logged in with ID:', userId); // Debugging line
            renderHistory(userId);  // Display history for the logged-in user
        } else {
            console.log('No user logged in. History cannot be displayed.');
        }
    });
});

// Attach search functionality to filter history table
const searchInput = document.getElementById('history-search-input');
if (searchInput) {
    searchInput.addEventListener('input', filterHistoryTable);
} else {
    console.error("Search input not found!");
}





    // Fetch the participant states and logged participants data from storage
    function fetchData() {
        chrome.storage.local.get(["participantStates", "loggedParticipants"], (result) => {
            const participantStates = result.participantStates || {};
            const loggedParticipants = result.loggedParticipants || {};
            updateDashboard(participantStates, loggedParticipants);
        });
    }

    // Initial fetch and periodic refresh every 5 seconds
    fetchData();
    setInterval(fetchData,5000); // Refresh every 5 seconds

    // Listen for updates from content.js
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.message === 'updateParticipantData') {
            const loggedParticipants = message.data;
            updateDashboard({}, loggedParticipants);  // Update with only loggedParticipants
        }
    });
});







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
                        // Save user info in Chrome storage
                        chrome.storage.local.set({ userInfo: userInfo });

                        // Populate user details in the UI
                        updateProfile(userInfo);
                    })
                    .catch(console.error);
            } else {
                console.error("OAuth failed or was canceled.");
            }
        }
    );
}

// Function to update profile UI with user info and show successful login message
function updateProfile(userInfo) {
    const profilePic = document.getElementById('profile-pic');
    const userName = document.getElementById('user-name');
    const successMessage = document.getElementById('success-message');

    // Set profile picture and name
    if (userInfo.picture) {
        profilePic.src = userInfo.picture;
    }
    if (userInfo.name) {
        userName.textContent = `Hello, ${userInfo.name}`;
    }

    // Display success message (e.g., "Login successful!")
    if (successMessage) {
        successMessage.classList.add('show'); // Add the 'show' class to trigger animation
        successMessage.textContent = 'Login successful!';

        // Hide message after 3 seconds with fade-out effect
        setTimeout(() => {
            successMessage.style.animation = 'fadeOutSlideDown 0.5s ease-out forwards'; // Trigger fade-out
            setTimeout(() => {
                successMessage.classList.remove('show'); // Remove the 'show' class after the animation
                successMessage.style.animation = ''; // Reset animation
            }, 500); // Wait for the fade-out animation to finish
        }, 3000); // Message will disappear after 3 seconds
    }

    // Update the Profile Dropdown UI
    document.getElementById('logout-link').addEventListener('click', logout);
}

// Example of Success Message Element
document.body.innerHTML += `
   <!-- Success Message -->
<div id="success-message" class="success-message">
    Login successful!
</div>

<style>
/* Success Message Styles */
.success-message {
    display: none; /* Initially hidden */
    background-color: #4CAF50;
    color: white;
    padding: 15px 30px;
    margin-left: 100px;
    text-align: center;
    position: fixed;
    top: 50%; /* Vertically center the message */
    left: 50%; /* Horizontally center the message */
    transform: translate(-50%, -50%); /* Offset to truly center */
    border-radius: 8px;
    font-size: 18px;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 9999;
    max-width: 90%;
    width: auto;
    line-height: 1.4;
    transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}

/* Fade-in and slide-up animation */
@keyframes fadeInSlideUp {
    0% {
        opacity: 0;
        transform: translate(-50%, -50%) translateY(-20px); /* Start from slightly above */
    }
    100% {
        opacity: 1;
        transform: translate(-50%, -50%) translateY(0); /* End at the final position */
    }
}

/* Adding animation */
.success-message.show {
    display: block;
    animation: fadeInSlideUp 0.5s ease-out forwards;
}

/* Fade-out animation (if desired) */
@keyframes fadeOutSlideDown {
    0% {
        opacity: 1;
        transform: translate(-50%, -50%) translateY(0);
    }
    100% {
        opacity: 0;
        transform: translate(-50%, -50%) translateY(20px); /* Slide down */
    }
}
</style>
`;



function logout() {
    // Remove user data from local storage
    chrome.storage.local.remove('userInfo', () => {
        console.log('User logged out');
        
        // Show the logout popup
        const logoutPopup = document.getElementById('logoutPopup');
        logoutPopup.style.display = 'block';

        // Set a 3-second delay before automatically logging out and redirecting
        setTimeout(() => {
            logoutPopup.style.display = 'none';  // Hide the popup
            window.location.href = 'login.html'; // Redirect to the login page
        }, 3000); // 3 seconds delay (3000 milliseconds)
        
        // Optionally, you can still allow for a manual close, if needed
        // Close the popup when clicking outside of it (on overlay)
        window.onclick = (event) => {
            const overlay = document.querySelector('.popup::before');
            if (event.target === overlay || event.target === logoutPopup) {
                logoutPopup.style.display = 'none';
                window.location.href = 'login.html'; // Redirect if clicking outside the popup
            }
        };
    });
}



// Example of Logout Modal Element
document.body.innerHTML += `
 <!-- Logout Popup -->
<!-- Logout Popup -->
<div id="logoutPopup" class="popup">
    <div class="popup-content">
        <p>You have been logged out successfully.</p>
    </div>
</div>


<style>
/* Popup Styles */
.popup {
    display: none; /* Initially hidden */
    position: fixed;
    z-index: 9999;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    max-width: 90%;
    padding: 30px;
    background-color: #f9f9f9; /* Lighter background */
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    text-align: center;
    animation: fadeIn 0.4s ease-out, slideIn 0.5s ease-out;
    overflow: hidden;
}

/* Popup Content Styling */
.popup-content {
    padding: 0;
    color: #333;
    font-size: 17px;
    line-height: 1.6;
    font-family: 'Arial', sans-serif;
}

/* Close Icon Styling */
.close {
    position: absolute;
    top: 20px;
    right: 20px;
    font-size: 30px;
    font-weight: bold;
    color: #999;
    cursor: pointer;
    transition: color 0.3s ease;
}

.close:hover {
    color: #333;
}

/* Button Styling */
button {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 12px 24px;
    text-align: center;
    cursor: pointer;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    text-transform: uppercase;
    transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

button:hover {
    background-color: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

button:active {
    transform: translateY(0);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

button:focus {
    outline: none;
    box-shadow: 0 0 5px rgba(76, 175, 80, 0.6);
}

/* Fade-in Animation for Popup */
@keyframes fadeIn {
    0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.9);
    }
    100% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }
}

/* Slide-in Animation for Popup */
@keyframes slideIn {
    0% {
        transform: translate(-50%, -60%) scale(0.9);
    }
    100% {
        transform: translate(-50%, -50%) scale(1);
    }
}

/* Overlay Fade-in Animation */
@keyframes fadeInOverlay {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}

/* Optional: Overlay (background) styling for better user focus */
.popup::before {
    content: '';
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    animation: fadeInOverlay 0.4s ease-out;
}

</style>

`;



// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Check if user info is stored and update profile if it exists
    chrome.storage.local.get('userInfo', (result) => {
        if (result.userInfo) {
            updateProfile(result.userInfo);
        } else {
            handleGoogleLogin();  // If not logged in, trigger the Google login
        }
    });

    // Add event listener for Google login if needed
    document.getElementById('google-login')?.addEventListener('click', handleGoogleLogin);
});
