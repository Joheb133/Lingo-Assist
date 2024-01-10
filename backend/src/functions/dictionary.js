const { app } = require('@azure/functions');

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

            const data = await req.json()
            const [ISO, wordObjs] = Object.entries(data)[0];
            const learningISO = ISO.split('_')[0]

            let words = {
                [ISO]: {}
            }

            const wordPromises = [];

            Object.entries(wordObjs).forEach(([key, value]) => {
                const word = key;
                const wordObj = value;

                if (wordObj.infinitive !== null) {
                    const infinitivePromise = getWiktionary(learningISO, wordObj.infinitive)
                        .then(res => {
                            const newWord = transformWord(res, wordObj, true);
                            words[ISO][wordObj.infinitive] = newWord;
                        })
                        .catch(err => {
                            context.error(`Error processing infinitive "${wordObj.infinitive}": ${err.message}`);
                        });

                    wordPromises.push(infinitivePromise);
                }

                const wordPromise = getWiktionary(learningISO, word)
                    .then(res => {
                        const newWord = transformWord(res, wordObj);
                        words[ISO][word] = newWord;
                    })
                    .catch(err => {
                        context.error(`Error processing word "${word}": ${err.message}`);
                    });

                wordPromises.push(wordPromise);
            });

            await Promise.all(wordPromises);

            return {
                body: [JSON.stringify(words)],
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
 * @param {Array<object>} response 
 * @param {object} wordObj
 */

function transformWord(response, wordObj, isInfinitive = false) {
    let resWordObj;
    response.forEach(obj => {
        if (wordObj.pos && obj.partOfSpeech.toLowerCase() === wordObj.pos.toLowerCase()) {
            resWordObj = obj
        } else {
            resWordObj = response[0]
        }
    })

    const infinitive = isInfinitive ? null : wordObj.infinitive
    const pos = isInfinitive ? 'Infinitive' : resWordObj.partOfSpeech
    const translation = resWordObj.definitions[0].definition;

    let example = {
        native: null,
        translation: null
    };

    if (resWordObj.definitions[0].parsedExamples) {
        example.native = resWordObj.definitions[0].parsedExamples[0].example;
        example.translation = resWordObj.definitions[0].parsedExamples[0].translation;
    }

    return {
        infinitive,
        pos,
        translation,
        example
    }
}