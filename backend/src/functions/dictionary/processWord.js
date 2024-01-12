const getWiktionary = require('./getWiktionary')
const generateWordData = require('./generateWordData')

/**
 * Processes a word by retrieving data from Wiktionary & generating word details.
 * After this processing is done, add the word and it's data to the "word" object
 * @param {string} combinedISO learningISO_nativeISO
 * @param {string} word word to lookup on Wiktionary
 * @param {object} wordObj data associated with word
 * @param {object} words object to hold all words
 * @param {boolean} isInfinitive 
 */

module.exports = async function processWord(combinedISO, word, wordObj, words, isInfinitive = false) {
    const learningISO = combinedISO.split('_')[0]
    words[combinedISO][word] = {};
    try {
        const res = await getWiktionary(word);
        const wordData = generateWordData(res[learningISO], wordObj, isInfinitive);
        words[combinedISO][word] = wordData;

        // No need to check if Wiktionary thinks the word is an infinitive 
        // if the client has that set. This case is already handled in the "handler"
        if (wordObj.infinitive !== null) return

        // Look at the defintion/translation by Wiktionary
        const match = wordData.translation.match(/(?:of\s)([a-zA-Z]+)\b/);
        const foundWord = match ? match[1] : null;

        // If the word is labeled an infinitive by Wiktionary but not the client
        if (foundWord) {
            wordData.infinitive = foundWord
            words[combinedISO][word] = wordData;
            // Search the extracted word
            await processWord(combinedISO, foundWord, {}, words, true)
        }
    } catch (err) {
        console.error(`Error processing ${isInfinitive ? 'infinitive' : 'word'} "${isInfinitive ? wordObj.infinitive : word}": ${err.message}`);
    }
}