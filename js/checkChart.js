function loadChartJs() {
    if (typeof Chart === 'undefined') {
        console.error(`Chart.js not loaded. Retrying... (Attempt ${retryCount + 1}/${maxRetries})`);

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => {
            if (typeof Chart !== 'undefined') {
                console.log('Chart.js loaded successfully on retry.');
                initializeCharts(); // Call the chart initialization function here
            } else if (retryCount < maxRetries) {
                retryCount++;
                loadChartJs(); // Retry loading Chart.js
            } else {
                console.error('Failed to load Chart.js after maximum retries.');
            }
        };
        script.onerror = () => {
            console.error('Failed to load the Chart.js script.');
            if (retryCount < maxRetries) {
                retryCount++;
                loadChartJs(); // Retry loading on error
            } else {
                console.error('Failed to load Chart.js after maximum retries.');
            }
        };

        document.body.appendChild(script);
    } else {
        console.log('Chart.js already loaded.');
        initializeCharts(); // Initialize charts if Chart.js is already available
    }
}
