import { getLocalVocab } from "../../../messages.js";

let wordIndex = 0;

async function init() {
    const combinedISO = localStorage.getItem('combinedISO')
    const vocab = await getLocalVocab(combinedISO)

    if (!vocab) {
        console.error(`Error loading vocab on ${combinedISO}`)
        return
    }

    // Temporarily remove verbs
    const vocabArr = Object.entries(vocab).map(([word, dataArr]) => [
        word,
        dataArr.filter((dataEl) => dataEl.pos !== 'Verb')
    ]).filter(([_, dataArr]) => dataArr.length > 0)

    console.log(vocabArr)

    const wordWrapEl = document.querySelector('.word-wrap')
    wordWrapEl.innerHTML = `<span>${vocabArr[0][0]}</span>`
    console.log(vocabArr[0][1][0].translation)

    const inputEl = document.querySelector('.game-wrap input')
    inputEl.addEventListener('keydown', inputFunc)

    const restartBtn = document.querySelector('.restart-btn')
    restartBtn.addEventListener('click', restartFunc)

    function inputFunc(e) {
        if (e.code !== 'Enter') return

        const wordDataArr = vocabArr[0][1]
        const firstWordData = wordDataArr[0]

        // Compare word on screen with translation(s)

        if (inputEl.value.toLowerCase() === firstWordData.translation.toLowerCase()) { // User input right
            // Remove that word data from vocabArr
            if (vocabArr[0][1].length >= 2) {
                vocabArr[0][1].shift()
            } else {
                vocabArr.shift()
            }
            console.log(true, inputEl.value.toLowerCase(), firstWordData.translation.toLowerCase(), vocabArr)
        } else {
            // Move first word to end of array
            vocabArr.push(vocabArr.shift());
            console.log(false, inputEl.value.toLowerCase(), firstWordData.translation.toLowerCase(), vocabArr)
        }

        if (vocabArr.length === 0) {
            wordWrapEl.innerHTML = `<span>Nice job!</span>`
            inputEl.removeEventListener('keydown', inputFunc)
        } else {
            inputEl.value = '';
            wordWrapEl.innerHTML = `<span>${vocabArr[0][0]}</span>`
            console.log(vocabArr[0][1][0].translation)
        }
    }

    function restartFunc() {
        // Remove listeners
        console.log('...Restarting game')
        inputEl.removeEventListener('keydown', inputFunc)
        restartBtn.removeEventListener('click', restartFunc)
        init()
    }
}

init()