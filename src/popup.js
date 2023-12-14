document.addEventListener("DOMContentLoaded", () => {

    // Add a click event listener to the button
    const optionsBtn = document.querySelector('.options-btn');
    optionsBtn.addEventListener('click', function () {
        // Define the URL of your extension site page
        const sitePageUrl = chrome.runtime.getURL('src/pages/options/index.html');

        // Use the chrome.tabs API to open a new tab with the site page URL
        chrome.tabs.create({ url: sitePageUrl });
    });
});