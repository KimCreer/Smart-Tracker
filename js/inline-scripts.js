// inline-scripts.js

document.addEventListener("DOMContentLoaded", function() {
    // Example for exporting CSV functionality
    document.getElementById('export-button').addEventListener('click', function () {
        const rows = document.querySelectorAll("#participant-stats tr");
        const csvContent = Array.from(rows).map(row => {
            const cols = row.querySelectorAll("td, th");
            return Array.from(cols).map(col => col.innerText).join(",");
        }).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "participant_data.csv";
        a.click();
    });

    // Add additional JavaScript for modals and features here
    document.getElementById('addParticipantForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const name = document.getElementById('participantName').value;
        const email = document.getElementById('participantEmail').value;

        // Add the participant to the list (placeholder)
        const participantListBody = document.getElementById('participantListBody');
        const newRow = document.createElement('tr');
        newRow.innerHTML = `<td>${name}</td><td>0</td><td>0</td><td>0</td><td>0</td>`;
        participantListBody.appendChild(newRow);

        // Close the modal
        const addParticipantModal = bootstrap.Modal.getInstance(document.getElementById('addParticipantModal'));
        addParticipantModal.hide();

        // Clear the form
        document.getElementById('addParticipantForm').reset();
    });
});
