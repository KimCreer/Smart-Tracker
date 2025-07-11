// Dark Mode Toggle
document.getElementById('dark-mode-toggle').addEventListener('click', function() {
  document.body.classList.toggle('dark-mode');
});

// Collapsible Sections
document.querySelectorAll('.collapsible-header').forEach(header => {
  header.addEventListener('click', function() {
    const content = header.nextElementSibling;
    content.style.display = content.style.display === "none" || !content.style.display ? "block" : "none";
  });
});

// Tooltip Initialization
const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl);
});
