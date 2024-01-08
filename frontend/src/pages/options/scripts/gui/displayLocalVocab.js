import convertSnakeCase from '../../../../utils/convertSnakeCase.js'

/**
 * Display table of learning words & translations in native language in a table
 * Use getLocalVocab(messages.js) response
 * @param {Object} obj - keys are learning words, values are translations
*/

export default function displayLocalVocab(obj) {
    clearLocalVocab()

    const tableEl = document.querySelector("#vocab-table")
    const bodyEl = document.createElement('tbody')

    // Populate table body with vocab
    for (const [key, value] of Object.entries(obj)) {
        const row = document.createElement("tr")

        const word = document.createElement("td")
        word.innerText = convertSnakeCase(key, true)

        const translation = document.createElement("td")
        translation.innerText = convertSnakeCase(value.translation, true)

        row.append(word, translation)

        bodyEl.appendChild(row)
    }

    tableEl.appendChild(bodyEl)
}

export function clearLocalVocab() {
    // Wipe table data
    const table = document.querySelector("#vocab-table")
    const headings = table.firstElementChild
    table.innerHTML = ''
    table.appendChild(headings)
}