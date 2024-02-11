import { getData } from "../../../messages.js";
import convertSnakeCase from "../../../utils/convertSnakeCase.js"


async function init() {
    const combinedISO = await getData('combinedISO')
    const vocab = await getData(combinedISO)
    let wordCount = 0;
    let rightCount = 0;
    let wrongCount = 0;

    if (!vocab) {
        console.error(`Error loading vocab on ${combinedISO}`)
        return
    }

    // Temporarily remove verbs
    const vocabArr = Object.entries(vocab).map(([word, dataArr]) => [
        word,
        dataArr.filter((dataEl) => dataEl.pos !== 'Verb')
    ]).filter(([_, dataArr]) => dataArr.length > 0)

    const wordWrapEl = document.querySelector('.word-wrap')
    const wordWrapInnerHtml = `<span>${convertSnakeCase(vocabArr[0][0], true)}</span><span class="opacity-50 font-light text-sm">Part of Speech: <span class="opacity-100 font-normal">${vocabArr[0][1][0].pos}</span></span>`
    wordWrapEl.innerHTML = wordWrapInnerHtml

    const inputEl = document.querySelector('.game-wrap input')
    inputEl.addEventListener('keydown', inputFunc)

    const restartBtn = document.querySelector('.restart-btn')
    restartBtn.addEventListener('click', restartFunc)

    // Counters
    const wordCounterEl = document.querySelector('#word-counter')
    const rightCounterEl = document.querySelector('#right-counter')
    const wrongCounterEl = document.querySelector('#wrong-counter')

    vocabArr.forEach(([_, dataArr]) => {
        wordCount += dataArr.length
    })

    wordCounterEl.innerText = wordCount

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
            wordCount--;
            wordCounterEl.innerText = wordCount;
            rightCount++;
            rightCounterEl.innerHTML = rightCount;
        } else {
            // Move first word to end of array
            vocabArr.push(vocabArr.shift());
            wrongCount++;
            wrongCounterEl.innerText = wrongCount;
        }

        if (vocabArr.length === 0) {
            wordWrapEl.innerHTML = `<span>Nice job!</span>`
            inputEl.removeEventListener('keydown', inputFunc)
        } else {
            inputEl.value = '';
            wordWrapEl.innerHTML = wordWrapInnerHtml
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