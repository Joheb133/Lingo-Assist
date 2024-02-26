import convertSnakeCase from "../../../utils/convertSnakeCase.js";
import { hideSettingsPopup } from "./hidePopups.js"
import shuffleArray from "../../../utils/shuffleArray.js";

export default function startGame(combinedISO, vocabEntries) {
    const checkedWords = JSON.parse(localStorage.getItem('checkedWords'))[combinedISO]
    const gameArr = shuffleArray(
        vocabEntries
            .filter(([word, _]) => checkedWords[word] === true) // Ensure word is checked
            .flatMap(([word, dataArr]) => // Ensure each wordData element is it's own element in gameArr
                dataArr.map((dataEl) => [word, dataEl])
            )
    );
    const wrongInputArr = [];

    const noGameWrap = document.querySelector('.no-words-wrap')
    const wordWrapEl = document.querySelector('.word-wrap')
    const inputWrap = document.querySelector('.input-wrapper')

    const restartBtnList = document.querySelectorAll('.restart-btn')
    restartBtnList.forEach((restartBtn) => restartBtn.addEventListener('click', restartFunc))

    if (gameArr.length === 0) {
        noGameWrap.classList.remove('hidden')
        noGameWrap.classList.add('flex')
        wordWrapEl.classList.add('hidden')
        inputWrap.classList.add('hidden')
        return
    }

    noGameWrap.classList.add('hidden')
    noGameWrap.classList.remove('flex')
    wordWrapEl.classList.remove('hidden')
    inputWrap.classList.remove('hidden')

    const wordEl = wordWrapEl.querySelector('#word')
    wordEl.innerText = convertSnakeCase(gameArr[0][0], true)
    const wordPosEl = wordWrapEl.querySelector('#pos')
    wordPosEl.innerText = gameArr[0][1].pos
    console.log(gameArr[0][1].translations)

    const inputEl = inputWrap.querySelector('input')
    inputEl.addEventListener('keydown', inputFunc)

    // Hints
    const hintBtn = document.querySelector('.hint-btn')
    const hintEl = wordWrapEl.querySelector('#hint-el')
    const example = gameArr[0][1].example.native
    const doesExampleExist = example !== null
    hintBtn.classList.toggle('example-exists', doesExampleExist);
    hintBtn.classList.toggle('bg-neutral-300', !doesExampleExist)

    hintBtn.addEventListener('click', hintFunc)

    function inputFunc(e) {
        if (e.code !== 'Enter') return
        // Compare word on screen with translation(s)

        if (gameArr[0][1].translations.includes(inputEl.value.toLowerCase())) { // User input right
            // Remove that word data from gameArr
            gameArr.shift()
            handleNextWord()
        } else {
            // Move first word to end of array
            wrongInputArr.push(gameArr.shift());
            wordEl.classList.add('wrong-input'); // Add the shake animation class
            wordEl.addEventListener('animationend', () => {
                wordEl.classList.remove('wrong-input'); // Remove the shake animation class after the animation ends
                handleNextWord()
            }, { once: true });
        }

        function handleNextWord() {
            if (gameArr.length === 0) { // Game over
                showEndgamePopup(wrongInputArr);
                wordEl.innerText = '';
                inputEl.value = '';
                inputEl.removeEventListener('keydown', inputFunc)
            } else {
                inputEl.value = '';
                wordEl.innerText = convertSnakeCase(gameArr[0][0], true)
                wordPosEl.innerText = gameArr[0][1].pos

                const doesExampleExist = gameArr[0][1].example.native !== null
                hintBtn.classList.toggle('example-exists', doesExampleExist);
                hintBtn.classList.toggle('bg-neutral-300', !doesExampleExist)
                hintEl.innerText = ''
            }
        }
    }

    function restartFunc() {
        // Remove listeners
        console.log('...Restarting game')
        const inputEl = inputWrap.querySelector('input')
        const hintBtn = document.querySelector('.hint-btn')
        inputEl.removeEventListener('keydown', inputFunc)
        hintBtn.removeEventListener('click', hintFunc)
        restartBtnList.forEach((restartBtn) => restartBtn.removeEventListener('click', restartFunc))

        startGame(combinedISO, vocabEntries)

        const popupWindow = document.querySelector('.popup-window')
        popupWindow.style.display = 'none' // Close the window
    }

    function hintFunc() {
        const example = gameArr[0][1].example.native
        if (example === null) return

        hintEl.innerText = example !== null ? example : '';
    }
}

function showEndgamePopup(wrongInputArr) {
    hideSettingsPopup()
    const popupWindow = document.querySelector('.popup-window')
    const endgamePopup = popupWindow.querySelector('.endgame-container')
    const endgameTitle = popupWindow.querySelector('.endgame-title')

    if (wrongInputArr.length === 0) { // Didn't get anything wrong
        endgameTitle.innerText = 'Good job, You got everything right!'
    } else {
        endgameTitle.innerText = 'These are the words you got wrong'
    }

    const table = endgamePopup.querySelector('table')
    const oldTbody = table.querySelector('tbody')

    if (oldTbody) {
        table.removeChild(oldTbody)
    }

    const tbody = document.createElement('tbody')
    for (const [word, wordDataEl] of wrongInputArr) {
        const row = document.createElement('tr')

        const wordTd = document.createElement('td')
        wordTd.innerText = convertSnakeCase(word, true);

        const translationTd = document.createElement('td')
        const translationUl = document.createElement('ul')

        for (const translation of wordDataEl.translations) {
            const translationLi = document.createElement('li')
            translationLi.innerText = translation;
            translationUl.append(translationLi)
        }

        translationTd.append(translationUl)
        row.append(wordTd, translationTd)

        tbody.append(row)
    }

    table.append(tbody)

    popupWindow.style.display = 'flex';
}