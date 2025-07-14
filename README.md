# Privacy Lens — Chrome Extension

Privacy Lens is a lightweight Chrome extension designed to enhance user privacy awareness by visualizing third-party domains making network requests and displaying cookies set on the current webpage. It helps users understand what trackers and cookies are active, empowering them to browse the web more securely and transparently.

## Features
- Lists third-party domains sending requests on the current tab
- Displays all cookies set by the current site and third-party domains
- Provides request types and counts per domain (e.g., scripts, images, XHR)
- Built with Manifest V3 for enhanced security and performance
- Simple, clean popup UI using plain JavaScript, HTML, and CSS

## Why Privacy Lens?
Many websites load resources from multiple third parties, often tracking user activity. Privacy Lens gives you a transparent view of these behind-the-scenes activities to help protect your online privacy.

## Installation

### Load Locally for Development
1. Clone this repository:
   git clone https://github.com/VU-Kevin-coder/privacy-lens-chrome-extension.git
2. Open Chrome and navigate to chrome://extensions/

3. Enable Developer mode (toggle top-right)

4. Click Load unpacked and select the cloned folder

5. The Privacy Lens icon should appear in your toolbar

### From Chrome Web Store
(Coming soon) — Once published, you can install it directly from the Chrome Web Store.

## Usage
Click the Privacy Lens icon in the Chrome toolbar on any webpage.

View the popup listing all third-party domains making network requests.

Inspect cookies set by the site and third parties.

Use this information to be more aware of trackers and improve your browsing privacy.

## Permissions
This extension requires:

Access to active tabs and all URLs to monitor network requests

Access to browser cookies to display cookie details

Usage of webRequest API to listen to outgoing requests

All data is processed locally; no information is sent outside your browser.

## Development
This project uses:

Manifest Version 3 for Chrome extensions

Background service worker (background.js)

Popup UI (popup.html, popup.js)

CSS styles (styles.css)

## To build and test:
Make changes in the source files

Reload the extension in chrome://extensions/

Refresh the active tab to see effects

## Contributing
Contributions and suggestions are welcome! Feel free to:

Open issues for bugs or feature requests

Fork the repo and submit pull requests

Please adhere to the existing code style and document any new features.

## License
This project is licensed under the MIT License.

Made with ❤️ by Your Name
