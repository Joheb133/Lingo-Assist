import { getData } from "../../../messages.js";
import startGame from "./game.js";
import createSettings from "./settings/index.js";
import { hideEndgamePopup } from "./hidePopups.js";
import { orderByAlphabet, orderByLastPracticed, orderByStrength } from "./settings/orderWords.js";

async function main() {
    const combinedISO = await getData('combinedISO')
    const vocab = await getData(combinedISO)

    if (combinedISO === null || vocab === null) {
        const gameWrap = document.querySelector('.game-wrap')
        for (const child of gameWrap.children) {
            if (child.classList.contains('no-words-wrap')) {
                child.classList.add('flex')
                child.classList.remove('hidden')
                child.querySelector('p').innerText = 'You have no words locally saved'
            } else {
                child.classList.add('hidden')
            }
        }
        return
    }

    // Temporarily remove verbs
    const vocabEntries = Object.entries(vocab).map(([word, dataArr]) => [
        word,
        dataArr.filter((dataEl) => dataEl.pos !== 'Verb' && dataEl.translations.length !== 0)
    ]).filter(([_, dataArr]) => dataArr.length > 0)

    const defVocabEntries = orderByAlphabet(vocabEntries) // By default order by alphabet
    createSettings(combinedISO, defVocabEntries)

    const settingsBtn = document.querySelector('.options-btn')
    const popupWindow = document.querySelector('.popup-window');
    settingsBtn.addEventListener('click', () => {
        hideEndgamePopup()
        popupWindow.style.display = 'flex';
    })

    // Turn the popup window on and off
    popupWindow.addEventListener('mousedown', (event) => {
        if (event.target === popupWindow || event.target.closest('.esc-btn')) {
            popupWindow.style.display = 'none'
        }
    })

    // Listen to radio buttons
    const settingsFilterContainer = document.querySelector('.settings-filter-container')
    let alphBool = false
    let streBool = false
    let lastPracBool = false;

    settingsFilterContainer.addEventListener('mouseup', (event) => {
        const label = event.target.closest('label')

        if (label) {
            const inputEl = label.querySelector('input')
            const inputName = inputEl.id

            switch (inputName) {
                case 'order-alphabet':
                    createSettings(combinedISO, orderByAlphabet(vocabEntries, alphBool))
                    alphBool = !alphBool
                    break;
                case 'order-strength':
                    createSettings(combinedISO, orderByStrength(vocabEntries, streBool))
                    streBool = !streBool
                    break;
                case 'order-last-practiced':
                    createSettings(combinedISO, orderByLastPracticed(vocabEntries, lastPracBool))
                    lastPracBool = !lastPracBool
                    break;
            }
        }
    })

    startGame(combinedISO, vocabEntries)
}

main()