module.exports = async function chunkPromises(promises, concurrencyLimit, TIME_INTERVAL, TIME_OUT) {
    const startTime = Date.now();
    let x = 0;

    while (promises.length > 0) {
        const elapsedTime = Date.now() - startTime
        x++;
        if (elapsedTime >= TIME_OUT) {
            console.log('Timeout reached. Exiting loop')
            return false;
        }

        let runningPromises = promises.slice(0, concurrencyLimit);
        const results = await Promise.all(runningPromises.map((promise) => promise()));

        // Remove resolved promises from the array
        promises = promises.filter((_, index) => !results[index]);

        if (promises.length > 0) {
            await new Promise(resolve => setTimeout(resolve, TIME_INTERVAL));
        }
    }

    console.log(`Completed in ${x} chunks`)
    return true;
}