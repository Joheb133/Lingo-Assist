
export default function handleSaveCheckBox(checkedWords, combinedISO) {
    // Update checkedWords with checkbox value
    const checkBoxs = document.querySelectorAll('.checkbox-container .checkbox-wrapper')

    for (let i = 0; i < checkBoxs.length; i++) {
        const word = checkBoxs[i].querySelector('span').innerText.replace(/ /g, "_")
        checkedWords[combinedISO][word] = checkBoxs[i].querySelector('input').checked
    }

    localStorage.setItem('checkedWords', JSON.stringify(checkedWords));

    console.log('saved')
}