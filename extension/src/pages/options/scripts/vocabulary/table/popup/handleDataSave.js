import updateRow from './updateRow.js'

// Save user edits to local storage
export default async function handleDataSave(row, rowWord, vocab, combinedISO) {
    const popup = document.querySelector('.options-popup')
    const saveBtn = popup.querySelector('.save-btn')
    saveBtn.disabled = true;

    const wordDataEl = rowWord[0]
    const wordMetaData = rowWord[1]

    /* Get data in different elements */

    // Translations
    const translationsUl = popup.querySelector('.translations-wrap ul')
    const translations = []
    for (const translationLi of translationsUl.querySelectorAll('li:not(.add-trans-wrap)')) {
        const translation = translationLi.textContent;
        translations.push(translation)
    }

    // Part of Speech
    const posInputEl = popup.querySelector('.pos-wrap input')
    const pos = posInputEl.value === '' ? null : posInputEl.value;

    // Infinitive
    const infinitiveInputEl = popup.querySelector('.infinitive-wrap input')
    const infinitive = infinitiveInputEl.value === '' ? null : infinitiveInputEl.value

    // Examples // plans to change to text area
    const llInputEl = popup.querySelector('#learning-language-ta')
    const englishInputEl = popup.querySelector('#english-ta')

    const llExample = llInputEl.value === '' ? null : llInputEl.value;
    const englishExample = englishInputEl.value === '' ? null : englishInputEl.value;

    // Create new wordDataEl
    const newWordDataEl = {
        translations,
        pos,
        infinitive,
        'last_practiced_ms': wordDataEl['last_practiced_ms'],
        strength: wordDataEl.strength,
        example: {
            native: llExample,
            translation: englishExample
        }
    }

    // Check if wordDataEl.duolingo_id exists
    if (wordDataEl.duolingo_id) {
        newWordDataEl.duolingo_id = wordDataEl.duolingo_id;
    }

    const wordDataElIndex = wordMetaData.wordDataArrIndex;
    const word = wordMetaData.word;

    /* Save wordDataEl into local storage */
    vocab[word][wordDataElIndex] = newWordDataEl
    chrome.storage.local.set({ [combinedISO]: vocab })

    updateRow(row, newWordDataEl)

    // Update wordDataEl
    wordDataEl.translations = translations;
    wordDataEl.pos = pos;
    wordDataEl.infinitive = infinitive;
    wordDataEl.example = {
        native: llExample,
        translation: englishExample
    }

    saveBtn.disabled = false;
}