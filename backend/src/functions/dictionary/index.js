const { app } = require('@azure/functions');
const returnWordPromises = require('./returnWordPromises');
const chunkPromises = require('./chunkPromises')

const REQUEST_LIMIT = 100;
const TIME_INTERVAL = 1000; //ms
const TIME_OUT = 2 * 60 * 1000 // 1 minute

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

            const chunkResult = await chunkPromises(wordPromises, REQUEST_LIMIT, TIME_INTERVAL, TIME_OUT)

            if (chunkResult) {
                return {
                    status: 200,
                    body: JSON.stringify(words),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            } else {
                return {
                    status: 206,
                    body: JSON.stringify(words),
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Status-Message': 'Partial response due to timeout'
                    }
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