// Create and return a new list item containing the translation
export default function returnNewLi(translation) {
    const li = document.createElement('li')
    const spanEl = document.createElement('span')
    spanEl.innerText = translation
    li.append(spanEl)
    return li;
}