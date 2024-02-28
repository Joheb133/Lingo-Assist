import clearVocab from "../vocabulary/table/clearVocab.js";
import { getData } from "../../../../messages.js";

export default function handleClearVocab() {
    // Clear words from local storage
    const clearBtn = document.querySelector('.clear-btn');
    clearBtn.addEventListener('click', async function () {
        const combinedISO = await getData('combinedISO')
        if (combinedISO === false) {
            return
        }
        chrome.storage.local.set({ [combinedISO]: {} })
        clearVocab()

        // Display words learned
        const wordsLearnedEl = document.querySelector('.duolingo-msg-el #words-learned')
        wordsLearnedEl.innerText = '';
    })
}