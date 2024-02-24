import displayVocab from "../vocabulary/table/displayVocab.js";
import displayLoginStatus, { login } from "./displayLoginStatus.js";
import displayWordsLearned from "../vocabulary/displayWordsLearned.js";
import { ISO_to_words } from "../../../../utils/ISO.js";
import { getData, syncDuolingo } from "../../../../messages.js";

// Everything that happens when we sync vocabulary from duolingo
export default async function duolingoSync() {
    const duolingoSyncBtn = document.querySelector('.duolingo-sync-btn')
    duolingoSyncBtn.disabled = true;
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
        const learningLanuage = ISO_to_words[learningISO]
        learningEl.innerText = learningLanuage

        // Set language for popup
        const nativeTA = document.querySelector('.options-popup #learning-language-ta')
        nativeTA.placeholder = learningLanuage
    }

    const vocabKeys = !vocab ? [] : Object.keys(vocab)

    if (vocabKeys.length === 0) {
        failEl.innerText = `${syncStatus ? '' : baseFailMsg} ${combinedISO === null ? 'No course code cached' : 'No vocab in storage'}`
        return
    }

    // Display words learned
    displayWordsLearned(vocab)

    displayVocab(vocab, combinedISO)
    failEl.innerText = !syncStatus ? baseFailMsg + 'Using cached code course instead' : ''

    const tableContainer = document.querySelector('.table-container')
    if (tableContainer.style.maxHeight !== '') { // User decided to show table
        tableContainer.style.maxHeight = `${tableContainer.scrollHeight}px`;
    }

    duolingoSyncBtn.disabled = false;
}