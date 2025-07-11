

document.addEventListener("DOMContentLoaded", function () {
    // Toggle collapsible content in the sidebar
    const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
    collapsibleHeaders.forEach(header => {
        header.addEventListener('click', function () {
            const content = header.nextElementSibling;
            content.style.display = content.style.display === "block" ? "none" : "block";
        });
    });

    // Dark mode toggle functionality
    const darkModeButton = document.getElementById('dark-mode-toggle');
    darkModeButton.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');

        // Change button text based on the mode
        if (document.body.classList.contains('dark-mode')) {
            darkModeButton.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        } else {
            darkModeButton.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
        }
    });
});
