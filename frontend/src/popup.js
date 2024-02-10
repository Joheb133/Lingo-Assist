import { getData } from "./messages.js";

document.addEventListener("DOMContentLoaded", async function () {

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
    const applyContentScript = await getData('applyContentScript')
    if (applyContentScript === null) {
        console.log('applyContentScript is', null)
        chrome.storage.local.set(({ applyContentScript: 'true' }))
        applyContentScript = 'true';
    }
    applyContentScript === 'true' ? toggleSliderBtn.checked = true : toggleSliderBtn.checked = false;

    toggleSliderBtn.addEventListener('change', async function () {
        const applyContentScript = await getData('applyContentScript')
        if (toggleSliderBtn.checked && applyContentScript === 'false') {
            console.log('Set to on')
            chrome.storage.local.set(({ applyContentScript: 'true' }))
        } else if (!toggleSliderBtn.checked && applyContentScript === 'true') {
            console.log('Set to off')
            chrome.storage.local.set(({ applyContentScript: 'false' }))
        }
    })
});