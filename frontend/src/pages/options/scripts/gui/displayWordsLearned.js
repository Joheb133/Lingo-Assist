// Display how many words the user has learned
export default function displayWordsLearned(vocab) {
    const wordDataValues = Object.values(vocab);
    let wordCount = 0;

    for (const wordDataArr of wordDataValues) {
        for (const wordDataEl of wordDataArr) {
            if (!wordDataEl.duplicate) {
                wordCount++;
            }
        }
    }

    const wordsLearnedEl = document.querySelector('.duolingo-msg-el #words-learned')
    wordsLearnedEl.innerText = wordCount;
}