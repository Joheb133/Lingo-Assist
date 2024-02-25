import convertSnakeCase from '../../../../../utils/convertSnakeCase.js'
import clearVocab from './clearVocab.js';
import editRowClicked from './popup/handleRowClicked.js'

// Fill in the vocabulary table on main page with word data
export default function displayVocab(vocab, combinedISO) {
    clearVocab();
    const table = document.querySelector('.table-container table')
    const tbody = document.createElement('tbody')

    const rowWordDataArr = []; // An array that stores wordDataEl's used to create a table row

    for (const [word, wordDataArr] of Object.entries(vocab)) {
        let i = -1; // store wordDataEl index -> ensure's right wordDataEl is replaced later
        for (const wordDataEl of wordDataArr) {
            i++;

            // Ensure word isn't a duplicate
            if (wordDataEl.duplicate) continue;

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
            // const exampleTd = document.createElement('td');
            // const exampleNative = wordDataEl.example?.native ?? null;
            // exampleTd.innerText = exampleNative !== null ? exampleNative : '';

            // Strength
            const strengthTd = document.createElement('td')
            strengthTd.innerText = Number(wordDataEl.strength.toFixed(2))

            // Last practiced
            const lastPracticedTd = document.createElement('td')
            const lastPracticedMs = wordDataEl['last_practiced_ms']
            if (lastPracticedMs) {
                const date = new Date(lastPracticedMs)
                const year = date.getFullYear();
                const month = date.toLocaleString('en-US', { month: 'short' });
                const day = date.getDate()

                lastPracticedTd.innerText = `${day} ${month} ${year}`
            } else {
                lastPracticedTd.innerText = ''
            }

            // Append elements
            row.append(wordTd, translationTd, posTd, infinitiveTd, strengthTd, lastPracticedTd)
            tbody.append(row)

            wordDataEl.index = i;
            wordDataEl.word = word;

            // Add row data to arr
            rowWordDataArr.push(wordDataEl)
        }
    }
    table.append(tbody)

    // Responsable for enabling popup
    tbody.addEventListener('click', (event) => { editRowClicked(event, rowWordDataArr, vocab, combinedISO) })
}