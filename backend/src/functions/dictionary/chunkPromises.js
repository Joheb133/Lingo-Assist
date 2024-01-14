/**
 * Process an array of promises concurrently in chunks, 
 * respecting concurrency limits and timeouts.
 * @param {Array<Function>} promises - Array of functions representing promises.
 * @param {number} concurrencyLimit - The maximum number of promises to run concurrently.
 * @param {number} TIME_INTERVAL - The time interval (in milliseconds) between consecutive chunks.
 * @param {number} TIME_OUT - The maximum time (in milliseconds) allowed for the entire process.
 * @returns {Promise<boolean>} A Promise that resolves to true if all promises are processed, false if a timeout occurs.
 * @async
 */

module.exports = async function chunkPromises(promises, concurrencyLimit, TIME_INTERVAL, TIME_OUT) {
    const startTime = Date.now();
    let chunkCounter = 0;
    let promiseCounter = 0;

    while (promises.length > 0) {
        const elapsedTime = Date.now() - startTime

        if (elapsedTime >= TIME_OUT) {
            console.log('Timeout reached. Exiting loop')
            return false;
        }

        let runningPromises = promises.slice(0, concurrencyLimit);
        const results = await Promise.all(runningPromises.map((promise) => promise()));

        // Remove resolved promises from the array
        promises = promises.filter((_, index) => !results[index]);

        chunkCounter++;
        promiseCounter += results.length

        if (promises.length > 0) {
            await new Promise(resolve => setTimeout(resolve, TIME_INTERVAL));
        }
    }

    console.log(`Processed ${promiseCounter} words in ${chunkCounter} chunks`)
    return true;
}