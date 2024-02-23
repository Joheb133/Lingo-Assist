import displayVocab from "../vocabulary/table/displayVocab.js";
import displayWordsLearned from "../vocabulary/displayWordsLearned.js";
import { getData, requestTranslations } from "../../../../messages.js";


export default function handleTranslation() {
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
        displayWordsLearned(vocab)

        translateBtn.disabled = false;
    });
}