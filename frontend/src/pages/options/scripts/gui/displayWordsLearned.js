// Display how many words the user has learned
export default function displayWordsLearned(vocab) {
    const wordDataArr = Object.values(vocab);
    let wordCount = 0;

    for (let i = 0; i < wordDataArr.length; i++) {
        wordCount += wordDataArr[i].length
    }

    const wordsLearnedEl = document.querySelector('.duolingo-msg-el #words-learned')
    wordsLearnedEl.innerText = wordCount;
}