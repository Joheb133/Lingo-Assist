import convertSnakeCase from "../../../../utils/convertSnakeCase.js"

// Create an element containing a checkbox and a word

export default function returnCheckBox(word, boolean) {
    const wrapEl = document.createElement('div')
    wrapEl.className = 'checkbox-wrapper'
    const spanEl = document.createElement('span')
    const checkBox = document.createElement('input')

    spanEl.innerText = convertSnakeCase(word);
    checkBox.type = 'checkbox'
    checkBox.checked = boolean

    wrapEl.append(checkBox, spanEl)

    return wrapEl;
}