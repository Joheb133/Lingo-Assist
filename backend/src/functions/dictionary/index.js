const { app } = require('@azure/functions');
const returnWordPromises = require('./returnWordPromises');
const chunkPromises = require('./chunkPromises')

const REQUEST_LIMIT = 100;
const TIME_INTERVAL = 1000; //ms
const TIME_OUT = 2 * 60 * 1000 // 1 minute
let isCurrentlyRunning = false;

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

            if (isCurrentlyRunning) {
                isCurrentlyRunning = false;
                return {
                    status: 429,
                    body: 'Too Many Requests: Currently processing a request'
                }
            }

            isCurrentlyRunning = true;

            const requestData = await req.json()
            const [combinedISO, wordObjs] = Object.entries(requestData)[0];

            const wordRes = { [combinedISO]: {} } // this var is updated with new data for each word

            const wordPromises = returnWordPromises(wordRes, wordObjs, combinedISO)

            const chunkResult = await chunkPromises(wordPromises, REQUEST_LIMIT, TIME_INTERVAL, TIME_OUT)

            // Because I'm smart and definitely NOT lazy
            // I'm not going to rewrite old code to handle infinitives and verbs
            // For loops below make it so verbs use inifinitives translation which is more usable than wiktionaries verb translations 

            // First replace verb translations with infinitive translations
            for (const [word, wordDataArr] of Object.entries(wordRes[combinedISO])) {
                let i = 0;
                for (const wordDataEl of wordDataArr) {
                    const infinitive = wordDataEl.infinitive;
                    if (infinitive) {
                        wordRes[combinedISO][word][i].translations = wordRes[combinedISO][infinitive][0].translations
                    }
                    i++;
                }
            }

            // Second, remove the infinitives
            for (const [word, wordDataArr] of Object.entries(wordRes[combinedISO])) {
                if (wordDataArr[0].pos.toLowerCase() === 'infinitive') {
                    delete wordRes[combinedISO][word]
                }
            }

            isCurrentlyRunning = false;

            if (chunkResult) {
                return {
                    status: 200,
                    body: JSON.stringify(wordRes),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            } else {
                return {
                    status: 206,
                    body: JSON.stringify(wordRes),
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Status-Message': 'Partial response due to timeout'
                    }
                }
            }


        } catch (error) {
            isCurrentlyRunning = false;
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