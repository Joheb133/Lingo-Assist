document.addEventListener("DOMContentLoaded", () => {

    // Add a click event listener to the button
    const optionsBtn = document.querySelector('.options-btn');
    optionsBtn.addEventListener('click', function () {
        // Define the URL of your extension site page
        const sitePageUrl = chrome.runtime.getURL('src/pages/options/index.html');

        // Use the chrome.tabs API to open a new tab with the site page URL
        chrome.tabs.create({ url: sitePageUrl });
    });

    // Add a click event listener to the button
    const gameBtn = document.querySelector('.game-btn');
    gameBtn.addEventListener('click', function () {
        // Define the URL of your extension site page
        const sitePageUrl = chrome.runtime.getURL('src/pages/game/index.html');

        // Use the chrome.tabs API to open a new tab with the site page URL
        chrome.tabs.create({ url: sitePageUrl });
    });

    // Toggle slider button
    const toggleSliderBtn = document.querySelector('.switch input');
    const applyContentScript = localStorage.getItem('applyContentScript')
    if (localStorage.getItem('applyContentScript') === null) {
        localStorage.setItem('applyContentScript', 'true')
    }
    applyContentScript === 'true' ? toggleSliderBtn.checked = true : toggleSliderBtn.checked = false;

    toggleSliderBtn.addEventListener('change', function () {
        const applyContentScript = localStorage.getItem('applyContentScript')
        console.log(toggleSliderBtn.checked, applyContentScript)
        if (toggleSliderBtn.checked && applyContentScript === 'false') {
            console.log('Set to on')
            localStorage.setItem('applyContentScript', 'true')
        } else if (!toggleSliderBtn.checked && applyContentScript === 'true') {
            console.log('Set to off')
            localStorage.setItem('applyContentScript', 'false')
        }
    })
});