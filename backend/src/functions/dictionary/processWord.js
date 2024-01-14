const getWiktionary = require('./getWiktionary')
const generateWordData = require('./generateWordData')

/**
 * Processes a word by retrieving data from Wiktionary & generating word details.
 * After this processing is done, add the word and it's data to the "word" object
 * @param {Array<Promise>} promises
 * @param {string} combinedISO learningISO_nativeISO
 * @param {string} word word to lookup on Wiktionary
 * @param {object} wordObj data associated with word
 * @param {object} words object to hold all words
 * @param {boolean} isInfinitive 
 */

module.exports = async function processWord(promises, combinedISO, word, wordObj, words, isInfinitive = false, recursionCount = 0) {
    const learningISO = combinedISO.split('_')[0]
    words[combinedISO][word] = {};

    try {
        const res = await getWiktionary(word);
        const data = generateWordData(res[learningISO], word, wordObj, isInfinitive);
        const wikiInfinitive = data.wikiInfinitive;
        const wordData = data.word;

        words[combinedISO][word] = wordData;

        // No need to check if Wiktionary thinks the word is an infinitive 
        // if the client has that set. This case is already handled in the "handler"
        if (wordObj.infinitive !== null) return true

        // If the word is labeled an infinitive by Wiktionary but not the client
        if (wikiInfinitive && recursionCount < 1) {
            recursionCount++
            wordData.infinitive = wikiInfinitive
            words[combinedISO][word] = wordData;
            // Add the extracted word to be searched at the end of all promises
            promises.push(() => processWord(promises, combinedISO, wikiInfinitive, {}, words, true, recursionCount))
        }

        return true
    } catch (err) {
        console.error(`Error processing ${isInfinitive ? 'infinitive' : 'word'} "${isInfinitive ? wordObj.infinitive : word}": ${err.message}`);
        return false;
    }
}