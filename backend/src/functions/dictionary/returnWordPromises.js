const processWord = require('./processWord')

/**
 * Generates and returns an array of promises.
 * These Promises allow processWord() to happen concurrently.
 * @param {object} wordRes - An object to hold new word objects.
 * @param {object} wordObjs - An object containing client word objects.
 * @param {string} combinedISO - Combined ISO code.
 * @returns {Array<Promise>} An array of promises for processing words and infinitive forms.
 */

module.exports = function returnWordPromises(wordRes, wordObjs, combinedISO) {
    const promises = {}
    Object.entries(wordObjs).forEach(([word, wordDataArr]) => {
        promises[word] = () => processWord(promises, combinedISO, word, wordDataArr, wordRes, false)

        // Check if the word is marked as an infinitive by the client & not already fetched and stored in "words"
        wordDataArr.forEach((wordObj) => {
            if (wordObj.infinitive !== null && promises[wordObj.infinitive] === undefined) {
                promises[word.infinitive] = () => processWord(promises, combinedISO, wordObj.infinitive, [wordObj], wordRes, true)
            }
        })
    });

    return promises;
}