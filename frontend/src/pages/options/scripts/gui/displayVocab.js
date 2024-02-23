import { getData } from '../../../../messages.js';
import convertSnakeCase from '../../../../utils/convertSnakeCase.js'

// Fill in the vocabulary table on main page with word data
export default function displayVocab(vocab) {
    clearVocab();
    const table = document.querySelector('.table-container table')
    const tbody = document.createElement('tbody')

    const rowWordDataArr = []; // An array that stores wordDataEl's used to create a table row

    for (const [word, wordDataArr] of Object.entries(vocab)) {
        let i = -1; // store wordDataEl index -> ensure's right wordDataEl is replaced later
        for (const wordDataEl of wordDataArr) {
            i++;

            // Ensure word isn't a duplicate
            if (wordDataEl?.duplicate === true) continue

            const row = document.createElement('tr')

            // Word
            const wordTd = document.createElement('td')
            wordTd.innerText = convertSnakeCase(word, true);

            // Translation
            const translationTd = document.createElement('td');
            const translationUl = document.createElement('ul');

            for (const translation of wordDataEl.translations.slice(0, 2)) {
                const translationLi = document.createElement('li');
                const translationSpan = document.createElement('span')
                translationSpan.innerText = convertSnakeCase(translation, true)
                translationLi.append(translationSpan)
                translationUl.append(translationLi)
            }

            translationTd.append(translationUl)

            // Part of Speech
            const posTd = document.createElement('td')
            posTd.innerText = wordDataEl.pos;

            // Infinitive
            const infinitiveTd = document.createElement('td')
            const infinitive = wordDataEl.infinitive
            infinitiveTd.innerText = infinitive !== null ? convertSnakeCase(infinitive, true) : '';

            // Example
            const exampleTd = document.createElement('td');
            const exampleNative = wordDataEl.example?.native ?? null;
            exampleTd.innerText = exampleNative !== null ? exampleNative : '';

            // Append elements
            row.append(wordTd, translationTd, posTd, infinitiveTd, exampleTd)
            tbody.append(row)

            wordDataEl.index = i;
            wordDataEl.word = word;

            // Add row data to arr
            rowWordDataArr.push(wordDataEl)
        }
    }
    table.append(tbody)

    // Responsable for enabling popup
    tbody.addEventListener('click', (event) => { editRowClicked(event, rowWordDataArr, vocab) })
}

export function clearVocab() {
    // Wipe table data (keep header)
    const table = document.querySelector(".table-container table");
    const tbody = table.querySelector("tbody");
    if (tbody) {
        tbody.removeEventListener('click', editRowClicked)
        table.removeChild(tbody)
    }

    const transUl = document.querySelector('.popup .translations-wrap ul')
    transUl.removeEventListener('click', handleTransEvents)

    const saveBtn = document.querySelector('.popup button')
    saveBtn.removeEventListener('click', handleDataSave)
}

/* Popup GUI and functionality */

const popupWindow = document.querySelector('.popup-window');
popupWindow.addEventListener('mousedown', (event) => {
    if (event.target === popupWindow || event.target.closest('.esc-btn')) {
        popupWindow.style.display = 'none'

        // Enable scrolling
        document.body.classList.toggle('overflow-hidden')
    }
})

// Show the popup with the clicked rows data
function editRowClicked(event, rowWordDataArr, vocab) {
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
            const li = returnNewTransItem(translation)
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
        saveBtn.addEventListener('click', () => handleDataSave(clickedRow, wordDataEl, vocab))
    }
}

// Create and return a new list item
function returnNewTransItem(translation) {
    const li = document.createElement('li')
    const spanEl = document.createElement('span')
    spanEl.innerText = translation
    li.append(spanEl)
    return li;
}

// Handle the logic that occurs when the translation element of the popup is clicked
function handleTransEvents(event) {
    const clickedLi = event.target.closest('li')

    if (clickedLi) {
        let li = clickedLi;
        if (clickedLi.classList.contains('add-trans-wrap')) { // Add new translation
            const transUl = document.querySelector('.popup .translations-wrap ul')
            const newLi = returnNewTransItem('')
            transUl.insertBefore(newLi, clickedLi)
            li = newLi
        }

        // Enable span to be a textbox
        const spanEl = li.querySelector('span')
        spanEl.role = 'textbox'
        spanEl.contentEditable = true;
        spanEl.focus();

        // Move cursor to the end
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(spanEl);
        range.collapse(false); // Collapse to the end
        selection.removeAllRanges();
        selection.addRange(range);

        spanEl.addEventListener('blur', handleLiBlur)

        // Handle clicking off li
        function handleLiBlur() {
            spanEl.contentEditable = 'false'; // Turn off span editing
            spanEl.role = null;

            spanEl.innerText = spanEl.innerText.trim();

            // Ensure span is valid else remove the li
            spanEl.removeAttribute('role');
            if (spanEl.innerText === '') {
                li.remove();
            }
            spanEl.removeEventListener('blur', handleLiBlur);
        }
    }
}


async function handleDataSave(row, wordDataEl, vocab) {
    const popup = document.querySelector('.popup')
    const saveBtn = popup.querySelector('.save-btn')
    saveBtn.disabled = true;
    saveBtn.innerText = 'Saving...'

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
    const infinitive = infinitiveInputEl === '' ? null : infinitiveInputEl.value

    // Examples // plans to change to text area
    const llInputEl = popup.querySelector('#learning-language-input')
    const englishInputEl = popup.querySelector('#english-input')

    const llExample = llInputEl.value === '' ? null : llInputEl.value;
    const englishExample = englishInputEl.value === '' ? null : englishInputEl;

    // Create new wordDataEl
    const newWordDataEl = {
        translations,
        pos,
        infinitive,
        example: {
            native: llExample,
            translation: englishExample
        }
    }

    // Check if wordDataEl.duolingo_id exists
    if (wordDataEl.duolingo_id) {
        newWordDataEl.duolingo_id = wordDataEl.duolingo_id;
    }

    const wordDataElIndex = wordDataEl.index;
    const word = wordDataEl.word;

    /* Save wordDataEl into local storage */
    const combinedISO = await getData('combinedISO')
    vocab[word][wordDataElIndex] = newWordDataEl
    chrome.storage.local.set({ [combinedISO]: vocab })

    updateRow(row, newWordDataEl)

    // Update wordDataEl
    wordDataEl.translations = translations;
    wordDataEl.pos = pos;
    wordDataEl.infinitive = infinitive;
    wordDataEl.example.native = llExample;
    wordDataEl.example.translation = englishExample;

    // Create a function that resolves after a specified time
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    await delay(150);

    saveBtn.innerText = 'Save'
    saveBtn.disabled = false;
}

// Update the row with the new edits
function updateRow(row, newWordDataEl) {
    const transTd = row.cells[1]
    const posTd = row.cells[2]
    const infinitiveTd = row.cells[3]
    const exampleTd = row.cells[4]

    // Update translations
    const transUl = transTd.querySelector('ul')
    transUl.innerHTML = ''
    for (const translation of newWordDataEl.translations.slice(0, 2)) {
        const li = document.createElement('li')
        li.innerText = translation;
        transUl.append(li)
    }

    // Update other stuff
    posTd.innerText = newWordDataEl.pos

    const infinitive = newWordDataEl.infinitive
    infinitiveTd.innerText = infinitive !== null ? convertSnakeCase(infinitive, true) : '';

    const exampleNative = newWordDataEl.example?.native ?? null;
    exampleTd.innerText = exampleNative !== null ? exampleNative : '';
}