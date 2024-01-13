const processWord = require('./processWord')

/**
 * Generates and returns an array of promises.
 * These Promises allow processWord() to happen concurrently.
 * @param {object} words - An object to hold new word objects.
 * @param {object} wordObjs - An object containing client word objects.
 * @param {string} combinedISO - Combined ISO code.
 * @returns {Array<Promise>} An array of promises for processing words and infinitive forms.
 */

module.exports = function returnWordPromises(words, wordObjs, combinedISO) {
    const promises = []
    Object.entries(wordObjs).forEach(([key, value]) => {
        const word = key;
        const wordObj = value;
        promises.push(() => processWord(promises, combinedISO, word, wordObj, words, false));

        // Check if the word is marked as an infinitive by the client & not already fetched and stored in "words"
        if (wordObj.infinitive !== null && !words[combinedISO][wordObj.infinitive]) {
            words[combinedISO][wordObj.infinitive] = {};
            promises.push(() => processWord(promises, combinedISO, wordObj.infinitive, wordObj, words, true));
        }
    });

    return promises;
}