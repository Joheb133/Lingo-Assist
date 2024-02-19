import { getData, getCurrentTabDomain } from "./messages.js";

document.addEventListener("DOMContentLoaded", async function () {
    const optionsBtn = document.querySelector('.options-btn');
    optionsBtn.addEventListener('click', function () {
        const sitePageUrl = chrome.runtime.getURL('src/pages/options/index.html');
        chrome.tabs.create({ url: sitePageUrl }); // Use the chrome.tabs API to open a new tab with the site page URL
    });

    const gameBtn = document.querySelector('.game-btn');
    gameBtn.addEventListener('click', function () {
        const sitePageUrl = chrome.runtime.getURL('src/pages/game/index.html');
        chrome.tabs.create({ url: sitePageUrl });
    });

    // Toggle translations button
    const translationsToggleWrap = document.querySelector('.translations-toggle-wrap')
    const translationToggleSpan = document.querySelector('#translation-toggle-span')
    const toggleSliderBtn = document.querySelector('.switch input');
    let applyContentScript = await getData('applyContentScript')
    if (applyContentScript === null) {
        console.log('applyContentScript is', null)
        chrome.storage.local.set(({ applyContentScript: 'true' }))
        applyContentScript = 'true';
    }

    if (applyContentScript === 'true') {
        toggleSliderBtn.checked = true;
        translationToggleSpan.innerText = 'enabled'
    } else if (applyContentScript === 'false') {
        toggleSliderBtn.checked = false;
        translationToggleSpan.innerText = 'disabled'
        translationsToggleWrap.classList.toggle('bg-green-200')
        translationsToggleWrap.classList.toggle('bg-red-200')
    }

    toggleSliderBtn.addEventListener('change', async function () {
        const applyContentScript = await getData('applyContentScript')
        if (toggleSliderBtn.checked && applyContentScript === 'false') {
            console.log('Set to on')
            chrome.storage.local.set(({ applyContentScript: 'true' }))
            translationToggleSpan.innerText = 'enabled'
        } else if (!toggleSliderBtn.checked && applyContentScript === 'true') {
            console.log('Set to off')
            chrome.storage.local.set(({ applyContentScript: 'false' }))
            translationToggleSpan.innerText = 'disabled'
        }
        translationsToggleWrap.classList.toggle('bg-green-200')
        translationsToggleWrap.classList.toggle('bg-red-200')
    })

    // Ignore/unignore the current domain
    const currentDomainContainer = document.querySelector('.current-domain-container')
    const currentDomainSpan = currentDomainContainer.querySelector('span')
    const ignoreCurrentDomainBtn = currentDomainContainer.querySelector('button')

    const tempIgnoredDomains = await getData('ignoredDomains')
    let ignoredDomainArr;
    if (tempIgnoredDomains === null) {
        ignoredDomainArr = []
        chrome.storage.local.set(({ ignoredDomains: [] }))
    } else {
        ignoredDomainArr = tempIgnoredDomains;
    }

    const currentDomain = await getCurrentTabDomain();
    currentDomainSpan.innerText = currentDomain;

    if (ignoredDomainArr.includes(currentDomain)) {
        ignoreCurrentDomainBtn.innerText = 'Unignore domain'
        ignoreCurrentDomainBtn.classList.toggle('domain-btn')
    }

    ignoreCurrentDomainBtn.addEventListener('click', async () => {
        ignoreCurrentDomainBtn.disabled = true; // temp disable cuz async operations
        const ignoredDomains = await getData('ignoredDomains')
        if (ignoredDomains.includes(currentDomain)) { // remove current domain from ignore list
            const newArr = ignoredDomains.filter((element) => element !== currentDomain)
            chrome.storage.local.set(({ ignoredDomains: newArr }))
            ignoreCurrentDomainBtn.innerText = 'Ignore domain'
        } else { // add current domain to ignore list
            ignoredDomains.push(currentDomain)
            chrome.storage.local.set(({ ignoredDomains }))
            ignoreCurrentDomainBtn.innerText = 'Unignore domain'
        }
        ignoreCurrentDomainBtn.classList.toggle('domain-btn')
        ignoreCurrentDomainBtn.disabled = false;
    })
});