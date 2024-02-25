import convertSnakeCase from '../../../../../../utils/convertSnakeCase.js'
import handleDataSave from './handleDataSave.js'
import handleTransEvents from './handleTranslationElEvents.js'
import returnNewLi from './returnNewLi.js'

// Show the popup with the clicked rows data
export default function editRowClicked(event, rowWordDataArr, vocab, combinedISO) {
    const clickedRow = event.target.closest('tr')

    if (clickedRow) {
        const wordDataEl = rowWordDataArr[clickedRow.rowIndex - 1] // Data associated with this row
        const word = wordDataEl.word

        // Show popup
        const popupWindow = document.querySelector('.popup-window');
        popupWindow.style.display = 'flex';

        // Prevent scrolling
        document.body.classList.toggle('overflow-hidden');

        /* Fill popup with data */
        const popup = document.querySelector('.options-popup')

        const heading = popup.querySelector('header #title') // Heading
        heading.innerText = convertSnakeCase(word, true);

        const lastPracticedEl = popup.querySelector('.data-wrap #last-practiced-el')
        const lastPracticedMs = wordDataEl['last_practiced_ms']
        if (lastPracticedMs) {
            const date = new Date(lastPracticedMs)
            const year = date.getFullYear();
            const month = date.toLocaleString('en-US', { month: 'short' });
            const day = date.getDate()

            lastPracticedEl.innerText = `${day} ${month} ${year}`
        } else {
            lastPracticedEl.innerText = ''
        }

        const strengthEl = popup.querySelector('.data-wrap #strength-el')// Strength
        strengthEl.innerText = Number(wordDataEl.strength.toFixed(2))

        // Translations
        const transUl = popup.querySelector('.translations-wrap ul')
        const addTransWrap = transUl.querySelector('.add-trans-wrap')
        transUl.innerHTML = '' // Reset ul
        for (const translation of wordDataEl.translations) {
            const li = returnNewLi(translation)
            transUl.append(li)
        }
        transUl.append(addTransWrap)
        transUl.addEventListener('click', handleTransEvents)

        const posInputEl = popup.querySelector('.pos-wrap input') // Part of Speech
        posInputEl.value = wordDataEl.pos ?? ''

        const infinitiveInputEl = popup.querySelector('.infinitive-wrap input') // Infinitive
        infinitiveInputEl.value = wordDataEl.infinitive !== null ? convertSnakeCase(wordDataEl.infinitive, true) : ''

        // Examples
        const learningLanguageTA = popup.querySelector('#learning-language-ta')
        const englishTA = popup.querySelector('#english-ta')
        learningLanguageTA.value = wordDataEl.example?.native ?? ''
        englishTA.value = wordDataEl.example?.translation ?? ''

        // Save changes made in popup
        const saveBtn = document.querySelector('.options-popup button')
        saveBtn.addEventListener('click', () => handleDataSave(clickedRow, wordDataEl, vocab, combinedISO))
    }
}