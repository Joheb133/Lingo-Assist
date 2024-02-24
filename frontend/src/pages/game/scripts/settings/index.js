import { getData } from "../../../../messages.js";
import returnCheckBox from "./returnCheckBox.js";

// code for settings btn
export default async function settingsInit() {
    const settingsBtn = document.querySelector('.options-btn')
    const popupWindow = document.querySelector('.popup-window');
    settingsBtn.addEventListener('click', () => {
        // Show popup window
        popupWindow.style.display = 'flex';
    })

    // Turn the popup window on and off
    popupWindow.addEventListener('mousedown', (event) => {
        if (event.target === popupWindow || event.target.closest('.esc-btn')) {
            popupWindow.style.display = 'none'
        }
    })

    // Get words
    const combinedISO = await getData('combinedISO')
    const vocab = await getData(combinedISO);

    /* Filter out invalid words */

    // Temporarily remove verbs
    const vocabArr = Object.entries(vocab).map(([word, dataArr]) => [
        word,
        dataArr.filter((dataEl) => dataEl.pos !== 'Verb' && dataEl.translations.length !== 0)
    ]).filter(([_, dataArr]) => dataArr.length > 0)

    // Create a checkbox for each word
    const checkBoxContainer = document.querySelector('.checkbox-container')
    for (const [word, _] of vocabArr) {
        const checkBox = returnCheckBox(word)
        checkBoxContainer.append(checkBox)
    }
}