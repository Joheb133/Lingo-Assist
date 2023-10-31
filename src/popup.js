document.addEventListener("DOMContentLoaded", () => {

    // Add a click event listener to the button
    const homeBtn = document.querySelector('.home-btn');
    homeBtn.addEventListener('click', function () {
        // Define the URL of your extension site page
        const sitePageUrl = chrome.runtime.getURL('src/pages/home/index.html');

        // Use the chrome.tabs API to open a new tab with the site page URL
        chrome.tabs.create({ url: sitePageUrl });
    });
});