import displayLanguages from "./gui/displayLanguages.js";
import displayLocalVocab, { clearLocalVocab } from "./gui/displayLocalVocab.js";
import displayLoginStatus, { login } from "./gui/displayLoginStatus.js";
import { getData, syncDuolingo, requestTranslations } from "../../../messages.js";

const duolingoSyncBtn = document.querySelector('.duolingo-sync-btn');
duolingoSyncBtn.addEventListener('click', function () {
    initDuolingoSync()
});

/* REMOVE from development */
// Clear stored data
const clearBtn = document.querySelector('.clear-btn');
clearBtn.addEventListener('click', function () {
    chrome.storage.local.clear(() => console.log('Local storage cleared'))
    clearLocalVocab()
})

const translateBtn = document.querySelector('.translate-btn');
translateBtn.addEventListener('click', async function () {
    const combinedISO = await getData('combinedISO')
    const reqTrans = await requestTranslations(combinedISO)
    if (!reqTrans) {
        return
    }
    const vocab = await getData(combinedISO)
    displayLocalVocab(vocab)
});


async function initDuolingoSync() {
    const failEl = document.querySelector('.duolingo-msg-el').querySelector('#fail-el')
    failEl.innerText = ''

    const baseFailMsg = 'Failed to login Duolingo, please login to sync vocab. '

    displayLoginStatus(login.LOADING)

    // syncDuolingo changes localStorage so await here is important
    const syncStatus = await syncDuolingo()
    const combinedISO = await getData('combinedISO')
    const vocab = await getData(combinedISO)

    displayLoginStatus(syncStatus ? login.SUCCESS : login.FAIL)

    if (combinedISO) {
        displayLanguages(combinedISO)
    }

    if (!vocab || Object.keys(vocab).length === 0) {
        failEl.innerText = `${syncStatus ? '' : baseFailMsg} ${combinedISO === null ? 'No course code cached' : 'No vocab in storage'}`
        return
    }

    displayLocalVocab(vocab)
    failEl.innerText = !syncStatus ? baseFailMsg + 'Using cached code course instead' : ''
}

initDuolingoSync()
