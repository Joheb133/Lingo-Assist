const getWiktionary = require('./getWiktionary')
const generateWordData = require('./generateWordData')

/**
 * Processes a word by retrieving data from Wiktionary & generating word details.
 * After this processing is done, add the word and it's data to the "word" object
 * @param {Array<Promise>} promises the array promises are stores
 * @param {string} combinedISO learningISO_nativeISO
 * @param {string} word word to lookup on Wiktionary
 * @param {object} wordDataArr data associated with word
 * @param {object} words response object to hold all words
 * @param {boolean} isInfinitive 
 */

module.exports = async function processWord(promises, combinedISO, word, wordDataArr, words, isInfinitive = false, recursionCount = 0) {
    const learningISO = combinedISO.split('_')[0]

    try {
        const res = await getWiktionary(word);
        const data = generateWordData(res[learningISO], word, wordDataArr, isInfinitive);
        const wikiInfinitives = data.wikiInfinitives;
        const wordData = data.resDataArr;

        // If the word is labeled an infinitive by Wiktionary but not the client
        for (let i = 0; i < wikiInfinitives.length; i++) {
            if (wikiInfinitives[i].length > 0 && recursionCount < 1) {
                recursionCount++
                // Add the extracted word to be searched at the end of all promises
                promises.push(() => processWord(promises, combinedISO, wikiInfinitives[i], {}, words, true, recursionCount))
            }
        }

        words[combinedISO][word] = wordData;

        return true;
    } catch (err) {
        console.error(`Error processing ${isInfinitive ? 'infinitive' : 'word'} "${isInfinitive ? wordObj.infinitive : word}": ${err.message}`);
        return false;
    }
}