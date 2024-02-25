import convertSnakeCase from "../../../utils/convertSnakeCase.js";

// This is going to take gameArr as an argument
// It's going to copy that arr
// We're going to get checkedWords, compare the two and filter out words that aren't checked true
// Then we play the game


export default function startGame(combinedISO, vocabEntries) {
    const checkedWords = JSON.parse(localStorage.getItem('checkedWords'))[combinedISO]
    const gameArr = vocabEntries.filter(([word, _]) => checkedWords[word] === true)
    const wrongInputArr = [];

    // -- Game stuff -- //
    const wordWrapEl = document.querySelector('.word-wrap')
    const wordEl = wordWrapEl.querySelector('#word')

    wordEl.innerText = convertSnakeCase(gameArr[0][0], true)
    const wordPosEl = wordWrapEl.querySelector('#pos')
    wordPosEl.innerText = gameArr[0][1][0].pos
    console.log(gameArr[0][1][0].translations[0])

    const inputEl = document.querySelector('.game-wrap input')
    inputEl.addEventListener('keydown', inputFunc)

    const restartBtn = document.querySelector('.restart-btn')
    restartBtn.addEventListener('click', restartFunc)

    const hintBtn = document.createElement('button')
    hintBtn.innerText = 'Hint'
    hintBtn.className = 'text-black px-4 py-0'
    hintBtn.classList.toggle('hidden', gameArr[0][1][0].example.native === null);
    wordWrapEl.append(hintBtn)

    hintBtn.addEventListener('click', hintFunc)

    function inputFunc(e) {
        if (e.code !== 'Enter') return

        const wordDataArr = gameArr[0][1]
        const firstWordData = wordDataArr[0]

        // Compare word on screen with translation(s)

        if (firstWordData.translations.includes(inputEl.value.toLowerCase())) { // User input right
            // Remove that word data from gameArr
            if (gameArr[0][1].length >= 2) {
                gameArr[0][1].shift()
            } else {
                gameArr.shift()
            }
        } else {
            // Move first word to end of array
            wrongInputArr.push(gameArr.shift());
        }

        if (gameArr.length === 0) {
            wordWrapEl.innerHTML = `<span>Nice job!</span>`
            inputEl.value = '';
            inputEl.removeEventListener('keydown', inputFunc)
        } else {
            inputEl.value = '';
            wordEl.innerText = convertSnakeCase(gameArr[0][0], true)
            wordPosEl.innerText = gameArr[0][1][0].pos
            hintBtn.classList.toggle('hidden', gameArr[0][1][0].example.native === null);
        }
    }

    function restartFunc() {
        // Remove listeners
        console.log('...Restarting game')
        inputEl.removeEventListener('keydown', inputFunc)
        hintBtn.removeEventListener('click', hintFunc)
        restartBtn.removeEventListener('click', restartFunc)
        startGame(combinedISO, vocabEntries)
    }

    // Add GUI later, cba rn
    function hintFunc() {
        if (gameArr[0][1][0].example === null) return
        console.log(gameArr[0][1][0].example.native)
    }
}