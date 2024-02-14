import convertSnakeCase from '../../../../utils/convertSnakeCase.js'

/**
 * Display table of learning words & translations in native language in a table
 * Use getLocalVocab(messages.js) response
 * @param {Object} obj - keys are learning words, values are translations
*/

export default function displayLocalVocab(obj) {
    clearLocalVocab()

    // Populate table body with vocab
    for (const [word, wordDataArr] of Object.entries(obj)) {
        const wordDataPos = {}
        wordDataArr.forEach((value) => {
            // If untranslated
            if (value.translation.length === 0) {
                // If POS table doesn't exist
                if (!document.querySelector('#default-wrap table')) {
                    createTable()
                }

                const table = document.querySelector('#default-wrap table')
                const row = document.createElement('tr')
                const wordEl = document.createElement('td')
                wordEl.innerText = convertSnakeCase(word, true)
                row.append(wordEl)
                table.append(row)

                return
            }

            // If translated
            wordDataPos[value.pos] = wordDataPos[value.pos] ? wordDataPos[value.pos] + 1 : 1;

            // If POS table doesn't exist
            if (!document.querySelector(`#${value.pos.toLowerCase()}-wrap table`)) {
                createTable(value.pos.toLowerCase())
            }

            const table = document.querySelector(`#${value.pos.toLowerCase()}-wrap table`)

            if (wordDataPos[value.pos] > 1) {
                const transUl = table.rows[table.rows.length - 1].querySelector('ul')
                value.translation.forEach((translationEl) => {
                    const transLi = document.createElement("li")
                    transLi.innerText = convertSnakeCase(translationEl, true)
                    transUl.append(transLi)
                })
            } else {
                const row = document.createElement("tr")

                const wordEl = document.createElement("td")
                wordEl.innerText = convertSnakeCase(word, true)

                const translation = document.createElement("td")
                const transUl = document.createElement("ul")
                value.translation.forEach((translationEl) => {
                    const transLi = document.createElement("li")
                    transLi.innerText = convertSnakeCase(translationEl, true)
                    transUl.append(transLi)
                })
                translation.append(transUl)

                row.append(wordEl, translation)

                table.append(row)
            }
        })
    }
}

export function clearLocalVocab() {
    // Wipe table data
    const table = document.querySelector(".table-container")
    table.innerHTML = '';
}

function createTable(pos) {
    const tableContainer = document.querySelector('.table-container');
    const tableWrap = document.createElement('div');
    const tableEl = document.createElement('table');

    const tHeading1 = document.createElement('th');
    tHeading1.innerText = 'Word';

    const tHeadingRow = document.createElement('tr');
    const heading = document.createElement('h4');

    // Add Translation header only if pos is provided
    if (pos) {
        const tHeading2 = document.createElement('th');
        tHeading2.innerText = 'Translation';
        tableWrap.id = `${pos.toLowerCase()}-wrap`
        heading.innerText = pos.charAt(0).toUpperCase() + pos.slice(1)
        tHeadingRow.append(tHeading1, tHeading2);
    } else {
        tableWrap.id = 'default-wrap'
        heading.innerText = 'Untranslated Words'
        tHeadingRow.append(tHeading1)
    }

    tableEl.append(tHeadingRow);
    tableWrap.append(heading, tableEl);

    // Use prepend for default table, append for part of speech tables
    pos ? tableContainer.append(tableWrap) : tableContainer.prepend(tableWrap);
}