document.addEventListener("DOMContentLoaded", () => {

    // Add a click event listener to the button
    const homeBtn = document.querySelector('.home-btn');
    homeBtn.addEventListener('click', function () {
        // Define the URL of your extension site page
        const sitePageUrl = chrome.runtime.getURL('src/pages/home/index.html');

        // Use the chrome.tabs API to open a new tab with the site page URL
        chrome.tabs.create({ url: sitePageUrl });
    });

    // Fetch data button
    const fetchBtn = document.querySelector('.fetch-btn');
    fetchBtn.addEventListener('click', function () {
        chrome.runtime.sendMessage({ type: 'getDuolingo' }).then((res) => {
            if (res.error) {
                console.error('Error syncing Duolingo', res.error)
            } else {
                console.log('Data:', res.data);
            }
        })
    });

    // Clear stored data
    const clearBtn = document.querySelector('.clear-btn');
    clearBtn.addEventListener('click', function () {
        chrome.storage.local.clear(() => console.log("Local storage cleared"))
    })
});