import displayVocab, { clearVocab } from "./gui/displayVocab.js";
import displayLoginStatus, { login } from "./gui/displayLoginStatus.js";
import { getData, syncDuolingo, requestTranslations } from "../../../messages.js";
import { ISO_to_words } from "../../../utils/ISO.js"

const duolingoSyncBtn = document.querySelector('.duolingo-sync-btn');
duolingoSyncBtn.addEventListener('click', function () {
    initDuolingoSync()
});

/* REMOVE from development */
// Clear stored data
const clearBtn = document.querySelector('.clear-btn');
clearBtn.addEventListener('click', function () {
    chrome.storage.local.clear(() => console.log('Local storage cleared'))
    clearVocab()
})

// Handle translation button
const translateBtn = document.querySelector('.translate-btn');
translateBtn.addEventListener('click', async function () {
    // Start loading
    translateBtn.disabled = true;
    const translateFailEl = document.querySelector('#translate-fail-el')
    translateFailEl.innerText = '';
    const loading = document.querySelector('#translate-loading')
    loading.classList.toggle('hidden')
    const combinedISO = await getData('combinedISO')
    const reqTrans = await requestTranslations(combinedISO)

    // Done loading
    loading.classList.toggle('hidden')
    if (reqTrans !== true) { // Some error/nothing to translate
        translateFailEl.innerText = `${reqTrans}`
        translateBtn.disabled = false;
        return
    }

    // Nothing wrong, update table
    const vocab = await getData(combinedISO)
    displayVocab(vocab)

    // Display words learned
    const vocabKeys = !vocab ? [] : Object.keys(vocab)
    const wordsLearnedEl = document.querySelector('.duolingo-msg-el #words-learned')
    wordsLearnedEl.innerText = vocabKeys.length;

    translateBtn.disabled = false;
});

const gameBtn = document.querySelector('.game-btn')
gameBtn.addEventListener('click', function () {
    window.open('../game/index.html', '_blank');
})

// Hide/Show vocab table
const tableBtn = document.querySelector('.table-btn')
const tableContainer = document.querySelector('.table-container')
tableBtn.addEventListener('click', function () {
    if (tableContainer.style.maxHeight) {
        tableContainer.style.maxHeight = null;
    } else {
        tableContainer.style.maxHeight = `${tableContainer.scrollHeight}px`;
    }
})

async function ignoredDomains() {
    const ignoredDomainArr = await getData('ignoredDomains')

    if (ignoredDomainArr === null) {
        chrome.storage.local.set({ 'ignoredDomains': [] })
    }

    const domainTextArea = document.querySelector('.ignore-domain-container textarea')
    const ignoreDomainSubmit = document.querySelector('.ignore-domain-container #submit-btn')
    const resetDomainSubmit = document.querySelector('.ignore-domain-container #reset-btn')

    // Display domains
    domainTextArea.value = ignoredDomainArr.length > 0 ? ignoredDomainArr.join('\n') : ''

    // Update domains
    ignoreDomainSubmit.addEventListener('click', () => {
        if (domainTextArea.value.length === 0) return
        const domainArr = domainTextArea.value.split('\n')
        chrome.storage.local.set({ 'ignoredDomains': domainArr })
    })

    resetDomainSubmit.addEventListener('click', () => {
        chrome.storage.local.set({ 'ignoredDomains': [] })
        domainTextArea.value = ''
    })
}

ignoredDomains()

async function initDuolingoSync() {
    const failEl = document.querySelector('.dashboard-container #login-fail-el')
    failEl.innerText = ''

    const baseFailMsg = 'Failed to login Duolingo, please login to sync vocab. '

    displayLoginStatus(login.LOADING)

    // syncDuolingo changes localStorage so await here is important
    const syncStatus = await syncDuolingo()
    const combinedISO = await getData('combinedISO')
    const vocab = await getData(combinedISO)

    displayLoginStatus(syncStatus ? login.SUCCESS : login.FAIL)

    // Display duolingo language
    if (combinedISO) {
        const learningEl = document.querySelector('.duolingo-msg-el #learning-language')
        const learningISO = combinedISO.split('_')[0]
        learningEl.innerText = ISO_to_words[learningISO]
    }

    const vocabKeys = !vocab ? [] : Object.keys(vocab)

    if (vocabKeys.length === 0) {
        failEl.innerText = `${syncStatus ? '' : baseFailMsg} ${combinedISO === null ? 'No course code cached' : 'No vocab in storage'}`
        return
    }

    // Display words learned
    const wordsLearnedEl = document.querySelector('.duolingo-msg-el #words-learned')
    wordsLearnedEl.innerText = vocabKeys.length;

    displayVocab(vocab)
    failEl.innerText = !syncStatus ? baseFailMsg + 'Using cached code course instead' : ''
}

initDuolingoSync()
