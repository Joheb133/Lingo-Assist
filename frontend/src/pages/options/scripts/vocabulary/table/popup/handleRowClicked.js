import convertSnakeCase from '../../../../../../utils/convertSnakeCase.js'
import handleDataSave from './handleDataSave.js'
import handleTransEvents from './handleTranslationEvents.js'
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
        const popup = document.querySelector('.popup')

        const heading = popup.querySelector('header #title') // Heading
        heading.innerText = convertSnakeCase(word, true);

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
        const learningLanguageInputEl = popup.querySelector('#learning-language-input')
        const englishInputEl = popup.querySelector('#english-input')
        learningLanguageInputEl.value = wordDataEl.example?.native ?? ''
        englishInputEl.value = wordDataEl.example?.translation ?? ''

        // Save changes made in popup
        const saveBtn = document.querySelector('.popup button')
        saveBtn.addEventListener('click', () => handleDataSave(clickedRow, wordDataEl, vocab, combinedISO))
    }
}