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
 * @param {Array<object>} wordDataArr
 * @return {object}
 */

module.exports = function generateWordData(response, word, wordDataArr, isInfinitive = false) {

    if (!response) {
        console.error(`Error: Word not found => ${word}`)
        return wordDataArr
    }

    let responseDup = [...response];
    let resDataArr = []
    let wikiInfinitives = {}

    for (let i = 0; i < wordDataArr.length; i++) {
        const wordObj = wordDataArr[i];
        if (responseDup.length === 0) {
            wordObj.duplicate = true;
            resDataArr.push(wordObj)
            break;
        }

        let resWordObj = undefined;
        // The same word can have multiple meanings
        for (let j = 0; j < responseDup.length; j++) {
            // If the clients part of speech matches the pos of the response
            // assume this is the word they want
            if (wordObj.pos && responseDup[j].partOfSpeech.toLowerCase() === wordObj.pos.toLowerCase()) {
                resWordObj = responseDup.splice(j, 1)[0]
                break;
            }
        }

        if (resWordObj === undefined) {
            resWordObj = responseDup.splice(0, 1)[0]; // Take the first meaning unless it's been taken before
        }

        let infinitive = isInfinitive ? null : wordObj.infinitive
        const pos = isInfinitive ? 'Infinitive' : resWordObj.partOfSpeech
        let translation = resWordObj.definitions[0].definition;
        let translations;

        // Check for wiki infinitve class
        const wikiInfinitive = getTextByClass(translation, 'form-of-definition-link')
        if (wikiInfinitive.length > 0 &&
            wordObj.infinitive === null &&
            resWordObj.partOfSpeech.toLowerCase() === 'verb') {
            infinitive = wikiInfinitive
            wikiInfinitives[infinitive] = {
                strength: wordObj.strength,
                last_practiced_ms: wordObj.last_practiced_ms,
                pos: 'Verb'
            };
        }

        // Check defintion error
        if (getTextByClass(translation, 'error').length > 0) {
            translations = [word]
            console.error(`Encountered Wiki error searching ${word}`)
        } else {
            translations = sanitizeTranslation(translation)
        }

        // Decide whether to use client or wiktionary example
        let example = {
            native: null,
            translation: null
        };

        if (wordObj.example?.native && wordObj.example?.translation) {
            // Example exists & native + translation !== ''
            example = wordObj.example;
        } else if (resWordObj.definitions[0].parsedExamples) {
            // Wiktionary provides examples for most but not all words
            example.native = removeHtmlTags(resWordObj.definitions[0].parsedExamples[0].example);
            example.translation = removeHtmlTags(resWordObj.definitions[0].parsedExamples[0].translation);
        }

        // Return the word obj
        const generatedWordObj = {
            duolingo_id: wordObj.duolingo_id,
            infinitive,
            pos,
            translations,
            example,
            strength: wordObj.strength,
            last_practiced_ms: wordObj.last_practiced_ms,
            note: wordObj.note
        }

        resDataArr.push(generatedWordObj)
    }

    return { resDataArr, wikiInfinitives }
}

function sanitizeTranslation(text) {
    if (text.length === 0) return []
    text = removeHtmlTags(text);
    text = text.toLowerCase();
    text = text.replace(/^to /i, '')
    text = text.replace(/\s*\([^)]*\)/g, ''); // regex to remove parenthesis & the parenthetical phrase
    text = text.split(/[,;]/g).flat(); // separate translations by commas and/or semicolon
    text = text.map(element => {
        let moddedEl = element.replace(/[.?!]/g, ''); // regex to remove special chars
        moddedEl = moddedEl.trim() // remove white space
        return moddedEl
    }).filter(element => element); // trim translations & remove empty strings
    return text;
}