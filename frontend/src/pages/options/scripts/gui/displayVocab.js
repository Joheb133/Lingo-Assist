import convertSnakeCase from '../../../../utils/convertSnakeCase.js'

export default function displayVocab(vocab) {
    clearVocab();
    const table = document.querySelector('.table-container table')
    const tbody = document.createElement('tbody')
    for (const [word, wordDataArr] of Object.entries(vocab)) {
        for (const wordDataEl of wordDataArr) {
            // Ensure word isn't a duplicate
            if (wordDataEl?.duplicate === true) continue

            const row = document.createElement('tr')

            // Word
            const wordTd = document.createElement('td')
            wordTd.innerText = convertSnakeCase(word, true);

            // Translation
            const translationTd = document.createElement('td');
            const translationUl = document.createElement('ul');

            for (const translation of wordDataEl.translation.splice(0, 2)) {
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
        }
    }
    table.append(tbody)

    tbody.addEventListener('click', (event) => { editRow(event, vocab) })
}

export function clearVocab() {
    // Wipe table data (keep header)
    const table = document.querySelector(".table-container table");
    const tbody = table.querySelector("tbody");
    if (tbody) {
        tbody.removeEventListener('click', editRow)
        table.removeChild(tbody)
    }
}

const popupWindow = document.querySelector('.popup-window');
popupWindow.addEventListener('click', () => popupWindow.style.display = 'none')

function editRow(event, vocab) {
    const clickedRow = event.target.closest('tr')

    if (clickedRow) {
        const wordTdInnerText = clickedRow.firstChild.textContent.toLowerCase();
        const wordDataArr = vocab[wordTdInnerText];

        // Show popup
        const popupWindow = document.querySelector('.popup-window');
        popupWindow.style.display = 'flex'
    }
}