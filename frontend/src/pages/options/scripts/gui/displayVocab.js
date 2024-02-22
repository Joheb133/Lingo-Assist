import convertSnakeCase from '../../../../utils/convertSnakeCase.js'

// Fill in the vocabulary table with word data
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

            for (const translation of wordDataEl.translation.slice(0, 2)) {
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

            // Add row data to arr
            const wordObj = { word, wordDataEl, wordDataElIndex: i }
            rowWordDataArr.push(wordObj)
        }
    }
    table.append(tbody)

    tbody.addEventListener('click', (event) => { editRowClicked(event, rowWordDataArr) })
}

export function clearVocab() {
    // Wipe table data (keep header)
    const table = document.querySelector(".table-container table");
    const tbody = table.querySelector("tbody");
    if (tbody) {
        tbody.removeEventListener('click', editRowClicked)
        table.removeChild(tbody)
    }
}

const popupWindow = document.querySelector('.popup-window');
popupWindow.addEventListener('click', (event) => {
    if (event.target === popupWindow || event.target.closest('.esc-btn')) {
        popupWindow.style.display = 'none'

        // Enable scrolling
        document.body.classList.toggle('overflow-hidden')
    }
})

function editRowClicked(event, rowWordDataArr) {
    const clickedRow = event.target.closest('tr')

    if (clickedRow) {
        const rowDataEl = rowWordDataArr[clickedRow.rowIndex - 1] // Data associated with this row
        const word = rowDataEl.word
        const wordDataEl = rowDataEl.wordDataEl
        const wordDataElIndex = rowWordDataArr.wordDataElIndex

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
        for (const translation of wordDataEl.translation) {
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
    }

    function returnNewTransItem(translation) {
        const li = document.createElement('li')
        const spanEl = document.createElement('span')
        spanEl.innerText = translation
        spanEl.role = 'textbox'
        spanEl.contentEditable = true;
        li.append(spanEl)
        return li;
    }

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

            // Move cursor to the end
            const spanEl = li.querySelector('span')
            spanEl.focus();
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(spanEl);
            range.collapse(false); // Collapse to the end
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    // Add new translation button

    // Remove empty span
}