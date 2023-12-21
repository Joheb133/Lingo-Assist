import displayLanguages from "./gui/displayLanguages.js";
import displayLocalVocab, { clearLocalVocab } from "./gui/displayLocalVocab.js";
import displayLoginStatus, { login } from "./gui/displayLoginStatus.js";
import { getLocalVocab, syncDuolingo } from "./messages.js";

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


async function initDuolingoSync() {
    const failEl = document.querySelector('.duolingo-msg-el').querySelector('#fail-el')
    failEl.innerText = ''

    displayLoginStatus(login.LOADING)
    // syncDuolingo changes localStorage so await here is important
    const syncStatus = await syncDuolingo()
    const combinedISO = localStorage.getItem('combinedISO')

    if (combinedISO !== null) {
        // Don't care when displayLocalVocab is executed, only using await because it's so quick
        // it doesn't justify Promise.all()
        displayLocalVocab(await getLocalVocab(combinedISO))
        displayLanguages(combinedISO)
        failEl.innerText = !syncStatus ? 'Failed to login Duolingo, please login to sync vocab. Now using cached code course' : ''
    } else {
        failEl.innerText = 'Failed to login Duolingo, please login to sync vocab. No course code cached'
    }

    displayLoginStatus(syncStatus ? login.SUCCESS : login.FAIL)
}

initDuolingoSync()
