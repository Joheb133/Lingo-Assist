
export default function handleSaveCheckBox(checkedWords, combinedISO) {
    console.log('saved')
    const checkedWordsArr = Object.entries(checkedWords[combinedISO])
    // Update checkedWords with checkbox value
    const checkBoxs = document.querySelectorAll('.checkbox-container .checkbox-wrapper input')

    for (let i = 0; i < checkBoxs.length; i++) {
        checkedWordsArr[i][1] = checkBoxs[i].checked;
    }

    checkedWords = { [combinedISO]: Object.fromEntries(checkedWordsArr) };
    localStorage.setItem('checkedWords', JSON.stringify(checkedWords));
}