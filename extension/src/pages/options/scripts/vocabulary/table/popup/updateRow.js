import convertSnakeCase from "../../../../../../utils/convertSnakeCase.js"

// Update the row with the new edits
export default function updateRow(row, newWordDataEl) {
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