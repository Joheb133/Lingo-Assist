import convertSnakeCase from '../../../../utils/convertSnakeCase.js'

/**
 * Display table of learning words & translations in native language in a table
 * Use getLocalVocab(messages.js) response
 * @param {Object} obj - keys are learning words, values are translations
*/

export default function displayLocalVocab(obj) {
    clearLocalVocab()

    // Populate table body with vocab
    for (const [key, values] of Object.entries(obj)) {
        const valuesPos = {}
        values.forEach((value) => {
            // If untranslated
            if (value.translation === '') {
                // If POS table doesn't exist
                if (!document.querySelector('#default-wrap table')) {
                    createDefaultTable()
                }

                const table = document.querySelector('#default-wrap table')
                const row = document.createElement('tr')
                const word = document.createElement('td')
                word.innerText = convertSnakeCase(key, true)
                row.append(word)
                table.append(row)

                return
            }

            // If translated
            valuesPos[value.pos] = valuesPos[value.pos] ? valuesPos[value.pos] + 1 : 1;

            // If POS table doesn't exist
            if (!document.querySelector(`#${value.pos.toLowerCase()}-wrap table`)) {
                createTable(value.pos.toLowerCase())
            }

            const table = document.querySelector(`#${value.pos.toLowerCase()}-wrap table`)

            if (valuesPos[value.pos] > 1) {
                const transUl = table.rows[table.rows.length - 1].querySelector('ul')
                const transLi = document.createElement("li")
                transLi.innerText = convertSnakeCase(value.translation, true)
                transUl.append(transLi)
            } else {
                const row = document.createElement("tr")

                const word = document.createElement("td")
                word.innerText = convertSnakeCase(key, true)

                const translation = document.createElement("td")
                const transUl = document.createElement("ul")
                const transLi = document.createElement("li")
                transLi.innerText = convertSnakeCase(value.translation, true)
                transUl.append(transLi)
                translation.append(transUl)

                row.append(word, translation)

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

// Table for untranslated words
function createDefaultTable() {
    const tableContainer = document.querySelector('.table-container')
    const tableWrap = document.createElement('div')
    const tableEl = document.createElement('table')
    tableWrap.id = 'default-wrap'

    const tHeading1 = document.createElement('th')
    tHeading1.innerText = 'Word'
    const tHeadingRow = document.createElement('tr')
    const heading = document.createElement('h4')
    heading.innerText = 'Untranslated words'
    tHeadingRow.append(tHeading1)

    tableEl.append(tHeadingRow)
    tableWrap.append(heading, tableEl)
    tableContainer.prepend(tableWrap)
}

// Table for any part of speech
function createTable(pos) {
    const tableContainer = document.querySelector('.table-container')
    const tableWrap = document.createElement('div')
    const tableEl = document.createElement('table')
    tableWrap.id = `${pos.toLowerCase()}-wrap`

    const tHeading1 = document.createElement('th')
    const tHeading2 = document.createElement('th')
    tHeading1.innerText = 'Word'
    tHeading2.innerText = 'Translation'
    const tHeadingRow = document.createElement('tr')
    const heading = document.createElement('h4')
    heading.innerText = pos.charAt(0).toUpperCase() + pos.slice(1);
    tHeadingRow.append(tHeading1, tHeading2)

    tableEl.append(tHeadingRow)
    tableWrap.append(heading, tableEl)
    tableContainer.append(tableWrap)
}