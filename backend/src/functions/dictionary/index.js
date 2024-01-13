const { app } = require('@azure/functions');
const returnWordPromises = require('./returnWordPromises');

const REQUEST_LIMIT = 5;
const TIME_INTERVAL = 1500; //ms

// 100 req/2s

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

            const wordPromises = returnWordPromises(words, wordObjs, combinedISO)

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