# Smart Attendance Tracker

Effortless attendance management for your Google Meet sessions.

## Overview
Smart Attendance Tracker is a Chrome extension designed to automate and simplify attendance tracking for Google Meet sessions. It provides real-time monitoring, detailed analytics, and secure data storage, making it ideal for teachers, business managers, and event organizers.

## Features
- **Automated Attendance Tracking:** Automatically captures attendance data from Google Meet sessions without manual input.
- **Detailed Reports:** Generate comprehensive attendance reports for individual sessions or participants.
- **Real-Time Monitoring:** Monitor attendance as the session progresses, ensuring no one is missed.
- **Secure Data Storage:** All attendance records are stored securely using Chrome's async storage.
- **Analytics Dashboard:** Visualize participation trends, hand raises, mic and camera usage, and more.
- **Export Options:** Export attendance reports in PDF or Excel format (Google account required).

## How It Works
1. **Login:** Sign in using your Google account via Google OAuth (Google Console) for secure and personalized access. The system integrates seamlessly with your Google Meet sessions.
2. **Set Up Your Session:** Provide details like the Google Meet link, session title, date, and time. Customize tracking settings as needed.
3. **Start Tracking:** When the session begins, the system automatically tracks attendance in real-time by scraping the Google Meet web page and analyzing the DOM.
4. **View Reports:** After the session, generate detailed attendance reports, including join/leave times and attendance duration.
5. **Manage Attendance:** Review and edit logs, and export reports for record-keeping or sharing (Google account required).

## System Limitations
- **Google Meet Only:** Currently supports only Google Meet sessions. Other platforms like Zoom or Microsoft Teams are not compatible.
- **Login Requirement:** Only users with Google accounts can export or save attendance data. Guests can view tracking data but cannot export or save it.
- **Web Scraping Limitations:** Attendance tracking relies on web scraping and DOM manipulation. Changes to the Google Meet interface may affect functionality until the extension is updated.
- **Network Dependency:** Real-time tracking depends on the quality of the Google Meet connection and browser performance.

## Technologies Used
- **Chrome Extensions API**
- **Google OAuth (Google Console) for Authentication**
- **Web Scraping & DOM Manipulation** (for Google Meet attendance tracking)
- **Chrome Async Storage**
- **Chart.js** for analytics
- **XLSX.js** for Excel export
- **HTML, CSS, JavaScript**

## Setup Instructions
1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   ```
2. **Install dependencies:**
   - The extension uses libraries included in the `libs/` and `js/` folders.
3. **Load the extension in Chrome:**
   - Go to `chrome://extensions/` in your browser.
   - Enable Developer Mode.
   - Click on "Load unpacked" and select the project directory.
4. **Start using the extension:**
   - Click the extension icon, log in with Google (via Google OAuth), and start tracking attendance in your Google Meet sessions.

## Sample Usage Scenarios
- **Teachers:** Track student attendance in virtual classrooms and generate reports automatically.
- **Business Managers:** Monitor team meeting attendance and participation.
- **Event Organizers:** Analyze attendance trends for webinars and online events.

## Contact
For questions or support, contact:
- **Email:** creerallen09@gmail.com
- **Phone:** 9062966623
- **Address:** Poblacion, Muntinlupa City

---
© 2025 Smart Attendance Tracking. All rights reserved. 