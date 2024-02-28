/**
 * Process an array of promises concurrently in chunks, 
 * respecting concurrency limits and timeouts.
 * @param {object<Function>} promises - Object of functions containing promises.
 * @param {number} REQUEST_LIMIT - The maximum number of promises to run concurrently.
 * @param {number} TIME_INTERVAL - The time interval (in milliseconds) between consecutive chunks.
 * @param {number} TIME_OUT - The maximum time (in milliseconds) allowed for the entire process.
 * @returns {Promise<boolean>} A Promise that resolves to true if all promises are processed, false if a timeout occurs.
 * @async
 */

module.exports = async function chunkPromises(promises, REQUEST_LIMIT, TIME_INTERVAL, TIME_OUT) {
    const startTime = Date.now();
    let chunkCounter = 0;
    let promiseCounter = 0;
    let timeSinceLastReset = Date.now();
    let promisesThisSecond = 0;

    while (Object.keys(promises).length > 0) {
        // Check if it's time to reset promisesThisSecond
        if (Date.now() - timeSinceLastReset >= TIME_INTERVAL) {
            console.log('Time reset');
            timeSinceLastReset = Date.now();
            promisesThisSecond = 0;
        }

        // Check if the request limit is reached
        if (promisesThisSecond >= REQUEST_LIMIT) {
            console.log('Request limit reached, halting promises')
            await new Promise(resolve => setTimeout(resolve, TIME_INTERVAL));
            timeSinceLastReset = Date.now();
            promisesThisSecond = 0;
        }

        // Time out this function
        const elapsedTime = Date.now() - startTime
        if (elapsedTime >= TIME_OUT) {
            console.log('Timeout reached. Exiting loop');
            return false;
        }

        const runningKeys = Object.keys(promises).slice(0, REQUEST_LIMIT);
        const runningPromises = runningKeys.map(key => promises[key]);
        deleteKeysFromObject(promises, runningKeys);

        const results = await Promise.all(runningPromises.map((promise) => promise()));

        chunkCounter++;
        promiseCounter += results.length;
        promisesThisSecond += runningPromises.length;
    }

    console.log(`Processed ${promiseCounter} words in ${chunkCounter} chunks`)
    return true;
}

// Helper function to delete keys from an object
function deleteKeysFromObject(obj, keys) {
    keys.forEach(key => delete obj[key]);
}