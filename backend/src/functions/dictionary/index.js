const { app } = require('@azure/functions');
const processWord = require('./processWord');

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

            const words = { [combinedISO]: {} } // this var is updated with new data for each word

            const wordPromises = Object.entries(wordObjs).flatMap(([key, value]) => {
                const word = key;
                const wordObj = value;
                const wordPromise = processWord(combinedISO, word, wordObj, words);

                // Check if the word is marked as an infinitive by the client
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