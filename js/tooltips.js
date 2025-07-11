// tooltips.js
document.addEventListener("DOMContentLoaded", function () {
  initializeTooltips();
});

function initializeTooltips() {
  try {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
      new bootstrap.Tooltip(tooltipTriggerEl);
    });
  } catch (error) {
    console.error("Tooltip initialization failed:", error);
  }
}

// You can call `initializeTooltips()` again whenever new elements are added to re-initialize tooltips
