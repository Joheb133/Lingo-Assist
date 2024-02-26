import { getData } from "../../../messages.js";
import startGame from "./game.js";
import createSettings from "./settings/index.js";
import { hideEndgamePopup } from "./hidePopups.js";

async function main() {
    const combinedISO = await getData('combinedISO')
    const vocab = await getData(combinedISO)

    if (combinedISO === null || vocab === null) {
        const gameWrap = document.querySelector('.game-wrap')
        for (const child of gameWrap.children) {
            if (child.classList.contains('no-words-wrap')) {
                child.classList.add('flex')
                child.classList.remove('hidden')
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
    createSettings(combinedISO, vocabEntries)

    const settingsBtn = document.querySelector('.options-btn')
    const popupWindow = document.querySelector('.popup-window');
    settingsBtn.addEventListener('click', () => {
        hideEndgamePopup()
        createSettings(combinedISO, vocabEntries)
        popupWindow.style.display = 'flex';
    })

    // Turn the popup window on and off
    popupWindow.addEventListener('mousedown', (event) => {
        if (event.target === popupWindow || event.target.closest('.esc-btn')) {
            popupWindow.style.display = 'none'
        }
    })

    startGame(combinedISO, vocabEntries)
}

main()