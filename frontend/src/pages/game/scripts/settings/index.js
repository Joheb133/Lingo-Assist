import handleSaveCheckBox from "./handleSaveCheckBox.js";
import returnCheckBox from "./returnCheckBox.js";

let saveBtnHandler; // Needed to store the right func reference for removeEventListener

// Create the settings checkboxes
export default async function createSettings(combinedISO, vocabEntries) {
    const saveBtn = document.querySelector('.save-btn')
    const checkBoxContainer = document.querySelector('.checkbox-container')
    const noWordsContainer = document.querySelector('.game-popup .no-words-container')

    // No words to select
    if (vocabEntries.length === 0) {
        saveBtn.classList.add('hidden')
        noWordsContainer.classList.remove('hidden')
        return;
    }

    saveBtn.classList.remove('hidden')
    noWordsContainer.classList.add('hidden')

    // Cleanup old resources
    saveBtn.removeEventListener('click', saveBtnHandler)
    checkBoxContainer.innerHTML = ''

    // Get words
    let checkedWords = JSON.parse(localStorage.getItem('checkedWords'))

    if (!checkedWords || !checkedWords[combinedISO]) {
        // Update checkedWords to the selected course
        checkedWords = { [combinedISO]: {} }
    }

    // Create a checkbox for each word

    for (const [word, _] of vocabEntries) {
        if (checkedWords[combinedISO][word] === undefined) {
            // If checkedWords doesn't have the vocab word, add it to checkedWords
            checkedWords[combinedISO][word] = true;
        }
        const checkBox = returnCheckBox(word, checkedWords[combinedISO][word])
        checkBoxContainer.append(checkBox)
    }

    localStorage.setItem('checkedWords', JSON.stringify(checkedWords))

    saveBtnHandler = () => handleSaveCheckBox(checkedWords, combinedISO)
    saveBtn.addEventListener('click', saveBtnHandler)
}