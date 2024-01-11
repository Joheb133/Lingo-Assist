const { app } = require('@azure/functions');
const removeHtmlTags = require('../utils/removeHtmlTags')

app.http('dictionary', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (req, context) => {
        context.log(`Http function processed request for url "${req.url}"`);

        try {
            // Check if the request body is present
            if (!req.body) {
                return {
                    status: 400,
                    body: 'Bad Request: Request body is required.'
                };
            }

            const requestData = await req.json()
            const [combinedISO, wordObjs] = Object.entries(requestData)[0];

            const words = { [combinedISO]: {} } // update var with new data for each word

            const wordPromises = Object.entries(wordObjs).flatMap(([key, value]) => {
                const word = key;
                const wordObj = value;
                const wordPromise = processWord(combinedISO, word, wordObj, words);

                // Check if the word has a valid infinitive
                if (wordObj.infinitive !== null && !words[combinedISO][wordObj.infinitive]) {
                    const infinitivePromise = processWord(combinedISO, wordObj.infinitive, wordObj, words, true);
                    return [wordPromise, infinitivePromise];
                }

                return [wordPromise];
            });

            await Promise.all(wordPromises);

            return {
                body: JSON.stringify(words),
                headers: {
                    'Content-Type': 'application/json'
                }
            }

        } catch (error) {
            context.error(`Error processing request ${error.message}`)
            return {
                status: 500,
                body: {
                    error: 'Internal Server Error'
                }
            }
        }
    }
});

/**
 * Return a promise of a fetch request to Wiktionary
 * We request a specific word from Wik
 * @param {string} ISO 
 * @param {string} word
 */

async function getWiktionary(ISO, word) {

    const email = process.env.email
    const url = `https://en.wiktionary.org/api/rest_v1/page/definition/${word}&redirect=false`
    const options = {
        method: 'GET',
        headers: {
            'User-Agent': `dictionary/${email}`,
        }
    }

    return fetch(url, options)
        .then(res => {
            if (!res.ok) {
                throw new Error(res.statusText)
            }

            return res.json()
        })
        .then(json => json[ISO])
        .catch(err => err)
}

/**
 * This functions fills in the details of a word and returns that
 * data as an object. This data is specific to each word
 * @param {Array<object>} response 
 * @param {object} wordObj
 * @return {object}
 */

function generateWordData(response, wordObj, isInfinitive = false) {
    let resWordObj = response[0];
    response.forEach(obj => {
        if (wordObj.pos && obj.partOfSpeech.toLowerCase() === wordObj.pos.toLowerCase()) {
            resWordObj = obj
        }
    })

    const infinitive = isInfinitive ? null : wordObj.infinitive
    const pos = isInfinitive ? 'Infinitive' : resWordObj.partOfSpeech
    const translation = removeHtmlTags(resWordObj.definitions[0].definition);

    let example = {
        native: null,
        translation: null
    };

    if (resWordObj.definitions[0].parsedExamples) {
        example.native = removeHtmlTags(resWordObj.definitions[0].parsedExamples[0].example);
        example.translation = removeHtmlTags(resWordObj.definitions[0].parsedExamples[0].translation);
    }

    return { infinitive, pos, translation, example }
}

/**
 * Combine getWiktionary and generateWordData
 * add that result to words
 * @param {string} combinedISO learningISO_nativeISO
 * @param {string} word word to lookup on Wiktionary
 * @param {object} wordObj data associated with word
 * @param {object} words object to hold all words
 * @param {boolean} isInfinitive 
 */

async function processWord(combinedISO, word, wordObj, words, isInfinitive = false) {
    const learningISO = combinedISO.split('_')[0]
    words[combinedISO][word] = {};
    try {
        const res = await getWiktionary(learningISO, word);
        const wordData = generateWordData(res, wordObj, isInfinitive);
        words[combinedISO][word] = wordData;

        if (wordObj.infinitive !== null) return

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