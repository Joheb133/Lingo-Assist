import { getData } from "../../../messages.js";
import convertSnakeCase from "../../../utils/convertSnakeCase.js"
import startGame from "./game.js";
import createSettings from "./settings/index.js";

const combinedISO = await getData('combinedISO')
const vocab = await getData(combinedISO)

/* 
Handle no data on combinedISO || vocab
*/

// Temporarily remove verbs
const vocabEntries = Object.entries(vocab).map(([word, dataArr]) => [
    word,
    dataArr.filter((dataEl) => dataEl.pos !== 'Verb' && dataEl.translations.length !== 0)
]).filter(([_, dataArr]) => dataArr.length > 0)
createSettings(combinedISO, vocabEntries)

const settingsBtn = document.querySelector('.options-btn')
const popupWindow = document.querySelector('.popup-window');
settingsBtn.addEventListener('click', () => {
    createSettings(combinedISO, vocabEntries)
    // Show popup window
    popupWindow.style.display = 'flex';
})

// Turn the popup window on and off
popupWindow.addEventListener('mousedown', (event) => {
    if (event.target === popupWindow || event.target.closest('.esc-btn')) {
        popupWindow.style.display = 'none'
    }
})

startGame(combinedISO, vocabEntries)