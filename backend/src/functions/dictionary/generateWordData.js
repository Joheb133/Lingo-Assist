const removeHtmlTags = require('../../utils/removeHtmlTags')
const getTextByClass = require('../../utils/getTextByClass')

/**
 * Each word has an object associated with it. That object provides data on the word.
 * This function, using a combination of the clients word data and Wiktionary data,
 * generates and returns data for said word.
 * This function shouldn't be used independently as it doesn't return the actual word
 * itself, and it relies on the Wiktionary response as an argument.
 * @param {Array<object>} response 
 * @param {string} word
 * @param {object} wordObj
 * @return {object}
 */

module.exports = function generateWordData(response, word, wordObj, isInfinitive = false) {

    if (!response) {
        console.error(`Error: Word not found => ${word}`)
        return wordObj
    }

    // The same word can have multiple meanings
    let resWordObj = response[0]; // Take the first meaning
    response.forEach(obj => {
        // If the clients part of speech matches the pos of the response
        // assume this is the word they want
        if (wordObj.pos && obj.partOfSpeech.toLowerCase() === wordObj.pos.toLowerCase()) {
            resWordObj = obj
        }
    })

    const infinitive = isInfinitive ? null : wordObj.infinitive
    const pos = isInfinitive ? 'Infinitive' : resWordObj.partOfSpeech
    let translation = resWordObj.definitions[0].definition;

    const wikiInfinitive = getTextByClass(translation, 'form-of-definition-link')
    translation = removeHtmlTags(translation)

    // Wiktionary provides examples for most but not all words
    let example = {
        native: null,
        translation: null
    };

    if (resWordObj.definitions[0].parsedExamples) {
        example.native = removeHtmlTags(resWordObj.definitions[0].parsedExamples[0].example);
        example.translation = removeHtmlTags(resWordObj.definitions[0].parsedExamples[0].translation);
    }

    return { word: { infinitive, pos, translation, example }, wikiInfinitive }
}