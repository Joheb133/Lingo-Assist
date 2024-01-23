const getWiktionary = require('./getWiktionary')
const generateWordData = require('./generateWordData')

/**
 * Processes a word by retrieving data from Wiktionary & generating word details.
 * After this processing is done, add the word and it's data to the "word" object
 * @param {Array<Promise>} promises
 * @param {string} combinedISO learningISO_nativeISO
 * @param {string} word word to lookup on Wiktionary
 * @param {object} wordObj data associated with word
 * @param {number} index incase words are homonyms, they're stored in an array. Index is useful for picking a different definition in generateWordData()
 * @param {object} words object to hold all words
 * @param {boolean} isInfinitive 
 */

module.exports = async function processWord(promises, combinedISO, word, wordObj, index, words, isInfinitive = false, recursionCount = 0) {
    const learningISO = combinedISO.split('_')[0]
    words[combinedISO][word] = [];

    try {
        const res = await getWiktionary(word);
        const data = generateWordData(res[learningISO], word, wordObj, index, isInfinitive);
        const wikiInfinitive = data.wikiInfinitive;
        const wordData = data.word;

        // If the word is labeled an infinitive by Wiktionary but not the client
        if (wikiInfinitive && recursionCount < 1) {
            recursionCount++
            wordData.infinitive = wikiInfinitive
            // Add the extracted word to be searched at the end of all promises
            promises.push(() => processWord(promises, combinedISO, wikiInfinitive, {}, 0, words, true, recursionCount))
        }

        words[combinedISO][word].push(wordData);

        return true
    } catch (err) {
        console.error(`Error processing ${isInfinitive ? 'infinitive' : 'word'} "${isInfinitive ? wordObj.infinitive : word}": ${err.message}`);
        return false;
    }
}